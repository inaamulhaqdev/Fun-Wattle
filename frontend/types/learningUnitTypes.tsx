export interface Exercise {
  id: string;
  title: string;
  description: string;
  order: number;
  time_spent?: number;
  completed?: boolean;
  accuracy?: number;
  num_correct?: number;
  num_incorrect?: number;
  last_practiced?: string | null;
}

export type AssignedLearningUnit = {
  assignmentId: string;
  learningUnitId: string;
  title: string;
  category: string;
  participationType: "required" | "recommended";
  time: number;
  progress?: number;
  status?: string;
  assignedDate?: string;
};

export interface LearningUnit {
  id: string;
  title: string;
  category: string;
  description: string;
  exercises?: Exercise[];
  status: string;
  image?: string;
  isAssigned?: boolean;
  isCompleted?: boolean;
}

export interface LibraryProps {
  data: LearningUnit[];
  loading?: boolean;
}
