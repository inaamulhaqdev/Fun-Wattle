import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

export default function IntroVideoScreen() {
  const skipToWelcome = () => {
    router.push('/welcome');
  };

  return (
    <View style={styles.container}>      
      {/* Video placeholder container */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          {/* Play button icon */}
          <View style={styles.playButton}>
            <ThemedText style={styles.playIcon}>▷</ThemedText>
          </View>
        </View>
        
        {/* Video description text */}
        <ThemedText style={styles.videoDescription}>
          Watch the following video for an {'\n'}
          introduction to the app.
        </ThemedText>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
      
      {/* Skip button */}
      <Pressable style={styles.skipButton} onPress={skipToWelcome}>
        <ThemedText style={styles.skipText}>Skip</ThemedText>
        <ThemedText style={styles.skipIcon}>⏭</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    color: '#999',
    textAlign: 'left',
    marginTop: 20,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  videoPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playButton: {
    width: 60,
    height: 60,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 40,
    color: '#666',
  },
  videoDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
    maxWidth: 300,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '30%', // Shows 30% progress
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: 'flex-end',
  },
  skipText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
    marginRight: 8,
  },
  skipIcon: {
    fontSize: 16,
    color: '#000',
  },
});