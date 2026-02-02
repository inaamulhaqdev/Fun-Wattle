import React, { useEffect, useState, useLayoutEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, Image, Modal, TextInput } from "react-native";
import { Text, DefaultTheme, Provider as PaperProvider, ActivityIndicator, Card, Button } from "react-native-paper";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { useApp } from "@/context/AppContext";
import { API_URL } from "../config/api";
import { Asset } from 'expo-asset';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Question {
  id: string;
  question_type: string;
  order: number;
  question_data: {
    question: string;
    image?: string;
    options?: Array<{
      id?: string;
      text?: string;
      image?: string;
      option?: string;
      correct?: boolean;
      order?: number;
    }>;
    show_pointer?: boolean;
  };
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  exercise_type: string;
  order: number;
  time_spent: number;
  completed: boolean;
  accuracy: number;
  num_correct: number;
  num_incorrect: number;
  last_practiced: string | null;
  questions?: Question[];
  showQuestions?: boolean;
}

const calculateAccuracy = (exercises: Exercise[]) => {
  const accuracies: number[] = [];
  for (const ex of exercises) {
    accuracies.push(ex.accuracy);
  }

  if (accuracies.length === 0) return 0;

  let total = 0;
  for (const a of accuracies) {
    total += a;
  }

  return total / accuracies.length;
};

