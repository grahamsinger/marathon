import { useState } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../../types';
import type { WorkoutTemplate } from '../../types';
import { formatPace } from '../../utils';
import { TemplateForm } from './TemplateForm';

export function TemplateList() {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  if (isLoading) {
    return <div className="animate-pulse space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Workout Templates</h2>
        <button
          onClick={() => { setEditingTemplate(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + New Template
        </button>
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-1">No templates yet</p>
          <p className="text-sm">Create a template to quickly apply workout presets.</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className={`border rounded-lg p-4 ${WORKOUT_TYPE_COLORS[t.workout_type]}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs uppercase tracking-wide mt-0.5 opacity-75">
                  {WORKOUT_TYPE_LABELS[t.workout_type]}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditingTemplate(t); setShowForm(true); }}
                  className="text-xs px-2 py-1 rounded hover:bg-black/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTemplate(t.id)}
                  className="text-xs px-2 py-1 rounded hover:bg-black/10"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm space-y-0.5">
              {t.distance && <div>{t.distance} mi</div>}
              {t.pace_seconds && <div>{formatPace(t.pace_seconds)}/mi</div>}
              {t.interval_pace_seconds && <div>Intervals: {formatPace(t.interval_pace_seconds)}/mi</div>}
              {t.duration_minutes && <div>{t.duration_minutes} min</div>}
              {t.description && <div className="text-xs opacity-75">{t.description}</div>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TemplateForm
          template={editingTemplate}
          onSave={(data) => {
            if (editingTemplate) {
              updateTemplate({ id: editingTemplate.id, data });
            } else {
              createTemplate(data);
            }
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
