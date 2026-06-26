import type { Workout } from '../../types';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../../types';
import { formatPace } from '../../utils';

interface Props {
  workout: Workout;
  onEdit: () => void;
  onToggleComplete: () => void;
  isSwapSource?: boolean;
}

export function WorkoutCard({ workout, onEdit, onToggleComplete, isSwapSource }: Props) {
  const colors = WORKOUT_TYPE_COLORS[workout.workout_type];

  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${colors} ${
        isSwapSource ? 'ring-2 ring-blue-500' : ''
      } ${workout.is_completed ? 'opacity-60' : ''}`}
      onClick={onEdit}
    >
      <div className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={workout.is_completed}
          onChange={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 rounded cursor-pointer flex-shrink-0"
        />
        <span className={`text-xs font-semibold uppercase tracking-wide ${workout.is_completed ? 'line-through' : ''}`}>
          {WORKOUT_TYPE_LABELS[workout.workout_type]}
        </span>
      </div>

      <div className="mt-1 text-sm space-y-0.5">
        {workout.distance && <div>{workout.distance} mi</div>}
        {workout.pace_seconds && <div>Target {formatPace(workout.pace_seconds)}/mi</div>}
        {workout.actual_pace_seconds && <div>Actual {formatPace(workout.actual_pace_seconds)}/mi</div>}
        {workout.interval_pace_seconds && (
          <div>Intervals: {formatPace(workout.interval_pace_seconds)}/mi</div>
        )}
        {workout.duration_minutes && <div>{workout.duration_minutes} min</div>}
        {workout.description && (
          <div className="text-xs opacity-75 truncate">{workout.description}</div>
        )}
      </div>
    </div>
  );
}
