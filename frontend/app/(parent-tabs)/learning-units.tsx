import React from 'react';
import LearningLibrary from '../../components/shared/learning-library';
import { LearningUnit, LibraryProps } from '../../types/learningUnitTypes';

const data = [
  { id: "1", 
    title: "Narrative Inferencing", 
    category: "Comprehension", 
    description: "Learn how to use words to describe pictures!", 
    exercises: [
      { description: "In this exercise, you will learn to give a reason for the happening of a particular situation ultimately helping you to provide reasoning for different situation."},
      { description: "In this exercise, you will fill in the blanks to make inferences about the pictures given. Allow yourself to share your thoughts and inferences. Encourage yourself to explain your reasoning and connect different elements of the picture."}
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

/* // Module definition (backend)
interface Module {
  moduleId: string;
  name: string;
  description?: string;
  configuration?: {
    exercises?: { name?: string; description: string }[];
    [key: string]: any;
  };
}

export default function LearningUnits() {
  const [data, setData] = useState<LearningUnit[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get<Module[]>('http://localhost:8000/api/modules');

        // Map response format to LearningUnit format
        const learningUnits: LearningUnit[] = res.data.map((mod) => ({
          id: mod.moduleId,
          title: mod.name,
          category: '',
          description: mod.description || '',
          exercises: mod.configuration?.exercises || [],
          status: '',
        }));

        setData(learningUnits);
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    fetchModules();
  }, []);

  return <LearningLibrary data={data} />;
} */

/* Expected response from backend (JSON):
[
  {
    id: "1",
    title: "Narrative Inferencing",
    category: "Comprehension",
    description: "Learn how to use words to describe pictures!",
    exercises: [
      { description: "In this exercise, you will learn to give a reason for the happening of a particular situation ultimately helping you to provide reasoning for different situation." },
      { description: "In this exercise, you will fill in the blanks to make inferences about the pictures given. Allow yourself to share your thoughts and inferences. Encourage yourself to explain your reasoning and connect different elements of the picture." }
    ],
    status: "Unassigned"
  },
  {
    id: "2",
    title: "Opposites Course",
    category: "Language Building",
    description: "Simple quiz style activity to learn your opposites!",
    exercises: [
      { name: "Opposite Pairs - Drag and Match!", description: "Drag and drop your answer!" },
      { name: "Opposites Memory Challenge", description: "How many opposites can you remember?" }
    ],
    status: "Unassigned"
  }
] */

export default function LearningUnits() {
  return <LearningLibrary data={data} />;
}
