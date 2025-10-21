import Constants from 'expo-constants';

const getApiUrl = () => {
  const experienceUrl = Constants.experienceUrl;

  if (experienceUrl) {
    // experienceUrl will be something like exp://192.168.1.100:8081, and we need to get just 192.168.1.100
    const host = experienceUrl.split('://')[1].split(':')[0];
    return `http://${host}:8000`;  // Point to Django backend
  }
};

export const API_URL = getApiUrl();