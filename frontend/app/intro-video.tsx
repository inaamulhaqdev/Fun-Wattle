import React, { useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Video } from 'expo-av';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

export default function IntroVideoScreen() {
  const videoRef = useRef<Video>(null);
  const [progress, setProgress] = useState(0);

  const skipToWelcome = () => {
    router.push('/welcome');
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.durationMillis) {
      setProgress(status.positionMillis / status.durationMillis);
    }
  };

  const VideoComponent: any = Video;

  return (
    <View style={styles.container}>
      {/* Video */}
      <View style={styles.videoContainer}>
        <VideoComponent
        ref={videoRef}
        source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }} // sample video
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

        {/* Video description */}
        <ThemedText style={styles.videoDescription}>
          Watch the following video for an {'\n'}
          introduction to the app.
        </ThemedText>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
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
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '80%',
    borderRadius: 12,
    backgroundColor: '#000',
    marginBottom: 20,
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
