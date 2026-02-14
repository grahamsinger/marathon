import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAllWorkouts } from '../../hooks/useAllWorkouts';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useTemplates } from '../../hooks/useTemplates';
import { updateWorkout as updateWorkoutApi } from '../../api';
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
      <td className="py-2.5 px-3 text-sm text-gray-700 whitespace-nowrap">
        {formatDate(workout.date)}
      </td>
      <td className="py-2.5 px-3">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${colors}`}>
          {label}
        </span>
      </td>
      <td className="py-2.5 px-3 text-sm text-gray-700 text-right">
        {workout.distance != null ? `${workout.distance} mi` : '—'}
      </td>
      <td className="py-2.5 px-3 text-sm text-gray-700 text-right">
        {workout.pace_seconds != null ? `${formatPace(workout.pace_seconds)} /mi` : '—'}
      </td>
      <td className="py-2.5 px-3 text-sm text-gray-700 text-right">
        {workout.duration_minutes != null
          ? `${workout.duration_minutes} min`
          : workout.distance != null && workout.pace_seconds != null
            ? `${Math.round((workout.distance * workout.pace_seconds) / 60)} min`
            : '—'}
      </td>
      <td className="py-2.5 px-3 text-center">
        <label
          className="inline-flex items-center justify-center w-8 h-8 cursor-pointer"
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

export function WorkoutSummary() {
  const { data: workouts, isLoading } = useAllWorkouts();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const queryClient = useQueryClient();

  const weekStart = editingWorkout
    ? getMondayOfWeek(new Date(editingWorkout.date + 'T00:00:00'))
    : '';
  const workoutActions = useWorkouts(weekStart);
  const { createTemplate } = useTemplates();

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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Distance</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Pace</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Duration</th>
            <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Done</th>
          </tr>
        </thead>
        <tbody>
          {workouts.map((workout) => (
            <WorkoutRow
              key={workout.id}
              workout={workout}
              onEdit={() => setEditingWorkout(workout)}
              onToggleComplete={() => handleToggleComplete(workout)}
            />
          ))}
        </tbody>
      </table>

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
