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

# Log Azure credentials status at module load
print(f"Azure Speech Key configured: {'Yes' if AZURE_SPEECH_KEY else 'No'}")
print(f"Azure Speech Region: {AZURE_SPEECH_REGION}")
print(f"Azure OpenAI Endpoint configured: {'Yes' if AZURE_OPENAI_ENDPOINT else 'No'}")

@api_view(['POST'])
def assess_speech(request):
    print(f"DEBUG: request.FILES = {request.FILES}")
    print(f"DEBUG: request.data = {request.data}")
    print(f"DEBUG: request.POST = {request.POST}")
    
    audio_file = request.FILES.get('file')
    question_id = request.data.get('questionId')
    question_text = request.data.get('questionText')

    if not audio_file:
        print("ERROR: No audio file found in request")
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

        # Skip embedding comparison for now - just use speech recognition and pronunciation
        # Simplified feedback without correctness checking

        # GPT Feedback
        if not AZURE_OPENAI_ENDPOINT:
            return Response({'error': 'Azure OpenAI endpoint not configured'}, status=500)

        gpt_client = AzureOpenAI(
            api_version="2024-12-01-preview",
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_KEY,
        )

        system_prompt = """
        You are an encouraging, friendly speech therapist helping children practice pronunciation and speaking skills.
        Provide constructive feedback on their pronunciation and how well they answered the question.
        If the child's response deviates from the question, gently redirect them.
        Follow professional speech pathologist guidelines when interacting with the child.
        """

        user_prompt = f"""
        Question asked: "{question_text}"
        Child's speech: "{result.text}"

        Pronunciation Assessment Results: {json.dumps(pron_data, indent=2)}
        
        Generate exactly three sentences giving feedback:
        - First sentence: encouraging and positive about their effort
        - Second sentence: constructive feedback on pronunciation or clarity
        - Third sentence: fun motivational line
        DO NOT include any headings, labels, numbers, bullets, markdown symbols, or emojis.
        Output ONLY the sentences themselves, nothing else.
        """

        response_gpt = gpt_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=300,
            temperature=0.8,
        )

        feedback_text = response_gpt.choices[0].message.content or ""

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
        if result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details  # type: ignore[attr-defined]
            if cancellation:
                error_msg = f"Speech synthesis canceled. Reason: {cancellation.reason}"  # type: ignore[union-attr]
                if cancellation.reason == speechsdk.CancellationReason.Error:  # type: ignore[union-attr]
                    error_msg += f", Error details: {cancellation.error_details}"  # type: ignore[union-attr]
                print(f"ERROR: {error_msg}")
                return HttpResponse(error_msg, status=500)
            else:
                return HttpResponse("Speech synthesis canceled", status=500)
        else:
            error_details = result.cancellation_details if hasattr(result, 'cancellation_details') else 'Unknown error'  # type: ignore[attr-defined]
            print(f"Speech synthesis failed. Reason: {result.reason}, Details: {error_details}")
            return HttpResponse(f"Speech synthesis failed: {error_details}", status=500)

    with open(temp_output.name, "rb") as f:
        audio_data = f.read()

    os.remove(temp_output.name)

    response = HttpResponse(audio_data, content_type="audio/mpeg")
    response["Content-Disposition"] = "inline; filename=tts.mp3"
    return response
