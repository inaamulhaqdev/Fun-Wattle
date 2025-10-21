import React from 'react';
import LearningLibrary from '../../components/shared/learning-library';
import NarrativeInferencingEx1 from '../(therapist-tabs)/narrative-inferencing-ex1';
import NarrativeInferencingEx2 from '../(therapist-tabs)/narrative-inferencing-ex2';

const data = [
  {
    id: "1",
    title: "Narrative Inferencing",
    category: "Comprehension",
    status: "Unassigned",
    exercises: [
      { id: "ex1", title: "Exercise 1", component: NarrativeInferencingEx1 },
      { id: "ex2", title: "Exercise 2", component: NarrativeInferencingEx2 },
    ],
  },
  {
    id: "2",
    title: "Sentence Building",
    category: "Language Building",
    status: "Unassigned",
    exercises: [
      // Add sentence building stuff here
    ],
  },
];

export default function LearningUnits() {
  return <LearningLibrary data={data} />;
}
