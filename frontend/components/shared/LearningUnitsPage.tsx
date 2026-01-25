import React, { useState } from 'react';
import LearningLibrary from './LearningLibrary';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LearningUnit } from '../../types/learningUnitTypes';
import { API_URL } from '../../config/api';
import { useApp } from '../../context/AppContext';
import LoginScreen from '@/app/login';

export default function LearningUnitsPage() {
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

          // Fetch assigned and completed units for the selected child
          let assignedUnitIds: string[] = [];
          let completedUnitIds: string[] = [];

          if (childId) {
            console.log('Fetching assignments for childId:', childId);
            try {
              const assignedResponse = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              });

              if (assignedResponse.ok) {
                const assignments = await assignedResponse.json();
                assignedUnitIds = assignments.map((a: any) => a.learning_unit.id);
                console.log('Assigned Unit IDs:', assignedUnitIds);

                // Check completion status for each assigned unit
                for (const assignment of assignments) {
                  const unitId = assignment.learning_unit.id;
                  
                  const exercisesResponse = await fetch(`${API_URL}/content/${unitId}/exercises/`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                  });

                  if (exercisesResponse.ok) {
                    const exercises = await exercisesResponse.json();
                    let allCompleted = exercises.length > 0;

                    for (const exercise of exercises) {
                      const resultsResponse = await fetch(`${API_URL}/result/${childId}/exercise/${exercise.id}/`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                      });

                      if (resultsResponse.ok) {
                        const results = await resultsResponse.json();
                        if (!Array.isArray(results) || results.length === 0) {
                          allCompleted = false;
                          break;
                        }
                      } else {
                        allCompleted = false;
                        break;
                      }
                    }

                    if (allCompleted && exercises.length > 0) {
                      completedUnitIds.push(unitId);
                    }
                  }
                }
                console.log('Completed Unit IDs:', completedUnitIds);
              }
            } catch (error) {
              console.error('Error fetching child assignments:', error);
            }
          }

          // Transform backend data to LearningUnit with status
          const learningUnits: LearningUnit[] = json_resp.map((unit: any) => ({
            id: unit.id.toString(),
            title: unit.title,
            category: unit.category,
            description: unit.description,
            image: unit.image,
            isAssigned: assignedUnitIds.includes(unit.id),
            isCompleted: completedUnitIds.includes(unit.id),
          }));

          console.log('Learning units with status:', learningUnits.map(u => ({ 
            title: u.title, 
            isAssigned: u.isAssigned, 
            isCompleted: u.isCompleted 
          })));

          setData(learningUnits);
        } catch (err) {
          console.error('Error fetching modules:', err);
          Alert.alert('Error', 'Failed to load learning units. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchModules();
    }, [session?.access_token, childId])
  );

  // If there's no active session, show the login screen (hooks above are still called unconditionally)
  if (!session?.access_token) {
    return <LoginScreen />;
  }

  return <LearningLibrary data={data} loading={loading} />;
}