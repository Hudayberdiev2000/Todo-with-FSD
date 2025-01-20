import { normalize, schema } from "normalizr";
import { Task, typicodeApi } from "../../../shared/api";
import {
  createSelector,
  createSlice,
  Dispatch,
  PayloadAction,
} from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
// import { useQuery } from "@tanstack/react-query";
import { useIsFetching, useQuery } from "react-query";
import { useSelector } from "react-redux";

export type QueryConfig = {
  completed?: boolean;
  userId?: number;
};

type NormalizedTasks = Record<number, Task>;

export const taskSchema = new schema.Entity<Task>("tasks");
export const normalizeTask = (data: Task) =>
  normalize<Task, { tasks: NormalizedTasks }>(data, taskSchema);
export const normalizeTasks = (data: Task[]) =>
  normalize<Task, { tasks: NormalizedTasks }>(data, [taskSchema]);

export const initialState: {
  data: NormalizedTasks;
  queryConfig?: QueryConfig;
} = {
  data: {},
  queryConfig: {},
};

export const taskModel = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasksList: (state, { payload }: PayloadAction<Task[]>) => {
      state.data = normalizeTasks(payload).entities.tasks;
    },
    addTaskToList: (state, { payload: task }: PayloadAction<Task>) => {
      state.data = { ...state.data, ...normalizeTask(task).entities.tasks };
    },
    toggleTask: ({ data }, { payload: taskId }: PayloadAction<number>) => {
      data[taskId].completed = !data[taskId].completed;
    },
    setQueryConfig: (state, { payload }: PayloadAction<QueryConfig>) => {
      state.queryConfig = payload;
    },
  },
});

export const { setQueryConfig, toggleTask } = taskModel.actions;

const TASK_LIST_QUERY_KEY = "tasks";

export const getTasksListAsync =
  (params?: typicodeApi.tasks.GetTasksListParams) => (dispatch: Dispatch) =>
    useQuery<AxiosResponse<Task[]>>(
      TASK_LIST_QUERY_KEY,
      () => typicodeApi.tasks.getTasksList(params),
      {
        onSuccess: ({ data }) => dispatch(taskModel.actions.setTasksList(data)),
        refetchOnWindowFocus: false,
      }
    );

export const getTaskByIdAsync =
  (params: typicodeApi.tasks.GetTaskByIdParams) => (dispatch: Dispatch) =>
    useQuery<AxiosResponse<Task>>(
      "task-single",
      () => typicodeApi.tasks.getTaskById(params),
      {
        onSuccess: ({ data }) =>
          dispatch(taskModel.actions.addTaskToList(data)),
        refetchOnWindowFocus: false,
        retry: false,
      }
    );

export const useFilteredTasks = () =>
  useSelector(
    createSelector(
      (state: RootState) => state.tasks.queryConfig,
      (state: RootState) => state.tasks.data,
      (
        queryConfig: RootState["tasks"]["queryConfig"],
        tasks: RootState["tasks"]["data"]
      ) =>
        Object.values(tasks).filter(
          (task) =>
            queryConfig?.completed === undefined ||
            task?.completed === queryConfig.completed
        )
    )
  );

export const useTask = (taskId: number) =>
  useSelector(
    createSelector(
      (state: RootState) => state.tasks.data,
      (tasks) => tasks[taskId]
    )
  );

export const useIsTaskListLoading = (): boolean =>
  useIsFetching([TASK_LIST_QUERY_KEY]) > 0;

export const useIsTasksEmpty = (): boolean =>
  useSelector(
    createSelector(
      (state: RootState) => state.tasks.data,
      (tasks) => Object.keys(tasks).length === 0
    )
  );

export const reducer = taskModel.reducer;
