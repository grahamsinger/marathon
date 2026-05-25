import type { Workout } from '../../types';
import { addDays, isToday } from '../../utils';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../../types';

interface Props {
  weekStart: string;
  workouts: Workout[];
  onNavigate: (weekStart: string) => void;
}

export function CompactWeekRow({ weekStart, workouts, onNavigate }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const workoutsByDate = (date: string) =>
    workouts.filter((w) => w.date === date);

  return (
    <div
      className="grid grid-cols-7 gap-3 opacity-60 cursor-pointer"
      onClick={() => onNavigate(weekStart)}
    >
      {days.map((date) => {
        const dayWorkouts = workoutsByDate(date);
        const firstWorkout = dayWorkouts[0];
        const today = isToday(date);
        const d = new Date(date + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={date}
            className={`border rounded-lg px-2 py-1.5 h-[52px] flex flex-col justify-center ${
              today ? 'border-blue-300 bg-blue-50/40' : 'bg-gray-50 border-gray-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(weekStart);
            }}
          >
            <span className="text-xs text-gray-500 leading-tight">{label}</span>
            {firstWorkout && (
              <span
                className={`text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded border leading-tight truncate ${
                  WORKOUT_TYPE_COLORS[firstWorkout.workout_type]
                }`}
              >
                {WORKOUT_TYPE_LABELS[firstWorkout.workout_type]}
                {dayWorkouts.length > 1 && ` +${dayWorkouts.length - 1}`}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
