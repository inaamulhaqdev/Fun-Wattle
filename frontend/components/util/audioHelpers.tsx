import { Alert } from 'react-native';
import { AudioModule, RecordingPresets } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { getInfoAsync, readAsStringAsync, EncodingType } from 'expo-file-system/legacy';

export const requestAudioPermissions = async () => {
  const status = await AudioModule.requestRecordingPermissionsAsync();
  if (!status.granted) {
    Alert.alert('Permission to access microphone was denied');
    return false;
  }
  await AudioModule.setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: true,
  });
  return true;
};

export const startRecording = async (audioRecorder: any) => {
  try {
    await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
    await audioRecorder.record();
    return true;
  } catch (err) {
    console.error('Error starting recording:', err);
    return false;
  }
};

export const stopRecording = async (audioRecorder: any) => {
  try {
    await audioRecorder.stop();
    return audioRecorder.uri; // uri of recorded audio input 
  } catch (err) {
    console.error('Error stopping recording:', err);
    return null;
  }
};
