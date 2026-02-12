import { useTemplates } from '../../hooks/useTemplates';
import { WORKOUT_TYPE_LABELS } from '../../types';
import { formatPace } from '../../utils';

interface Props {
  onSelect: (templateId: number) => void;
  onClose: () => void;
}

export function TemplatePicker({ onSelect, onClose }: Props) {
  const { templates, isLoading } = useTemplates();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Choose Template</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

        {templates.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500">No templates yet. Create one from a workout.</p>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-sm">{t.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {WORKOUT_TYPE_LABELS[t.workout_type]}
                {t.distance && ` · ${t.distance} mi`}
                {t.pace_seconds && ` · ${formatPace(t.pace_seconds)}/mi`}
                {t.duration_minutes && ` · ${t.duration_minutes} min`}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
