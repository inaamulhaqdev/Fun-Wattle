from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *
import os
import tempfile
import json
from pydub import AudioSegment
from rest_framework.decorators import api_view
from rest_framework.response import Response
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI
from django.http import HttpResponse
import re
from pgvector.django import CosineDistance

AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "australiaeast")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_EMB_ENDPOINT = os.getenv("AZURE_OPENAI_EMB_ENDPOINT")

@api_view(['POST'])
def assess_speech(request):
    audio_file = request.FILES.get('file')
    question_id = request.data.get('questionId')
    question_text = request.data.get('questionText')

    if not audio_file:
        return Response({'error': 'audio file is required'}, status=400)

    temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".m4a")
    for chunk in audio_file.chunks():
        temp_input.write(chunk)
    temp_input.close()

    temp_output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
    try:
        sound = AudioSegment.from_file(temp_input.name)
        sound.export(temp_output_path, format="wav")

        # Azure Speech config
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        audio_input = speechsdk.AudioConfig(filename=temp_output_path)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_input)

        result = recognizer.recognize_once()
        if result.reason != speechsdk.ResultReason.RecognizedSpeech:
            return Response({'error': 'Speech recognition failed'}, status=400)

        # Pronunciation assessment
        pron_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=result.text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True
        )
        audio_input = speechsdk.AudioConfig(filename=temp_output_path)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_input)
        pron_config.apply_to(recognizer)
        pron_result_raw = recognizer.recognize_once()

        pron_result = speechsdk.PronunciationAssessmentResult(pron_result_raw)
        pron_data = {
            "recognized_text": pron_result_raw.text,
            "accuracy_score": pron_result.accuracy_score,
            "fluency_score": pron_result.fluency_score,
            "completeness_score": pron_result.completeness_score,
            "pronunciation_score": pron_result.pronunciation_score,
        }

        emb_client = AzureOpenAI(
            api_version="2024-12-01-preview",
            azure_endpoint=AZURE_OPENAI_EMB_ENDPOINT,
            api_key=AZURE_OPENAI_KEY
        )

        child_emb = emb_client.embeddings.create(
            input=result.text,
            model="text-embedding-3-small"
        ).data[0].embedding

        question_embeddings = Question_Embedding.objects.filter(question__id=question_id)

        # cosine distance → convert to similarity
        similarities = question_embeddings.annotate(
            distance=CosineDistance('embedding', child_emb)
        ).order_by('distance')

        best = similarities.first()
        if best is None:
            return Response({"error": "No embeddings exist for this question"}, status=500)
        best_score = 1 - best.distance        
        best_answer = best.expected_answer_text
        is_correct = best_score >= 0.80

        # RAG
        combined_input = f"Question: {question_text}\nChild's answer: {result.text}"

        combined_emb = emb_client.embeddings.create(
            input=combined_input,
            model="text-embedding-3-small"
        ).data[0].embedding

        rag_similarities = (
            Rag_Context.objects
            .annotate(distance=CosineDistance("embedding", combined_emb))
            .order_by("distance")[:5]  # Top 5
        )

        rag_contexts = [ctx.content_chunk for ctx in rag_similarities]
        rag_context_combined = "\n\n".join(rag_contexts)

        # GPT Feedback
        gpt_client = AzureOpenAI(
            api_version="2024-12-01-preview",
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_KEY,
        )

        system_prompt = f"""
        You are an encouraging, friendly speech therapist helping children practice pronunciation.
        Ensure that you are providing constructive feedback on their pronunciation.
        If the child's response deviates from the question subject matter,
        then redirect the child's focus back onto the question and ask them to try again.
        Ensure you are following the professional and ethical speech pathologist guidelines when interacting with the child.

        Use the following context as background knowledge to better understand what the child might mean
        and to help you give accurate, supportive feedback. Do not quote the context directly.
        Do not mention that the context exists. Use it only to inform your understanding.

        --- BEGIN CONTEXT ---
        {rag_context_combined}
        --- END CONTEXT ---
        """

        user_prompt = f"""
        Question asked: "{question_text}"
        Child's speech: "{result.text}"

        Expected best match: "{best_answer}"
        Cosine similarity: {best_score:.2f}
        Correct: {is_correct}

        Pronunciation Assessment Results: {json.dumps(pron_data, indent=2)}
        Generate exactly three sentences giving feedback:
        - First sentence: encouraging and positive
        - Second sentence: area to improve
        - Third sentence: fun motivational line
        DO NOT include any headings, labels, numbers, bullets, markdown symbols, or emojis.
        Output ONLY the sentences themselves, nothing else.
        """

        response_gpt = gpt_client.chat.completions.create(
            model="feedback-gpt4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=300,
            temperature=0.8,
        )

        feedback_text = response_gpt.choices[0].message.content

        labels_to_remove = [
            r'Encouraging Summary\s*:\s*',
            r'Area to Improve\s*:\s*',
            r'Motivational Line\s*:\s*'
        ]

        for label in labels_to_remove:
            feedback_text = re.sub(label, '', feedback_text, flags=re.IGNORECASE)

        # clean up gpt feedback
        feedback_text = re.sub(r'^\s*(?:\d+[\.\)]\s*|[-*•]\s*|[#*]+)\s*', '', feedback_text, flags=re.MULTILINE)
        feedback_text = re.sub(r'[^\w\s.,!?\'"]+', '', feedback_text)
        feedback_text = re.sub(r'\s+', ' ', feedback_text).strip()

        return Response({
            "transcript": result.text,
            "pronunciation": pron_data,
            "feedback": feedback_text,
            "is_correct": is_correct,
            "similarity_score": best_score,
            "matched_answer": best_answer,
            "RAG_context": rag_context_combined,
        }, status=200)

    finally:
        os.remove(temp_input.name)
        os.remove(temp_output_path)

