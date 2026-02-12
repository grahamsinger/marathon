export type WorkoutType =
  | 'long_run'
  | 'medium_long_run'
  | 'speed_work'
  | 'easy_run'
  | 'cross_train'
  | 'rest'
  | 'strength';

export interface Workout {
  id: number;
  week_id: number;
  date: string;
  workout_type: WorkoutType;
  distance: number | null;
  pace_seconds: number | null;
  interval_pace_seconds: number | null;
  duration_minutes: number | null;
  description: string | null;
  is_completed: boolean;
}

export interface Week {
  id: number;
  week_start: string;
  mileage_target: number | null;
  notes: string | null;
  workouts: Workout[];
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  workout_type: WorkoutType;
  distance: number | null;
  pace_seconds: number | null;
  interval_pace_seconds: number | null;
  duration_minutes: number | null;
  description: string | null;
}

export interface PaceDataPoint {
  date: string;
  pace_seconds: number;
  distance: number;
}

export interface RaceInfo {
  race_name: string;
  race_date: string;
  days_until_race: number;
  goal_time_seconds: number;
  goal_pace_seconds: number;
}

export interface Feedback {
  id: number;
  message: string;
  page: string | null;
  created_at: string;
}

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  long_run: 'Long Run',
  medium_long_run: 'Medium Long Run',
  speed_work: 'Speed Work',
  easy_run: 'Easy Run',
  cross_train: 'Cross Train',
  rest: 'Rest',
  strength: 'Strength',
};

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  long_run: 'bg-red-100 border-red-300 text-red-800',
  medium_long_run: 'bg-orange-100 border-orange-300 text-orange-800',
  speed_work: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  easy_run: 'bg-green-100 border-green-300 text-green-800',
  cross_train: 'bg-blue-100 border-blue-300 text-blue-800',
  rest: 'bg-gray-100 border-gray-300 text-gray-600',
  strength: 'bg-purple-100 border-purple-300 text-purple-800',
};

export const RUNNING_TYPES: WorkoutType[] = ['long_run', 'medium_long_run', 'speed_work', 'easy_run'];
