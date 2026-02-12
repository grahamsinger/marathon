import { useState } from 'react';
import type { Workout } from '../../types';
import { RUNNING_TYPES } from '../../types';

interface Props {
  workouts: Workout[];
  target: number | null;
  onTargetChange: (target: number) => void;
}

export function MileageBar({ workouts, target, onTargetChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  const actual = workouts
    .filter((w) => RUNNING_TYPES.includes(w.workout_type) && w.distance && w.is_completed)
    .reduce((sum, w) => sum + (w.distance ?? 0), 0);

  const pct = target && target > 0 ? Math.min((actual / target) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-base font-semibold text-gray-800 whitespace-nowrap">
        {actual.toFixed(1)} /{' '}
        {editing ? (
          <form
            className="inline"
            onSubmit={(e) => {
              e.preventDefault();
              onTargetChange(parseFloat(input) || 0);
              setEditing(false);
            }}
          >
            <input
              type="number"
              step="0.1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={() => {
                onTargetChange(parseFloat(input) || 0);
                setEditing(false);
              }}
              className="w-16 px-1 py-0.5 border rounded text-base font-semibold text-center"
              autoFocus
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setInput(target?.toString() ?? '');
              setEditing(true);
            }}
            className="hover:text-blue-600 border-b border-dashed border-gray-400 hover:border-blue-600"
            title="Click to edit weekly mileage target"
          >
            {target ?? '—'}
          </button>
        )}{' '}
        mi
      </span>
      <div className="w-[200px] bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all bg-green-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
