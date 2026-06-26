import { useState, useMemo } from 'react';
import { useQueryClient, useQueries } from '@tanstack/react-query';
import { useAllWorkouts } from '../../hooks/useAllWorkouts';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useTemplates } from '../../hooks/useTemplates';
import { updateWorkout as updateWorkoutApi, getWeek } from '../../api';
import { formatPace, formatDate, getMondayOfWeek } from '../../utils';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../../types';
import type { Workout, WorkoutType } from '../../types';
import { WorkoutForm } from '../workout/WorkoutForm';

function WorkoutRow({
  workout,
  onEdit,
  onToggleComplete,
}: {
  workout: Workout;
  onEdit: () => void;
  onToggleComplete: () => void;
}) {
  const colors = WORKOUT_TYPE_COLORS[workout.workout_type as WorkoutType];
  const label = WORKOUT_TYPE_LABELS[workout.workout_type as WorkoutType];

  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onClick={onEdit}
    >
      <td className="py-1.5 px-3 text-sm text-gray-700 whitespace-nowrap">
        {formatDate(workout.date)}
      </td>
      <td className="py-1.5 px-3">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${colors}`}>
          {label}
        </span>
      </td>
      <td className="py-1.5 px-3 text-sm text-gray-700 text-right">
        {workout.distance != null ? `${workout.distance} mi` : '—'}
      </td>
      <td className="py-1.5 px-3 text-sm text-gray-700 text-right whitespace-nowrap">
        {workout.pace_seconds != null ? `${formatPace(workout.pace_seconds)} /mi` : '—'}
        {workout.actual_pace_seconds != null && (
          <div className="text-xs text-gray-400">act {formatPace(workout.actual_pace_seconds)} /mi</div>
        )}
      </td>
      <td className="py-1.5 px-3 text-sm text-gray-700 text-right">
        {workout.duration_minutes != null
          ? `${workout.duration_minutes} min`
          : workout.distance != null && workout.pace_seconds != null
            ? `${Math.round((workout.distance * workout.pace_seconds) / 60)} min`
            : '—'}
      </td>
      <td className="py-1.5 px-3 text-center">
        <label
          className="inline-flex items-center justify-center w-7 h-7 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={workout.is_completed}
            onChange={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className="h-3.5 w-3.5 rounded cursor-pointer"
          />
        </label>
      </td>
    </tr>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 2l4 4-4 4z" />
    </svg>
  );
}

function WeeklyMileage({
  workouts,
  targetByWeek,
}: {
  workouts: Workout[];
  targetByWeek: Record<string, number | null>;
}) {
  // Progress counts mileage actually run (completed), not the full plan — a week
  // with 24 mi planned but only 3 mi run is short of a 24 mi target, not "met".
  const byWeek = new Map<string, number>();
  for (const w of workouts) {
    const monday = getMondayOfWeek(new Date(w.date + 'T00:00:00'));
    const done = w.is_completed ? w.distance ?? 0 : 0;
    byWeek.set(monday, (byWeek.get(monday) ?? 0) + done);
  }
  // Chronological (oldest week first) so the mileage build reads top to bottom.
  const weeks = Array.from(byWeek.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  // Scale bars (and the target marker) so both fit within the track.
  const max = Math.max(
    1,
    ...weeks.map(([, mi]) => mi),
    ...weeks.map(([m]) => targetByWeek[m] ?? 0),
  );

  if (weeks.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Weekly mileage</h3>
      <div className="space-y-1.5">
        {weeks.map(([monday, miles]) => {
          const label = new Date(monday + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const target = targetByWeek[monday] ?? null;
          const delta = target != null ? miles - target : 0;
          const status =
            target == null ? 'none' : delta > 0.05 ? 'over' : delta < -0.05 ? 'short' : 'met';
          const fill =
            status === 'short' ? 'bg-amber-400' : status === 'none' ? 'bg-blue-400' : 'bg-green-500';

          return (
            <div key={monday} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-gray-500 whitespace-nowrap">Wk of {label}</span>
              <div className="relative flex-1 bg-gray-100 rounded h-4 overflow-hidden">
                <div className={`h-full rounded ${fill}`} style={{ width: `${(miles / max) * 100}%` }} />
                {target != null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
                    style={{ left: `${(target / max) * 100}%` }}
                    title={`target ${target} mi`}
                  />
                )}
              </div>
              <span className="w-28 text-right text-gray-700 tabular-nums whitespace-nowrap">
                {miles.toFixed(1)}
                {target != null ? ` / ${target}` : ''} mi
              </span>
              <span className="w-16 text-right">
                {status === 'met' && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">met</span>
                )}
                {status === 'over' && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">
                    +{delta.toFixed(1)}
                  </span>
                )}
                {status === 'short' && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
                    {delta.toFixed(1)}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkoutSummary() {
  const { data: workouts, isLoading } = useAllWorkouts();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const queryClient = useQueryClient();

  const weekStart = editingWorkout
    ? getMondayOfWeek(new Date(editingWorkout.date + 'T00:00:00'))
    : '';
  const workoutActions = useWorkouts(weekStart);
  const { createTemplate } = useTemplates();

  // Reuse the existing per-week endpoint to pull each week's mileage target.
  const weekStarts = useMemo(() => {
    const set = new Set<string>();
    (workouts ?? []).forEach((w) => set.add(getMondayOfWeek(new Date(w.date + 'T00:00:00'))));
    return Array.from(set);
  }, [workouts]);

  const weekQueries = useQueries({
    queries: weekStarts.map((ws) => ({ queryKey: ['week', ws], queryFn: () => getWeek(ws) })),
  });

  const targetByWeek: Record<string, number | null> = {};
  weekQueries.forEach((q) => {
    if (q.data) targetByWeek[q.data.week_start] = q.data.mileage_target;
  });

  // Group workouts into weeks (newest first), preserving each week's existing
  // newest-first row order.
  const weekGroups = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of workouts ?? []) {
      const monday = getMondayOfWeek(new Date(w.date + 'T00:00:00'));
      if (!map.has(monday)) map.set(monday, []);
      map.get(monday)!.push(w);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [workouts]);

  // How many of the newest weeks start expanded; older weeks start collapsed.
  // Tapping a week header overrides its default.
  const DEFAULT_EXPANDED_WEEKS = 2;
  const [expandOverrides, setExpandOverrides] = useState<Record<string, boolean>>({});
  const isExpanded = (monday: string, index: number) =>
    expandOverrides[monday] ?? index < DEFAULT_EXPANDED_WEEKS;
  const toggleWeek = (monday: string, index: number) =>
    setExpandOverrides((o) => ({ ...o, [monday]: !(o[monday] ?? index < DEFAULT_EXPANDED_WEEKS) }));

  const handleToggleComplete = (workout: Workout) => {
    const ws = getMondayOfWeek(new Date(workout.date + 'T00:00:00'));
    updateWorkoutApi(workout.id, { is_completed: !workout.is_completed }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['week', ws] });
      queryClient.invalidateQueries({ queryKey: ['workouts', 'all'] });
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return <p className="text-gray-500 text-sm">No workouts yet.</p>;
  }

  return (
    <div>
      <WeeklyMileage workouts={workouts} targetByWeek={targetByWeek} />
      <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Distance</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Pace (target / act)</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Duration</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Done</th>
          </tr>
        </thead>
        {weekGroups.map(([monday, weekWorkouts], index) => {
          const expanded = isExpanded(monday, index);
          const label = new Date(monday + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const target = targetByWeek[monday] ?? null;
          const completedMiles = weekWorkouts.reduce(
            (s, w) => s + (w.is_completed ? w.distance ?? 0 : 0),
            0,
          );
          const doneCount = weekWorkouts.filter((w) => w.is_completed).length;

          return (
            <tbody key={monday}>
              <tr
                className="border-b border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleWeek(monday, index)}
              >
                <td colSpan={6} className="py-2 px-3">
                  <div className="sticky left-3 inline-flex items-center gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      <Chevron expanded={expanded} />
                      Wk of {label}
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
                      {completedMiles.toFixed(1)}
                      {target != null ? ` / ${target}` : ''} mi · {doneCount}/{weekWorkouts.length} done
                    </span>
                  </div>
                </td>
              </tr>
              {expanded &&
                weekWorkouts.map((workout) => (
                  <WorkoutRow
                    key={workout.id}
                    workout={workout}
                    onEdit={() => setEditingWorkout(workout)}
                    onToggleComplete={() => handleToggleComplete(workout)}
                  />
                ))}
            </tbody>
          );
        })}
      </table>
      </div>

      {editingWorkout && (
        <WorkoutForm
          date={editingWorkout.date}
          workout={editingWorkout}
          weekStart={weekStart}
          onSave={(data) => workoutActions.createWorkout(data)}
          onUpdate={(id, data) => workoutActions.updateWorkout({ id, data })}
          onDelete={(id) => workoutActions.deleteWorkout(id)}
          onSaveAsTemplate={(data) => createTemplate(data)}
          onApplyTemplate={(templateId, date) =>
            workoutActions.createFromTemplate({ templateId, date })
          }
          onClose={() => setEditingWorkout(null)}
        />
      )}
    </div>
  );
}
