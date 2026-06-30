import { describe, it, expect } from 'vitest'
import {
  formatPace,
  paceToSeconds,
  formatTime,
  getMondayOfWeek,
  addDays,
  formatDate,
  getDayName,
  isToday,
} from './utils'

describe('formatPace', () => {
  it('formats minutes:seconds with zero-padded seconds', () => {
    expect(formatPace(540)).toBe('9:00')
    expect(formatPace(545)).toBe('9:05')
    expect(formatPace(635)).toBe('10:35')
  })

  it('handles sub-minute paces', () => {
    expect(formatPace(45)).toBe('0:45')
  })
})

describe('paceToSeconds', () => {
  it('converts minutes and seconds to total seconds', () => {
    expect(paceToSeconds(9, 0)).toBe(540)
    expect(paceToSeconds(8, 30)).toBe(510)
  })

  it('round-trips with formatPace', () => {
    expect(formatPace(paceToSeconds(7, 45))).toBe('7:45')
  })
})

describe('formatTime', () => {
  it('formats H:MM:SS with zero-padded minutes and seconds', () => {
    expect(formatTime(3661)).toBe('1:01:01')
    expect(formatTime(515 * 26)).toBe('3:43:10') // ~goal marathon time
  })

  it('handles zero', () => {
    expect(formatTime(0)).toBe('0:00:00')
  })
})

describe('getMondayOfWeek', () => {
  it('returns the same day when given a Monday', () => {
    expect(getMondayOfWeek(new Date('2026-03-02T12:00:00'))).toBe('2026-03-02')
  })

  it('snaps a mid-week day back to Monday', () => {
    // 2026-03-04 is a Wednesday
    expect(getMondayOfWeek(new Date('2026-03-04T12:00:00'))).toBe('2026-03-02')
  })

  it('treats Sunday as the end of the prior Monday-start week', () => {
    // 2026-03-08 is a Sunday -> should map back to Mon 2026-03-02
    expect(getMondayOfWeek(new Date('2026-03-08T12:00:00'))).toBe('2026-03-02')
  })
})

describe('addDays', () => {
  it('adds days within a month', () => {
    expect(addDays('2026-03-02', 5)).toBe('2026-03-07')
  })

  it('subtracts with negative input', () => {
    expect(addDays('2026-03-02', -2)).toBe('2026-02-28')
  })

  it('rolls over month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('formatDate', () => {
  it('formats as weekday, month, day', () => {
    expect(formatDate('2026-03-02')).toBe('Mon, Mar 2')
  })
})

describe('getDayName', () => {
  it('returns the full weekday name', () => {
    expect(getDayName('2026-03-02')).toBe('Monday')
    expect(getDayName('2026-03-08')).toBe('Sunday')
  })
})

describe('isToday', () => {
  it('is true for today and false for other dates', () => {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`
    expect(isToday(todayStr)).toBe(true)
    expect(isToday('1999-01-01')).toBe(false)
  })
})
