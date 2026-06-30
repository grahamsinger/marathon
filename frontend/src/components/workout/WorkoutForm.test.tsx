import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithClient } from '../../test/render'
import { WorkoutForm } from './WorkoutForm'
import type { Workout } from '../../types'

const baseWorkout: Workout = {
  id: 42,
  week_id: 1,
  date: '2026-03-02',
  workout_type: 'easy_run',
  distance: 5,
  pace_seconds: 540,
  actual_pace_seconds: null,
  interval_pace_seconds: null,
  duration_minutes: null,
  description: null,
  is_completed: false,
}

function setup(props: Partial<React.ComponentProps<typeof WorkoutForm>> = {}) {
  const handlers = {
    onSave: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onSwap: vi.fn(),
    onSaveAsTemplate: vi.fn(),
    onApplyTemplate: vi.fn(),
    onClose: vi.fn(),
  }
  renderWithClient(
    <WorkoutForm date="2026-03-02" weekStart="2026-03-02" {...handlers} {...props} />,
  )
  return handlers
}

describe('WorkoutForm — editing', () => {
  it('populates fields from the workout being edited', () => {
    setup({ workout: baseWorkout })

    expect(screen.getByRole('heading')).toHaveTextContent(/Edit Workout/i)
    expect(screen.getByPlaceholderText('0.0')).toHaveValue(5)
    // Edit mode shows the Update / Delete / Swap actions.
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swap' })).toBeInTheDocument()
  })

  it('submits a non-whole-mile distance through onUpdate (regression for the 3.25 bug)', async () => {
    const user = userEvent.setup()
    const { onUpdate, onClose } = setup({ workout: baseWorkout })

    const distance = screen.getByPlaceholderText('0.0')
    await user.clear(distance)
    await user.type(distance, '3.25')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith(42, expect.objectContaining({ distance: 3.25 }))
    expect(onClose).toHaveBeenCalled()
  })

  it('fires onDelete then closes', async () => {
    const user = userEvent.setup()
    const { onDelete, onClose } = setup({ workout: baseWorkout })

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledWith(42)
    expect(onClose).toHaveBeenCalled()
  })

  it('fires onSwap then closes', async () => {
    const user = userEvent.setup()
    const { onSwap, onClose } = setup({ workout: baseWorkout })

    await user.click(screen.getByRole('button', { name: 'Swap' }))

    expect(onSwap).toHaveBeenCalledWith(42)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows duration (not distance/pace) when the type is changed to strength', async () => {
    const user = userEvent.setup()
    setup({ workout: baseWorkout })

    // easy_run starts with a distance field...
    expect(screen.getByPlaceholderText('0.0')).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), 'strength')

    // ...strength swaps to a duration field and drops distance/pace.
    expect(screen.queryByPlaceholderText('0.0')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument()
  })

  it('drops all numeric fields for a rest day', async () => {
    const user = userEvent.setup()
    setup({ workout: baseWorkout })

    await user.selectOptions(screen.getByRole('combobox'), 'rest')

    expect(screen.queryByPlaceholderText('0.0')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('MM')).not.toBeInTheDocument()
  })
})

describe('WorkoutForm — creating', () => {
  it('shows the create UI with no edit-only actions', () => {
    setup() // no workout -> create mode

    expect(screen.getByRole('heading')).toHaveTextContent(/New Workout/i)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Swap' })).not.toBeInTheDocument()
    expect(screen.getByText(/Apply from template/i)).toBeInTheDocument()
  })

  it('creates a workout with the entered date and parsed distance', async () => {
    const user = userEvent.setup()
    const { onSave } = setup()

    await user.type(screen.getByPlaceholderText('0.0'), '6.5')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-03-02', distance: 6.5, workout_type: 'easy_run' }),
    )
  })
})

describe('WorkoutForm — close affordances', () => {
  it('closes when the backdrop × is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = setup({ workout: baseWorkout })

    // The header close button renders a × glyph.
    const header = screen.getByRole('heading').parentElement as HTMLElement
    await user.click(within(header).getByRole('button'))

    expect(onClose).toHaveBeenCalled()
  })
})
