import { describe, it, expect } from 'vitest'

import {
  displayCacheStatus,
  displayClearResult,
  resolveCacheAction,
  resolveCacheOptions,
} from '../src/commands/cache-helpers.js'

// ─── resolveCacheAction ────────────────────────────────
describe('resolveCacheAction', () => {
  it('returns status by default', () => {
    expect(resolveCacheAction({}, {})).toBe('status')
  })

  it('returns the action from args', () => {
    expect(resolveCacheAction({ action: 'clear' }, {})).toBe('clear')
  })

  it('returns status from args', () => {
    expect(resolveCacheAction({ action: 'status' }, {})).toBe('status')
  })

  it('overrides args with clear flag', () => {
    expect(resolveCacheAction({ action: 'status' }, { clear: true })).toBe('clear')
  })

  it('overrides args with status flag', () => {
    expect(resolveCacheAction({ action: 'clear' }, { status: true })).toBe('status')
  })

  it('prioritizes clear over status flag', () => {
    expect(resolveCacheAction({}, { clear: true, status: true })).toBe('clear')
  })

  it('defaults to status when action is undefined', () => {
    expect(resolveCacheAction({ action: undefined }, {})).toBe('status')
  })
})

// ─── resolveCacheOptions ───────────────────────────────
describe('resolveCacheOptions', () => {
  it('returns default path when no path flag', () => {
    const opts = resolveCacheOptions({}, {}, '/default/cache')
    expect(opts.path).toBe('/default/cache')
  })

  it('uses path from flags', () => {
    const opts = resolveCacheOptions({}, { path: '/custom/path' }, '/default')
    expect(opts.path).toBe('/custom/path')
  })

  it('resolves action from args and flags', () => {
    const opts = resolveCacheOptions({ action: 'clear' }, {}, '/default')
    expect(opts.action).toBe('clear')
  })

  it('returns status action by default', () => {
    const opts = resolveCacheOptions({}, {}, '/default')
    expect(opts.action).toBe('status')
  })

  it('flag action overrides args action', () => {
    const opts = resolveCacheOptions({ action: 'status' }, { clear: true }, '/default')
    expect(opts.action).toBe('clear')
  })
})

// ─── displayCacheStatus ────────────────────────────────
describe('displayCacheStatus', () => {
  it('displays cache path', () => {
    const logs: string[] = []
    const capture = (...args: unknown[]) => logs.push(args.map(String).join(' '))
    displayCacheStatus({ entries: 5, size: 1024 }, '/cache/path', capture)
    expect(logs.some((l) => l.includes('/cache/path'))).toBe(true)
  })

  it('displays entry count', () => {
    const logs: string[] = []
    const capture = (...args: unknown[]) => logs.push(args.map(String).join(' '))
    displayCacheStatus({ entries: 42, size: 2048 }, '/cache', capture)
    expect(logs.some((l) => l.includes('42'))).toBe(true)
  })

  it('displays formatted size', () => {
    const logs: string[] = []
    const capture = (...args: unknown[]) => logs.push(args.map(String).join(' '))
    displayCacheStatus({ entries: 1, size: 1024 }, '/cache', capture)
    expect(logs.some((l) => l.includes('KB') || l.includes('1.0'))).toBe(true)
  })

  it('shows "Cache is empty" for zero entries', () => {
    const logs: string[] = []
    displayCacheStatus({ entries: 0, size: 0 }, '/cache', (msg) => logs.push(msg))
    expect(logs.some((l) => l.includes('Cache is empty'))).toBe(true)
  })

  it('shows "Cache is active" for non-zero entries', () => {
    const logs: string[] = []
    displayCacheStatus({ entries: 10, size: 5000 }, '/cache', (msg) => logs.push(msg))
    expect(logs.some((l) => l.includes('Cache is active'))).toBe(true)
  })

  it('includes blank lines for spacing', () => {
    const logs: string[] = []
    displayCacheStatus({ entries: 1, size: 100 }, '/cache', (msg) => logs.push(msg))
    expect(logs.filter((l) => l === '').length).toBeGreaterThanOrEqual(1)
  })

  it('includes bold header', () => {
    const logs: string[] = []
    displayCacheStatus({ entries: 1, size: 100 }, '/cache', (msg) => logs.push(msg))
    expect(logs.some((l) => l.includes('Cache Status'))).toBe(true)
  })
})

// ─── displayClearResult ────────────────────────────────
describe('displayClearResult', () => {
  it('shows "already empty" for zero entries', () => {
    const logs: string[] = []
    displayClearResult({ entries: 0, size: 0 }, (msg) => logs.push(msg))
    expect(logs.some((l) => l.includes('already empty'))).toBe(true)
  })

  it('shows cleared message for non-zero entries', () => {
    const logs: string[] = []
    displayClearResult({ entries: 5, size: 2048 }, (msg) => logs.push(msg))
    expect(logs.some((l) => l.includes('Cache cleared'))).toBe(true)
  })

  it('shows number of removed entries', () => {
    const logs: string[] = []
    displayClearResult({ entries: 12, size: 4096 }, (msg) => logs.push(msg))
    expect(logs.some((l) => l.includes('12 entries'))).toBe(true)
  })

  it('shows formatted size of removed data', () => {
    const logs: string[] = []
    displayClearResult({ entries: 3, size: 1536 }, (msg) => logs.push(msg))
    expect(logs.some((l) => l.includes('1.5 KB') || l.includes('KB'))).toBe(true)
  })

  it('returns early for zero entries without showing cleared message', () => {
    const logs: string[] = []
    displayClearResult({ entries: 0, size: 0 }, (msg) => logs.push(msg))
    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('already empty')
  })
})
