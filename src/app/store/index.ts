import { configureStore } from "@reduxjs/toolkit";
import { taskModel } from "../../entities/task/model/tasks";

export const store = configureStore({
  reducer: {
    tasks: taskModel.reducer,
  },
});
