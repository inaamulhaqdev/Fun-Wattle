import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Animated } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams();

// Task data structure
interface Task {
  id: string;
  name: string;
  completed: boolean;
}

// Sample tasks -
const sampleTasks: Task[] = [
  { id: '1', name: 'activity1', completed: true },
  { id: '2', name: 'opposites_exercise', completed: false },
  { id: '3', name: 'activity3', completed: false },
  { id: '4', name: 'activity4', completed: false },
  { id: '5', name: 'activity5', completed: false },
];





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
        <Image
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
        />
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
const AnimatedNavButton: React.FC<{ children: React.ReactNode; style?: any; onPress?: () => void }> = ({ children, style, onPress = () => {} }) => {
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

const ChildDashboard = () => {
  const { completedTaskId } = useLocalSearchParams();
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [bloomingTaskId, setBloomingTaskId] = useState<string | null>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Handle task completion from activity page with blooming animation
  useEffect(() => {
    console.log('=== COMPLETION EFFECT TRIGGERED ===');
    console.log('completedTaskId received:', completedTaskId);
    console.log('Current tasks state:', tasks);

    if (completedTaskId && typeof completedTaskId === 'string') {
      console.log('Processing completion for task ID:', completedTaskId);

      // Check if task is already completed to avoid duplicate processing
      const currentTask = tasks.find(task => task.id === completedTaskId);
      if (currentTask?.completed) {
        console.log('Task already completed, skipping...');
        return;
      }

      // Find the completed task index for scrolling
      const completedTaskIndex = tasks.findIndex(task => task.id === completedTaskId);
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
              return { ...task, completed: true };
            }
            return task;
          });
          console.log('Updated tasks after completion:', updatedTasks);
          return updatedTasks;
        });

        // After blooming animation, scroll to next incomplete task
        setTimeout(() => {
          setTasks(currentTasks => {
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
            return currentTasks;
          });
        }, 2000); // Wait for bloom animation to finish

        // Clear the blooming state after animation completes
        setTimeout(() => {
          console.log('Clearing blooming state');
          setBloomingTaskId(null);
        }, 2000);
      }, 1000);

      return () => clearTimeout(completionTimeout);
    }
  }, [completedTaskId, tasks, screenHeight]);

  // Debug effect to track task state changes
  useEffect(() => {
    console.log('=== TASKS STATE CHANGED ===');
    console.log('Current tasks:', tasks);
    tasks.forEach((task, index) => {
      console.log(`Task ${index}: ${task.name} - completed: ${task.completed}`);
    });
  }, [tasks]);

  const handleTaskPress = async (task: Task) => {
    if (task.completed) return;
    try {
      const res = await fetch(`http://192.168.0.234:8000/api/modules/${id}/`);
      if (!res.ok) throw new Error('Failed to fetch activities');

      const assignedActivities = await res.json();
      const currentTask = assignedActivities.find((a: any) => a.activity.id === task.id);

      router.push({
        // Task name is used as the route name
        pathname: `/${task.name}` as typeof router.push extends (args: { pathname: infer T, params?: any }) => any ? T : string,
        params: { taskId: task.id, taskName: task.name }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMascotCustomization = () => {
    router.push('/mascot-customization');
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

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('@/assets/images/child-dashboard-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
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
            <Text style={styles.streakText}>12</Text>
          </View>
          <View style={styles.starContainer}>
            <MaterialCommunityIcons name="star-circle" size={24} color="#007ae6ff" />
            <Text style={styles.starText}>120</Text>
          </View>
        </View>
      </View>

      {/* Main Content - Vertical ScrollView with Wave */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.verticalScroll}
        contentContainerStyle={styles.scrollContent}
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
                  onPress={() => handleTaskPress(task)}
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

      {/* Koala Character */}
      <View style={styles.koalaContainer} pointerEvents="none">
          <Image
            source={require('@/assets/images/mascot.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
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
    zIndex: -1,
    opacity: 0.3,
    filter: 'brightness(1.3)',
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
  },
  scrollContent: {
    position: 'relative',
    minHeight: '100%',
    left: -40,
    top: -20,
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
    bottom: 70,
    right: -30,
    height: 300,
    width: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 400,
    height: 700,
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
});

export default ChildDashboard;