import { useState, useCallback } from 'react';
import { useWeek } from '../../hooks/useWeek';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useTemplates } from '../../hooks/useTemplates';
import { getMondayOfWeek, addDays } from '../../utils';
import type { Workout } from '../../types';
import { WeekNavigation } from './WeekNavigation';
import { MileageBar } from './MileageBar';
import { DayCard } from './DayCard';
import { WorkoutForm } from '../workout/WorkoutForm';
import { CompactWeekRow } from './CompactWeekRow';

export function WeekView() {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()));
  const prevWeekStart = addDays(weekStart, -7);
  const nextWeekStart = addDays(weekStart, 7);
  const { data: week, isLoading, updateWeek } = useWeek(weekStart);
  const { data: prevWeek } = useWeek(prevWeekStart);
  const { data: nextWeek } = useWeek(nextWeekStart);
  const workoutActions = useWorkouts(weekStart);
  const { createTemplate } = useTemplates();

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [swapSourceId, setSwapSourceId] = useState<number | null>(null);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const workoutByDate = useCallback(
    (date: string) => week?.workouts.find((w) => w.date === date),
    [week]
  );

  const handleSwapSelect = (workout: Workout) => {
    if (swapSourceId === null) {
      setSwapSourceId(workout.id);
    } else if (swapSourceId === workout.id) {
      setSwapSourceId(null);
    } else {
      workoutActions.swapWorkouts({ id1: swapSourceId, id2: workout.id });
      setSwapSourceId(null);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-7 gap-3">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <WeekNavigation weekStart={weekStart} onNavigate={setWeekStart} />
        <MileageBar workouts={week?.workouts ?? []} target={week?.mileage_target ?? null} />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Target:</span>
          {editingTarget ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateWeek({ mileage_target: parseFloat(targetInput) || 0 });
                setEditingTarget(false);
              }}
              className="flex gap-1"
            >
              <input
                type="number"
                step="0.1"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-20 px-2 py-1 border rounded text-sm"
                autoFocus
              />
              <button type="submit" className="text-sm text-blue-600">Set</button>
              <button type="button" onClick={() => setEditingTarget(false)} className="text-sm text-gray-400">Cancel</button>
            </form>
          ) : (
            <button
              onClick={() => {
                setTargetInput(week?.mileage_target?.toString() ?? '');
                setEditingTarget(true);
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {week?.mileage_target ? `${week.mileage_target} mi` : 'Set target'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Notes:</span>
          {editingNotes ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateWeek({ notes: notesInput });
                setEditingNotes(false);
              }}
              className="flex gap-1"
            >
              <input
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-60 px-2 py-1 border rounded text-sm"
                autoFocus
                placeholder="Week notes..."
              />
              <button type="submit" className="text-sm text-blue-600">Save</button>
              <button type="button" onClick={() => setEditingNotes(false)} className="text-sm text-gray-400">Cancel</button>
            </form>
          ) : (
            <button
              onClick={() => {
                setNotesInput(week?.notes ?? '');
                setEditingNotes(true);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {week?.notes || 'Add notes...'}
            </button>
          )}
        </div>
      </div>

      {swapSourceId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700 flex items-center justify-between">
          <span>Select another workout to swap with</span>
          <button onClick={() => setSwapSourceId(null)} className="text-blue-500 hover:text-blue-700">Cancel</button>
        </div>
      )}

      <CompactWeekRow
        weekStart={prevWeekStart}
        workouts={prevWeek?.workouts ?? []}
        onNavigate={setWeekStart}
      />

      <div className="grid grid-cols-7 gap-3">
        {days.map((date) => (
          <DayCard
            key={date}
            date={date}
            workout={workoutByDate(date)}
            onAddWorkout={() => {
              setEditingDate(date);
              setEditingWorkout(null);
            }}
            onEditWorkout={(w) => {
              if (swapSourceId !== null) {
                handleSwapSelect(w);
              } else {
                setEditingDate(date);
                setEditingWorkout(w);
              }
            }}
            onDeleteWorkout={(id) => workoutActions.deleteWorkout(id)}
            swapSourceId={swapSourceId}
            onSwapSelect={handleSwapSelect}
          />
        ))}
      </div>

      <CompactWeekRow
        weekStart={nextWeekStart}
        workouts={nextWeek?.workouts ?? []}
        onNavigate={setWeekStart}
      />

      {editingDate && (
        <WorkoutForm
          date={editingDate}
          workout={editingWorkout}
          weekStart={weekStart}
          onSave={(data) => workoutActions.createWorkout(data)}
          onUpdate={(id, data) => workoutActions.updateWorkout({ id, data })}
          onDelete={(id) => workoutActions.deleteWorkout(id)}
          onSaveAsTemplate={(data) => createTemplate(data)}
          onApplyTemplate={(templateId, date) =>
            workoutActions.createFromTemplate({ templateId, date })
          }
          onClose={() => {
            setEditingDate(null);
            setEditingWorkout(null);
          }}
        />
      )}
    </div>
  );
}
