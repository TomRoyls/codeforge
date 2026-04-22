import { describe, test, expect } from 'vitest'
import {
  displayCacheStatus,
  displayClearResult,
  formatSize,
  resolveCacheAction,
  resolveCacheOptions,
  type CacheAction,
  type CacheOptions,
  type LogFn,
} from '../../../src/commands/cache-helpers.js'

describe('formatSize', () => {
  test('formats 0 bytes', () => {
    expect(formatSize(0)).toBe('0.0 B')
  })

  test('formats bytes less than 1024', () => {
    expect(formatSize(500)).toBe('500.0 B')
  })

  test('formats exactly 1 KB', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
  })

  test('formats kilobytes', () => {
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  test('formats fractional kilobytes', () => {
    expect(formatSize(1536)).toBe('1.5 KB')
  })

  test('formats exactly 1 MB', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB')
  })

  test('formats megabytes', () => {
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  test('formats exactly 1 GB', () => {
    expect(formatSize(1024 * 1024 * 1024)).toBe('1.0 GB')
  })

  test('formats gigabytes', () => {
    expect(formatSize(2 * 1024 * 1024 * 1024)).toBe('2.0 GB')
  })

  test('does not exceed GB unit', () => {
    const result = formatSize(10 * 1024 * 1024 * 1024)
    expect(result).toContain('GB')
    expect(result).not.toContain('TB')
  })

  test('formats 1 byte', () => {
    expect(formatSize(1)).toBe('1.0 B')
  })

  test('formats 1023 bytes', () => {
    expect(formatSize(1023)).toBe('1023.0 B')
  })

  test('formats large MB value', () => {
    expect(formatSize(500 * 1024 * 1024)).toBe('500.0 MB')
  })

  test('formats 512 bytes (0.5 KB)', () => {
    expect(formatSize(512)).toBe('512.0 B')
  })

  test('always has one decimal place', () => {
    const result = formatSize(42)
    expect(result).toMatch(/\d+\.\d B/)
  })

  test('formats negative value as negative bytes', () => {
    expect(formatSize(-1)).toBe('-1.0 B')
  })

  test('formats negative large value staying in bytes', () => {
    expect(formatSize(-2048)).toBe('-2048.0 B')
  })

  test('formats fractional megabytes', () => {
    expect(formatSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
  })

  test('formats 1025 bytes as just over 1 KB', () => {
    expect(formatSize(1025)).toBe('1.0 KB')
  })

  test('formats value just under 1 MB boundary', () => {
    expect(formatSize(1024 * 1024 - 1)).toBe('1024.0 KB')
  })

  test('formats large fractional gigabytes', () => {
    expect(formatSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB')
  })

  test('formats decimal input', () => {
    expect(formatSize(0.5)).toBe('0.5 B')
  })
})

describe('resolveCacheAction', () => {
  test('returns status by default', () => {
    expect(resolveCacheAction({}, {})).toBe('status')
  })

  test('returns status when action arg is status', () => {
    expect(resolveCacheAction({ action: 'status' }, {})).toBe('status')
  })

  test('returns clear when action arg is clear', () => {
    expect(resolveCacheAction({ action: 'clear' }, {})).toBe('clear')
  })

  test('returns clear when clear flag is true', () => {
    expect(resolveCacheAction({ action: 'status' }, { clear: true })).toBe('clear')
  })

  test('returns status when status flag is true', () => {
    expect(resolveCacheAction({ action: 'status' }, { status: true })).toBe('status')
  })

  test('clear flag overrides action arg', () => {
    expect(resolveCacheAction({ action: 'status' }, { clear: true })).toBe('clear')
  })

  test('clear flag takes priority over status flag', () => {
    expect(resolveCacheAction({}, { clear: true, status: true })).toBe('clear')
  })

  test('returns status when all flags are false', () => {
    expect(resolveCacheAction({}, { clear: false, status: false })).toBe('status')
  })

  test('returns status for undefined action', () => {
    expect(resolveCacheAction({ action: undefined }, {})).toBe('status')
  })

  test('clear flag with truthy non-boolean value', () => {
    expect(resolveCacheAction({}, { clear: 1 })).toBe('clear')
  })

  test('status flag with truthy non-boolean value', () => {
    expect(resolveCacheAction({}, { clear: false, status: 'yes' })).toBe('status')
  })

  test('returns status for null action', () => {
    expect(resolveCacheAction({ action: null }, {})).toBe('status')
  })

  test('status flag overrides clear action arg', () => {
    expect(resolveCacheAction({ action: 'clear' }, { status: true })).toBe('status')
  })

  test('ignores unrelated flags', () => {
    expect(resolveCacheAction({}, { verbose: true, json: true })).toBe('status')
  })

  test('treats string "true" as truthy for clear flag', () => {
    expect(resolveCacheAction({}, { clear: 'true' })).toBe('clear')
  })

  test('empty string status flag does not override clear action', () => {
    expect(resolveCacheAction({ action: 'clear' }, { status: '' })).toBe('clear')
  })

  test('returns unrecognized action string when arg is not clear or status', () => {
    const result = resolveCacheAction({ action: 'purge' }, {})
    expect(result).toBe('purge')
  })

  test('clear flag overrides unrecognized action arg', () => {
    expect(resolveCacheAction({ action: 'unknown' }, { clear: true })).toBe('clear')
  })

  test('status flag overrides unrecognized action arg', () => {
    expect(resolveCacheAction({ action: 'unknown' }, { status: true })).toBe('status')
  })
})

describe('resolveCacheOptions', () => {
  test('returns default options with no args or flags', () => {
    const result = resolveCacheOptions({}, {}, '/default/path')
    expect(result).toEqual({ action: 'status', path: '/default/path' })
  })

  test('returns clear action with default path', () => {
    const result = resolveCacheOptions({ action: 'clear' }, {}, '/default/path')
    expect(result.action).toBe('clear')
    expect(result.path).toBe('/default/path')
  })

  test('uses custom path from flags', () => {
    const result = resolveCacheOptions({}, { path: '/custom/cache' }, '/default/path')
    expect(result.path).toBe('/custom/cache')
  })

  test('uses default path when path flag is undefined', () => {
    const result = resolveCacheOptions({}, {}, '/default/path')
    expect(result.path).toBe('/default/path')
  })

  test('clear flag overrides action arg', () => {
    const result = resolveCacheOptions({ action: 'status' }, { clear: true }, '/default')
    expect(result.action).toBe('clear')
  })

  test('respects action arg when no flags override', () => {
    const result = resolveCacheOptions({ action: 'clear' }, {}, '/default')
    expect(result.action).toBe('clear')
  })

  test('combines clear action with custom path', () => {
    const result = resolveCacheOptions({ action: 'clear' }, { path: '/my/cache' }, '/default')
    expect(result).toEqual({ action: 'clear', path: '/my/cache' })
  })

  test('returns CacheOptions type', () => {
    const result = resolveCacheOptions({}, {}, '/path')
    expect(result).toHaveProperty('action')
    expect(result).toHaveProperty('path')
  })

  test('uses empty string for undefined path flag and empty default', () => {
    const result = resolveCacheOptions({}, { path: undefined }, '')
    expect(result.path).toBe('')
  })

  test('preserves action through resolveCacheAction call', () => {
    const result = resolveCacheOptions({ action: 'status' }, { status: true }, '/p')
    expect(result.action).toBe('status')
  })

  test('uses path with special characters from flags', () => {
    const result = resolveCacheOptions({}, { path: '/cache/my project/data' }, '/default')
    expect(result.path).toBe('/cache/my project/data')
  })

  test('uses empty string default when no path flag provided', () => {
    const result = resolveCacheOptions({}, {}, '')
    expect(result.path).toBe('')
  })

  test('uses relative path from flags', () => {
    const result = resolveCacheOptions({}, { path: './local-cache' }, '/default')
    expect(result.path).toBe('./local-cache')
  })

  test('clear flag overrides action with custom path', () => {
    const result = resolveCacheOptions(
      { action: 'status' },
      { clear: true, path: '/custom' },
      '/default',
    )
    expect(result).toEqual({ action: 'clear', path: '/custom' })
  })

  test('status flag overrides clear action arg with default path', () => {
    const result = resolveCacheOptions({ action: 'clear' }, { status: true }, '/default')
    expect(result.action).toBe('status')
    expect(result.path).toBe('/default')
  })

  test('falls back to default path when path flag is null', () => {
    const result = resolveCacheOptions({}, { path: null }, '/default')
    expect(result.path).toBe('/default')
  })

  test('preserves action arg with custom path and no overriding flags', () => {
    const result = resolveCacheOptions({ action: 'clear' }, { path: '/custom' }, '/default')
    expect(result).toEqual({ action: 'clear', path: '/custom' })
  })
})

describe('displayCacheStatus', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('displays Cache Status header', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/cache', log))
    const output = lines.join('\n')
    expect(output).toContain('Cache Status')
  })

  test('displays cache path', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 0, size: 0 }, '/my/cache/path', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('/my/cache/path')
  })

  test('displays entry count', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 5, size: 1024 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('5')
    expect(output).toContain('Entries')
  })

  test('displays formatted size', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 1, size: 2048 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('KB')
    expect(output).toContain('Size')
  })

  test('shows Cache is empty for zero entries', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/cache', log))
    const output = lines.join('\n')
    expect(output).toContain('Cache is empty')
  })

  test('shows Cache is active for non-zero entries', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 3, size: 100 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('Cache is active')
  })

  test('calls logFn multiple times', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/cache', log))
    expect(lines.length).toBeGreaterThan(3)
  })

  test('includes blank lines for spacing', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/cache', log))
    expect(lines).toContain('')
  })

  test('displays size in bytes for small cache', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 1, size: 100 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('100.0 B')
  })

  test('displays size in MB for large cache', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 10, size: 5 * 1024 * 1024 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('MB')
  })

  test('displays zero entries correctly', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/cache', log))
    const output = lines.join('\n')
    expect(output).toContain('0')
  })

  test('passes multiple args to logFn for path line', () => {
    const calls: unknown[][] = []
    displayCacheStatus({ entries: 0, size: 0 }, '/cache/path', (...args: unknown[]) => {
      calls.push(args)
    })
    const pathCall = calls.find((c) => c.length === 2 && String(c[1]).includes('/cache/path'))
    expect(pathCall).toBeDefined()
    expect(pathCall![1]).toBe('/cache/path')
  })

  test('shows Cache is active for single entry', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 1, size: 50 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('Cache is active')
    expect(output).not.toContain('Cache is empty')
  })

  test('displays GB for very large cache size', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 50, size: 3 * 1024 * 1024 * 1024 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('GB')
  })

  test('displays very large entry count', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 1000000, size: 1024 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('1000000')
  })

  test('calls logFn exactly 7 times for empty cache', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/cache', log))
    expect(lines).toHaveLength(7)
  })

  test('calls logFn exactly 7 times for active cache', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 5, size: 1024 }, '/cache', log),
    )
    expect(lines).toHaveLength(7)
  })

  test('displays cache path with special characters', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 0, size: 0 }, '/path/with spaces/缓存', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('/path/with spaces/缓存')
  })

  test('first log call contains Cache Status header', () => {
    const calls: string[] = []
    displayCacheStatus({ entries: 0, size: 0 }, '/cache', (msg) => {
      calls.push(msg ?? '')
    })
    expect(calls[0]).toContain('Cache Status')
  })

  test('entries line contains the count as string', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 42, size: 0 }, '/cache', log),
    )
    const entriesLine = lines.find((l) => l.includes('Entries'))
    expect(entriesLine).toBeDefined()
    expect(entriesLine).toContain('42')
  })
})