@api_view(['POST'])
def text_to_speech(request):
    """
    Convert text to speech using Azure Speech with SSML for expressive style.
    Request body: {"text": "Great job!", "voice": "en-AU-NatashaNeural", "style": "cheerful"}
    """
    text = request.data.get("text")
    voice = request.data.get("voice", "en-AU-NatashaNeural")
    style = request.data.get("style", "cheerful")

    if not text:
        return HttpResponse("Missing 'text' field", status=400)

    # Check if Azure credentials are configured
    if not AZURE_SPEECH_KEY:
        print("ERROR: AZURE_SPEECH_KEY environment variable is not set")
        return HttpResponse("Azure Speech credentials not configured", status=500)

    # Azure Speech configuration
    speech_config = speechsdk.SpeechConfig(
        subscription=AZURE_SPEECH_KEY,
        region=AZURE_SPEECH_REGION
    )
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )

    #　SSML — Expressive voice style
    ssml_text = f"""
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
           xmlns:mstts="https://www.w3.org/2001/mstts"
           xml:lang="en-AU">
        <voice name="{voice}">
            <prosody volume="150%">
                <mstts:express-as style="{style}" styledegree="1.2">
                    {text}
                </mstts:express-as>
            </prosody>
        </voice>
    </speak>
    """

    # Generate audio from SSML
    temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    audio_output = speechsdk.audio.AudioOutputConfig(filename=temp_output.name)
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=audio_output
    )

    result = synthesizer.speak_ssml_async(ssml_text).get()

    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        error_details = result.cancellation_details if hasattr(result, 'cancellation_details') else 'Unknown error'
        print(f"Speech synthesis failed. Reason: {result.reason}, Details: {error_details}")
        return HttpResponse(f"Speech synthesis failed: {error_details}", status=500)

    with open(temp_output.name, "rb") as f:
        audio_data = f.read()

    os.remove(temp_output.name)

    response = HttpResponse(audio_data, content_type="audio/mpeg")
    response["Content-Disposition"] = "inline; filename=tts.mp3"
    return response
