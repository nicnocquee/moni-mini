import Piscina from "piscina";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Data = { id: string };
type Task = { data: Data; interval: number; nextRun?: number };

const taskMap: Map<string, Task> = new Map();

const numCores = os.cpus().length;

const piscina = new Piscina({
  filename: `${__dirname}/worker.ts`,
  maxThreads: numCores,
});

export const addTask = (id: string, data: Data, interval: number) => {
  taskMap.set(id, { data, interval, nextRun: Date.now() });
};

export const updateTask = (id: string, newValues: Partial<Task>) => {
  const task = taskMap.get(id);
  if (!task) return false;
  const updatedTask = { ...task, ...newValues };
  taskMap.set(id, updatedTask);
  return true;
};

export const deleteTask = (id: string) => {
  return taskMap.delete(id);
};

const processQueue = async () => {
  const currentTime = Date.now();

  for (const [id, task] of taskMap) {
    if (task.nextRun && task.nextRun <= currentTime) {
      task.nextRun = undefined;
      piscina
        .run(task.data)
        .then(() => {
          const updatedTask = {
            ...task,
            nextRun: Date.now() + task.interval * 1000,
          };
          taskMap.set(id, updatedTask);
        })
        .catch((err) => {
          console.error("Task failed", err);
        });
    }
  }

  setTimeout(processQueue, 1000);
};

// Initialization
addTask("data1", { id: "data1" }, 10);
addTask("data2", { id: "data2" }, 5);

processQueue();
