import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithClient } from '../../test/render'
import { WorkoutSummary } from './WorkoutSummary'
import type { Workout, Week } from '../../types'

// Mock the whole API module so the summary's queries resolve from fixtures
// instead of hitting the network.
vi.mock('../../api')
import * as api from '../../api'

function workout(over: Partial<Workout> & Pick<Workout, 'id' | 'date' | 'workout_type'>): Workout {
  return {
    week_id: 1,
    distance: null,
    pace_seconds: null,
    actual_pace_seconds: null,
    interval_pace_seconds: null,
    duration_minutes: null,
    description: null,
    is_completed: false,
    ...over,
  }
}

// Three distinct weeks (each workout falls on a Monday). Newest first, the way
// the real /workouts/all endpoint returns them.
const WORKOUTS: Workout[] = [
  workout({ id: 1, date: '2026-03-16', workout_type: 'long_run', distance: 12, pace_seconds: 540 }),
  workout({ id: 2, date: '2026-03-09', workout_type: 'easy_run', distance: 5, pace_seconds: 560, is_completed: true }),
  workout({ id: 3, date: '2026-03-02', workout_type: 'long_run', distance: 99, pace_seconds: 600 }),
]

beforeEach(() => {
  vi.mocked(api.fetchAllWorkouts).mockResolvedValue(WORKOUTS)
  vi.mocked(api.getTemplates).mockResolvedValue([])
  vi.mocked(api.getWeek).mockImplementation(
    async (weekStart: string): Promise<Week> => ({
      id: 1,
      week_start: weekStart,
      mileage_target: null,
      notes: null,
      workouts: [],
    }),
  )
  vi.mocked(api.updateWorkout).mockResolvedValue(WORKOUTS[0])
})

async function renderSummary() {
  renderWithClient(<WorkoutSummary />)
  // Wait for the loading skeleton to be replaced by the real table.
  await screen.findByRole('table')
}

describe('WorkoutSummary', () => {
  it('groups workouts by week, expanding the two newest and collapsing older ones', async () => {
    await renderSummary()
    const table = screen.getByRole('table')

    // All three week headers render...
    expect(within(table).getByText('Wk of Mar 16')).toBeInTheDocument()
    expect(within(table).getByText('Wk of Mar 9')).toBeInTheDocument()
    expect(within(table).getByText('Wk of Mar 2')).toBeInTheDocument()

    // ...the two newest weeks' rows are expanded...
    expect(within(table).getByText('12 mi')).toBeInTheDocument()
    expect(within(table).getByText('5 mi')).toBeInTheDocument()

    // ...but the oldest week starts collapsed (its 99 mi row is hidden).
    expect(within(table).queryByText('99 mi')).not.toBeInTheDocument()
  })

  it('expands a collapsed week when its header is clicked', async () => {
    const user = userEvent.setup()
    await renderSummary()
    const table = screen.getByRole('table')

    await user.click(within(table).getByText('Wk of Mar 2'))

    expect(within(table).getByText('99 mi')).toBeInTheDocument()
  })

  it('opens the edit modal when a workout row is clicked', async () => {
    const user = userEvent.setup()
    await renderSummary()
    const table = screen.getByRole('table')

    const row = within(table).getByText('12 mi').closest('tr') as HTMLElement
    await user.click(row)

    // The WorkoutForm modal opens, pre-filled for that workout.
    expect(await screen.findByRole('heading', { name: /Edit Workout/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.0')).toHaveValue(12)
  })

  it('toggling the Done checkbox calls updateWorkout with the flipped value', async () => {
    const user = userEvent.setup()
    await renderSummary()
    const table = screen.getByRole('table')

    const row = within(table).getByText('12 mi').closest('tr') as HTMLElement
    const checkbox = within(row).getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)

    await waitFor(() =>
      expect(api.updateWorkout).toHaveBeenCalledWith(1, { is_completed: true }),
    )
  })

  it('shows an empty state when there are no workouts', async () => {
    vi.mocked(api.fetchAllWorkouts).mockResolvedValue([])
    renderWithClient(<WorkoutSummary />)

    expect(await screen.findByText(/No workouts yet/i)).toBeInTheDocument()
  })
})
