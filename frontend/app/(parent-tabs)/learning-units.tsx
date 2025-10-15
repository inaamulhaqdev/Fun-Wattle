import React from 'react';
import LearningLibrary from '../../components/shared/learning-library';

const data = [
  { id: "1", title: "Narrative Inferencing", category: "Comprehension", status: "Unassigned" },
  { id: "2", title: "Sentence Building", category: "Language Building", status: "Unassigned" },
];

export default function LearningUnits() {
  return <LearningLibrary data={data} />;
}
