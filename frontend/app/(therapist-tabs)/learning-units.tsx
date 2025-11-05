import React from 'react';
import LearningLibrary from '../../components/shared/learning-library';
// Import for future reference
import { LearningUnit, Exercise, LibraryProps } from '../../types/learningUnitTypes';
import NarrativeInferencingEx1 from '../multiple_select';
import NarrativeInferencingEx2 from '../narrative-inferencing-ex2';

const data = [
  { id: "1", 
    title: "Narrative Inferencing", 
    category: "Comprehension", 
    description: "Learn how to use words to describe pictures!", 
    exercises: [
      { name: "Exercise 1",
        description: "In this exercise, you will learn to give a reason for the happening of a particular situation ultimately helping you to provide reasoning for different situation.", 
        component: NarrativeInferencingEx1},
      { name: "Exercise 2", 
        description: "In this exercise, you will fill in the blanks to make inferences about the pictures given. Allow yourself to share your thoughts and inferences. Encourage yourself to explain your reasoning and connect different elements of the picture.",
        component: NarrativeInferencingEx2}
    ], 
    status: "Unassigned" },
  { id: "2", title: "Opposites Course", 
    category: "Language Building", 
    description: "Simple quiz style activity to learn your opposites!", 
    exercises: [
      { name: "Opposite Pairs - Drag and Match!", description: "Drag and drop your answer!"}, 
      { name: "Opposites Memory Challenge", description: "How many opposites can you remember?" }
    ],
    status: "Unassigned" },
];

export default function LearningUnits() {
  return <LearningLibrary data={data} />;
}
