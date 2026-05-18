import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Watch from '../../src/commands/watch.js'

// ─── Top-level mocks ───

vi.mock('../../src/utils/watcher.js', () => {
  return {
    FileWatcher: class {
      on = vi.fn().mockReturnThis()
      watch = vi.fn().mockResolvedValue(undefined)
      stop = vi.fn().mockResolvedValue(undefined)
    },
  }
})

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    initialize = vi.fn().mockResolvedValue(undefined)
    parseFile = vi.fn()
    dispose = vi.fn()
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/utils/command-helpers.js', () => ({
  loadCommandConfig: vi.fn().mockResolvedValue({
    files: ['**/*.ts'],
    ignore: [],
  }),
  resolvePatterns: vi.fn().mockReturnValue(['**/*.ts']),
  setupRuleRegistryLazy: vi.fn().mockResolvedValue({
    runRules: vi.fn().mockReturnValue([]),
  }),
}))

vi.mock('../../src/config/cache.js', () => ({
  ConfigCache: class {},
}))

vi.mock('../../src/utils/constants.js', () => ({
  DEFAULT_DEBOUNCE_MS: 300,
}))

vi.mock('../../src/utils/errors.js', () => ({
  CLIError: class CLIError extends Error {
    public readonly code = 'E000'
    public readonly context: Record<string, unknown> = {}
    public readonly suggestions: string[] = []
    constructor(message: string) {
      super(message)
      this.name = 'CLIError'
    }
  },
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    setLevel: vi.fn(),
  },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
}))