describe('displayClearResult', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('shows already empty for zero entries', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 0 }, log))
    const output = lines.join('\n')
    expect(output).toContain('Cache is already empty')
  })

  test('shows cleared message for non-zero entries', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 5, size: 1024 }, log))
    const output = lines.join('\n')
    expect(output).toContain('Cache cleared')
  })

  test('shows entry count in clear message', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 3, size: 500 }, log))
    const output = lines.join('\n')
    expect(output).toContain('3 entries')
  })

  test('shows formatted size in clear message', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 2, size: 2048 }, log))
    const output = lines.join('\n')
    expect(output).toContain('KB')
  })

  test('shows removed count in parentheses', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 10, size: 5000 }, log))
    const output = lines.join('\n')
    expect(output).toContain('(')
    expect(output).toContain(')')
  })

  test('does not show cleared message for empty cache', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 0 }, log))
    const output = lines.join('\n')
    expect(output).not.toContain('Cache cleared')
  })

  test('does not show empty message for non-empty cache', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 1, size: 100 }, log))
    const output = lines.join('\n')
    expect(output).not.toContain('already empty')
  })

  test('calls logFn once for empty cache', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 0 }, log))
    expect(lines).toHaveLength(1)
  })

  test('calls logFn twice for cleared cache', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 5, size: 1000 }, log))
    expect(lines).toHaveLength(2)
  })

  test('formats large sizes correctly in clear result', () => {
    const lines = captureOutput((log) =>
      displayClearResult({ entries: 100, size: 50 * 1024 * 1024 }, log),
    )
    const output = lines.join('\n')
    expect(output).toContain('MB')
  })

  test('shows single entry count correctly', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 1, size: 50 }, log))
    const output = lines.join('\n')
    expect(output).toContain('1 entries')
  })

  test('handles zero size with non-zero entries', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 3, size: 0 }, log))
    const output = lines.join('\n')
    expect(output).toContain('Cache cleared')
    expect(output).toContain('0.0 B')
  })

  test('shows GB in clear result for large cache', () => {
    const lines = captureOutput((log) =>
      displayClearResult({ entries: 500, size: 5 * 1024 * 1024 * 1024 }, log),
    )
    const output = lines.join('\n')
    expect(output).toContain('GB')
    expect(output).toContain('500 entries')
  })

  test('shows very large entry count in clear result', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 999999, size: 1024 }, log))
    const output = lines.join('\n')
    expect(output).toContain('999999 entries')
  })

  test('formats size as KB when clearing 1024 bytes', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 2, size: 1024 }, log))
    const output = lines.join('\n')
    expect(output).toContain('1.0 KB')
  })

  test('single entry shows count in parentheses', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 1, size: 200 }, log))
    const output = lines.join('\n')
    expect(output).toContain('1 entries')
    expect(output).toContain('(')
    expect(output).toContain(')')
  })

  test('cleared message contains checkmark symbol', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 2, size: 100 }, log))
    const output = lines.join('\n')
    expect(output).toContain('✓')
  })

  test('second log line contains Removed prefix with entries count and size', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 5, size: 2048 }, log))
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('Removed 5 entries')
    expect(lines[1]).toContain('2.0 KB')
  })

  test('resolveCacheAction treats null action arg as status', () => {
    expect(resolveCacheAction({ action: null }, {})).toBe('status')
  })

  test('resolveCacheAction treats undefined action arg as status', () => {
    expect(resolveCacheAction({}, {})).toBe('status')
  })

  test('resolveCacheOptions uses default path when path flag is undefined', () => {
    const opts = resolveCacheOptions({}, {}, '/default/cache')
    expect(opts.path).toBe('/default/cache')
  })

  test('resolveCacheOptions uses path flag over default', () => {
    const opts = resolveCacheOptions({}, { path: '/custom/path' }, '/default/cache')
    expect(opts.path).toBe('/custom/path')
  })

  test('resolveCacheOptions returns clear action when clear flag set', () => {
    const opts = resolveCacheOptions({}, { clear: true }, '/cache')
    expect(opts.action).toBe('clear')
  })

  test('displayCacheStatus shows active message for entries > 0', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 5, size: 100 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('Cache is active')
    expect(output).not.toContain('Cache is empty')
  })

  test('displayCacheStatus shows entries count', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 42, size: 100 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('42')
  })

  test('displayCacheStatus shows formatted size', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 5, size: 2048 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('KB')
  })
})

