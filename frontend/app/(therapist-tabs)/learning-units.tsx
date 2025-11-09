import React, { useState } from 'react';
import LearningLibrary from '../../components/shared/learning-library';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LearningUnit } from '../../types/learningUnitTypes';
import { API_URL } from '../../config/api';
import { useApp } from '../../context/AppContext';

export default function LearningUnits() {
  const [data, setData] = useState<LearningUnit[]>([]);
  const { childId } = useApp();

  useFocusEffect(
    React.useCallback(() => {
      const fetchModules = async () => {
        try {
          const response = await fetch(`${API_URL}/content/learning_units/`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch modules (${response.status})`);
          }

          const json_resp = await response.json();

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
        }
      };

      fetchModules();
    }, [childId])
  );

  return <LearningLibrary data={data} />;
}
