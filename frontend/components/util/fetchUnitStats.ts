import { API_URL } from "../../config/api";

export interface UnitStats {
  totalDuration: number;
  status: string;
  completedCount: number;
}

export const fetchUnitStats = async (
  learningUnitId: string,
  childId: string | null
): Promise<UnitStats> => {
  try {
    if (!childId) throw new Error("childId is required");

    // Fetch all exercises
    const exResp = await fetch(`${API_URL}/api/exercises/${learningUnitId}/`);
    if (!exResp.ok) throw new Error("Failed to fetch exercises");

    const exercisesData = await exResp.json();
    const exercises = exercisesData as { id: string }[];
    const totalExercises = exercises.length;

    // Fetch all results
    const results = await Promise.all(
      exercises.map(async (ex) => {
        const resResp = await fetch(`${API_URL}/api/results/${childId}/exercise/${ex.id}/`);
        if (!resResp.ok) throw new Error("Failed to fetch results for exercises");

        const resJson = await resResp.json();

        if (Array.isArray(resJson) && resJson.length > 0) {
          const first = resJson[0];
          return {
            time_spent: first.time_spent || 0,
            completed: true,
          };
        }
        return { time_spent: 0, completed: false };
      })
    );

    let totalTime = 0;
    let completedCount = 0;
    results.forEach((r) => {
      totalTime += r.time_spent;
      if (r.completed) completedCount++;
    });

    let baseStatus: string;
    if (completedCount === 0) baseStatus = "Not started";
    else if (completedCount === totalExercises) baseStatus = "Completed";
    else baseStatus = "In progress";

    // Construct status
    const status = `${baseStatus} ${completedCount}/${totalExercises}`;

    return { totalDuration: totalTime, status, completedCount };
  } catch (err) {
    console.error("fetchUnitStats error:", err);
    return { totalDuration: 0, status: "Not started 0/0", completedCount: 0 };
  }
};