describe('formatSize boundary and edge cases', () => {
  test('formats exactly 1024 KB boundary as MB', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB')
  })

  test('formats exactly 1024 MB boundary as GB', () => {
    expect(formatSize(1024 * 1024 * 1024)).toBe('1.0 GB')
  })

  test('formats Number.MAX_SAFE_INTEGER staying in GB', () => {
    const result = formatSize(Number.MAX_SAFE_INTEGER)
    expect(result).toContain('GB')
  })

  test('formats very small fractional byte', () => {
    expect(formatSize(0.001)).toBe('0.0 B')
  })

  test('formats 999 bytes', () => {
    expect(formatSize(999)).toBe('999.0 B')
  })

  test('formats 1000 bytes as just under 1 KB', () => {
    expect(formatSize(1000)).toBe('1000.0 B')
  })

  test('formats large negative value in bytes', () => {
    expect(formatSize(-1024 * 1024)).toBe('-1048576.0 B')
  })

  test('formats 1.1 KB correctly', () => {
    expect(formatSize(1126)).toBe('1.1 KB')
  })
})

describe('resolveCacheAction edge cases', () => {
  test('handles args with extra unrelated keys', () => {
    expect(resolveCacheAction({ foo: 'bar', baz: 42 }, { qux: true })).toBe('status')
  })

  test('clear flag with empty object does not override', () => {
    expect(resolveCacheAction({ action: 'clear' }, {})).toBe('clear')
  })

  test('falsy clear flag (0) does not activate clear', () => {
    expect(resolveCacheAction({}, { clear: 0 })).toBe('status')
  })

  test('falsy status flag (0) does not activate status override', () => {
    expect(resolveCacheAction({ action: 'clear' }, { status: 0 })).toBe('clear')
  })

  test('clear flag as empty array is truthy', () => {
    expect(resolveCacheAction({}, { clear: [] as unknown[] as unknown as boolean })).toBe('clear')
  })

  test('clear flag as object is truthy', () => {
    expect(
      resolveCacheAction({}, { clear: {} as Record<string, unknown> as unknown as boolean }),
    ).toBe('clear')
  })
})

