import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeedback, deleteFeedback } from '../../api';

// Friendly names for the page a feedback item was sent from.
const PAGE_LABELS: Record<string, string> = {
  '/': 'Calendar',
  '/templates': 'Templates',
  '/pace': 'Pace Trend',
  '/summary': 'Summary',
};

// created_at comes from SQLite's CURRENT_TIMESTAMP, which is UTC but has no
// timezone marker — tag it as UTC so it renders in local time.
function formatCreatedAt(iso: string): string {
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(iso);
  const d = new Date(hasTz ? iso : iso + 'Z');
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function FeedbackAdmin() {
  const queryClient = useQueryClient();
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: getFeedback,
  });
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const remove = useMutation({
    mutationFn: (id: number) => deleteFeedback(id),
    onSuccess: () => {
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Feedback</h2>
        <span className="text-sm text-gray-500">
          {feedback?.length ?? 0} item{feedback?.length === 1 ? '' : 's'}
        </span>
      </div>

      {!feedback || feedback.length === 0 ? (
        <p className="text-gray-500 text-sm">No feedback yet.</p>
      ) : (
        <ul className="space-y-3">
          {feedback.map((item) => (
            <li key={item.id} className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{item.message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatCreatedAt(item.created_at)}</span>
                  {item.page && (
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                      {PAGE_LABELS[item.page] ?? item.page}
                    </span>
                  )}
                </div>
                {confirmId === item.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => remove.mutate(item.id)}
                      disabled={remove.isPending}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {remove.isPending ? 'Deleting...' : 'Confirm delete'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
