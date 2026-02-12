import axios from 'axios';
import type { Week, Workout, WorkoutTemplate, PaceDataPoint, RaceInfo, Feedback } from './types';

const api = axios.create({ baseURL: '/api' });

// Weeks
export const getWeek = (weekStart: string) =>
  api.get<Week>(`/weeks/${weekStart}`).then((r) => r.data);

export const updateWeek = (weekStart: string, data: { mileage_target?: number; notes?: string }) =>
  api.put<Week>(`/weeks/${weekStart}`, data).then((r) => r.data);

// Workouts
export const createWorkout = (data: Partial<Workout> & { date: string; workout_type: string }) =>
  api.post<Workout>('/workouts', data).then((r) => r.data);

export const updateWorkout = (id: number, data: Partial<Workout>) =>
  api.put<Workout>(`/workouts/${id}`, data).then((r) => r.data);

export const deleteWorkout = (id: number) =>
  api.delete(`/workouts/${id}`);

export const createFromTemplate = (templateId: number, date: string) =>
  api.post<Workout>('/workouts/from-template', { template_id: templateId, date }).then((r) => r.data);

export const swapWorkouts = (id1: number, id2: number) =>
  api.post<Workout[]>('/workouts/swap', { workout_id_1: id1, workout_id_2: id2 }).then((r) => r.data);

// Templates
export const getTemplates = () =>
  api.get<WorkoutTemplate[]>('/templates').then((r) => r.data);

export const createTemplate = (data: Omit<WorkoutTemplate, 'id'>) =>
  api.post<WorkoutTemplate>('/templates', data).then((r) => r.data);

export const updateTemplate = (id: number, data: Partial<WorkoutTemplate>) =>
  api.put<WorkoutTemplate>(`/templates/${id}`, data).then((r) => r.data);

export const deleteTemplate = (id: number) =>
  api.delete(`/templates/${id}`);

// Stats
export const getPaceTrend = () =>
  api.get<PaceDataPoint[]>('/stats/pace-trend').then((r) => r.data);

export const getTotalMileage = () =>
  api.get<{ total_miles: number }>('/stats/total-mileage').then((r) => r.data);

// Race info
export const getRaceInfo = () =>
  api.get<RaceInfo>('/race-info').then((r) => r.data);

// Feedback
export const createFeedback = (data: { message: string; page?: string | null }) =>
  api.post<Feedback>('/feedback', data).then((r) => r.data);