describe('resolveCacheOptions edge cases', () => {
  test('uses whitespace-only path flag over default', () => {
    const result = resolveCacheOptions({}, { path: '   ' }, '/default')
    expect(result.path).toBe('   ')
  })

  test('preserves deeply nested path', () => {
    const result = resolveCacheOptions({}, { path: '/a/b/c/d/e/f' }, '/default')
    expect(result.path).toBe('/a/b/c/d/e/f')
  })

  test('handles both clear and status flags with custom path', () => {
    const result = resolveCacheOptions(
      {},
      { clear: true, status: true, path: '/custom' },
      '/default',
    )
    expect(result).toEqual({ action: 'clear', path: '/custom' })
  })

  test('uses default path with slash', () => {
    const result = resolveCacheOptions({}, {}, '/')
    expect(result.path).toBe('/')
  })

  test('uses dot as default path', () => {
    const result = resolveCacheOptions({}, {}, '.')
    expect(result.path).toBe('.')
  })
})

describe('displayCacheStatus edge cases', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('displays empty string path', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '', log))
    const output = lines.join('\n')
    expect(output).toContain('Path:')
  })

  test('displays zero entries and zero size', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/cache', log))
    expect(lines).toHaveLength(7)
    const output = lines.join('\n')
    expect(output).toContain('Cache is empty')
  })

  test('displays size in GB for cache at GB boundary', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 1, size: 1024 * 1024 * 1024 }, '/cache', log),
    )
    const output = lines.join('\n')
    expect(output).toContain('1.0 GB')
  })
})

