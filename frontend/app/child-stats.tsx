import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather, FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const StatsPage = () => {
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      // Hide tab bar when this screen is focused
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });
      
      // Show tab bar when leaving this screen
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: undefined
        });
      };
    }, [navigation])
  );

  const handleMascotCustomization = () => {
    router.push('/mascot-customization');
  };

  const handleHome = () => {
    router.push('/child-dashboard');
  };

  const handleSettings = () => {
    router.push('/child-settings');
  };

  const StatCard = ({ title, value, subtitle, icon, backgroundColor }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    backgroundColor: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor }]}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const RecommendedExercise = ({ title, description, difficulty, onPress }: {
    title: string;
    description: string;
    difficulty: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.exerciseCard} onPress={onPress}>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseTitle}>{title}</Text>
        <Text style={styles.exerciseDescription}>{description}</Text>
        <View style={styles.exerciseFooter}>
          <View style={[styles.difficultyBadge, 
            { backgroundColor: difficulty === 'Easy' ? '#4CAF50' : 
              difficulty === 'Medium' ? '#FF9800' : '#F44336' }
          ]}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Animated Navigation Button Component (same as ChildDashboard)
  const AnimatedNavButton = ({ children, style, onPress = () => {} }: {
    children: React.ReactNode;
    style: any;
    onPress?: () => void;
  }) => {
    return (
      <TouchableOpacity
        style={style}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
      </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Coins Collected"
              value="856"
              subtitle="Total earned"
              icon={<FontAwesome5 name="coins" size={32} color="#FFD700" />}
              backgroundColor="#FFF9E6"
            />
            <StatCard
              title="Current Streak"
              value="12 days"
              subtitle="Keep it up!"
              icon={<FontAwesome6 name="fire" size={32} color="#FF4500" />}
              backgroundColor="#FFF2E6"
            />
            <StatCard
              title="Accuracy Rate"
              value="87%"
              subtitle="Questions correct"
              icon={<FontAwesome5 name="bullseye" size={32} color="#4CAF50" />}
              backgroundColor="#E8F5E8"
            />
            <StatCard
              title="Exercsises Completed"
              value="4 down"
              subtitle="Weekly progress"
              icon={<FontAwesome5 name="book" size={32} color="#9C27B0" />}
              backgroundColor="#F3E5F5"
            />
          </View>

          {/* Weekly Progress Chart Placeholder */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartBars}>
                <View style={[styles.bar, { height: 40 }]} />
                <View style={[styles.bar, { height: 65 }]} />
                <View style={[styles.bar, { height: 30 }]} />
                <View style={[styles.bar, { height: 80 }]} />
                <View style={[styles.bar, { height: 55 }]} />
                <View style={[styles.bar, { height: 90 }]} />
                <View style={[styles.bar, { height: 75 }]} />
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Mon</Text>
                <Text style={styles.chartLabel}>Tue</Text>
                <Text style={styles.chartLabel}>Wed</Text>
                <Text style={styles.chartLabel}>Thu</Text>
                <Text style={styles.chartLabel}>Fri</Text>
                <Text style={styles.chartLabel}>Sat</Text>
                <Text style={styles.chartLabel}>Sun</Text>
              </View>
            </View>
          </View>

          {/* Recommended Exercises */}
          <View style={styles.recommendedSection}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            
            <RecommendedExercise
              title="Advanced Phonics"
              description="Practice complex letter sounds and word building"
              difficulty="Medium"
              onPress={() => console.log('Navigate to Advanced Phonics')}
            />
            
            <RecommendedExercise
              title="Story Comprehension"
              description="Read short stories and answer questions"
              difficulty="Easy"
              onPress={() => console.log('Navigate to Story Comprehension')}
            />
            
            <RecommendedExercise
              title="Grammar Fundamentals"
              description="Learn about nouns, verbs, and sentence structure"
              difficulty="Hard"
              onPress={() => console.log('Navigate to Grammar Fundamentals')}
            />
            
            <RecommendedExercise
              title="Creative Writing"
              description="Express yourself through guided writing prompts"
              difficulty="Medium"
              onPress={() => console.log('Navigate to Creative Writing')}
            />
          </View>

          {/* Bottom padding for scroll */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Navigation (same as ChildDashboard) */}
        <View style={styles.bottomNav}>
          <AnimatedNavButton style={styles.navButton} onPress={handleHome}>
            <FontAwesome6 name="house-chimney-window" size={40} color="white" />
          </AnimatedNavButton>
          
          <AnimatedNavButton style={styles.navButton}>
            <FontAwesome5 name="trophy" size={40} color="#FFD700" />
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chartSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 10,
  },
  bar: {
    width: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    width: 30,
  },
  recommendedSection: {
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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

export default StatsPage;