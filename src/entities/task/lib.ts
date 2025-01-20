import { Task } from "../../shared/api";

export const getTaskStatus = (data: Task) => {
  return data.completed ? "CLOSED" : "OPENED";
};
