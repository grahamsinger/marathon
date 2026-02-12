import type { Workout } from '../../types';
import { RUNNING_TYPES } from '../../types';

interface Props {
  workouts: Workout[];
  target: number | null;
}

export function MileageBar({ workouts, target }: Props) {
  const actual = workouts
    .filter((w) => RUNNING_TYPES.includes(w.workout_type) && w.distance)
    .reduce((sum, w) => sum + (w.distance ?? 0), 0);

  const pct = target && target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  const overTarget = target !== null && actual > target;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 whitespace-nowrap">
        {actual.toFixed(1)} / {target ?? '—'} mi
      </span>
      <div className="flex-1 bg-gray-200 rounded-full h-2.5 max-w-[200px]">
        <div
          className={`h-2.5 rounded-full transition-all ${
            overTarget ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
