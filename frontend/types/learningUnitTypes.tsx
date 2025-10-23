export interface Exercise {
  id?: string;
  name?: string;
  title?: string;
  description: string;
  component?: React.ComponentType<any>;
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
