import { useState, useEffect } from 'react';
import type { Workout, WorkoutType } from '../../types';
import { WORKOUT_TYPE_LABELS, RUNNING_TYPES } from '../../types';
import { PaceInput } from './PaceInput';
import { TemplatePicker } from '../template/TemplatePicker';

interface Props {
  date: string;
  workout?: Workout | null;
  weekStart: string;
  onSave: (data: Partial<Workout> & { date: string; workout_type: string }) => void;
  onUpdate: (id: number, data: Partial<Workout>) => void;
  onDelete?: (id: number) => void;
  onSaveAsTemplate: (data: {
    name: string;
    workout_type: string;
    distance?: number | null;
    pace_seconds?: number | null;
    interval_pace_seconds?: number | null;
    duration_minutes?: number | null;
    description?: string | null;
  }) => void;
  onApplyTemplate: (templateId: number, date: string) => void;
  onClose: () => void;
}

const WORKOUT_TYPES: WorkoutType[] = [
  'long_run', 'medium_long_run', 'speed_work', 'easy_run', 'cross_train', 'rest', 'strength',
];

export function WorkoutForm({
  date,
  workout,
  onSave,
  onUpdate,
  onDelete,
  onSaveAsTemplate,
  onApplyTemplate,
  onClose,
}: Props) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>(workout?.workout_type ?? 'easy_run');
  const [distance, setDistance] = useState(workout?.distance?.toString() ?? '');
  const [paceSeconds, setPaceSeconds] = useState<number | null>(workout?.pace_seconds ?? null);
  const [intervalPaceSeconds, setIntervalPaceSeconds] = useState<number | null>(workout?.interval_pace_seconds ?? null);
  const [durationMinutes, setDurationMinutes] = useState(workout?.duration_minutes?.toString() ?? '');
  const [description, setDescription] = useState(workout?.description ?? '');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const isEditing = !!workout;
  const isRunning = RUNNING_TYPES.includes(workoutType);
  const showDistance = isRunning || workoutType === 'cross_train';
  const showPace = isRunning;
  const showIntervalPace = workoutType === 'speed_work';
  const showDuration = workoutType === 'cross_train' || workoutType === 'strength';

  useEffect(() => {
    if (workout) {
      setWorkoutType(workout.workout_type);
      setDistance(workout.distance?.toString() ?? '');
      setPaceSeconds(workout.pace_seconds ?? null);
      setIntervalPaceSeconds(workout.interval_pace_seconds ?? null);
      setDurationMinutes(workout.duration_minutes?.toString() ?? '');
      setDescription(workout.description ?? '');
    }
  }, [workout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      workout_type: workoutType,
      distance: distance ? parseFloat(distance) : null,
      pace_seconds: showPace ? paceSeconds : null,
      interval_pace_seconds: showIntervalPace ? intervalPaceSeconds : null,
      duration_minutes: showDuration && durationMinutes ? parseInt(durationMinutes) : null,
      description: description || null,
    };

    if (isEditing) {
      onUpdate(workout.id, data);
    } else {
      onSave({ ...data, date });
    }
    onClose();
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) return;
    onSaveAsTemplate({
      name: templateName.trim(),
      workout_type: workoutType,
      distance: distance ? parseFloat(distance) : null,
      pace_seconds: showPace ? paceSeconds : null,
      interval_pace_seconds: showIntervalPace ? intervalPaceSeconds : null,
      duration_minutes: showDuration && durationMinutes ? parseInt(durationMinutes) : null,
      description: description || null,
    });
    setShowSaveTemplate(false);
    setTemplateName('');
  };

  const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{isEditing ? 'Edit' : 'New'} Workout — {dayLabel}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setShowTemplatePicker(true)}
            className="mb-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Apply from template...
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="0.0"
              />
            </div>
          )}

          {showPace && <PaceInput value={paceSeconds} onChange={setPaceSeconds} label="Pace" />}
          {showIntervalPace && (
            <PaceInput value={intervalPaceSeconds} onChange={setIntervalPaceSeconds} label="Interval Pace" />
          )}

          {showDuration && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="0"
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
              placeholder="Workout notes..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => { onDelete(workout.id); onClose(); }}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Save as Template
              </button>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

        {showSaveTemplate && (
          <div className="mt-3 flex gap-2">
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name..."
              className="flex-1 px-3 py-1.5 border rounded text-sm"
            />
            <button
              onClick={handleSaveAsTemplate}
              className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded hover:bg-gray-900"
            >
              Save
            </button>
          </div>
        )}

        {showTemplatePicker && (
          <TemplatePicker
            onSelect={(templateId) => {
              onApplyTemplate(templateId, date);
              onClose();
            }}
            onClose={() => setShowTemplatePicker(false)}
          />
        )}
      </div>
    </div>
  );
}
