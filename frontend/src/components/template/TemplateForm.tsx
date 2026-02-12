import { useState } from 'react';
import type { WorkoutTemplate, WorkoutType } from '../../types';
import { WORKOUT_TYPE_LABELS, RUNNING_TYPES } from '../../types';
import { PaceInput } from '../workout/PaceInput';

interface Props {
  template?: WorkoutTemplate | null;
  onSave: (data: Omit<WorkoutTemplate, 'id'>) => void;
  onClose: () => void;
}

const WORKOUT_TYPES: WorkoutType[] = [
  'long_run', 'medium_long_run', 'speed_work', 'easy_run', 'cross_train', 'rest', 'strength',
];

export function TemplateForm({ template, onSave, onClose }: Props) {
  const [name, setName] = useState(template?.name ?? '');
  const [workoutType, setWorkoutType] = useState<WorkoutType>(template?.workout_type ?? 'easy_run');
  const [distance, setDistance] = useState(template?.distance?.toString() ?? '');
  const [paceSeconds, setPaceSeconds] = useState<number | null>(template?.pace_seconds ?? null);
  const [intervalPaceSeconds, setIntervalPaceSeconds] = useState<number | null>(template?.interval_pace_seconds ?? null);
  const [durationMinutes, setDurationMinutes] = useState(template?.duration_minutes?.toString() ?? '');
  const [description, setDescription] = useState(template?.description ?? '');

  const isRunning = RUNNING_TYPES.includes(workoutType);
  const showDistance = isRunning || workoutType === 'cross_train';
  const showPace = isRunning;
  const showIntervalPace = workoutType === 'speed_work';
  const showDuration = workoutType === 'cross_train' || workoutType === 'strength';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      workout_type: workoutType,
      distance: distance ? parseFloat(distance) : null,
      pace_seconds: showPace ? paceSeconds : null,
      interval_pace_seconds: showIntervalPace ? intervalPaceSeconds : null,
      duration_minutes: showDuration && durationMinutes ? parseInt(durationMinutes) : null,
      description: description || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{template ? 'Edit' : 'New'} Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Template Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="e.g. Tuesday Speed Session"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {WORKOUT_TYPES.map((t) => (
                <option key={t} value={t}>{WORKOUT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {showDistance && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Distance (miles)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          )}

          {showPace && <PaceInput value={paceSeconds} onChange={setPaceSeconds} label="Pace" />}
          {showIntervalPace && <PaceInput value={intervalPaceSeconds} onChange={setIntervalPaceSeconds} label="Interval Pace" />}

          {showDuration && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              {template ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