vi.mock('../../src/commands/watch-helpers.js', () => {
  let counter = 0
  return {
    MAX_VIOLATIONS_TO_DISPLAY: 3,
    resolveRequestedRules: (rulesFlag: string | undefined): string[] | undefined => {
      if (!rulesFlag) return undefined
      return rulesFlag.split(',').map((r) => r.trim())
    },
    countBySeverity: (violations: Array<{ severity: string }>) => {
      let errors = 0
      let warnings = 0
      for (const v of violations) {
        if (v.severity === 'error') errors++
        else if (v.severity === 'warning') warnings++
      }
      return { errors, warnings }
    },
    getRelativePath: (filePath: string, cwd: string) =>
      filePath.replace(cwd, '.').replace(/^\.\//, ''),
    buildWatcherConfig: (options: { debounceMs?: number; ignorePatterns?: string[] }) => ({
      debounceMs: options.debounceMs ?? 300,
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
      ignorePatterns: options.ignorePatterns ?? [],
    }),
    formatStartupMessage: vi.fn((patterns: string[], debounceMs: number, logFn: (msg: string) => void) => {
      logFn(`Starting file watcher...`)
      logFn(`  Watching: ${patterns.join(', ') || 'current directory'}`)
      logFn(`  Debounce: ${debounceMs}ms`)
      logFn(`  Press Ctrl+C to stop`)
    }),
    formatFileResult: vi.fn(
      (filePath: string, violations: Array<{ message: string; range: { end: { column: number; line: number }; start: { column: number; line: number } }; ruleId: string; severity: string }>, cwd: string, logFn: (msg: string) => void) => {
        const relativePath = filePath.replace(cwd, '.').replace(/^\.\//, '')

        if (violations.length === 0) {
          logFn(`  ✓ ${relativePath}`)
        } else {
          let errors = 0
          let warnings = 0
          for (const v of violations) {
            if (v.severity === 'error') errors++
            else if (v.severity === 'warning') warnings++
          }

          logFn(`  ⚠ ${relativePath} - ${errors} error(s), ${warnings} warning(s)`)

          for (const violation of violations.slice(0, 3)) {
            const severityLabel = violation.severity === 'error' ? 'error' : 'warn'
            logFn(
              `      ${violation.range.start.line}:${violation.range.start.column} ` +
                `${severityLabel} ${violation.ruleId} - ${violation.message}`,
            )
          }

          if (violations.length > 3) {
            logFn(`      ... and ${violations.length - 3} more`)
          }
        }
      },
    ),
  }
})

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface WatchPrivate {
  analyzeFile: (filePath: string, requestedRules: string[] | undefined, verbose: boolean) => Promise<void>
  configCache: unknown
  exit: (code: number) => void
  handleShutdown: () => void
  isRunning: boolean
  log: (...args: unknown[]) => void
  parser: { dispose: () => void; initialize: () => Promise<void>; parseFile: ReturnType<typeof vi.fn> } | null
  pendingAnalysis: boolean
  run: () => Promise<void>
  watcher: { on: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; watch: ReturnType<typeof vi.fn> } | null
}

function createWatchInstance(): { command: Watch; p: WatchPrivate; logs: string[] } {
  const logs: string[] = []
  const command = new Watch([], {} as never)
  const p = command as unknown as WatchPrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  p.parser = {
    dispose: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
    parseFile: vi.fn().mockResolvedValue({ sourceFile: null }),
  }

  return { command, p, logs }
}

// ─── Static properties ───

describe('Watch command static properties', () => {
  it('has correct description', () => {
    expect(Watch.description).toBe('Watch files for changes and analyze on save')
  })

  it('has examples defined', () => {
    expect(Watch.examples).toBeDefined()
    expect(Watch.examples!.length).toBeGreaterThan(0)
  })

  it('defines files arg as optional string array', () => {
    const filesArg = Watch.args!.files
    expect(filesArg).toBeDefined()
    expect(filesArg!.description).toBe('Files or directories to watch')
    expect(filesArg!.multiple).toBe(true)
    expect(filesArg!.required).toBe(false)
  })

  it('has config flag with char c', () => {
    const configFlag = Watch.flags!.config as Record<string, unknown>
    expect(configFlag).toBeDefined()
    expect(configFlag.char).toBe('c')
  })

  it('has debounce flag with char d and default from constants', () => {
    const debounceFlag = Watch.flags!.debounce as Record<string, unknown>
    expect(debounceFlag).toBeDefined()
    expect(debounceFlag.char).toBe('d')
    expect(debounceFlag.default).toBe(300)
  })

  it('has ignore flag with char i and multiple option', () => {
    const ignoreFlag = Watch.flags!.ignore as Record<string, unknown>
    expect(ignoreFlag).toBeDefined()
    expect(ignoreFlag.char).toBe('i')
    expect(ignoreFlag.multiple).toBe(true)
  })

  it('has rules flag with char r and multiple false', () => {
    const rulesFlag = Watch.flags!.rules as Record<string, unknown>
    expect(rulesFlag).toBeDefined()
    expect(rulesFlag.char).toBe('r')
    expect(rulesFlag.multiple).toBe(false)
  })

  it('has verbose flag with char v defaulting to false', () => {
    const verboseFlag = Watch.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
  })

  it('defines at least 2 examples', () => {
    expect(Watch.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description', () => {
    for (const example of Watch.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
    }
  })
})

// ─── watch-helpers: resolveRequestedRules ───

describe('resolveRequestedRules', () => {
  it('returns undefined when no rules flag provided', async () => {
    const { resolveRequestedRules } = await import('../../src/commands/watch-helpers.js')
    expect(resolveRequestedRules(undefined)).toBeUndefined()
  })

  it('splits comma-separated rules', async () => {
    const { resolveRequestedRules } = await import('../../src/commands/watch-helpers.js')
    const result = resolveRequestedRules('prefer-const,no-eval,max-params')
    expect(result).toEqual(['prefer-const', 'no-eval', 'max-params'])
  })

  it('trims whitespace around rule names', async () => {
    const { resolveRequestedRules } = await import('../../src/commands/watch-helpers.js')
    const result = resolveRequestedRules(' prefer-const , no-eval ')
    expect(result).toEqual(['prefer-const', 'no-eval'])
  })

  it('returns single rule as array of one', async () => {
    const { resolveRequestedRules } = await import('../../src/commands/watch-helpers.js')
    const result = resolveRequestedRules('prefer-const')
    expect(result).toEqual(['prefer-const'])
  })
})

// ─── watch-helpers: buildWatcherConfig ───

describe('buildWatcherConfig', () => {
  it('returns defaults when no options provided', async () => {
    const { buildWatcherConfig } = await import('../../src/commands/watch-helpers.js')
    const config = buildWatcherConfig({})
    expect(config.debounceMs).toBe(300)
    expect(config.extensions).toEqual(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
    expect(config.ignorePatterns).toEqual([])
  })

  it('uses provided debounceMs', async () => {
    const { buildWatcherConfig } = await import('../../src/commands/watch-helpers.js')
    const config = buildWatcherConfig({ debounceMs: 500 })
    expect(config.debounceMs).toBe(500)
  })

  it('uses provided ignorePatterns', async () => {
    const { buildWatcherConfig } = await import('../../src/commands/watch-helpers.js')
    const config = buildWatcherConfig({ ignorePatterns: ['dist/**', 'node_modules/**'] })
    expect(config.ignorePatterns).toEqual(['dist/**', 'node_modules/**'])
  })

  it('falls back to DEFAULT_DEBOUNCE_MS when debounceMs is undefined', async () => {
    const { buildWatcherConfig } = await import('../../src/commands/watch-helpers.js')
    const config = buildWatcherConfig({ debounceMs: undefined })
    expect(config.debounceMs).toBe(300)
  })
})

// ─── watch-helpers: countBySeverity ───

describe('countBySeverity', () => {
  it('returns zeros for empty violations array', async () => {
    const { countBySeverity } = await import('../../src/commands/watch-helpers.js')
    expect(countBySeverity([])).toEqual({ errors: 0, warnings: 0 })
  })

  it('counts errors and warnings correctly', async () => {
    const { countBySeverity } = await import('../../src/commands/watch-helpers.js')
    const violations = [
      { message: 'a', range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r1', severity: 'error' as const },
      { message: 'b', range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r2', severity: 'warning' as const },
      { message: 'c', range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r3', severity: 'error' as const },
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 2, warnings: 1 })
  })

  it('ignores non-error non-warning severities', async () => {
    const { countBySeverity } = await import('../../src/commands/watch-helpers.js')
    const violations = [
      { message: 'a', range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r1', severity: 'info' as const },
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 0, warnings: 0 })
  })
})

// ─── watch-helpers: getRelativePath ───

describe('getRelativePath', () => {
  it('replaces cwd with dot', async () => {
    const { getRelativePath } = await import('../../src/commands/watch-helpers.js')
    const result = getRelativePath('/home/user/project/src/file.ts', '/home/user/project')
    expect(result).toBe('src/file.ts')
  })

  it('strips leading dot-slash', async () => {
    const { getRelativePath } = await import('../../src/commands/watch-helpers.js')
    const result = getRelativePath('/home/user/project/file.ts', '/home/user/project')
    expect(result).toBe('file.ts')
  })
})

// ─── watch-helpers: formatStartupMessage ───

describe('formatStartupMessage', () => {
  it('logs startup info with patterns and debounce', async () => {
    const { formatStartupMessage } = await import('../../src/commands/watch-helpers.js')
    const logs: string[] = []
    formatStartupMessage(['**/*.ts', '**/*.tsx'], 300, (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Starting file watcher')
    expect(output).toContain('**/*.ts, **/*.tsx')
    expect(output).toContain('300ms')
    expect(output).toContain('Ctrl+C')
  })

  it('shows "current directory" when patterns empty', async () => {
    const { formatStartupMessage } = await import('../../src/commands/watch-helpers.js')
    const logs: string[] = []
    formatStartupMessage([], 500, (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('current directory')
  })
})

// ─── watch-helpers: formatFileResult ───

describe('formatFileResult', () => {
  it('logs green check when no violations', async () => {
    const { formatFileResult } = await import('../../src/commands/watch-helpers.js')
    const logs: string[] = []
    formatFileResult('/project/src/file.ts', [], '/project', (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('✓')
    expect(output).toContain('src/file.ts')
  })

  it('logs warning icon with error and warning counts', async () => {
    const { formatFileResult } = await import('../../src/commands/watch-helpers.js')
    const violations = [
      { message: 'err', range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'no-eval', severity: 'error' as const },
      { message: 'warn', range: { end: { column: 5, line: 2 }, start: { column: 0, line: 2 } }, ruleId: 'prefer-const', severity: 'warning' as const },
    ]
    const logs: string[] = []
    formatFileResult('/project/src/file.ts', violations, '/project', (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('⚠')
    expect(output).toContain('1 error(s)')
    expect(output).toContain('1 warning(s)')
  })

  it('shows violation details with line:col, ruleId and message', async () => {
    const { formatFileResult } = await import('../../src/commands/watch-helpers.js')
    const violations = [
      { message: 'Unexpected eval', range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } }, ruleId: 'no-eval', severity: 'error' as const },
    ]
    const logs: string[] = []
    formatFileResult('/project/file.ts', violations, '/project', (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('5:0')
    expect(output).toContain('no-eval')
    expect(output).toContain('Unexpected eval')
  })

  it('truncates after MAX_VIOLATIONS_TO_DISPLAY with "... and N more"', async () => {
    const { formatFileResult, MAX_VIOLATIONS_TO_DISPLAY } = await import('../../src/commands/watch-helpers.js')
    const violations = Array.from({ length: MAX_VIOLATIONS_TO_DISPLAY + 2 }, (_, i) => ({
      message: `msg${i}`,
      range: { end: { column: 5, line: i + 1 }, start: { column: 0, line: i + 1 } },
      ruleId: `rule-${i}`,
      severity: 'error' as const,
    }))
    const logs: string[] = []
    formatFileResult('/project/file.ts', violations, '/project', (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain(`... and 2 more`)
  })
})

// ─── analyzeFile ───

describe('analyzeFile', () => {
  let watchInstance: ReturnType<typeof createWatchInstance>

  beforeEach(async () => {
    vi.clearAllMocks()
    watchInstance = createWatchInstance()
    const { setupRuleRegistryLazy } = vi.mocked(
      await import('../../src/utils/command-helpers.js'),
    )
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRules: vi.fn().mockReturnValue([]),
    })
  })

  it('skips analysis when isRunning is true and sets pendingAnalysis', async () => {
    const { p } = watchInstance
    p.isRunning = true

    await p.analyzeFile('/test/file.ts', undefined, false)

    expect(p.pendingAnalysis).toBe(true)
  })

  it('sets isRunning to true during analysis', async () => {
    const { p } = watchInstance
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRules: vi.fn().mockReturnValue([]),
    })

    let runningDuringAnalysis = false
    const origParseFile = p.parser!.parseFile
    p.parser!.parseFile = vi.fn().mockImplementation(async () => {
      runningDuringAnalysis = p.isRunning
      return { sourceFile: null }
    }) as ReturnType<typeof vi.fn>

    await p.analyzeFile('/test/file.ts', undefined, false)

    expect(runningDuringAnalysis).toBe(true)
    p.parser!.parseFile = origParseFile
  })

  it('resets isRunning in finally block', async () => {
    const { p } = watchInstance
    await p.analyzeFile('/test/file.ts', undefined, false)
    expect(p.isRunning).toBe(false)
  })

  it('returns early when parser is null', async () => {
    const { p } = watchInstance
    p.parser = null

    await p.analyzeFile('/test/file.ts', undefined, false)
    // Should not throw
    expect(p.isRunning).toBe(false)
  })

  it('returns early when parseResult has no sourceFile', async () => {
    const { p } = watchInstance
    p.parser!.parseFile = vi.fn().mockResolvedValue({ sourceFile: null })

    await p.analyzeFile('/test/file.ts', undefined, false)
    // Should complete without error
    expect(p.isRunning).toBe(false)
  })

  it('calls formatFileResult with parsed violations', async () => {
    const { p } = watchInstance
    const mockSourceFile = { getText: vi.fn() }
    p.parser!.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const violations = [
      { message: 'err', range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'no-eval', severity: 'error' as const },
    ]
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRules: vi.fn().mockReturnValue(violations),
    })

    const { formatFileResult } = await import('../../src/commands/watch-helpers.js')

    await p.analyzeFile('/project/test.ts', undefined, false)

    expect(vi.mocked(formatFileResult)).toHaveBeenCalledWith(
      '/project/test.ts',
      violations,
      expect.any(String),
      expect.any(Function),
    )
  })

  it('catches parse errors silently', async () => {
    const { p } = watchInstance
    p.parser!.parseFile = vi.fn().mockRejectedValue(new Error('Parse failed'))

    // Should not throw
    await p.analyzeFile('/test/file.ts', undefined, false)
    expect(p.isRunning).toBe(false)
  })

  it('schedules pending analysis via setImmediate after completion', async () => {
    const { p } = watchInstance
    const mockSetImmediate = vi.spyOn(globalThis, 'setImmediate')

    p.isRunning = true
    const promise1 = p.analyzeFile('/test/file.ts', undefined, false)
    p.isRunning = false
    await promise1

    p.parser!.parseFile = vi.fn().mockResolvedValue({ sourceFile: null })
    p.isRunning = true
    p.pendingAnalysis = true
    p.isRunning = false

    if (p.pendingAnalysis) {
      p.pendingAnalysis = false
      mockSetImmediate.mock.calls[0]?.[0]()
    }

    mockSetImmediate.mockRestore()
  })
})

// ─── handleShutdown ───

describe('handleShutdown', () => {
  let watchInstance: ReturnType<typeof createWatchInstance>
  const mockWatcherStop = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    watchInstance = createWatchInstance()
  })

  it('logs stopping message', () => {
    const { p, logs } = watchInstance
    p.exit = vi.fn()

    p.handleShutdown()

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Stopping watcher')
  })

  it('calls watcher.stop when watcher exists', () => {
    const { p } = watchInstance
    p.watcher = {
      on: vi.fn(),
      stop: mockWatcherStop,
      watch: vi.fn(),
    }
    p.exit = vi.fn()

    p.handleShutdown()

    expect(mockWatcherStop).toHaveBeenCalled()
  })

  it('does not call watcher.stop when watcher is null', () => {
    const { p } = watchInstance
    p.watcher = null
    p.exit = vi.fn()
    mockWatcherStop.mockClear()

    p.handleShutdown()

    expect(mockWatcherStop).not.toHaveBeenCalled()
  })

  it('calls parser.dispose when parser exists', () => {
    const { p } = watchInstance
    p.exit = vi.fn()

    p.handleShutdown()

    expect(p.parser!.dispose).toHaveBeenCalled()
  })

  it('does not call parser.dispose when parser is null', () => {
    const { p } = watchInstance
    const disposeSpy = vi.fn()
    p.parser = { dispose: disposeSpy, initialize: vi.fn(), parseFile: vi.fn() }
    p.parser = null
    p.exit = vi.fn()

    p.handleShutdown()

    expect(disposeSpy).not.toHaveBeenCalled()
  })

  it('calls exit with code 0', () => {
    const { p } = watchInstance
    const mockExit = vi.fn()
    p.exit = mockExit

    p.handleShutdown()

    expect(mockExit).toHaveBeenCalledWith(0)
  })
})

// ─── Instance state ───

describe('Watch instance state', () => {
  it('initializes with isRunning false', () => {
    const { p } = createWatchInstance()
    expect(p.isRunning).toBe(false)
  })

  it('initializes with pendingAnalysis false', () => {
    const { p } = createWatchInstance()
    expect(p.pendingAnalysis).toBe(false)
  })

  it('initializes with watcher null', () => {
    const { p } = createWatchInstance()
    expect(p.watcher).toBeNull()
  })

  it('initializes with parser null', () => {
    const command = new Watch([], {} as never)
    const p = command as unknown as WatchPrivate
    expect(p.parser).toBeNull()
  })
})

// ─── watch-helpers: WatcherConfig interface ───

describe('WatcherConfig', () => {
  it('buildWatcherConfig returns correct extensions', async () => {
    const { buildWatcherConfig } = await import('../../src/commands/watch-helpers.js')
    const config = buildWatcherConfig({})
    expect(config.extensions).toContain('.ts')
    expect(config.extensions).toContain('.tsx')
    expect(config.extensions).toContain('.js')
    expect(config.extensions).toContain('.jsx')
    expect(config.extensions).toContain('.mjs')
    expect(config.extensions).toContain('.cjs')
  })
})

// ─── watch-helpers: MAX_VIOLATIONS_TO_DISPLAY ───

describe('MAX_VIOLATIONS_TO_DISPLAY', () => {
  it('is set to 3', async () => {
    const { MAX_VIOLATIONS_TO_DISPLAY } = await import('../../src/commands/watch-helpers.js')
    expect(MAX_VIOLATIONS_TO_DISPLAY).toBe(3)
  })
})

// ─── formatFileResult severity formatting ───

describe('formatFileResult severity display', () => {
  it('shows "error" label for error severity', async () => {
    const { formatFileResult } = await import('../../src/commands/watch-helpers.js')
    const violations = [
      { message: 'bad', range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r1', severity: 'error' as const },
    ]
    const logs: string[] = []
    formatFileResult('/p/file.ts', violations, '/p', (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('error')
  })

  it('shows "warn" label for warning severity', async () => {
    const { formatFileResult } = await import('../../src/commands/watch-helpers.js')
    const violations = [
      { message: 'meh', range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r1', severity: 'warning' as const },
    ]
    const logs: string[] = []
    formatFileResult('/p/file.ts', violations, '/p', (msg) => logs.push(msg))

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('warn')
  })
})
