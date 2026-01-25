import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AudioRecorder, useAudioRecorder, useAudioRecorderState, RecordingPresets } from 'expo-audio';
import { Audio } from 'expo-av';
import { requestAudioPermissions, startRecording, stopRecording } from '@/components/util/audioHelpers';
import { API_URL } from '../config/api';
import { useApp } from '@/context/AppContext';
import { Buffer } from 'buffer';

// Question data interfaces
interface Question {
  id: string;
  question: string;
  image: string;
  show_pointer: boolean;
  pointerPosition?: {
    top: string;
    left: string;
  };
}

interface DescribeExercise {
  id: string;
  title: string;
  questions: Question[];
}

interface ApiQuestion {
  id: string;
  question_type: string;
  order: number;
  question_data: string | object;
  created_at: string;
}

// Fetch questions for a specific exercise by ID
const fetchQuestionsByExerciseId = async (exerciseId: string): Promise<DescribeExercise | null> => {
  console.log('=== FETCHING DESCRIBE EXERCISE QUESTIONS ===');
  console.log('Exercise ID:', exerciseId);
  console.log('API_URL:', API_URL);

  try {
    const url = `${API_URL}/content/${exerciseId}/questions/`;
    console.log('Fetching questions from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      console.error('Failed to fetch questions:', response.status, response.statusText);

      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
      } catch (bodyError) {
        console.error('Could not read error response body:', bodyError);
      }

      return null;
    }

    const questionsData = await response.json();
    console.log('Questions data received:', questionsData);

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      console.warn('No questions found for exercise:', exerciseId);
      return null;
    }

    // Transform API questions to our Question format
    
    const transformedQuestions: Question[] = questionsData
      .sort((a: ApiQuestion, b: ApiQuestion) => a.order - b.order) // Sort by order
      .map((apiQuestion: ApiQuestion, index: number) => {
        try {
          // Handle both string and object cases for question_data
          let questionData;
          if (typeof apiQuestion.question_data === 'string') {
            questionData = JSON.parse(apiQuestion.question_data);
          } else {
            questionData = apiQuestion.question_data;
          }
          console.log(`Question ${index + 1} data:`, questionData);

          const transformedQuestion = {
            id: apiQuestion.id,
            question: questionData.question || 'Question not available',
            image: questionData.image || '',
            show_pointer: questionData.show_pointer || false,
            pointerPosition: questionData.pointerPosition || undefined
          };
          
          return transformedQuestion;
        } catch (parseError) {
          console.error('Error parsing question_data for question:', apiQuestion.id, parseError);
          return {
            id: apiQuestion.id,
            question: 'Error loading question',
            image: '',
            show_pointer: false,
            pointerPosition: undefined
          };
        }
      });

    console.log('Transformed questions:', transformedQuestions);

    return {
      id: exerciseId,
      title: 'Describe Exercise',
      questions: transformedQuestions
    };

  } catch (error) {
    console.error('Network error fetching questions:', error);
    return null;
  }
};

// Fallback exercise data
const fallbackExercise: DescribeExercise = {
  id: 'fallback',
  title: 'Describe Exercise',
  questions: [
    {
      id: '1',
      question: "Where are we?",
      image: "https://via.placeholder.com/400x300/87CEEB/000000?text=Beach+Scene",
      show_pointer: false,
      pointerPosition: undefined
    }
  ]
};

// Mascot data interface
interface MascotData {
  bodyType: string;
  accessoryId?: number;
}


const getMascotImages = (mascotData: MascotData) => {
  const bodyImages = {
    koala: require('@/assets/images/koala.png'),
    kangaroo: require('@/assets/images/roo.png'),
  };
  const accessoryImages = {
    1: { // Shirt
      koala: require('@/assets/images/shirt_koala.png'),
      kangaroo: require('@/assets/images/shirt_roo.png'),
    },
    2: { // Sunglasses
      koala: require('@/assets/images/sunglasses_koala.png'),
      kangaroo: require('@/assets/images/sunglasses_roo.png'),
    },
  };

  const bodyType = mascotData.bodyType.toLowerCase();
  const bodyImage = bodyImages[bodyType as keyof typeof bodyImages] || bodyImages.koala;

  let accessoryImage = null;
  if (mascotData.accessoryId && accessoryImages[mascotData.accessoryId as keyof typeof accessoryImages]) {
    const accessorySet = accessoryImages[mascotData.accessoryId as keyof typeof accessoryImages];
    accessoryImage = accessorySet[bodyType as keyof typeof accessorySet] || accessorySet.koala;
  }

  return { bodyImage, accessoryImage };
};

