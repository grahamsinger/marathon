import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { usePaceTrend } from '../../hooks/usePaceTrend';
import { useRaceInfo } from '../../hooks/useRaceInfo';
import { getTotalMileage } from '../../api';
import { formatPace } from '../../utils';

export function PaceTrendChart() {
  const { data: paceData, isLoading } = usePaceTrend();
  const { data: raceInfo } = useRaceInfo();
  const { data: totalMileage } = useQuery({
    queryKey: ['total-mileage'],
    queryFn: getTotalMileage,
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;
  }

  if (!paceData || paceData.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg mb-1">No pace data yet</p>
        <p className="text-sm">Log long runs with pace data to see your trend.</p>
      </div>
    );
  }

  const chartData = paceData.map((p) => ({
    date: new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pace: p.pace_seconds,
    actual: p.actual_pace_seconds ?? undefined,
    distance: p.distance,
  }));

  const allPaces = [
    ...paceData.map((p) => p.pace_seconds),
    ...paceData.map((p) => p.actual_pace_seconds).filter((v): v is number => v != null),
  ];
  const goalPace = raceInfo?.goal_pace_seconds ?? 515;
  const minPace = Math.min(...allPaces, goalPace) - 15;
  const maxPace = Math.max(...allPaces, goalPace) + 15;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Long Run Pace Trend</h2>
        {totalMileage !== undefined && (
          <span className="text-sm text-gray-600">
            Total mileage: <span className="font-semibold text-gray-800">{totalMileage.total_miles} mi</span>
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[minPace, maxPace]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => formatPace(v)}
            label={{ value: 'Pace (min/mi)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 12 } }}
          />
          <Tooltip
            formatter={(value: any, name) => [value != null ? formatPace(value) + '/mi' : '—', name ?? '']}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            y={goalPace}
            stroke="#ef4444"
            strokeDasharray="8 4"
            label={{ value: `Goal ${formatPace(goalPace)}`, position: 'right', fill: '#ef4444', fontSize: 12 }}
          />
          <Line
            name="Target"
            type="monotone"
            dataKey="pace"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 5, fill: '#3b82f6' }}
            activeDot={{ r: 7 }}
            label={({ x, y, value }: any) => (
              <text x={x} y={y - 12} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight={500}>
                {formatPace(value)}
              </text>
            )}
          />
          <Line
            name="Actual"
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={{ r: 4, fill: '#10b981', strokeDasharray: '0' }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
