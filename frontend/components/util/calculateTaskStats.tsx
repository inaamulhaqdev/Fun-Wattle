export interface Task {
  progress?: string;
  time?: string;
}

export function calculateTaskStats(tasks: Task[]) {
  let overallDone = 0;
  let overallTasks = 0;
  let overallTime = 0;

  tasks.forEach(task => {
    if (task.progress) {
      const [done, total] = task.progress.split("/").map(Number);
      overallDone += done;
      overallTasks += total;
    }
    overallTime += Number(task.time || 0);
  });

  return {
    activitiesDone: `${overallDone}/${overallTasks}`,
    overallTime,
  };
}
