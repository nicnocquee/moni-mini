import Piscina from "piscina";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import { logWithTimestamp } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Data = { id: string; urls: string[]; dbPath: string };
type Task = { data: Data; interval: number; nextRun?: number };

const taskMap: Map<string, Task> = new Map();

const numCores = os.cpus().length;

logWithTimestamp(`Piscina will use ${numCores} cores`);

const piscina = new Piscina({
  filename:
    process.env.NODE_ENV === "development"
      ? `${__dirname}/worker.ts`
      : `${__dirname}/worker.mjs`,
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

export const processQueue = async () => {
  const currentTime = Date.now();

  for (const [id, task] of taskMap) {
    if (task.nextRun && task.nextRun <= currentTime) {
      task.nextRun = undefined;
      piscina
        .run(task.data)
        .then(() => {
          // no need to do anything
        })
        .catch((err) => {
          // no need to do anything
        })
        .finally(() => {
          const updatedTask = {
            ...task,
            nextRun: Date.now() + task.interval * 1000,
          };
          taskMap.set(id, updatedTask);
        });
    }
  }

  setTimeout(processQueue, 1000);
};
