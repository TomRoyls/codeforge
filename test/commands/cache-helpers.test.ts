import { describe, expect, it } from 'vitest'

import {
  displayCacheStatus,
  displayClearResult,
  resolveCacheAction,
  resolveCacheOptions,
  type CacheAction,
} from '../../src/commands/cache-helpers.js'

// ─── resolveCacheAction ───

describe('resolveCacheAction', () => {
  it('returns status by default', () => {
    expect(resolveCacheAction({}, {})).toBe('status')
  })

  it('returns action from args when valid', () => {
    expect(resolveCacheAction({ action: 'clear' }, {})).toBe('clear')
    expect(resolveCacheAction({ action: 'status' }, {})).toBe('status')
  })

  it('prioritizes clear flag over args', () => {
    expect(resolveCacheAction({ action: 'status' }, { clear: true })).toBe('clear')
  })

  it('prioritizes status flag over args', () => {
    expect(resolveCacheAction({ action: 'clear' }, { status: true })).toBe('status')
  })

  it('clear flag takes priority over status flag', () => {
    expect(resolveCacheAction({}, { clear: true, status: true })).toBe('clear')
  })
})

// ─── resolveCacheOptions ───

describe('resolveCacheOptions', () => {
  it('returns default path when no path flag', () => {
    const result = resolveCacheOptions({}, {}, '/default/path')
    expect(result.path).toBe('/default/path')
  })

  it('uses custom path from flags', () => {
    const result = resolveCacheOptions({}, { path: '/custom' }, '/default')
    expect(result.path).toBe('/custom')
  })

  it('resolves action correctly', () => {
    const result = resolveCacheOptions({}, { clear: true }, '/default')
    expect(result.action).toBe('clear')
  })
})

// ─── displayCacheStatus ───

describe('displayCacheStatus', () => {
  it('displays cache path and stats', () => {
    const calls: string[][] = []
    displayCacheStatus(
      { entries: 10, size: 4096 },
      '/cache/path',
      (msg?: string, ...args: unknown[]) => calls.push([msg ?? '', ...args.map(String)]),
    )
    const allText = calls.flat().join(' ')
    expect(allText).toContain('/cache/path')
    expect(allText).toContain('10')
  })

  it('shows "empty" message when no entries', () => {
    const calls: string[][] = []
    displayCacheStatus(
      { entries: 0, size: 0 },
      '/cache',
      (msg?: string, ...args: unknown[]) => calls.push([msg ?? '', ...args.map(String)]),
    )
    const allText = calls.flat().join(' ')
    expect(allText.toLowerCase()).toContain('empty')
  })

  it('shows "active" message when entries exist', () => {
    const calls: string[][] = []
    displayCacheStatus(
      { entries: 5, size: 1024 },
      '/cache',
      (msg?: string, ...args: unknown[]) => calls.push([msg ?? '', ...args.map(String)]),
    )
    const allText = calls.flat().join(' ')
    expect(allText.toLowerCase()).toContain('active')
  })
})

// ─── displayClearResult ───

describe('displayClearResult', () => {
  it('shows "already empty" when no entries', () => {
    const messages: string[] = []
    displayClearResult({ entries: 0, size: 0 }, (msg) => messages.push(msg))
    const text = messages.join(' ')
    expect(text).toContain('empty')
  })

  it('shows cleared count when entries existed', () => {
    const messages: string[] = []
    displayClearResult({ entries: 5, size: 2048 }, (msg) => messages.push(msg))
    const text = messages.join(' ')
    expect(text).toContain('5')
  })
})