describe('displayClearResult edge cases', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('does not contain checkmark for already empty cache', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 0 }, log))
    expect(lines.join('\n')).not.toContain('✓')
  })

  test('does not contain Removed for already empty cache', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 0 }, log))
    expect(lines.join('\n')).not.toContain('Removed')
  })

  test('handles large entry count with small size', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 10000, size: 1 }, log))
    const output = lines.join('\n')
    expect(output).toContain('10000 entries')
    expect(output).toContain('1.0 B')
  })

  test('clears cache with exactly 1024 MB', () => {
    const lines = captureOutput((log) =>
      displayClearResult({ entries: 1, size: 1024 * 1024 * 1024 }, log),
    )
    const output = lines.join('\n')
    expect(output).toContain('1.0 GB')
  })
})

describe('resolveCacheAction exhaustive', () => {
  test('no args, no flags → status', () => {
    expect(resolveCacheAction({}, {})).toBe('status')
  })

  test('args.action = "clear" → clear', () => {
    expect(resolveCacheAction({ action: 'clear' }, {})).toBe('clear')
  })

  test('args.action = "status" → status', () => {
    expect(resolveCacheAction({ action: 'status' }, {})).toBe('status')
  })

  test('flags.clear overrides args.action', () => {
    expect(resolveCacheAction({ action: 'status' }, { clear: true })).toBe('clear')
  })

  test('flags.status forces status', () => {
    expect(resolveCacheAction({ action: 'clear' }, { status: true })).toBe('status')
  })

  test('both clear and status flags → clear takes priority', () => {
    expect(resolveCacheAction({}, { clear: true, status: true })).toBe('clear')
  })

  test('undefined args → status', () => {
    expect(resolveCacheAction({}, {})).toBe('status')
  })

  test('empty string action → status (via ??)', () => {
    expect(resolveCacheAction({ action: '' }, {})).toBe('')
  })

  test('random action value → status', () => {
    expect(resolveCacheAction({ action: 'purge' }, {})).toBe('purge')
  })

  test('falsy clear flag → status', () => {
    expect(resolveCacheAction({}, { clear: false })).toBe('status')
  })

  test('falsy status flag → status', () => {
    expect(resolveCacheAction({}, { status: false })).toBe('status')
  })

  test('clear flag with truthy value → clear', () => {
    expect(resolveCacheAction({}, { clear: 1 })).toBe('clear')
  })
})

