import { addDays } from '../../utils';

interface Props {
  weekStart: string;
  onNavigate: (weekStart: string) => void;
}

export function WeekNavigation({ weekStart, onNavigate }: Props) {
  const weekEnd = addDays(weekStart, 6);

  const format = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onNavigate(addDays(weekStart, -7))}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
      >
        &larr;
      </button>
      <h2 className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
        {format(weekStart)} &ndash; {format(weekEnd)}
      </h2>
      <button
        onClick={() => onNavigate(addDays(weekStart, 7))}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
      >
        &rarr;
      </button>
      <button
        onClick={() => {
          const today = new Date();
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(today);
          monday.setDate(diff);
          onNavigate(monday.toISOString().split('T')[0]);
        }}
        className="text-sm text-blue-600 hover:text-blue-800 ml-2"
      >
        Today
      </button>
    </div>
  );
}
