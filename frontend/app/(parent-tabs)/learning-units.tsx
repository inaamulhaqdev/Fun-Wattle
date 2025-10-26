import React, { useEffect, useState } from 'react';
import LearningLibrary from '../../components/shared/learning-library';
import { Alert } from 'react-native';
import { LearningUnit, LibraryProps } from '../../types/learningUnitTypes';
import { API_URL } from '../../config/api';
import { useApp } from '../../context/AppContext';

export default function LearningUnits() {
  const [data, setData] = useState<LearningUnit[]>([]);
  const { childId } = useApp();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(`${API_URL}/api/learning_units?child_id=${childId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch modules (${response.status})`);
        }

        const json_resp = await response.json();

        // Transform backend data to Learning_Unit
        const learningUnits: LearningUnit[] = json_resp.map((unit: any) => ({
          id: unit.id.toString(),
          title: unit.title,
          category: unit.category,
          description: unit.description,
          exercises: unit.exercises.map((exercise: any) => ({
            title: exercise.title,
            description: exercise.description,
          })),
          status: unit.status
        }));

        setData(learningUnits);
      } catch (err) {
        console.error('Error fetching modules:', err);
        Alert.alert('Error', 'Failed to load learning units. Please try again.');
      }
    };

    fetchModules();
  }, []);

  return <LearningLibrary data={data} />;
}