describe('resolveCacheOptions exhaustive', () => {
  test('defaults to action=status and provided path', () => {
    const opts = resolveCacheOptions({}, {}, '/default')
    expect(opts.action).toBe('status')
    expect(opts.path).toBe('/default')
  })

  test('path from flags overrides default', () => {
    const opts = resolveCacheOptions({}, { path: '/custom' }, '/default')
    expect(opts.path).toBe('/custom')
  })

  test('action=clear with path', () => {
    const opts = resolveCacheOptions({}, { clear: true, path: '/tmp' }, '/default')
    expect(opts.action).toBe('clear')
    expect(opts.path).toBe('/tmp')
  })

  test('empty path flag uses default', () => {
    const opts = resolveCacheOptions({}, { path: '' }, '/default')
    expect(opts.path).toBe('')
  })

  test('undefined path flag uses default', () => {
    const opts = resolveCacheOptions({}, { path: undefined }, '/default')
    expect(opts.path).toBe('/default')
  })

  test('null path flag uses default', () => {
    const opts = resolveCacheOptions({}, {}, '/default')
    expect(opts.path).toBe('/default')
  })

  test('relative path preserved', () => {
    const opts = resolveCacheOptions({}, { path: './cache' }, '/absolute')
    expect(opts.path).toBe('./cache')
  })

  test('absolute path preserved', () => {
    const opts = resolveCacheOptions({}, { path: '/absolute/cache' }, '.')
    expect(opts.path).toBe('/absolute/cache')
  })

  test('path with spaces', () => {
    const opts = resolveCacheOptions({}, { path: '/path with spaces' }, '.')
    expect(opts.path).toBe('/path with spaces')
  })

  test('path with unicode', () => {
    const opts = resolveCacheOptions({}, { path: '/日本語/cache' }, '.')
    expect(opts.path).toBe('/日本語/cache')
  })

  test('combined args.action and flags.path', () => {
    const opts = resolveCacheOptions({ action: 'clear' }, { path: '/tmp' }, '.')
    expect(opts.action).toBe('clear')
    expect(opts.path).toBe('/tmp')
  })
})

describe('displayCacheStatus exhaustive', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('shows Cache Status header', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 5, size: 1024 }, '/c', log))
    expect(lines[0]).toContain('Cache Status')
  })

  test('shows Path line', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 5, size: 1024 }, '/my/cache', log),
    )
    expect(lines.join('\n')).toContain('Path:')
    expect(lines.join('\n')).toContain('/my/cache')
  })

  test('shows Entries line with count', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 42, size: 1024 }, '/c', log))
    expect(lines.join('\n')).toContain('Entries:')
    expect(lines.join('\n')).toContain('42')
  })

  test('shows Size line', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 5, size: 2048 }, '/c', log))
    expect(lines.join('\n')).toContain('Size:')
    expect(lines.join('\n')).toContain('2.0 KB')
  })

  test('active cache shows green message', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 1, size: 100 }, '/c', log))
    expect(lines.join('\n')).toContain('Cache is active')
  })

  test('empty cache shows yellow message', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/c', log))
    expect(lines.join('\n')).toContain('Cache is empty')
  })

  test('large entry count displayed', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 1000000, size: 1073741824 }, '/c', log),
    )
    expect(lines.join('\n')).toContain('1000000')
    expect(lines.join('\n')).toContain('1.0 GB')
  })

  test('path with special chars', () => {
    const lines = captureOutput((log) =>
      displayCacheStatus({ entries: 0, size: 0 }, '/path/with spaces/and$dollar', log),
    )
    expect(lines.join('\n')).toContain('/path/with spaces/and$dollar')
  })

  test('exactly 7 lines for empty cache', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/c', log))
    expect(lines).toHaveLength(7)
  })

  test('exactly 7 lines for active cache', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 10, size: 5000 }, '/c', log))
    expect(lines).toHaveLength(7)
  })
})

