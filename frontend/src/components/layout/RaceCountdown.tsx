import { useRaceInfo } from '../../hooks/useRaceInfo';
import { formatTime, formatPace } from '../../utils';

export function RaceCountdown() {
  const { data } = useRaceInfo();
  if (!data) return null;

  const weeks = Math.floor(data.days_until_race / 7);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-600">
      <span className="whitespace-nowrap">
        <span className="text-gray-400">Race</span>
        <span className="ml-1.5 font-semibold text-gray-800">{new Date(data.race_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </span>
      <span className="text-gray-300">·</span>
      <span className="whitespace-nowrap font-semibold text-gray-800">{data.days_until_race}d ({weeks}w)</span>
      <span className="text-gray-300">·</span>
      <span className="whitespace-nowrap">
        <span className="text-gray-400">Goal</span>
        <span className="ml-1.5 font-semibold text-gray-800">{formatTime(data.goal_time_seconds)} ({formatPace(data.goal_pace_seconds)}/mi)</span>
      </span>
    </div>
  );
}
