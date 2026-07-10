import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithClient } from '../../test/render'
import { FeedbackAdmin } from './FeedbackAdmin'
import type { Feedback } from '../../types'

vi.mock('../../api')
import * as api from '../../api'

const ITEMS: Feedback[] = [
  {
    id: 2,
    message: "If I run a different distance that isn't a full mile it won't let me update it",
    page: '/',
    created_at: '2026-06-07T20:15:00',
  },
  { id: 1, message: 'Love the new summary view', page: '/summary', created_at: '2026-06-01T14:00:00' },
]

beforeEach(() => {
  vi.mocked(api.getFeedback).mockResolvedValue(ITEMS)
  vi.mocked(api.deleteFeedback).mockResolvedValue(undefined as never)
})

describe('FeedbackAdmin', () => {
  it('lists feedback with message, page label, and count', async () => {
    renderWithClient(<FeedbackAdmin />)

    expect(await screen.findByText(/full mile/)).toBeInTheDocument()
    expect(screen.getByText('Love the new summary view')).toBeInTheDocument()
    // page paths map to friendly names
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('deletes only after confirming, then refreshes the list', async () => {
    const user = userEvent.setup()
    renderWithClient(<FeedbackAdmin />)
    await screen.findByText(/full mile/)

    // First click arms the confirm step — nothing deleted yet.
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    expect(api.deleteFeedback).not.toHaveBeenCalled()

    // Confirm deletes the armed item (list is newest-first, so id 2).
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    await waitFor(() => expect(api.deleteFeedback).toHaveBeenCalledWith(2))
  })

  it('cancel backs out of the confirm step', async () => {
    const user = userEvent.setup()
    renderWithClient(<FeedbackAdmin />)
    await screen.findByText(/full mile/)

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('button', { name: 'Confirm delete' })).not.toBeInTheDocument()
    expect(api.deleteFeedback).not.toHaveBeenCalled()
  })

  it('shows an empty state when there is no feedback', async () => {
    vi.mocked(api.getFeedback).mockResolvedValue([])
    renderWithClient(<FeedbackAdmin />)

    expect(await screen.findByText(/No feedback yet/)).toBeInTheDocument()
    expect(screen.getByText('0 items')).toBeInTheDocument()
  })
})