describe('displayClearResult exhaustive', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('empty cache: 1 line with already empty', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 0 }, log))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('already empty')
  })

  test('cleared cache: 2 lines with checkmark and removed', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 5, size: 1024 }, log))
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('✓')
    expect(lines[1]).toContain('Removed')
  })

  test('cleared cache shows entry count', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 99, size: 5000 }, log))
    expect(lines.join('\n')).toContain('99 entries')
  })

  test('cleared cache shows formatted size', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 1, size: 1536 }, log))
    expect(lines.join('\n')).toContain('1.5 KB')
  })

  test('single entry shows "1 entries"', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 1, size: 100 }, log))
    expect(lines.join('\n')).toContain('1 entries')
  })

  test('large cleared cache', () => {
    const lines = captureOutput((log) =>
      displayClearResult({ entries: 50000, size: 5368709120 }, log),
    )
    expect(lines.join('\n')).toContain('50000 entries')
    expect(lines.join('\n')).toContain('5.0 GB')
  })

  test('empty cache does not show removed info', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 0 }, log))
    expect(lines.join('\n')).not.toContain('Removed')
  })
})

describe('formatSize additional edge cases', () => {
  test('formats NaN as NaN B', () => {
    expect(formatSize(NaN)).toBe('NaN B')
  })

  test('formats Infinity as Infinity GB', () => {
    expect(formatSize(Infinity)).toBe('Infinity GB')
  })

  test('formats -Infinity as -Infinity B', () => {
    expect(formatSize(-Infinity)).toBe('-Infinity B')
  })

  test('formats 100 KB value', () => {
    expect(formatSize(100 * 1024)).toBe('100.0 KB')
  })

  test('formats 10 MB value', () => {
    expect(formatSize(10 * 1024 * 1024)).toBe('10.0 MB')
  })

  test('formats 256 KB value', () => {
    expect(formatSize(256 * 1024)).toBe('256.0 KB')
  })

  test('formats 50 MB value', () => {
    expect(formatSize(50 * 1024 * 1024)).toBe('50.0 MB')
  })

  test('formats 3 GB value', () => {
    expect(formatSize(3 * 1024 * 1024 * 1024)).toBe('3.0 GB')
  })
})

describe('resolveCacheAction falsy flag combinations', () => {
  test('falsy clear null does not override clear action', () => {
    expect(resolveCacheAction({ action: 'clear' }, { clear: null })).toBe('clear')
  })

  test('falsy clear empty string does not override clear action', () => {
    expect(resolveCacheAction({ action: 'clear' }, { clear: '' })).toBe('clear')
  })

  test('falsy clear zero does not override clear action', () => {
    expect(resolveCacheAction({ action: 'clear' }, { clear: 0 })).toBe('clear')
  })

  test('falsy status null does not override clear action', () => {
    expect(resolveCacheAction({ action: 'clear' }, { status: null })).toBe('clear')
  })

  test('falsy status empty string does not override status action', () => {
    expect(resolveCacheAction({ action: 'status' }, { status: '' })).toBe('status')
  })

  test('clear flag NaN is falsy and does not trigger clear', () => {
    expect(resolveCacheAction({}, { clear: NaN })).toBe('status')
  })

  test('status flag NaN is falsy and does not override default', () => {
    expect(resolveCacheAction({}, { status: NaN })).toBe('status')
  })
})

