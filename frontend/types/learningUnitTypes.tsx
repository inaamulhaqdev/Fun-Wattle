export interface Exercise {
  title: string;
  description: string;
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
}

export interface LibraryProps {
  data: LearningUnit[];
}