export default function LearningUnitDetails() {
  const { id, title, category, description } = useLocalSearchParams<{ id: string; title: string; category: string; description?: string }>();
  const { childId, profileId, session } = useApp();
  const userId = session?.user?.id;
  const navigation = useNavigation();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [unitAccuracy, setUnitAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [retries, setRetries] = useState('3');
  const [participationType, setParticipationType] = useState<'required' | 'recommended'>('required');
  const [isChildProfile, setIsChildProfile] = useState(false);
  const [canPractice, setCanPractice] = useState(false); // Can child practice this unit?
  const [allAssignmentsCompleted, setAllAssignmentsCompleted] = useState(false);

  const [bgLoaded, setBgLoaded] = useState(false);

  const { darkMode } = useApp();

  // Set header title dynamically based on profile type
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isChildProfile ? 'Learning Unit Details' : 'Learning Unit Progress'
    });
  }, [navigation, isChildProfile]);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!id || !childId) return;

      setLoading(true);
      try {
        const resp = await fetch(`${API_URL}/content/${id}/exercises/`);
        if (!resp.ok) throw new Error("Failed to fetch exercises");

        const data = await resp.json();
        const sorted = (data as { id: string; title: string; description: string; exercise_type: string; order: number }[]).sort(
          (a, b) => a.order - b.order
        );

        const results = await Promise.all(
          sorted.map(async (ex) => {
            const resResp = await fetch(`${API_URL}/result/${childId}/exercise/${ex.id}/`);
            if (!resResp.ok) throw new Error('Failed to fetch result details.');

            const resJson = await resResp.json();
            if (Array.isArray(resJson) && resJson.length > 0) {
              const first = resJson[0];
              return {
                time_spent: first.time_spent || 0,
                completed: true,
                accuracy: first.accuracy,
                num_correct: first.num_correct,
                num_incorrect: first.num_incorrect,
                last_practiced: first.completed_at || null
              };
            }
            return { 
              time_spent: 0, 
              completed: false, 
              accuracy: 0, 
              num_correct: 0, 
              num_incorrect: 0,
              last_practiced: null
            };
          })
        );

        // Calculate total time spent and number of completed exercises
        let totalTime = 0;
        let completedCount = 0;
        const exercisesWithResults = sorted.map((ex, i) => {
          const r = results[i];
          totalTime += r.time_spent;
          if (r.completed) completedCount++;

          return { ...ex, ...r, questions: [], showQuestions: false };
        });

        setExercises(exercisesWithResults);
        setTotalDuration(totalTime);
        setProgress(sorted.length ? completedCount / sorted.length : 0);
        setUnitAccuracy(calculateAccuracy(exercisesWithResults));
      } catch (err) {
        console.error("Fetch error:", err);
        Alert.alert("Error", "Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    const checkAssignmentStatus = async () => {
      if (!childId || !id) {
        console.log('Skipping assignment check - missing required data');
        return;
      }

      // Check if we're viewing as a child (child logged in directly) vs parent viewing child's content
      // When child logs in directly: profileId === childId
      // When parent views child's content: profileId !== childId
      const isChild = profileId === childId;
      setIsChildProfile(isChild);
      console.log('Profile type check:', { profileId, childId, isChild });
      
      if (isChild) {
        console.log('Current profile is a child, checking practice eligibility');
        
        // For child profiles, check if all assigned units are completed
        try {
          const response = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`, { method: 'GET' });
          
          if (response.status === 404 || !response.ok) {
            // No assignments or error - child can practice freely
            console.log('No assignments found, child can practice any unit');
            setAllAssignmentsCompleted(true);
            setCanPractice(true);
            return;
          }
          
          const assignments = await response.json();
          console.log('Child assignments:', assignments.length);
          
          // Check if this specific unit is assigned
          const isThisUnitAssigned = assignments.some((a: any) => a.learning_unit.id === id);
          
          // Check if ALL assignments are completed
          const allCompleted = assignments.every((a: any) => a.completed_at !== null);
          console.log('All assignments completed:', allCompleted);
          
          setAllAssignmentsCompleted(allCompleted);
          
          // Child can practice if: all assignments completed AND this unit is NOT assigned
          // (If it's assigned, child should complete it normally, not practice)
          const canPracticeThisUnit = allCompleted && !isThisUnitAssigned;
          setCanPractice(canPracticeThisUnit);
          console.log('Can practice this unit:', canPracticeThisUnit);
          
        } catch (err) {
          console.error('Error checking assignments for practice mode:', err);
        }
        
        return;
      }
      
      try {
        console.log('Checking assignment status for unit:', id, 'and child:', childId);
        
        // Check assignments for the child (works for both parent and therapist)
        const response = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`, { method: 'GET' });
        
        // If child has no assignments (404), the unit is not assigned
        if (response.status === 404) {
          console.log('No assignments found for child (404)');
          setIsAssigned(false);
          return;
        }
        
        if (!response.ok) {
          console.log('Assignment check failed with status:', response.status);
          setIsAssigned(false);
          return;
        }
        
        const assignments = await response.json();
        console.log('Total assignments for child:', assignments.length);
        
        const isUnitAssigned = assignments.some((a: any) => a.learning_unit.id === id);
        console.log('Is unit assigned:', isUnitAssigned);
        
        setIsAssigned(isUnitAssigned);
      } catch (err) {
        console.error("Error checking assignment:", err);
        setIsAssigned(false);
      }
    };

    fetchExercises();
    checkAssignmentStatus();
  }, [id, childId, profileId, session]);

  const toggleQuestions = async (exerciseId: string) => {
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) return;

    const exercise = exercises[exerciseIndex];
    
    // If already showing, just hide
    if (exercise.showQuestions) {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex] = { ...exercise, showQuestions: false };
      setExercises(updatedExercises);
      return;
    }

    // If questions not loaded yet, fetch them
    if (!exercise.questions || exercise.questions.length === 0) {
      try {
        const resp = await fetch(`${API_URL}/content/${exerciseId}/questions/`);
        if (!resp.ok) throw new Error("Failed to fetch questions");
        
        const questionsData = await resp.json();
        const sortedQuestions = questionsData.sort((a: Question, b: Question) => a.order - b.order);
        
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = { 
          ...exercise, 
          questions: sortedQuestions,
          showQuestions: true 
        };
        setExercises(updatedExercises);
      } catch (err) {
        console.error("Error fetching questions:", err);
        Alert.alert("Error", "Failed to load questions");
      }
    } else {
      // Questions already loaded, just show them
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex] = { ...exercise, showQuestions: true };
      setExercises(updatedExercises);
    }
  };

  const assignLearningUnit = async () => {
    if (!session?.access_token) {
      Alert.alert('Error', 'You must be authorized to perform this action');
      return;
    }

    if (!id || !childId || !userId) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/assignment/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          learning_unit_id: id,
          child_id: childId,
          user_id: userId,
          participation_type: participationType,
          num_question_attempts: parseInt(retries) || 3
        }),
      });

      const res = await response.json();

      if (!response.ok) {
        Alert.alert('Error', res.error || 'Failed to assign learning unit');
        return;
      }

      setIsAssigned(true);
      setAssignmentModalVisible(false);
      Alert.alert('Success', `Learning unit assigned as ${participationType}`);
    } catch (err) {
      console.error("Error assigning learning unit:", err);
      Alert.alert('Error', 'Failed to assign learning unit');
    }
  };

  const unassignLearningUnit = async () => {
    if (!session?.access_token) {
      Alert.alert('Error', 'You must be authorized to perform this action');
      return;
    }

    if (!id || !childId) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/assignment/${childId}/unassign/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        Alert.alert('Error', 'Failed to unassign learning unit');
        return;
      }

      setIsAssigned(false);
      Alert.alert('Success', 'Learning unit unassigned successfully');
    } catch (err) {
      console.error("Error unassigning learning unit:", err);
      Alert.alert('Error', 'Failed to unassign learning unit');
    }
  };

  const handleAssignmentPress = () => {
    if (isAssigned) {
      Alert.alert(
        'Unassign Learning Unit',
        'Are you sure you want to unassign this learning unit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unassign', style: 'destructive', onPress: unassignLearningUnit }
        ]
      );
    } else {
      setAssignmentModalVisible(true);
    }
  };

  const handlePracticePress = () => {
    // Navigate to the first exercise in practice mode
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'This learning unit has no exercises available.');
      return;
    }

    const firstExercise = exercises[0];
    
    // Determine the route based on exercise type
    let routePath = '/multiple_drag_exercise';
    const cleanedType = firstExercise.exercise_type.trim().toLowerCase();
    
    switch (cleanedType) {
      case 'multiple_drag':
        routePath = '/multiple_drag_exercise';
        break;
      case 'multiple_select':
        routePath = '/multiple_select_exercise';
        break;
      case 'speaking':
        routePath = '/describe_exercise';
        break;
      case 'ordered_drag':
        routePath = '/ordered_drag_exercise';
        break;
      default:
        console.warn('Unknown exercise type:', cleanedType);
    }

    console.log('Starting practice mode for exercise:', firstExercise.id);
    
    router.push({
      pathname: routePath as any,
      params: {
        exerciseId: firstExercise.id,
        childId: childId,
        practiceMode: 'true', // Flag to indicate practice mode
        learningUnitTitle: title
      }
    });
  };

  useEffect(() => {
    async function loadBackground() {
      try {
        const asset = Asset.fromModule(
          darkMode
            ? require('@/assets/images/child-dashboard-background-dark.jpg')
            : require('@/assets/images/child-dashboard-background.jpg')
        );
        await asset.downloadAsync();
        setBgLoaded(true);
      } catch (err) {
        console.error("Image preload failed", err);
        setBgLoaded(true);
      }
    }

    loadBackground();
  }, [darkMode]);

  function formatTime(seconds: number) {
    if (seconds === undefined) return "0 min total";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min total`;
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not practiced yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '/') + ' | ' + 
    date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

  if (loading || !bgLoaded) {
    return (
      <PaperProvider>
        <View style={[styles.loadingContainer, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={DefaultTheme}>
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={
            darkMode
              ? require('@/assets/images/child-dashboard-background-dark.jpg')
              : require('@/assets/images/child-dashboard-background.jpg')
          }
          style={styles.backgroundImage}
          resizeMode="cover"
          onLoad={() => {
            console.log('Background image loaded');
          }}
        />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}>
          {/* Main Learning Unit Card */}
          <Card style={[styles.mainCard, darkMode && styles.mainCardDark]} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={[styles.mainTitle, darkMode && styles.textDark]}>
                {title}
              </Text>
              <Text variant="bodyMedium" style={[styles.categoryText, darkMode && styles.textSecondaryDark]}>
                {category}
              </Text>
              {description && (
                <Text variant="bodyMedium" style={[styles.descriptionText, darkMode && styles.textSecondaryDark]}>
                  {description}
                </Text>
              )}
              
              {/* Progress and Stats - Only for Parent/Therapist */}
              {!isChildProfile && (
                <>
                  <View style={styles.headerRow}>
                    <View style={styles.timeContainer}>
                      <MaterialCommunityIcons name="clock-outline" size={20} color={darkMode ? '#aaa' : '#666'} />
                      <Text style={[styles.timeText, darkMode && styles.textDark]}>
                        {formatTime(totalDuration)}
                      </Text>
                    </View>
                    
                    <Text style={[styles.accuracyText, darkMode && styles.textDark]}>
                      {unitAccuracy.toFixed(0)}% correct
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                  </View>
                </>
              )}

              {/* Assignment Button for Parent/Therapist */}
              {!isChildProfile && (
                <TouchableOpacity 
                  style={[styles.assignButton, isAssigned && styles.assignedButton]} 
                  onPress={handleAssignmentPress}
                >
                  <MaterialCommunityIcons 
                    name={isAssigned ? "check-circle" : "plus-circle"} 
                    size={20} 
                    color="#fff" 
                    style={styles.assignButtonIcon}
                  />
                  <Text style={styles.assignButtonText}>
                    {isAssigned ? 'Already Assigned - Tap to Unassign' : 'Assign Learning Unit'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Practice Button for Child - Only when all assignments completed */}
              {isChildProfile && canPractice && (
                <TouchableOpacity 
                  style={styles.practiceButton} 
                  onPress={handlePracticePress}
                >
                  <MaterialCommunityIcons 
                    name="play-circle-outline" 
                    size={20} 
                    color="#fff" 
                    style={styles.assignButtonIcon}
                  />
                  <Text style={styles.assignButtonText}>
                    Practice This Unit
                  </Text>
                </TouchableOpacity>
              )}

              {/* Message when child can't practice yet */}
              {isChildProfile && !canPractice && allAssignmentsCompleted === false && (
                <View style={styles.practiceLockedContainer}>
                  <MaterialCommunityIcons 
                    name="lock-outline" 
                    size={20} 
                    color={darkMode ? '#aaa' : '#666'} 
                  />
                  <Text style={[styles.practiceLockedText, darkMode && styles.textSecondaryDark]}>
                    Complete your assigned units to unlock practice mode
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Exercises Section */}
          <Text style={[styles.exercisesHeader, darkMode && styles.textDark]}>
            Exercises
          </Text>

          {/* Individual Exercise Cards */}
          {exercises.map((exercise, index) => {
            const total = exercise.num_correct + exercise.num_incorrect;
            const accuracy = total > 0 ? Math.round((exercise.num_correct / total) * 100) : 0;
            const completedCount = exercises.filter(e => e.completed).length;
            
            // Format exercise type for display
            const formatExerciseType = (type: string) => {
              return type.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
            };

            return (
              <Card 
                key={exercise.id} 
                style={[styles.activityCard, darkMode && styles.activityCardDark]} 
                mode="outlined"
              >
                <TouchableOpacity onPress={() => toggleQuestions(exercise.id)}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.exerciseHeader}>
                      <Text style={[styles.lastPracticed, darkMode && styles.textSecondaryDark]}>
                        Last practised: {formatDate(exercise.last_practiced)}
                      </Text>
                      <Text style={[styles.exerciseType, darkMode && styles.textSecondaryDark]}>
                        {formatExerciseType(exercise.exercise_type)}
                      </Text>
                    </View>
                    
                    <View style={styles.activityTitleRow}>
                      <Text style={[styles.activityTitle, darkMode && styles.textDark]}>
                        {exercise.title}
                      </Text>
                      <View style={styles.expandIconContainer}>
                        <MaterialCommunityIcons 
                          name={exercise.showQuestions ? "chevron-up" : "chevron-down"} 
                          size={24} 
                          color={darkMode ? '#aaa' : '#666'} 
                        />
                      </View>
                    </View>
                    
                    {exercise.description && (
                      <Text style={[styles.exerciseDescription, darkMode && styles.textSecondaryDark]}>
                        {exercise.description}
                      </Text>
                    )}

                    <View style={styles.divider} />

                    {/* Stats Table - Only for Parent/Therapist */}
                    {!isChildProfile && (
                      <View style={styles.statsTable}>
                        <View style={styles.statsColumn}>
                          <Text style={[styles.statsLabel, darkMode && styles.textDark]}>Correct</Text>
                          <Text style={[styles.statsValue, darkMode && styles.textDark]}>
                            {exercise.num_correct}
                          </Text>
                        </View>

                        <View style={[styles.statsColumn, styles.statsColumnMiddle]}>
                          <Text style={[styles.statsLabel, darkMode && styles.textDark]}>Incorrect</Text>
                          <Text style={[styles.statsValue, darkMode && styles.textDark]}>
                            {exercise.num_incorrect}
                          </Text>
                        </View>

                        <View style={styles.statsColumn}>
                          <Text style={[styles.statsLabel, darkMode && styles.textDark]}>Accuracy</Text>
                          <Text style={[styles.statsValue, darkMode && styles.textDark]}>
                            {accuracy}%
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {exercise.showQuestions && exercise.questions && exercise.questions.length > 0 && (
                      <View style={styles.tapHintContainer}>
                        <MaterialCommunityIcons name="chevron-up" size={20} color="#FD902B" />
                        <Text style={[styles.tapHint, darkMode && styles.tapHintDark]}>
                          Tap to hide questions
                        </Text>
                        <MaterialCommunityIcons name="chevron-up" size={20} color="#FD902B" />
                      </View>
                    )}
                    {!exercise.showQuestions && (
                      <View style={styles.tapHintContainer}>
                        <MaterialCommunityIcons name="eye-outline" size={20} color="#FD902B" />
                        <Text style={[styles.tapHint, darkMode && styles.tapHintDark]}>
                          Tap to view {exercise.questions?.length || '...'} questions
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#FD902B" />
                      </View>
                    )}
                  </Card.Content>
                </TouchableOpacity>

                {/* Questions Section */}
                {exercise.showQuestions && exercise.questions && exercise.questions.length > 0 && (
                  <View style={styles.questionsContainer}>
                    <View style={styles.questionsDivider} />
                    <Text style={[styles.questionsHeader, darkMode && styles.textDark]}>
                      Questions ({exercise.questions.length})
                    </Text>
                    
                    {exercise.questions.map((question, qIndex) => (
                      <View key={question.id} style={[styles.questionCard, darkMode && styles.questionCardDark]}>
                        <Text style={[styles.questionNumber, darkMode && styles.textDark]}>
                          Question {qIndex + 1}
                        </Text>
                        
                        <Text style={[styles.questionText, darkMode && styles.textDark]}>
                          {question.question_data.question}
                        </Text>
                        
                        {question.question_data.image && (
                          <Image 
                            source={{ uri: question.question_data.image }}
                            style={styles.questionImage}
                            resizeMode="contain"
                          />
                        )}
                        
                        {question.question_data.options && question.question_data.options.length > 0 && (
                          <View style={styles.optionsContainer}>
                            {question.question_data.options.map((option, optIndex) => (
                              <View 
                                key={option.id || option.option || optIndex} 
                                style={[
                                  styles.optionItem,
                                  darkMode && styles.optionItemDark,
                                  option.correct && styles.correctOption
                                ]}
                              >
                                <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
                                  {option.option || option.id || String.fromCharCode(65 + optIndex)}
                                </Text>
                                
                                {option.image && (
                                  <Image 
                                    source={{ uri: option.image }}
                                    style={styles.optionImage}
                                    resizeMode="contain"
                                  />
                                )}
                                
                                {option.text && (
                                  <Text style={[styles.optionText, darkMode && styles.textDark]}>
                                    {option.text}
                                  </Text>
                                )}
                                
                                {option.correct && (
                                  <MaterialCommunityIcons 
                                    name="check-circle" 
                                    size={20} 
                                    color="#4CAF50" 
                                    style={styles.correctIcon}
                                  />
                                )}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })}
        </ScrollView>

        {/* Assignment Modal */}
        <Modal
          visible={assignmentModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAssignmentModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>Assign Learning Unit</Text>
              
              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, darkMode && styles.textDark]}>Participation Type</Text>
                <View style={styles.participationButtons}>
                  <TouchableOpacity
                    style={[
                      styles.participationButton,
                      participationType === 'required' && styles.participationButtonActive
                    ]}
                    onPress={() => setParticipationType('required')}
                  >
                    <Text style={[
                      styles.participationButtonText,
                      participationType === 'required' && styles.participationButtonTextActive
                    ]}>
                      Required
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.participationButton,
                      participationType === 'recommended' && styles.participationButtonActive
                    ]}
                    onPress={() => setParticipationType('recommended')}
                  >
                    <Text 
                      numberOfLines={1}
                      style={[
                        styles.participationButtonText,
                        participationType === 'recommended' && styles.participationButtonTextActive
                      ]}
                    >
                      Recommended
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, darkMode && styles.textDark]}>Number of Retries</Text>
                <TextInput
                  style={[styles.modalInput, darkMode && styles.modalInputDark]}
                  value={retries}
                  onChangeText={setRetries}
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor={darkMode ? '#666' : '#999'}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setAssignmentModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonAssign]}
                  onPress={assignLearningUnit}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextAssign]}>Assign</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '120%',
    height: '120%',
    objectFit: "cover",
    opacity: 0.5
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  mainCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 16,
    marginTop: 8,
  },
  mainCardDark: {
    backgroundColor: '#2a2a2a',
  },
  mainTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#666',
    borderRadius: 4,
  },
  exercisesHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  activityCard: {
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'visible',
  },
  activityCardDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#444',
  },
  cardContent: {
    paddingBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastPracticed: {
    fontSize: 12,
    color: '#999',
  },
  exerciseType: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontWeight: '600',
  },
  exerciseDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandIconContainer: {
    marginLeft: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  completionStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: '#666',
  },
  tapHintContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF3E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FD902B',
    gap: 8,
  },
  tapHint: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FD902B',
    textAlign: 'center',
  },
  tapHintDark: {
    color: '#FFA040',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  questionsDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 12,
    marginBottom: 12,
  },
  questionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  questionsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  questionCardDark: {
    backgroundColor: '#2a2a2a',
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#e0e0e0',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionItemDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#444',
  },
  correctOption: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#f1f8f4',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
    minWidth: 24,
  },
  optionImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  correctIcon: {
    marginLeft: 'auto',
  },
  statsTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statsColumnMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#aaa',
  },
  assignButton: {
    backgroundColor: '#FD902B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  assignedButton: {
    backgroundColor: '#4CAF50',
  },
  assignButtonIcon: {
    marginRight: 8,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  practiceButton: {
    backgroundColor: '#9C27B0', // Purple color for practice mode
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  practiceLockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 8,
  },
  practiceLockedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalContentDark: {
    backgroundColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  participationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  participationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FD902B',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participationButtonActive: {
    backgroundColor: '#FD902B',
  },
  participationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FD902B',
    textAlign: 'center',
  },
  participationButtonTextActive: {
    color: '#fff',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalInputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#e0e0e0',
  },
  modalButtonAssign: {
    backgroundColor: '#FD902B',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalButtonTextAssign: {
    color: '#fff',
  },
});