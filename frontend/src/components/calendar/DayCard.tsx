import type { Workout } from '../../types';
import { formatDate, isToday } from '../../utils';
import { WorkoutCard } from '../workout/WorkoutCard';

interface Props {
  date: string;
  workouts: Workout[];
  onAddWorkout: () => void;
  onOpenTemplates: () => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: number) => void;
  onToggleComplete: (workout: Workout) => void;
  swapSourceId: number | null;
  onSwapSelect: (workout: Workout) => void;
}

export function DayCard({
  date,
  workouts,
  onAddWorkout,
  onOpenTemplates,
  onEditWorkout,
  onDeleteWorkout,
  onToggleComplete,
  swapSourceId,
  onSwapSelect,
}: Props) {
  const today = isToday(date);

  return (
    <div
      className={`border rounded-lg p-3 min-h-[120px] flex flex-col ${
        today ? 'border-blue-400 bg-blue-50/50' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${today ? 'text-blue-700' : 'text-gray-600'}`}>
          {formatDate(date)}
        </span>
        {today && <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">TODAY</span>}
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onEdit={() => onEditWorkout(workout)}
            onDelete={() => onDeleteWorkout(workout.id)}
            onToggleComplete={() => onToggleComplete(workout)}
            isSwapSource={swapSourceId === workout.id}
            onSwapSelect={() => onSwapSelect(workout)}
          />
        ))}
        <div className="mt-auto flex flex-col gap-1">
          <button
            onClick={onAddWorkout}
            className="w-full py-1.5 border border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-xs"
          >
            + Add
          </button>
          <button
            onClick={onOpenTemplates}
            title="Apply a saved template or copy a recent day"
            className="w-full py-1.5 border border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-xs"
          >
            Templates
          </button>
        </div>
      </div>
    </div>
  );
}
