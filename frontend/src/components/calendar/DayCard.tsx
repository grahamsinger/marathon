import type { Workout } from '../../types';
import { formatDate, isToday } from '../../utils';
import { WorkoutCard } from '../workout/WorkoutCard';

interface Props {
  date: string;
  workout?: Workout;
  onAddWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: number) => void;
  onToggleComplete: (workout: Workout) => void;
  swapSourceId: number | null;
  onSwapSelect: (workout: Workout) => void;
}

export function DayCard({
  date,
  workout,
  onAddWorkout,
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

      <div className="flex-1">
        {workout ? (
          <WorkoutCard
            workout={workout}
            onEdit={() => onEditWorkout(workout)}
            onDelete={() => onDeleteWorkout(workout.id)}
            onToggleComplete={() => onToggleComplete(workout)}
            isSwapSource={swapSourceId === workout.id}
            onSwapSelect={() => onSwapSelect(workout)}
          />
        ) : (
          <button
            onClick={onAddWorkout}
            className="w-full h-full min-h-[60px] border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors flex items-center justify-center text-sm"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}
