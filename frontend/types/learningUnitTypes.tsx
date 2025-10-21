export interface Exercise {
  name?: string;
  description: string;
}

export interface LearningUnit {
  id: string;
  title: string;
  category: string;
  description: string;
  exercises: Exercise[];
  status: string;
}

export interface LibraryProps {
  data: LearningUnit[];
}
