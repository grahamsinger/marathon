import { useRaceInfo } from '../../hooks/useRaceInfo';
import { formatTime, formatPace } from '../../utils';

export function RaceCountdown() {
  const { data } = useRaceInfo();
  if (!data) return null;

  const weeks = Math.floor(data.days_until_race / 7);

  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <span className="text-gray-500">Race Day</span>
        <span className="ml-2 font-semibold">{new Date(data.race_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div>
        <span className="text-gray-500">Countdown</span>
        <span className="ml-2 font-semibold">{data.days_until_race}d ({weeks}w)</span>
      </div>
      <div>
        <span className="text-gray-500">Goal</span>
        <span className="ml-2 font-semibold">{formatTime(data.goal_time_seconds)} ({formatPace(data.goal_pace_seconds)}/mi)</span>
      </div>
    </div>
  );
}
