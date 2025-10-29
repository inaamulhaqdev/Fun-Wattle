import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const { width } = Dimensions.get('window');

// Tutorial slides data - easily expandable
interface TutorialSlide {
  id: number;
  title: string;
  description: string;
  imagePlaceholder: string;
}

const tutorialSlides: TutorialSlide[] = [
  {
    id: 1,
    title: 'Introducing FunWattle \nfor Parents',
    description: 'Introducing our dashboard designed to help your child\'s journey.',
    imagePlaceholder: '📊'
  },
  {
    id: 2,
    title: 'Track Your Child\'s Progress',
    description: 'Monitor learning milestones and achievements in real-time.',
    imagePlaceholder: '📈'
  },
  {
    id: 3,
    title: 'Communicate with \nTherapists',
    description: 'Stay connected with your child\'s speech therapy team.',
    imagePlaceholder: '💬'
  },
  {
    id: 4,
    title: 'Customize \nLearning Paths',
    description: 'Personalize activities based on your child\'s needs and interests.',
    imagePlaceholder: '🎯'
  },
  {
    id: 5,
    title: 'Access \nResources & Tips',
    description: 'Get helpful guidance from our AI speech therapists to support learning at home.',
    imagePlaceholder: '📚'
  },
];

const ParentIntroductionPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (currentSlide === tutorialSlides.length - 1) {
      // Navigate to parent dashboard
      router.replace('/(parent-tabs)/parent-dashboard');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    // Navigate to parent dashboard
    router.replace('/(parent-tabs)/parent-dashboard');
  };

  const currentSlideData = tutorialSlides[currentSlide];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{currentSlideData.title}</Text>

        {/* Image Placeholder Container */}
        <View style={styles.imageContainer}>
          {/* Left tap area */}
          <TouchableOpacity
            style={styles.leftTapArea}
            onPress={prevSlide}
            disabled={currentSlide === 0}
          />

          {/* Image placeholder */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>{currentSlideData.imagePlaceholder}</Text>
            <Feather name="image" size={40} color="#666" />
          </View>

          {/* Right tap area */}
          <TouchableOpacity
            style={styles.rightTapArea}
            onPress={nextSlide}
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>{currentSlideData.description}</Text>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {tutorialSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      </View>

      {/* Skip Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <Feather name="skip-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    alignSelf: 'stretch',
    marginBottom: 40,
    lineHeight: 36,
  },
  imageContainer: {
    position: 'relative',
    width: width - 80,
    height: 400,
    marginBottom: 30,
  },
  leftTapArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '30%',
    height: '100%',
    zIndex: 2,
  },
  rightTapArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '30%',
    height: '100%',
    zIndex: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
    alignSelf: 'stretch',
    lineHeight: 22,
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 18,
    color: '#000',
    marginRight: 8,
    textDecorationLine: 'underline',
  },
});

export default ParentIntroductionPage;