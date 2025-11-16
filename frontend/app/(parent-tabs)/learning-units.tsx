import React, { useState } from 'react';
import LearningLibrary from '../../components/shared/learning-library';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LearningUnit } from '../../types/learningUnitTypes';
import { API_URL } from '../../config/api';
import { useApp } from '../../context/AppContext';
import LoginScreen from '../login';

export default function LearningUnits() {
  const [data, setData] = useState<LearningUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const { session, childId } = useApp();
  useFocusEffect(
    React.useCallback(() => {
      const fetchModules = async () => {
        // Guard: don't attempt network requests when there's no authenticated session
        if (!session?.access_token) {
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/content/learning_units/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch modules (${response.status})`);
          }

          const json_resp = await response.json();
          console.log('Fetched learning units:', json_resp);

          // Transform backend data to LearningUnit
          const learningUnits: LearningUnit[] = json_resp.map((unit: any) => ({
            id: unit.id.toString(),
            title: unit.title,
            category: unit.category,
            description: unit.description,
            image: unit.image,
          }));

          setData(learningUnits);
        } catch (err) {
          console.error('Error fetching modules:', err);
          Alert.alert('Error', 'Failed to load learning units. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchModules();
    }, [childId, session?.access_token])
  );

  // If there's no active session, show the login screen (hooks above are still called unconditionally)
  if (!session?.access_token) {
    return <LoginScreen />;
  }

  return <LearningLibrary data={data} loading={loading} />;
}
