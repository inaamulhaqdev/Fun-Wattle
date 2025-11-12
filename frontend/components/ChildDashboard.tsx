import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Animated, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { API_URL } from '@/config/api';


// Task data structure
interface Task {
  id: string;
  name: string;
  completed: boolean;
  exerciseType?: string; // For routing to correct exercise component
  exerciseId?: string;   // For passing to exercise component
  description?: string;  // Exercise description
}

// Mascot data structure
interface MascotData {
  bodyType: string;
  accessoryId?: number;
}

const childId = 'some-child-id';

// Default tasks (fallback if API fails)
/* const defaultTasks: Task[] = [
  { id: '1', name: 'activity1', completed: true },
  { id: '2', name: 'multiple_drag_exercise', completed: false },
  { id: '3', name: 'describe_exercise', completed: false },
  { id: '4', name: 'activity4', completed: false },
  { id: '5', name: 'activity5', completed: false },
]; */

// Function to fetch child's coin balance from backend
/*
const fetchCoinBalance = async (childId: string, setCoinBalance: (balance: number) => void) => {
  try {
    const response = await fetch(`${API_URL}/coins/${childId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setCoinBalance(data.coins || 0);
      console.log('Coin balance fetched successfully:', data.coins);
    } else {
      console.warn('Failed to fetch coin balance:', response.status);
      setCoinBalance(0);
    }
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    setCoinBalance(0);
  }
};
*/