describe('resolveCacheOptions additional cases', () => {
  test('preserves trailing slash in path', () => {
    const result = resolveCacheOptions({}, { path: '/cache/dir/' }, '/default')
    expect(result.path).toBe('/cache/dir/')
  })

  test('preserves emoji in path', () => {
    const result = resolveCacheOptions({}, { path: '/cache/📦/data' }, '/default')
    expect(result.path).toBe('/cache/📦/data')
  })

  test('clear action with empty default path', () => {
    const result = resolveCacheOptions({ action: 'clear' }, {}, '')
    expect(result).toEqual({ action: 'clear', path: '' })
  })

  test('unrelated flags do not affect result', () => {
    const result = resolveCacheOptions(
      { action: 'status' },
      { verbose: true, json: true, quiet: false },
      '/default',
    )
    expect(result).toEqual({ action: 'status', path: '/default' })
  })

  test('very long path is preserved', () => {
    const longPath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t'
    const result = resolveCacheOptions({}, { path: longPath }, '/default')
    expect(result.path).toBe(longPath)
  })

  test('clear action with undefined path uses default', () => {
    const result = resolveCacheOptions({ action: 'clear' }, { path: undefined }, '/my/cache')
    expect(result).toEqual({ action: 'clear', path: '/my/cache' })
  })

  test('status action with custom path flag', () => {
    const result = resolveCacheOptions(
      { action: 'status' },
      { status: true, path: '/custom/status' },
      '/default',
    )
    expect(result).toEqual({ action: 'status', path: '/custom/status' })
  })
})

describe('displayCacheStatus line position verification', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('second log call is blank line for spacing', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/c', log))
    expect(lines[1]).toBe('')
  })

  test('third log call contains Path label', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/c', log))
    expect(lines[2]).toContain('Path:')
  })

  test('fourth log call contains Entries label', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 5, size: 0 }, '/c', log))
    expect(lines[3]).toContain('Entries:')
  })

  test('fifth log call contains Size label', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 5, size: 1024 }, '/c', log))
    expect(lines[4]).toContain('Size:')
  })

  test('sixth log call is blank line for spacing', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 0 }, '/c', log))
    expect(lines[5]).toBe('')
  })

  test('displays 0.0 B when size is 0 with active entries', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 1, size: 0 }, '/c', log))
    const output = lines.join('\n')
    expect(output).toContain('0.0 B')
    expect(output).toContain('Cache is active')
  })

  test('shows active for negative entries count', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: -1, size: 100 }, '/c', log))
    const output = lines.join('\n')
    expect(output).toContain('Cache is active')
    expect(output).toContain('-1')
  })

  test('shows empty even when size is positive but entries is 0', () => {
    const lines = captureOutput((log) => displayCacheStatus({ entries: 0, size: 999 }, '/c', log))
    const output = lines.join('\n')
    expect(output).toContain('Cache is empty')
    expect(output).toContain('999.0 B')
  })
})

describe('displayClearResult additional cases', () => {
  function captureOutput(fn: (log: LogFn) => void): string[] {
    const lines: string[] = []
    fn((msg, ...args) => {
      const parts = [msg ?? '', ...args.map(String)]
      lines.push(parts.join(' '))
    })
    return lines
  }

  test('cleared cache with zero size shows 0.0 B', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 4, size: 0 }, log))
    const output = lines.join('\n')
    expect(output).toContain('0.0 B')
    expect(output).toContain('4 entries')
  })

  test('second line contains size in parentheses', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 1, size: 512 }, log))
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('(512.0 B)')
  })

  test('empty cache with non-zero size still shows already empty', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 0, size: 500 }, log))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('already empty')
  })

  test('first line of cleared output contains checkmark', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 1, size: 10 }, log))
    expect(lines[0]).toContain('✓')
    expect(lines[0]).toContain('Cache cleared')
  })

  test('cleared with large entry count displays correctly', () => {
    const lines = captureOutput((log) =>
      displayClearResult({ entries: 2500000, size: 10 * 1024 * 1024 * 1024 }, log),
    )
    const output = lines.join('\n')
    expect(output).toContain('2500000 entries')
    expect(output).toContain('10.0 GB')
  })

  test('cleared with fractional MB size shows 1.5 MB', () => {
    const lines = captureOutput((log) =>
      displayClearResult({ entries: 1, size: 1.5 * 1024 * 1024 }, log),
    )
    const output = lines.join('\n')
    expect(output).toContain('1.5 MB')
  })

  test('cleared with 10 entries shows count in output', () => {
    const lines = captureOutput((log) => displayClearResult({ entries: 10, size: 100 }, log))
    const output = lines.join('\n')
    expect(output).toContain('10 entries')
  })
})
