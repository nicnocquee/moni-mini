import { addTask, processQueue } from "./process-queue";

// Initialization
addTask("data1", { id: "data1" }, 10);
addTask("data2", { id: "data2" }, 5);

processQueue();
