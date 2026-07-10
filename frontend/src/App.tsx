import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { WeekView } from './components/calendar/WeekView';
import { TemplateList } from './components/template/TemplateList';
import { PaceTrendChart } from './components/stats/PaceTrendChart';
import { WorkoutSummary } from './components/summary/WorkoutSummary';
import { FeedbackAdmin } from './components/admin/FeedbackAdmin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<WeekView />} />
            <Route path="/templates" element={<TemplateList />} />
            <Route path="/pace" element={<PaceTrendChart />} />
            <Route path="/summary" element={<WorkoutSummary />} />
            {/* Not in the header nav on purpose — admin-only, reached by URL. */}
            <Route path="/admin" element={<FeedbackAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
