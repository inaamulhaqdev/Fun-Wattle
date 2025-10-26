import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Questions data
const questions = [
  {
    id: 1,
    question: "Where are we?",
    showPointer: false,
    pointerPosition: null
  },
  {
    id: 2,
    question: "What colour is the water?",
    showPointer: true,
    pointerPosition: { top: 250, left: 100 } // Point to ocean
  },
  {
    id: 3,
    question: "What is the weather like?",
    showPointer: true,
    pointerPosition: { top: 100, left: 100 } // Point to sky
  },
  {
    id: 4,
    question: "What else can you see?",
    showPointer: false,
    pointerPosition: null
  }
];

// Mascot data interface
interface MascotData {
  bodyType: string;
  accessoryId?: number;
}

// Mascot image helper function
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
//   try {
//     const response = await fetch(`${API_URL}/api/children/current/mascot`, {
//       method: 'GET',
//       headers: {
//          'Content-Type': 'application/json',
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

const DescribeExercise = () => {
  const { taskId, bodyType, accessoryId } = useLocalSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showMascotResponse, setShowMascotResponse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mascotData, setMascotData] = useState<MascotData>({ bodyType: 'koala' });
  const [sessionStartTime] = useState(Date.now()); // Used in commented backend submission
  const [exerciseResponses, setExerciseResponses] = useState<{ // Used in commented backend submission
    questionId: number;
    question: string;
    response: string; // In real app, this would be transcribed audio
    timeSpent: number;
    timestamp: number;
  }[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Animation values
  const speechBubbleAnim = React.useRef(new Animated.Value(0)).current;
  const responseAnim = React.useRef(new Animated.Value(0)).current;
  const pointerAnim = React.useRef(new Animated.Value(1)).current;

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
    if (questions[currentQuestion].showPointer) {
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
  }, [currentQuestion, pointerAnim]);

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

  //   try {
  //     const response = await fetch('/api/exercise-completions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
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

  // Handle mic button press
  const handleMicPress = () => {
    if (!isRecording) {
      // Starting to record - reset question timer
      setQuestionStartTime(Date.now());
    }
    setIsRecording(!isRecording);
    // TODO: Add actual voice recording logic here
  };

  // Handle submit answer
  const handleSubmit = () => {
    if (!isRecording) return;
    
    const currentTime = Date.now();
    const timeSpent = currentTime - questionStartTime;
    
    // Record the response (in real app, this would be transcribed audio)
    const responseData = {
      questionId: questions[currentQuestion].id,
      question: questions[currentQuestion].question,
      response: "Audio response transcription would go here", // TODO: Replace with actual transcription
      timeSpent: timeSpent,
      timestamp: currentTime
    };
    
    setExerciseResponses(prev => [...prev, responseData]);
    setIsRecording(false);
    setShowMascotResponse(true);
    
    // Animate mascot response
    Animated.spring(responseAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Hide response after 2 seconds
    setTimeout(() => {
      setShowMascotResponse(false);
      responseAnim.setValue(0);
    }, 2000);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now()); // Reset timer for next question
      speechBubbleAnim.setValue(0);
    } else {
      // Exercise completed
      setIsCompleted(true);
      
      // Submit exercise results to backend (commented out)
      // submitExerciseResults();
      
      // Temporary navigation (remove when backend is ready)
      setTimeout(() => {
        router.push({
          pathname: '/child-dashboard' as any,
          params: { 
            completedTaskId: taskId,
            bodyType: mascotData.bodyType,
            accessoryId: mascotData.accessoryId?.toString() || ''
          }
        });
      }, 2000);
    }
  };

  const currentQ = questions[currentQuestion];
  const { bodyImage, accessoryImage } = getMascotImages(mascotData);

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedText}>Exercise Completed! 🎉</Text>
        <Text style={styles.completedSubtext}>Great job describing the beach scene!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Question {currentQuestion + 1} of {questions.length}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Beach image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/beach.jpg')}
          style={styles.beachImage}
          resizeMode="cover"
        />
        
        {/* Pointer for ocean question */}
        {currentQ.showPointer && currentQ.pointerPosition && (
          <Animated.View 
            style={[
              styles.pointerContainer, 
              currentQ.pointerPosition,
              { transform: [{ scale: pointerAnim }] }
            ]}
          >
            <FontAwesome name="hand-pointer-o" size={50} color="#FF6B35" />
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
            color={isRecording ? "#FF6B35" : "#666"} 
          />
          <Text style={[
            styles.micButtonText,
            isRecording && styles.micButtonTextActive
          ]}>
            {isRecording ? "Recording..." : "Tap to speak"}
          </Text>
        </TouchableOpacity>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isRecording && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isRecording}
          >
            <Text style={[
              styles.submitButtonText,
              !isRecording && styles.submitButtonTextDisabled
            ]}>
              Submit
            </Text>
          </TouchableOpacity>

          {/* Next question button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !showMascotResponse && styles.nextButtonDisabled
            ]}
            onPress={handleNextQuestion}
            disabled={!showMascotResponse}
          >
            <Text style={[
              styles.nextButtonText,
              !showMascotResponse && styles.nextButtonTextDisabled
            ]}>
              {currentQuestion < questions.length - 1 ? "Next Question" : "Finish"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  progressContainer: {
    padding: 20,
    paddingTop: 50,
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
    borderColor: '#FF6B35',
  },
  micButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  micButtonTextActive: {
    color: '#FF6B35',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
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
  },
});

// Hide the default header for this page
export const options = {
  headerShown: false,
};

export default DescribeExercise;