// Fetch mascot data from backend
// const fetchMascotData = async () => {
//   if (!session?.access_token) {
//     Alert.alert('Error', 'You must be authorized to perform this action');
//     return;
//   }
//   try {
//     const response = await fetch(`${API_URL}/children/current/mascot`, {
//       method: 'GET',
//       headers: {
//          'Content-Type': 'application/json',
//          'Authorization': `Bearer ${session.access_token}`,
//       },
//     });

//     if (response.ok) {
//       const data = await response.json();
//       if (data.mascot) {
//         setMascotData(data.mascot);
//       }
//     } else {
//       console.warn('Failed to fetch mascot data:', response.status);
//     }
//   } catch (error) {
//     console.error('Error fetching mascot data:', error);
//     // Keep default mascot on error
//   }
// };

const DescribeExerciseComponent = () => {
  const { taskId, bodyType, accessoryId, exerciseId } = useLocalSearchParams();
  const { childId: contextChildId } = useApp();

  // Fallback childId for testing if context doesn't provide one
  const fallbackChildId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  const childId = contextChildId || fallbackChildId;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showMascotResponse, setShowMascotResponse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mascotData, setMascotData] = useState<MascotData>({ bodyType: 'koala' });
  const [exercise, setExercise] = useState<DescribeExercise>(fallbackExercise);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime] = useState(Date.now()); // Used in commented backend submission
  const { session } = useApp();
  const [exerciseResponses, setExerciseResponses] = useState<{ // Used in commented backend submission
    questionId: string; // Now string UUID instead of number
    question: string;
    response: string; // In real app, this would be transcribed audio
    timeSpent: number;
    timestamp: number;
  }[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Audio recorder set up
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Animation values
  const speechBubbleAnim = React.useRef(new Animated.Value(0)).current;
  const responseAnim = React.useRef(new Animated.Value(0)).current;
  const pointerAnim = React.useRef(new Animated.Value(1)).current;

  //Fetch mascot data from backend
  /*
  const fetchMascotData = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/${childId}/mascot`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.mascot) {
          setMascotData(data.mascot);
        }
      } else {
        console.warn('Failed to fetch mascot data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching mascot data:', error);
      // Keep default mascot on error
    }
  };
  */

  // Load exercise data from API
  useEffect(() => {
    const loadExerciseData = async () => {
      console.log('Loading exercise data - exerciseId:', exerciseId);
      console.log('Loading exercise data - childId:', childId);

      setIsLoading(true);

      // Try to fetch questions by exerciseId first
      if (exerciseId) {
        console.log('exerciseId exists, fetching questions by exercise ID:', exerciseId);
        const fetchedExercise = await fetchQuestionsByExerciseId(exerciseId as string);

        if (fetchedExercise) {
          console.log('Successfully loaded exercise data:', fetchedExercise);
          setExercise(fetchedExercise);
          setIsLoading(false);
          return;
        } else {
          console.warn('Failed to load exercise data, using fallback');
        }
      }

      // Use fallback data if API fetch failed
      console.log('Using fallback exercise data');
      setExercise(fallbackExercise);
      setIsLoading(false);
    };

    loadExerciseData();
  }, [exerciseId, childId]);

  // Load mascot data from route parameters
  useEffect(() => {
    if (bodyType || accessoryId) {
      setMascotData({
        bodyType: (bodyType as string) || 'koala',
        accessoryId: accessoryId ? parseInt(accessoryId as string) : undefined
      });
    }
  }, [bodyType, accessoryId]);

  // Initialize question timer when component mounts or question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  // Animate speech bubble appearance
  useEffect(() => {
    speechBubbleAnim.setValue(0);
    Animated.spring(speechBubbleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion, speechBubbleAnim]);

  // Animate pointer pulsing effect
  useEffect(() => {
    if (exercise.questions[currentQuestion]?.show_pointer) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pointerAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pointerAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pointerAnim.setValue(1);
      };
    }
  }, [currentQuestion, pointerAnim, exercise.questions]);

  useEffect(() => {
    if (!exercise || !exercise.questions) return;

    const currentQ = exercise.questions[currentQuestion];
    if (!currentQ?.question) return;

    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }

    handlePlayAudio(currentQ.question);
  }, [currentQuestion, exercise]);


  // const submitExerciseResults = async () => {
  //   const sessionEndTime = Date.now();
  //   const totalSessionTime = sessionEndTime - sessionStartTime;
  //
  //   const exerciseSubmission = {
  //     exerciseType: 'describe',
  //     activityId: 9, // From learning unit data - "Describe Exercise"
  //     childId: 'current-child-id', // Would come from auth/context
  //     sessionStartTime: sessionStartTime,
  //     sessionEndTime: sessionEndTime,
  //     totalTimeSpent: totalSessionTime,
  //     totalQuestions: questions.length,
  //     responses: exerciseResponses,
  //     questionsCompleted: currentQuestion + 1,
  //     completed: isCompleted,
  //     accuracy: 100,
  //   };
  //
  //   try {
  //     if (!session?.access_token) {
  //       Alert.alert('Error', 'You must be authorized to perform this action');
  //       return;
  //     }
  //     const response = await fetch('/api/exercise-completions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${session.access_token}`,
  //       },
  //       body: JSON.stringify(exerciseSubmission)
  //     });
  //
  //     if (!response.ok) {
  //       throw new Error('Failed to submit exercise results');
  //     }
  //
  //     const result = await response.json();
  //     console.log('Exercise submitted successfully:', result);
  //
  //     // Navigate back to dashboard after successful submission
  //     router.push({
  //       pathname: '/child-dashboard' as any,
  //       params: {
  //         completedTaskId: taskId,
  //         bodyType: mascotData.bodyType,
  //         accessoryId: mascotData.accessoryId?.toString() || ''
  //       }
  //     });
  //
  //   } catch (error) {
  //     console.error('Error submitting exercise:', error);
  //
  //     // Store locally for retry later
  //     const failedSubmissions = JSON.parse(
  //       localStorage.getItem('pendingExerciseSubmissions') || '[]'
  //     );
  //     failedSubmissions.push(exerciseSubmission);
  //     localStorage.setItem('pendingExerciseSubmissions', JSON.stringify(failedSubmissions));
  //
  //     // Still allow navigation
  //     router.push({
  //       pathname: '/child-dashboard' as any,
  //       params: {
  //         completedTaskId: taskId,
  //         bodyType: mascotData.bodyType,
  //         accessoryId: mascotData.accessoryId?.toString() || ''
  //       }
  //     });
  //   }
  // };

  // Update coin balance by adding coins
  const updateCoins = async (coinsToAdd: number) => {
    console.log('=== UPDATE COINS CALLED ===');
    console.log('Coins to add:', coinsToAdd);
    console.log('childId:', childId);
    
    if (!childId) {
      console.log('Missing childId, cannot update coins');
      return;
    }

    try {
      const url = `${API_URL}/profile/${childId}/coins/`;
      console.log('Updating coins at:', url);
      console.log('coinscount is:', coinsToAdd);

      const requestData = {
        amount: coinsToAdd
      };

      console.log('Request data:', requestData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.error('Failed to update coins:', response.status, response.statusText);
        
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        } catch (bodyError) {
          console.error('Could not read error response body:', bodyError);
        }
      } else {
        const data = await response.json();
        console.log('Coins updated successfully:', data);
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  // Handle mic button press
  const handleMicPress = async () => {
    if (!isRecording) {
      const hasPermission = await requestAudioPermissions();
      if (!hasPermission) return;

      setQuestionStartTime(Date.now());
      const started = await startRecording(audioRecorder);
      if (started) setIsRecording(true);
    } else {
      const uri = await stopRecording(audioRecorder);
      setIsRecording(false);

      if (!uri) return;

      const timeSpent = Date.now() - questionStartTime;
      const currentQData = exercise.questions[currentQuestion];

      try {
        const formData = new FormData();

        if (Platform.OS === 'web') {
          const blob = await fetch(uri).then(res => res.blob());
          const file = new File([blob], `question_${currentQData.id}.m4a`, {
            type: 'audio/m4a',
          });
          formData.append('file', file);
        } else {
          formData.append('file', {
            uri,
            name: `question_${currentQData.id}.m4a`,
            type: 'audio/m4a',
          } as any);
        }

        formData.append('questionId', currentQData.id.toString());
        formData.append('questionText', currentQData.question);

        console.log(formData.get("questionId"));
        console.log(formData.get("questionText"));

        if (!session?.access_token) {
          Alert.alert('Error', 'You must be authorized to perform this action');
          return;
        }
        const response = await fetch(`${API_URL}/AI/assess_speech/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        const testUpload = async (uri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'test.m4a',
    type: 'audio/m4a',
  } as any);

  if (!session?.access_token) {
    Alert.alert('Error', 'You must be authorized to perform this action');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/AI/assess_speech/`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` }, body: formData });
    console.log('Status:', res.status);
    console.log('Text:', await res.text());
  } catch (err) {
    console.error('Test upload failed:', err);
  }
};

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend error response:", errorText);
          throw new Error("Failed to upload audio");
        }

        const data = await response.json();
        console.log('Audio successfully sent:', data);
        handlePlayAudio(data.feedback);

        setExerciseResponses(prev => [
          ...prev,
          {
            questionId: currentQData.id, // Use string UUID directly
            question: currentQData.question,
            response: uri,
            timeSpent,
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        console.error('Error uploading audio:', error);
      }

/*
      // mascot response animation
      setShowMascotResponse(true);
      Animated.spring(responseAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setShowMascotResponse(false);
        responseAnim.setValue(0);
      }, 2000);

      */
    }
  };

  const handlePlayAudio = async (text: string) => {
    if (!text) return;

    try {
      const response = await fetch(`${API_URL}/AI/text_to_speech/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'en-AU-NatashaNeural',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS failed:', response.status, errorText);
        return;
      }

      const sound = new Audio.Sound();

      if (Platform.OS === 'web') {
        const blob = await response.blob();
        const uri = URL.createObjectURL(blob);
        await sound.loadAsync({ uri });
      } else {
        const arrayBuffer = await response.arrayBuffer();
        const base64Audio = `data:audio/mp3;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
        await sound.loadAsync({ uri: base64Audio });
      }

      await sound.playAsync();
    } catch (err) {
      console.error('Error playing feedback audio:', err);
    }
  };

  // Handle next question
  const handleNextQuestion = async () => {
    if (currentQuestion < exercise.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now()); // Reset timer for next question
      speechBubbleAnim.setValue(0);
    } else {
      // Exercise completed
      setIsCompleted(true);

      try {
        const response = await fetch(`${API_URL}/result/${childId}/exercise/${exerciseId}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Failed to submit exercise results: ${response.status}`);
        }
        const result = await response.json();
        console.log('Exercise submitted successfully:', result);
  
        // Award 50 coins for completing the entire speaking exercise
        await updateCoins(50);

        // Show completion screen for 3 seconds before navigating back
        setTimeout(() => {
          router.push({
            pathname: '/child-dashboard',
            params: { completedTaskId: exerciseId }
          });
        }, 3000);
  
      } catch (error) {
        console.error('Error submitting exercise:', error);
      }
    }
  };

  // Handle back button - return to dashboard without saving
  const handleBack = () => {
    Alert.alert(
      'Leave Exercise?',
      'Your progress will not be saved. Are you sure you want to go back?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            router.push('/child-dashboard');
          }
        }
      ]
    );
  };

  // Show loading screen while fetching exercise data
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Exercise...</Text>
      </View>
    );
  }

  const currentQ = exercise.questions[currentQuestion];
  const { bodyImage, accessoryImage } = getMascotImages(mascotData);

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedText}>Great Job!</Text>
        <Text style={styles.completedSubtext}>You completed the speaking exercise!</Text>
        <View style={styles.coinRewardContainer}>
          <Text style={styles.coinRewardText}>You earned</Text>
          <View style={styles.coinAmountContainer}>
            <MaterialCommunityIcons name="star-circle" size={40} color="#FFD700" />
            <Text style={styles.coinAmountText}>50 Coins!</Text>
          </View>
        </View>
        <Text style={styles.returningText}>Returning to dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with back button and progress indicator */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Question {currentQuestion + 1} of {exercise.questions.length}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / exercise.questions.length) * 100}%` }
              ]}
            />
          </View>
        </View>
      </View>

      {/* Exercise image */}
      <View style={styles.imageContainer}>
        <Image
          source={currentQ.image ? { uri: currentQ.image } : require('@/assets/images/beach.jpg')}
          style={styles.beachImage}
          resizeMode="contain"
        />

        {/* Pointer for ocean question */}
        {currentQ.show_pointer && currentQ.pointerPosition && (
          <Animated.View
            style={[
              styles.pointerContainer,
              {
                top: parseInt(currentQ.pointerPosition.top),
                left: parseInt(currentQ.pointerPosition.left),
              },
              { transform: [{ scale: pointerAnim }] }
            ]}
          >
            <FontAwesome name="hand-pointer-o" size={50} color="#fd9029" />
          </Animated.View>
        )}
      </View>

      {/* Mascot with speech bubble */}
      <View style={styles.mascotContainer}>
        {/* Speech bubble from mascot */}
        <Animated.View
          style={[
            styles.speechBubbleContainer,
            {
              transform: [{ scale: speechBubbleAnim }],
              opacity: speechBubbleAnim
            }
          ]}
        >
          <View style={styles.speechBubble}>
            <Text style={styles.questionText}>{currentQ.question}</Text>
            <View style={styles.speechBubbleTail} />
          </View>
        </Animated.View>

        {/* Mascot response bubble */}
        {showMascotResponse && (
          <Animated.View
            style={[
              styles.responseBubbleContainer,
              {
                transform: [{ scale: responseAnim }],
                opacity: responseAnim
              }
            ]}
          >
            <View style={[styles.speechBubble, styles.responseBubble]}>
              <Text style={styles.responseText}>Good job!! That&apos;s right!</Text>
              <View style={styles.speechBubbleTail} />
            </View>
          </Animated.View>
        )}

        {/* Mascot character */}
        <View style={styles.mascot}>
          <Image
            source={bodyImage}
            style={styles.mascotImage}
            resizeMode="contain"
          />
          {accessoryImage && (
            <Image
              source={accessoryImage}
              style={[styles.mascotImage, styles.mascotAccessory]}
              resizeMode="contain"
            />
          )}
        </View>
      </View>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        {/* Microphone button */}
        <TouchableOpacity
          style={[
            styles.micButton,
            isRecording && styles.micButtonActive
          ]}
          onPress={handleMicPress}
        >
          <FontAwesome
            name={isRecording ? "microphone" : "microphone-slash"}
            size={30}
            color={isRecording ? "#fd9029" : "#666"}
          />
          <Text style={[
            styles.micButtonText,
            isRecording && styles.micButtonTextActive
          ]}>
            {isRecording ? "Recording..." : "Tap to speak"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !exerciseResponses.some(r => r.questionId === currentQ.id) && styles.nextButtonDisabled
            ]}
            onPress={handleNextQuestion}
            disabled={!exerciseResponses.some(r => r.questionId === currentQ.id)}
          >
            <Text style={[
              styles.nextButtonText,
              !exerciseResponses.some(r => r.questionId === currentQ.id) && styles.nextButtonTextDisabled
            ]}>
              {currentQuestion < exercise.questions.length - 1 ? "Next Question" : "Finish"}
            </Text>
        </TouchableOpacity>


        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  imageContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  beachImage: {
    width: '100%',
    height: '100%',
  },
  pointerContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 100,
    left: 220,
    alignItems: 'flex-end',
  },
  speechBubbleContainer: {
    marginBottom: -70,
    marginRight: 50,
  },
  responseBubbleContainer: {
    marginBottom: 10,
    position: 'absolute',
    bottom: 320,
    right: 50,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    maxWidth: 200,
    minWidth: 150,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  responseBubble: {
    backgroundColor: '#4CAF50',
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  responseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mascot: {
    width: 200,
    height: 400,
    position: 'relative',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mascotAccessory: {
    zIndex: 2,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  micButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  micButtonActive: {
    backgroundColor: '#FFE8E0',
    borderColor: '#fd9029',
  },
  micButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  micButtonTextActive: {
    color: '#fd9029',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#fd9029',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
  },
  completedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  completedSubtext: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  coinRewardContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinRewardText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
  },
  coinAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinAmountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  returningText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fd9029',
    textAlign: 'center',
  },
});

// Hide the default header for this page
export const options = {
  headerShown: false,
};

export default DescribeExerciseComponent;