// Function to fetch exercises for a learning unit
const fetchExercisesForLearningUnit = async (learningUnitId: string, childId: string): Promise<any[]> => {
  try {
    const url = `${API_URL}/content/${learningUnitId}/exercises/`;
    //const url = `${API_URL}/exercises/${learningUnitId}/`;
    console.log('Fetching exercises from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const exercises = await response.json();
      console.log('Exercises fetched for learning unit', learningUnitId, ':', exercises);

      // For each exercise, check if it has results (meaning it's completed)
      // Create all completion check promises at once for parallel execution
      const completionCheckPromises = exercises.map(async (exercise: any) => {
        try {
          //const resultResponse = await fetch(`${API_URL}/api/exercise-results/?child_id=${childId}&exercise_id=${exercise.id}`, {
          const resultResponse = await fetch(`${API_URL}/result/${childId}/exercise/${exercise.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          let isCompleted = false;
          if (resultResponse.ok) {
            const results = await resultResponse.json();
            isCompleted = Array.isArray(results) && results.length > 0;
            console.log('Exercise', exercise.id, 'completion status:', isCompleted, '(', results.length, 'results found)');
          } else {
            console.log('No results found for exercise', exercise.id, '- treating as incomplete');
          }

          return {
            ...exercise,
            completed: isCompleted
          };
        } catch (error) {
          console.error('Error checking completion status for exercise', exercise.id, ':', error);
          return {
            ...exercise,
            completed: false
          };
        }
      });

      // Execute all completion checks in parallel
      const exercisesWithCompletionStatus = await Promise.all(completionCheckPromises);      console.log('Exercises with completion status:', exercisesWithCompletionStatus);
      return exercisesWithCompletionStatus;
    } else {
      console.error('Failed to fetch exercises for learning unit', learningUnitId, ':', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching exercises for learning unit', learningUnitId, ':', error);
    return [];
  }
};

// Function to fetch assigned learning units from backend
const fetchAssignedLearningUnit = async (childId: string, setTasks: (tasks: Task[]) => void, setIsDataLoaded: (loaded: boolean) => void) => {
  console.log('fetching assigned learning units for childId:', childId);
  console.log('API_URL:', API_URL);

  try {
    const assignmentsResponse = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Assignments response status:', assignmentsResponse.status);
    console.log('Assignments response ok:', assignmentsResponse.ok);

    if (!assignmentsResponse.ok) {
      console.error('Failed to fetch assignments:', assignmentsResponse.status, assignmentsResponse.statusText);
      try {
        const errorText = await assignmentsResponse.text();
        console.error('Assignments error response body:', errorText);
      } catch (bodyError) {
        console.error('Could not read assignments error response body:', bodyError);
      }
      console.log('Using default tasks due to assignments API error');
      return;
    }
    const assignmentsData = await assignmentsResponse.json();
    console.log('Assignments data received:', assignmentsData);

    if (!Array.isArray(assignmentsData) || assignmentsData.length === 0) {
      console.warn('No assignments found, using default tasks');
      return;
    }

    // Extract unique learning unit IDs from assignments
    const learningUnitIds = [...new Set(assignmentsData.map((assignment: any) => assignment.learning_unit.id))];
    console.log('Learning unit IDs found:', learningUnitIds);

    // Fetch exercises for all learning units in parallel
    const allExercises: any[] = [];
    const exercisePromises = learningUnitIds.map(learningUnitId => 
      fetchExercisesForLearningUnit(learningUnitId, childId)
    );
    const exerciseResults = await Promise.all(exercisePromises);
    exerciseResults.forEach(exercises => allExercises.push(...exercises));

    console.log('All exercises fetched:', allExercises);

    // Transform exercises to Task format
    if (allExercises.length > 0) {
      // First, set tasks with basic data for immediate UI display
      const basicTasks: Task[] = allExercises.map((exercise: any, index: number) => ({
        id: exercise.id || `exercise-${index}`,
        name: exercise.title || 'Untitled Exercise',
        completed: false, // Default to incomplete for faster loading
        exerciseType: exercise.exercise_type || 'multiple_drag',
        exerciseId: exercise.id,
        description: exercise.description || ''
      }));
      
      setTasks(basicTasks);
      setIsDataLoaded(true); // Allow UI to show immediately
      console.log('Basic tasks set for immediate display:', basicTasks);
      
      // Then update with actual completion status in background
      setTimeout(async () => {
        const transformedTasks: Task[] = allExercises.map((exercise: any, index: number) => ({
          id: exercise.id || `exercise-${index}`,
          name: exercise.title || 'Untitled Exercise',
          completed: exercise.completed || false,
          exerciseType: exercise.exercise_type || 'multiple_drag',
          exerciseId: exercise.id,
          description: exercise.description || ''
        }));
        
        setTasks(transformedTasks);
        console.log('Tasks updated with completion status:', transformedTasks);
      }, 0);
    } else {
      console.warn('No exercises found for assigned learning units, using default tasks');
      setIsDataLoaded(true);
    }

  } catch (error) {
    console.error('Network error fetching assigned activities:', error);
    console.log('Using default tasks due to network error');
  } finally {
    // Ensure data loaded is set even if there were errors
    setIsDataLoaded(true);
    console.log('Data loading completed');
  }
};

// Function to fetch child's streak count from backend (currenty using hardocoded value)
/*
const fetchStreakCount = async (childId: string, setStreakCount: (count: number) => void) => {
  try {
    const response = await fetch(`${API_URL}/streak/${childId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setStreakCount(data.streak || 0);
      console.log('Streak count fetched successfully:', data.streak);
    } else {
      console.warn('Failed to fetch streak count:', response.status);
    }
  } catch (error) {
    console.error('Error fetching streak count:', error);
  }
};
*/

// Completed Task Image with shape-aware shadow and blooming animation
const CompletedFlowerSVG = ({ size = 200, isNewlyCompleted = false }) => {
  // Use fixed container size for consistent positioning
  const containerSize = 200;

  // Blooming animation for newly completed tasks
  const scaleAnim = React.useRef(new Animated.Value(isNewlyCompleted ? 0 : 1)).current;

  React.useEffect(() => {
    if (isNewlyCompleted) {
      // Start blooming animation from scale 0 to 1 with bounce effect
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNewlyCompleted, scaleAnim]);

  return (
    <View style={{
      width: containerSize,
      height: containerSize,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden', // Prevent animation from affecting layout
    }}>
      <Animated.View style={{
        transform: [{ scale: scaleAnim }],
        position: 'absolute', // Absolutely position the animated content
        alignItems: 'center',
        justifyContent: 'center',
        left: 70,  // Move more to the right
        top: 30,   // Move slightly lower
      }}>
        {/* Shadow layer - black silhouette offset behind */}
        {/* COMMENTED OUT FOR PERFORMANCE - Shadow effects are expensive */}
        {/* <Image
          source={require('@/assets/images/completed_task.png')}
          style={{
            width: size * 1.3,
            height: size * 1.3,
            position: 'absolute',
            top: -26,  // Shadow offset down
            left: -78, // Shadow offset right
            opacity: 0.7,
          }}
          resizeMode="contain"
          // Apply black tint to create shadow effect
          // Note: tintColor works on iOS, for Android we rely on the opacity + positioning
          tintColor="#000000"
        /> */}
        {/* Main flower on top */}
        <Image
          source={require('@/assets/images/completed_task.png')}
          style={{
            width: size * 1.3,
            height: size * 1.3,
            position: 'absolute',
            top: -30,
            left: -80,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

// Incomplete Task Image (Seed with Green Circle)
const IncompleteTaskSVG = ({ size = 200, isAfterNext = false }) => {
  const containerSize = 200;
  const circleSize = size * 1.8;
  const seedSize = size * 2;

  return (
    <View style={{ width: containerSize, height: containerSize, alignItems: 'center', justifyContent: 'center' }}>
      {/* Green Circle underneath */}
      <View style={[
        styles.incompleteTaskCircle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
        }
      ]}>
        <View style={[
          styles.incompleteTaskInnerCircle,
          {
            borderRadius: circleSize / 2,
            backgroundColor: isAfterNext ? '#B0B0B0' : 'rgba(113, 224, 49, 1.0)'
          }
        ]} />
      </View>

      {/* Seed image on top */}
      <Image
        source={require('@/assets/images/seed.png')}
        style={{
          width: seedSize,
          height: seedSize,
          position: 'absolute',
        }}
        resizeMode="contain"
        tintColor={isAfterNext ? '#808080' : undefined}
      />
    </View>
  );
};

// Animated Navigation Button Component
const AnimatedNavButton: React.FC<{ children: React.ReactNode; style?: any; onPress?: () => void }> = ({ children, style, onPress = () => { } }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={style}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Mascot image mappings
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

// Global childId variable - initialized with fallback, updated when component mounts
let globalChildId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // Fallback UUID for testing

// Export function to get the current global childId
export const getGlobalChildId = () => globalChildId;

const ChildDashboard = () => {
  const { completedTaskId, bodyType, accessoryId } = useLocalSearchParams();
  const { childId: contextChildId } = useApp();

  // Update global childId with context value or keep fallback
  const childId = contextChildId || globalChildId;
  
  // Update the global variable so other parts of the app can access it
  React.useEffect(() => {
    if (contextChildId) {
      globalChildId = contextChildId;
      console.log('Global childId updated to:', globalChildId);
    }
  }, [contextChildId]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [bloomingTaskId, setBloomingTaskId] = useState<string | null>(null);
  const [mascotData, setMascotData] = useState<MascotData>({ bodyType: 'koala' });
  // const [streakCount, setStreakCount] = useState(0);
  // const [coinBalance, setCoinBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isUIReady, setIsUIReady] = useState(false);
  const [pendingBloomTaskId, setPendingBloomTaskId] = useState<string | null>(null);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);
  const [loadingStartTime] = useState(Date.now());
  const [contentLayoutComplete, setContentLayoutComplete] = useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const scrollViewRef = React.useRef<ScrollView>(null);
  const tasksRef = React.useRef<Task[]>([]);

  // Keep tasksRef in sync with tasks state
  React.useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  //Fetch mascot data from backend
  /*
  const fetchMascotData = async () => {
    try {
      const response = await fetch(`${API_URL}/mascot/${childId}`, {
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
    }
  };
  */

  // Load mascot data from route parameters
  useEffect(() => {
    if (bodyType || accessoryId) {
      setMascotData({
        bodyType: (bodyType as string) || 'koala',
        accessoryId: accessoryId ? parseInt(accessoryId as string) : undefined
      });
      console.log('Updated mascot from route params:', {
        bodyType: bodyType || 'koala',
        accessoryId: accessoryId ? parseInt(accessoryId as string) : undefined
      });
    }
  }, [bodyType, accessoryId]);

  // Load assigned activities, coin balance, and streak count on component mount
  useEffect(() => {
    console.log('=== CHILD DASHBOARD USEEFFECT TRIGGERED ===');
    console.log('childId value:', childId);
    console.log('childId type:', typeof childId);
    console.log('Context childId:', contextChildId);
    console.log('Using fallback?', !contextChildId);

    // Now childId will always have a value (either from context or fallback)
    console.log('Calling fetchAssignedLearningUnit with childId:', childId);
    fetchAssignedLearningUnit(childId, setTasks, setIsDataLoaded);
    //fetchCoinBalance(childId, setCoinBalance);
    //fetchStreakCount(childId, setStreakCount);
  }, [childId, contextChildId]);

  // Auto-scroll to center the next incomplete task when dashboard loads (NOT during completion)
  useEffect(() => {
    if (!isLoading && tasks.length > 0 && !completedTaskId && !bloomingTaskId) {
      // Find the next incomplete task
      const nextIncompleteIndex = tasks.findIndex(t => !t.completed);
      console.log('Dashboard loaded - auto centering next incomplete task at index:', nextIncompleteIndex);
      
      if (scrollViewRef.current && nextIncompleteIndex !== -1) {
        // Add a delay to ensure UI is fully rendered before scrolling
        const autoScrollTimeout = setTimeout(() => {
          const nextTaskPosition = nextIncompleteIndex * 400;
          const centerOffset = nextTaskPosition - (screenHeight / 2) + 100 + 20; // Account for content top offset
          console.log('Initial auto-centering to position:', centerOffset, 'for task index:', nextIncompleteIndex);
          console.log('Task position:', nextTaskPosition, 'Screen height:', screenHeight);
          
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, centerOffset),
            animated: true
          });
        }, 500); // Reduced delay for faster responsiveness
        
        return () => clearTimeout(autoScrollTimeout);
      }
    }
  }, [isLoading, tasks, screenHeight, completedTaskId, bloomingTaskId]);

  // Handle task completion from activity page with blooming animation
  useEffect(() => {
    console.log('=== COMPLETION EFFECT TRIGGERED ===');
    console.log('completedTaskId received:', completedTaskId);
    console.log('isLoading:', isLoading);
    console.log('Current tasks state:', tasksRef.current);

    if (completedTaskId && typeof completedTaskId === 'string') {
      console.log('Processing completion for task ID:', completedTaskId);

      // Check if task is already completed to avoid duplicate processing
      const currentTask = tasksRef.current.find(task => task.id === completedTaskId);
      if (currentTask?.completed) {
        console.log('Task already completed, skipping...');
        return;
      }

      // If still loading, store the pending bloom task ID
      if (isLoading) {
        console.log('Still loading, storing pending bloom task:', completedTaskId);
        setPendingBloomTaskId(completedTaskId);
        return;
      }

      // Find the completed task index for scrolling
      const completedTaskIndex = tasksRef.current.findIndex(task => task.id === completedTaskId);
      console.log('Task index found:', completedTaskIndex);

      // Scroll to center the blooming flower
      if (scrollViewRef.current && completedTaskIndex !== -1) {
        const taskPosition = completedTaskIndex * 200;
        const centerOffset = taskPosition - (screenHeight / 2) + 100;
        console.log('Scrolling to position:', centerOffset);
        scrollViewRef.current.scrollTo({
          y: Math.max(0, centerOffset),
          animated: true
        });
      }
      setBloomingTaskId(completedTaskId);

      // Update the task to completed and trigger blooming animation
      const completionTimeout = setTimeout(() => {
        console.log('=== EXECUTING TASK COMPLETION ===');
        console.log('Updating tasks, marking task', completedTaskId, 'as completed');

        setTasks(prevTasks => {
          console.log('Previous tasks:', prevTasks);
          const updatedTasks = prevTasks.map(task => {
            if (task.id === completedTaskId) {
              console.log('Marking task as completed:', task);
              return { ...task, completed: true, completedAt: new Date().toISOString() };
            }
            return task;
          });
          console.log('Updated tasks after completion:', updatedTasks);
          return updatedTasks;
        });

        // After blooming animation, scroll to next incomplete task
        setTimeout(() => {
          // Find next incomplete task using the updated tasks from ref
          const currentTasks = tasksRef.current;
          const nextIncompleteIndex = currentTasks.findIndex(t => !t.completed);
          console.log('Next incomplete task index:', nextIncompleteIndex);

          if (scrollViewRef.current && nextIncompleteIndex !== -1) {
            const nextTaskPosition = nextIncompleteIndex * 200;
            const nextCenterOffset = nextTaskPosition - (screenHeight / 2) + 120; // Account for content offset + center properly
            console.log('Scrolling to next task at position:', nextCenterOffset, 'for index:', nextIncompleteIndex);
            scrollViewRef.current.scrollTo({
              y: Math.max(0, nextCenterOffset),
              animated: true
            });
          }
        }, 2000); // Wait for bloom animation to finish

        // Clear the blooming state after animation completes
        setTimeout(() => {
          console.log('Clearing blooming state');
          setBloomingTaskId(null);
        }, 2000);
      }, 5000);

      return () => clearTimeout(completionTimeout);
    }
  }, [completedTaskId, screenHeight, childId, isLoading]);

  // Monitor UI readiness after data loads
  useEffect(() => {
    if (isDataLoaded && !isUIReady) {
      // Wait for critical images to load (background + mascot) + extra time for UI rendering
      const expectedImages = mascotData.accessoryId ? 3 : 2; // background + mascot + optional accessory

      const completeLoading = () => {
        const elapsedTime = Date.now() - loadingStartTime;
        const minimumLoadingTime = 1500; // Reduced to 1.5 seconds for faster loading
        const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

        setTimeout(() => {
          console.log('Loading completed after minimum time with UI buffer');
          setIsUIReady(true);
          setIsLoading(false);
        }, remainingTime);
      };

      // Check if critical images and content layout are ready
      const criticalElementsReady =
        loadedImagesCount >= expectedImages &&
        contentLayoutComplete;

      if (criticalElementsReady) {
        // Critical elements loaded, but ensure minimum loading time + UI render buffer
        const bufferTimeout = setTimeout(() => {
          console.log('Critical elements loaded, adding UI render buffer');
          completeLoading();
        }, 1000); // Reduced buffer time for faster loading
        return () => clearTimeout(bufferTimeout);
      } else {
        // Fallback timeout in case elements don't fire events
        const fallbackTimeout = setTimeout(() => {
          console.log('Fallback timeout - assuming UI is ready');
          console.log('Status: images:', loadedImagesCount, 'expected:', expectedImages, 'layout:', contentLayoutComplete);
          completeLoading();
        }, 3000); // Reduced fallback timeout for faster loading
        return () => clearTimeout(fallbackTimeout);
      }
    }
  }, [isDataLoaded, isUIReady, loadedImagesCount, mascotData.accessoryId, loadingStartTime, contentLayoutComplete]);

  // Helper function to handle image loading
  const handleImageLoad = (imageName: string) => {
    console.log(`Image loaded: ${imageName}`);
    setLoadedImagesCount(prev => prev + 1);
  };

  // Track when content layout is complete
  useEffect(() => {
    if (tasks.length > 0 && isDataLoaded && !contentLayoutComplete) {
      // Give time for all UI elements to render after tasks load
      const layoutTimeout = setTimeout(() => {
        console.log('Content layout should be complete');
        setContentLayoutComplete(true);
      }, 2500); // Allow time for SVG, task images, and layout calculations
      return () => clearTimeout(layoutTimeout);
    }
  }, [tasks, isDataLoaded, contentLayoutComplete]);

  // Handle pending bloom animation after loading completes
  useEffect(() => {
    if (!isLoading && pendingBloomTaskId) {
      console.log('Loading completed, triggering pending bloom animation for:', pendingBloomTaskId);

      // Find the completed task index for scrolling
      const completedTaskIndex = tasksRef.current.findIndex(task => task.id === pendingBloomTaskId);
      console.log('Task index found:', completedTaskIndex);

      // Scroll to center the blooming flower
      if (scrollViewRef.current && completedTaskIndex !== -1) {
        const taskPosition = completedTaskIndex * 200;
        const centerOffset = taskPosition - (screenHeight / 2) + 100;
        console.log('Scrolling to position:', centerOffset);
        scrollViewRef.current.scrollTo({
          y: Math.max(0, centerOffset),
          animated: true
        });
      }

      setBloomingTaskId(pendingBloomTaskId);

      // Update the task to completed and trigger blooming animation
      const completionTimeout = setTimeout(() => {
        console.log('=== EXECUTING PENDING TASK COMPLETION ===');
        console.log('Updating tasks, marking task', pendingBloomTaskId, 'as completed');

        setTasks(prevTasks => {
          console.log('Previous tasks:', prevTasks);
          const updatedTasks = prevTasks.map(task => {
            if (task.id === pendingBloomTaskId) {
              console.log('Marking task as completed:', task);
              return { ...task, completed: true, completedAt: new Date().toISOString() };
            }
            return task;
          });
          console.log('Updated tasks after completion:', updatedTasks);
          return updatedTasks;
        });

        // After blooming animation, scroll to next incomplete task
        setTimeout(() => {
          const currentTasks = tasksRef.current;
          const nextIncompleteIndex = currentTasks.findIndex(t => !t.completed);
          console.log('Next incomplete task index:', nextIncompleteIndex);

          if (scrollViewRef.current && nextIncompleteIndex !== -1) {
            const nextTaskPosition = nextIncompleteIndex * 200;
            const nextCenterOffset = nextTaskPosition - (screenHeight / 2) + 250;
            console.log('Scrolling to next task at position:', nextCenterOffset);
            scrollViewRef.current.scrollTo({
              y: Math.max(0, nextCenterOffset),
              animated: true
            });
          }
        }, 2000);

        // Clear the blooming and pending states after animation completes
        setTimeout(() => {
          console.log('Clearing blooming and pending states');
          setBloomingTaskId(null);
          setPendingBloomTaskId(null);
        }, 2000);
      }, 500); // Short delay to ensure UI is fully rendered

      return () => clearTimeout(completionTimeout);
    }
  }, [isLoading, pendingBloomTaskId, screenHeight]);



  const handleTaskPress = async (task: Task, child_id: string) => {
    if (task.completed) return;

    console.log('=== TASK PRESSED ===');
    console.log('Task:', task);
    console.log('Exercise type:', task.exerciseType);
    console.log('Exercise ID:', task.exerciseId);

    // Determine the route based on exercise type
    let routePath = '/multiple_drag_exercise'; // default
    if (task.exerciseType) {
      switch (task.exerciseType) {
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
          console.warn('Unknown exercise type:', task.exerciseType, 'using default route');
          routePath = '/multiple_drag_exercise';
      }
    }
    console.log('Navigating to:', routePath);
    console.log('Using global childId for navigation:', globalChildId);

    const navigationParams = {
      exerciseId: task.exerciseId || task.id,
      childId: globalChildId, // Use global childId
      taskId: task.id,
      taskName: task.name,
      bodyType: mascotData.bodyType,
      accessoryId: mascotData.accessoryId?.toString() || ''
    };
        
    // Navigate to the exercise with exercise ID and mascot data
    router.push({
      pathname: routePath as any,
      params: navigationParams
    });
  };

  const handleMascotCustomization = () => {
    router.push({
      pathname: '/mascot-customization',
      params: {
        currentBodyType: mascotData.bodyType,
        currentAccessoryId: mascotData.accessoryId?.toString() || ''
      }
    });
  };

  const handleSettings = () => {
    router.push('/child-settings');
  };

  const handleStats = () => {
    router.push('/child-stats');
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  console.log('Tasks:', tasks);

  // Show loading screen while data is being fetched
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('@/assets/images/child-dashboard-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
        onLoad={() => {
          console.log('Background image loaded');
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Today&apos;s tasks</Text>
          <Text style={styles.taskCounter}>{completedTasks}/{totalTasks} COMPLETE</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakContainer}>
            <FontAwesome6 name="fire" size={24} color="#FF4500" />
            <Text style={styles.streakText}>5</Text>
          </View>
          <View style={styles.starContainer}>
            <MaterialCommunityIcons name="star-circle" size={24} color="#007ae6ff" />
            <Text style={styles.starText}>150</Text>
          </View>
        </View>
      </View>

      {/* Main Content - Vertical ScrollView with Wave */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.verticalScroll}
        contentContainerStyle={styles.scrollContent}
        onLayout={() => {
          console.log('ScrollView layout completed');
          // Mark content layout as complete
          if (!contentLayoutComplete) {
            setTimeout(() => {
              setContentLayoutComplete(true);
            }, 300);
          }
        }}
      >
        {/* Green Wave Path */}
        <Svg
          style={styles.sineWavePath}
          width={screenWidth}
          height={tasks.length * 200 + 200}
        >
          <Path
            d={(() => {
              const amplitude = screenWidth * 0.25;
              const frequency = 1.5;
              const centerX = screenWidth * 0.5;

              let pathData = '';
              const steps = tasks.length * 10;

              for (let i = 0; i <= steps; i++) {
                const taskIndex = i / 10;
                const y = taskIndex * 200 + 100;
                const x = centerX + Math.sin(taskIndex * frequency) * amplitude;

                if (i === 0) {
                  pathData += `M ${x} ${y}`;
                } else {
                  pathData += ` L ${x} ${y}`;
                }
              }

              return pathData;
            })()}
            stroke="#4CAF50"
            strokeWidth="15"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        {tasks.map((task, index) => {
          // Calculate position of tasks on sine wave
          const amplitude = screenWidth * 0.25;
          const frequency = 1.5;
          const centerX = screenWidth * 0.5;
          const sineX = centerX + Math.sin(index * frequency) * amplitude;

          // Find the next incomplete task
          const nextIncompleteIndex = tasks.findIndex(t => !t.completed);
          const isNextTask = index === nextIncompleteIndex;
          const isAfterNextTask = !task.completed && index > nextIncompleteIndex;

          // Debug logging for task progression
          if (index === 0) {
            console.log('Next incomplete task index:', nextIncompleteIndex);
            console.log('Next incomplete task:', tasks[nextIncompleteIndex]);
          }

          return (
            <View
              key={task.id}
              style={[
                styles.taskContainer,
                {
                  left: sineX - 100, // Offset by half the container width (200/2 = 100) to center it
                  top: index * 200, // Vertical spacing between tasks
                }
              ]}
            >
              {/* START Sign and Arrow for Next Task */}
              {isNextTask && (
                <View style={styles.startSignContainer}>
                  <View style={styles.startSign}>
                    <Text style={styles.startText}>START</Text>
                  </View>
                  {/* Downward pointing triangle */}
                  <View style={styles.triangleContainer}>
                    <View style={styles.triangle} />
                  </View>
                </View>
              )}

              {/* Task flower/circle */}
              <View style={styles.taskFlowerContainer}>
                <TouchableOpacity
                  onPress={() => handleTaskPress(task, childId)}
                  disabled={task.completed || isAfterNextTask}
                >
                  {task.completed ? (
                    <CompletedFlowerSVG
                      size={180}
                      isNewlyCompleted={bloomingTaskId === task.id}
                    />
                  ) : (
                    <IncompleteTaskSVG size={60} isAfterNext={isAfterNextTask} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Mascot Character */}
      <View style={styles.koalaContainer} pointerEvents="none">
        {(() => {
          const { bodyImage, accessoryImage } = getMascotImages(mascotData);
          return (
            <>
              <Image
                source={bodyImage}
                style={styles.mascotImage}
                resizeMode="contain"
                onLoad={() => handleImageLoad('mascot-body')}
              />
              {accessoryImage && (
                <Image
                  source={accessoryImage}
                  style={[styles.mascotImage, styles.mascotAccessory]}
                  resizeMode="contain"
                  onLoad={() => handleImageLoad('mascot-accessory')}
                />
              )}
            </>
          );
        })()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <AnimatedNavButton style={styles.navButton}>
          <FontAwesome6 name="house-chimney-window" size={40} color="#FFD700" />
        </AnimatedNavButton>

        <AnimatedNavButton style={styles.navButton} onPress={handleStats}>
          <FontAwesome5 name="trophy" size={40} color="white" />
        </AnimatedNavButton>

        <AnimatedNavButton style={styles.navButton} onPress={handleMascotCustomization}>
          <MaterialCommunityIcons name="koala" size={60} color="white" />
        </AnimatedNavButton>

        <AnimatedNavButton style={styles.navButton} onPress={handleSettings}>
          <FontAwesome5 name="cog" size={40} color="white" />
        </AnimatedNavButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    //filter: 'brightness(1.3)',
    opacity: 0.5,
  },

  header: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 30,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskCounter: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    fontWeight: '600',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  starText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  verticalScroll: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    position: 'relative',
    minHeight: '100%',
    paddingBottom: 400,
    left: -40,
    top: 20,
  },
  sineWavePath: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  taskContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 200,
    zIndex: 2,
  },
  taskFlowerContainer: {
    marginBottom: 20,
  },
  incompleteTaskCircle: {
    backgroundColor: 'rgba(113, 224, 49, 1.0)',
    shadowColor: '#000',
    shadowOffset: {
      width: 3,
      height: 4,
    },
    shadowOpacity: 0.7,
    shadowRadius: 1,
    elevation: 8,
  },
  incompleteTaskInnerCircle: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    borderColor: '#ffffffff',
    opacity: 1,
  },
  startSignContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  startSign: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e4e4e4ff',
  },
  startText: {
    color: '#4CAF50',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  arrow: {
    fontSize: 20,
    color: '#4CAF50',
    transform: [{ rotate: '45deg' }],
  },
  triangleContainer: {
    alignItems: 'center',
    top: -1.5,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 1) 255, 255, 1)',
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  koalaContainer: {
    position: 'absolute',
    bottom: 60,
    left: 90,
    height: 200,
    width: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 200,
    height: 400,
    position: 'absolute',
    zIndex: 1,
  },
  mascotAccessory: {
    position: 'absolute',
    zIndex: 2,
  },
  koalaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFB366',
    paddingVertical: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
  // Loading screen styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default ChildDashboard;