import React from 'react';
import LearningLibrary from '../../components/shared/learning-library';
import { NarrativeInferencingEx1 } from '../(therapist-tabs)/narrative-inferencing-ex1';
import { NarrativeInferencingEx2 } from '../(therapist-tabs)/narrative-inferencing-ex2';

const data = [
  { id: "1", 
    title: "Narrative Inferencing", 
    category: "Comprehension", 
    description: "Learn how to use words to describe pictures!", 
    exercises: [
      { 
        id: "1-1",
        title: "Reasoning Exercise",
        description: "In this exercise, you will learn to give a reason for the happening of a particular situation ultimately helping you to provide reasoning for different situation.",
        component: NarrativeInferencingEx1
      },
      { 
        id: "1-2",
        title: "Inference Fill-in-the-Blanks",
        description: "In this exercise, you will fill in the blanks to make inferences about the pictures given. Allow yourself to share your thoughts and inferences. Encourage yourself to explain your reasoning and connect different elements of the picture.",
        component: NarrativeInferencingEx2
      }
    ], 
    status: "Unassigned" },
  { id: "2", title: "Opposites Course", 
    category: "Language Building", 
    description: "Simple quiz style activity to learn your opposites!", 
    exercises: [
      { 
        id: "2-1",
        title: "Opposite Pairs - Drag and Match!",
        description: "Drag and drop your answer!",
        component: () => <div>Opposite Pairs - Drag and Match!</div>
      }, 
      { 
        id: "2-2",
        title: "Opposites Memory Challenge",
        description: "How many opposites can you remember?",
        component: () => <div>Opposites Memory Challenge</div>
      }
    ],
    status: "Unassigned" },
];

export default function LearningUnits() {
  return <LearningLibrary data={data} />;
}
