import { useQuery } from '@tanstack/react-query';
import { getRecentDays } from '../../api';
import { useTemplates } from '../../hooks/useTemplates';
import { WORKOUT_TYPE_LABELS } from '../../types';
import { formatDate, formatPace } from '../../utils';

interface Props {
  targetDate: string;
  onApplyDay: (sourceDate: string) => void;
  onApplyTemplate: (templateId: number) => void;
  onClose: () => void;
}

export function DayTemplatePicker({ targetDate, onApplyDay, onApplyTemplate, onClose }: Props) {
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { data: recentDays = [], isLoading: recentLoading } = useQuery({
    queryKey: ['recent-days'],
    queryFn: getRecentDays,
  });

  // Don't offer the day you're already on as a source.
  const recent = recentDays.filter((d) => d.date !== targetDate);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Add from template</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-5">
          <section>
            <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Most recent days
            </h5>
            {recentLoading && <p className="text-sm text-gray-500">Loading...</p>}
            {!recentLoading && recent.length === 0 && (
              <p className="text-sm text-gray-400">
                No past days yet — fill in some days and they'll appear here to reuse.
              </p>
            )}
            <div className="space-y-2">
              {recent.map((d) => (
                <button
                  key={d.date}
                  onClick={() => onApplyDay(d.date)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm">{formatDate(d.date)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {d.workouts.map((w) => WORKOUT_TYPE_LABELS[w.workout_type]).join(' + ')}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Curated
            </h5>
            {templatesLoading && <p className="text-sm text-gray-500">Loading...</p>}
            {!templatesLoading && templates.length === 0 && (
              <p className="text-sm text-gray-400">No saved templates. Save one from a workout.</p>
            )}
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onApplyTemplate(t.id)}
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
          </section>
        </div>
      </div>
    </div>
  );
}
