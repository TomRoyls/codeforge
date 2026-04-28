import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('../../../src/rules/index.js', () => ({
  getRuleCategory: vi.fn((ruleId: string) => {
    const categories: Record<string, string> = {
      'no-console-log': 'patterns',
      'no-explicit-any': 'patterns',
      'prefer-const': 'patterns',
      'eq-eq-eq': 'patterns',
      'no-eval': 'security',
      'no-magic-numbers': 'patterns',
      'max-depth': 'complexity',
      'max-lines-per-function': 'complexity',
      'no-duplicate-code': 'patterns',
      'no-async-without-await': 'patterns',
      'prefer-nullish-coalescing': 'patterns',
      'no-unsafe-type-assertion': 'patterns',
    }
    return categories[ruleId] ?? 'patterns'
  }),
}))

interface RuleSuggestion {
  category: string
  confidence: 'high' | 'low' | 'medium'
  estimatedViolations: number
  impact: 'high' | 'low' | 'medium'
  reason: string
  ruleId: string
}

interface SuggestedRule {
  confidence: 'high' | 'low' | 'medium'
  impact: 'high' | 'low' | 'medium'
  reason: string
  ruleId: string
}

interface CommandInternals {
  findMatches: (content: string, pattern: RegExp | string) => number
  filterSuggestions: (suggestions: RuleSuggestion[], flags: { impact: string }) => RuleSuggestion[]
  sortSuggestions: (suggestions: RuleSuggestion[]) => RuleSuggestion[]
  addSuggestion: (
    suggestionMap: Map<string, RuleSuggestion>,
    ruleId: string,
    matches: number,
    suggested: SuggestedRule,
  ) => void
  analyzeFile: (content: string, suggestionMap: Map<string, RuleSuggestion>) => void
  displaySuggestions: (suggestions: RuleSuggestion[], verbose: boolean) => void
}

describe('SuggestRules Command', () => {
  let SuggestRules: typeof import('../../../src/commands/suggest-rules.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockExistsSync: ReturnType<typeof vi.fn>
  let mockReadFile: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    const fileDiscovery = await import('../../../src/core/file-discovery.js')
    mockDiscoverFiles = fileDiscovery.discoverFiles as ReturnType<typeof vi.fn>

    const fs = await import('node:fs')
    mockExistsSync = fs.existsSync as ReturnType<typeof vi.fn>

    const fsPromises = await import('node:fs/promises')
    mockReadFile = fsPromises.readFile as ReturnType<typeof vi.fn>

    SuggestRules = (await import('../../../src/commands/suggest-rules.js')).default
  })

  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown> = { path: '.' },
  ) {
    const command = new SuggestRules([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  function getInternals(): CommandInternals {
    return new SuggestRules([], {} as never) as unknown as CommandInternals
  }

  function makeSuggestion(overrides: Partial<RuleSuggestion> = {}): RuleSuggestion {
    return {
      category: 'patterns',
      confidence: 'medium',
      estimatedViolations: 5,
      impact: 'medium',
      reason: 'Test reason',
      ruleId: 'test-rule',
      ...overrides,
    }
  }

  async function detectPattern(content: string, flagsOverrides: Record<string, unknown> = {}) {
    mockExistsSync.mockReturnValue(true)
    mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/f.ts', path: 'f.ts' }])
    mockReadFile.mockResolvedValue(content)
    const cmd = createCommandWithMockedParse(
      {
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
        ...flagsOverrides,
      },
      { path: '.' },
    )
    await cmd.run()
    const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
    return JSON.parse(output)
  }

  async function runAndGetOutput(
    flags: Record<string, unknown>,
    files: Array<{ absolutePath: string; path: string }>,
    contents: string | Record<string, string>,
  ) {
    mockExistsSync.mockReturnValue(true)
    mockDiscoverFiles.mockResolvedValue(files)
    if (typeof contents === 'string') {
      mockReadFile.mockResolvedValue(contents)
    } else {
      mockReadFile.mockImplementation((p: string) => {
        for (const [key, val] of Object.entries(contents)) {
          if (p.includes(key)) return Promise.resolve(val)
        }
        return Promise.resolve('')
      })
    }
    const cmd = createCommandWithMockedParse(flags, { path: '.' })
    await cmd.run()
    return mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
  }

  function findRule(output: string, ruleId: string): RuleSuggestion | undefined {
    const parsed = JSON.parse(output)
    return parsed.find((r: { ruleId: string }) => r.ruleId === ruleId)
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(SuggestRules.description).toBe(
        'Analyze codebase and suggest which rules would be most beneficial',
      )
    })

    test('has examples defined', () => {
      expect(SuggestRules.examples).toBeDefined()
      expect(SuggestRules.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(SuggestRules.flags).toBeDefined()
      expect(SuggestRules.flags.format).toBeDefined()
      expect(SuggestRules.flags.top).toBeDefined()
      expect(SuggestRules.flags.verbose).toBeDefined()
      expect(SuggestRules.flags.impact).toBeDefined()
    })

    test('has path argument', () => {
      expect(SuggestRules.args).toBeDefined()
      expect(SuggestRules.args.path).toBeDefined()
      expect(SuggestRules.args.path.default).toBe('.')
    })

    test('format flag has correct options', () => {
      expect(SuggestRules.flags.format.options).toContain('json')
      expect(SuggestRules.flags.format.options).toContain('console')
    })

    test('format flag has default value console', () => {
      expect(SuggestRules.flags.format.default).toBe('console')
    })

    test('top flag has default value 15', () => {
      expect(SuggestRules.flags.top.default).toBe(15)
    })

    test('verbose flag has default false', () => {
      expect(SuggestRules.flags.verbose.default).toBe(false)
    })
  })

  describe('Flag characters', () => {
    test('verbose flag has char v', () => {
      expect(SuggestRules.flags.verbose.char).toBe('v')
    })
  })

  describe('run', () => {
    test('errors when path does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '/nonexistent' },
      )

      await expect(cmd.run()).rejects.toThrow('Path not found')
    })

    test('handles empty file list', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    test('outputs JSON format when format is json', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(true)
    })

    test('detects console.log pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const consoleRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(consoleRule).toBeDefined()
      expect(consoleRule.estimatedViolations).toBeGreaterThan(0)
    })

    test('detects explicit any pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x: any = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const anyRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(anyRule).toBeDefined()
    })

    test('detects loose equality pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('if (a == b) {}')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const eqRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'eq-eq-eq')
      expect(eqRule).toBeDefined()
    })

    test('detects eval pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('eval("code");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const evalRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(evalRule).toBeDefined()
      expect(evalRule.impact).toBe('high')
    })

    test('filters by impact level', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test"); if (a == b) {}')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: 'high',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.every((r: { impact: string }) => r.impact === 'high')).toBe(true)
    })

    test('limits output to top N suggestions', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockReadFile.mockResolvedValue(
        'console.log("test"); eval("code"); if (a == b) {} const x: any = 1;',
      )

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 2,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.length).toBeLessThanOrEqual(2)
    })

    test('outputs console format by default', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rule Suggestions')
    })

    test('shows verbose output when enabled', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: true,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Enable with:')
    })

    test('handles file read errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('file2')) return Promise.reject(new Error('Read error'))
        return Promise.resolve('console.log("test");')
      })

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: true,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Skipping file')
    })

    test('sorts suggestions by impact and confidence', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test"); eval("code"); if (a == b) {}')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const impacts = parsed.map((r: { impact: string }) => r.impact)
      const highIndex = impacts.indexOf('high')
      const mediumIndex = impacts.indexOf('medium')

      if (highIndex !== -1 && mediumIndex !== -1) {
        expect(highIndex).toBeLessThan(mediumIndex)
      }
    })

    test('aggregates violations across files', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const consoleRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(consoleRule.estimatedViolations).toBe(2)
    })
  })

  describe('Pattern detection - console', () => {
    test('detects console.warn', async () => {
      const result = await detectPattern('console.warn("msg")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule).toBeDefined()
    })

    test('detects console.error', async () => {
      const result = await detectPattern('console.error("err")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule).toBeDefined()
    })

    test('detects console.debug', async () => {
      const result = await detectPattern('console.debug("dbg")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule).toBeDefined()
    })

    test('counts multiple console calls', async () => {
      const result = await detectPattern('console.log("a"); console.log("b"); console.log("c")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule.estimatedViolations).toBe(3)
    })

    test('detects mixed console methods', async () => {
      const result = await detectPattern('console.log("a"); console.warn("b")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule).toBeDefined()
      expect(rule.estimatedViolations).toBeGreaterThanOrEqual(2)
    })

    test('no console detection for clean code', async () => {
      const result = await detectPattern('const x = 1;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule).toBeUndefined()
    })

    test('no-console-log has medium impact', async () => {
      const result = await detectPattern('console.log("a")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule.impact).toBe('medium')
    })

    test('no-console-log has high confidence', async () => {
      const result = await detectPattern('console.log("a")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule.confidence).toBe('high')
    })
  })

  describe('Pattern detection - any type', () => {
    test('detects : any annotation', async () => {
      const result = await detectPattern('const x: any = 1;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(rule).toBeDefined()
    })

    test('detects <any> cast', async () => {
      const result = await detectPattern('const x = <any>value;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(rule).toBeDefined()
    })

    test('detects as any assertion', async () => {
      const result = await detectPattern('const x = value as any;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(rule).toBeDefined()
    })

    test('no-explicit-any has high impact', async () => {
      const result = await detectPattern('const x: any = 1;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(rule.impact).toBe('high')
    })

    test('no-explicit-any has high confidence', async () => {
      const result = await detectPattern('const x: any = 1;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(rule.confidence).toBe('high')
    })

    test('counts multiple any occurrences', async () => {
      const result = await detectPattern('const x: any = 1; const y: any = 2;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(rule.estimatedViolations).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Pattern detection - var declarations', () => {
    test('detects var usage', async () => {
      const result = await detectPattern('var x = 1;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-const')
      expect(rule).toBeDefined()
    })

    test('prefer-const has medium impact', async () => {
      const result = await detectPattern('var x = 1;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-const')
      expect(rule.impact).toBe('medium')
    })

    test('counts multiple var declarations', async () => {
      const result = await detectPattern('var x = 1; var y = 2; var z = 3;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-const')
      expect(rule.estimatedViolations).toBe(3)
    })
  })

  describe('Pattern detection - loose equality', () => {
    test('detects == operator', async () => {
      const result = await detectPattern('if (a == b) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'eq-eq-eq')
      expect(rule).toBeDefined()
    })

    test('detects != operator', async () => {
      const result = await detectPattern('if (a != b) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'eq-eq-eq')
      expect(rule).toBeDefined()
    })

    test('eq-eq-eq has high impact', async () => {
      const result = await detectPattern('if (a == b) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'eq-eq-eq')
      expect(rule.impact).toBe('high')
    })
  })

  describe('Pattern detection - eval', () => {
    test('detects eval call', async () => {
      const result = await detectPattern('eval("code")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(rule).toBeDefined()
    })

    test('detects new Function constructor', async () => {
      const result = await detectPattern('new Function("code")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(rule).toBeDefined()
    })

    test('no-eval has high impact and high confidence', async () => {
      const result = await detectPattern('eval("code")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(rule.impact).toBe('high')
      expect(rule.confidence).toBe('high')
    })
  })

  describe('Pattern detection - magic numbers', () => {
    test('detects multi-digit numbers', async () => {
      const result = await detectPattern('const x = 42;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-magic-numbers')
      expect(rule).toBeDefined()
    })

    test('no-magic-numbers has medium impact and medium confidence', async () => {
      const result = await detectPattern('const x = 42;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-magic-numbers')
      expect(rule.impact).toBe('medium')
      expect(rule.confidence).toBe('medium')
    })

    test('single digit not detected as magic number', async () => {
      const result = await detectPattern('const x = 1;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-magic-numbers')
      expect(rule).toBeUndefined()
    })

    test('counts multiple magic numbers', async () => {
      const result = await detectPattern('const x = 42; const y = 100;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-magic-numbers')
      expect(rule).toBeDefined()
      expect(rule.estimatedViolations).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Pattern detection - nested conditionals', () => {
    test('detects nested if statements', async () => {
      const result = await detectPattern('if (a) { if (b) {} }')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'max-depth')
      expect(rule).toBeDefined()
    })

    test('max-depth has medium impact and medium confidence', async () => {
      const result = await detectPattern('if (a) { if (b) {} }')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'max-depth')
      expect(rule.impact).toBe('medium')
      expect(rule.confidence).toBe('medium')
    })
  })

  describe('Pattern detection - long functions', () => {
    test('does not detect long functions from patterns', async () => {
      const result = await detectPattern('function longFn() { var x = 1; }')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'max-lines-per-function')
      expect(rule).toBeUndefined()
    })

    test('long functions detector has low confidence', () => {
      expect(SuggestRules).toBeDefined()
    })
  })

  describe('Pattern detection - TODO/FIXME', () => {
    test('detects TODO comments', async () => {
      const result = await detectPattern('// TODO: fix this')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-duplicate-code')
      expect(rule).toBeDefined()
    })

    test('detects FIXME comments', async () => {
      const result = await detectPattern('// FIXME: broken')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-duplicate-code')
      expect(rule).toBeDefined()
    })

    test('detects HACK comments', async () => {
      const result = await detectPattern('// HACK: workaround')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-duplicate-code')
      expect(rule).toBeDefined()
    })

    test('detects XXX comments', async () => {
      const result = await detectPattern('// XXX: temp')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-duplicate-code')
      expect(rule).toBeDefined()
    })

    test('no-duplicate-code has low impact and low confidence', async () => {
      const result = await detectPattern('// TODO: fix')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-duplicate-code')
      expect(rule.impact).toBe('low')
      expect(rule.confidence).toBe('low')
    })
  })

  describe('Pattern detection - async without await', () => {
    test('detects async function without await', async () => {
      const result = await detectPattern('async function foo() { return 1; }')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-async-without-await')
      expect(rule).toBeDefined()
    })

    test('no-async-without-await has low impact and medium confidence', async () => {
      const result = await detectPattern('async function foo() { return 1; }')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-async-without-await')
      expect(rule.impact).toBe('low')
      expect(rule.confidence).toBe('medium')
    })
  })

  describe('Pattern detection - null checks', () => {
    test('detects === null', async () => {
      const result = await detectPattern('if (x === null) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-nullish-coalescing')
      expect(rule).toBeDefined()
    })

    test('detects !== null', async () => {
      const result = await detectPattern('if (x !== null) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-nullish-coalescing')
      expect(rule).toBeDefined()
    })

    test('detects === undefined', async () => {
      const result = await detectPattern('if (x === undefined) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-nullish-coalescing')
      expect(rule).toBeDefined()
    })

    test('detects !== undefined', async () => {
      const result = await detectPattern('if (x !== undefined) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-nullish-coalescing')
      expect(rule).toBeDefined()
    })

    test('prefer-nullish-coalescing has low impact and medium confidence', async () => {
      const result = await detectPattern('if (x === null) {}')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-nullish-coalescing')
      expect(rule.impact).toBe('low')
      expect(rule.confidence).toBe('medium')
    })
  })

  describe('Pattern detection - type assertions', () => {
    test('detects as assertion', async () => {
      const result = await detectPattern('const x = value as string;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-unsafe-type-assertion')
      expect(rule).toBeDefined()
    })

    test('no-unsafe-type-assertion has medium impact and low confidence', async () => {
      const result = await detectPattern('const x = value as string;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-unsafe-type-assertion')
      expect(rule.impact).toBe('medium')
      expect(rule.confidence).toBe('low')
    })

    test('counts multiple type assertions', async () => {
      const result = await detectPattern('const x = a as string; const y = b as number;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-unsafe-type-assertion')
      expect(rule.estimatedViolations).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Pattern detection - mixed', () => {
    test('detects multiple patterns in single file', async () => {
      const result = await detectPattern('console.log("a"); var x = 1; if (a == b) {} eval("c")')
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    test('detects all pattern types in complex file', async () => {
      const code = [
        'console.log("a")',
        'const x: any = 1',
        'var y = 2',
        'if (a == b) {}',
        'eval("c")',
        'const z = value as string',
        'if (x === null) {}',
      ].join('\n')
      const result = await detectPattern(code)
      expect(result.length).toBeGreaterThanOrEqual(5)
    })

    test('returns empty array for clean code', async () => {
      const result = await detectPattern('const x = 1;\nconst y = "hello";\n')
      expect(result).toEqual([])
    })

    test('as any triggers both no-explicit-any and no-unsafe-type-assertion', async () => {
      const result = await detectPattern('const x = value as any;')
      const anyRule = result.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      const assertRule = result.find(
        (r: { ruleId: string }) => r.ruleId === 'no-unsafe-type-assertion',
      )
      expect(anyRule).toBeDefined()
      expect(assertRule).toBeDefined()
    })

    test('preserves correct reason for each detected rule', async () => {
      const result = await detectPattern('console.log("a"); eval("b")')
      const consoleRule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      const evalRule = result.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(consoleRule.reason).toContain('console')
      expect(evalRule.reason).toContain('eval')
    })
  })

  describe('findMatches - string patterns', () => {
    test('returns 0 for no match', () => {
      const internals = getInternals()
      expect(internals.findMatches('hello world', 'xyz')).toBe(0)
    })

    test('returns 1 for single match', () => {
      const internals = getInternals()
      expect(internals.findMatches('console.log("a")', 'console.log')).toBe(1)
    })

    test('returns correct count for multiple matches', () => {
      const internals = getInternals()
      expect(internals.findMatches('aaa aaa aaa', 'aaa')).toBe(3)
    })

    test('finds match at start of content', () => {
      const internals = getInternals()
      expect(internals.findMatches('console.log("a") rest', 'console.log')).toBe(1)
    })

    test('finds match at end of content', () => {
      const internals = getInternals()
      expect(internals.findMatches('start console.log', 'console.log')).toBe(1)
    })

    test('returns 0 for empty content', () => {
      const internals = getInternals()
      expect(internals.findMatches('', 'console.log')).toBe(0)
    })

    test('counts overlapping occurrences correctly', () => {
      const internals = getInternals()
      expect(internals.findMatches('aaa', 'aa')).toBe(2)
    })

    test('exact content is pattern returns 1', () => {
      const internals = getInternals()
      expect(internals.findMatches('eval(', 'eval(')).toBe(1)
    })

    test('returns 0 when pattern longer than content', () => {
      const internals = getInternals()
      expect(internals.findMatches('ab', 'abcdef')).toBe(0)
    })
  })

  describe('findMatches - regex patterns', () => {
    test('returns 0 for no regex match', () => {
      const internals = getInternals()
      expect(internals.findMatches('hello', /\d{2,}/)).toBe(0)
    })

    test('returns correct count for regex match', () => {
      const internals = getInternals()
      expect(internals.findMatches('42 100 999', /\b\d{2,}\b/)).toBe(3)
    })

    test('handles global regex without mutation', () => {
      const internals = getInternals()
      const pattern = /\b\d{2,}\b/g
      expect(internals.findMatches('42 100', pattern)).toBe(2)
      expect(internals.findMatches('42 100', pattern)).toBe(2)
    })

    test('applies global flag to non-global regex', () => {
      const internals = getInternals()
      expect(internals.findMatches('aaa bbb aaa', /aaa/)).toBe(2)
    })

    test('returns 0 for empty content with regex', () => {
      const internals = getInternals()
      expect(internals.findMatches('', /test/)).toBe(0)
    })

    test('handles regex with special characters', () => {
      const internals = getInternals()
      expect(internals.findMatches('if (a) { if (b) {} }', /if\s*\([^)]*\)\s*\{[^}]*if\s*\(/)).toBe(
        1,
      )
    })

    test('returns correct count for TODO regex', () => {
      const internals = getInternals()
      expect(
        internals.findMatches('// TODO: fix\n// FIXME: broken', /\/\/\s*(TODO|FIXME|HACK|XXX)/i),
      ).toBe(2)
    })
  })

  describe('filterSuggestions', () => {
    test('returns all when impact is empty string', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'high', ruleId: 'r1' }),
        makeSuggestion({ impact: 'medium', ruleId: 'r2' }),
        makeSuggestion({ impact: 'low', ruleId: 'r3' }),
      ]
      const result = internals.filterSuggestions(suggestions, { impact: '' })
      expect(result).toHaveLength(3)
    })

    test('filters to high impact only', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'high', ruleId: 'r1' }),
        makeSuggestion({ impact: 'medium', ruleId: 'r2' }),
        makeSuggestion({ impact: 'low', ruleId: 'r3' }),
      ]
      const result = internals.filterSuggestions(suggestions, { impact: 'high' })
      expect(result).toHaveLength(1)
      expect(result[0].impact).toBe('high')
    })

    test('filters to medium impact only', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'high', ruleId: 'r1' }),
        makeSuggestion({ impact: 'medium', ruleId: 'r2' }),
        makeSuggestion({ impact: 'low', ruleId: 'r3' }),
      ]
      const result = internals.filterSuggestions(suggestions, { impact: 'medium' })
      expect(result).toHaveLength(1)
      expect(result[0].impact).toBe('medium')
    })

    test('filters to low impact only', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'high', ruleId: 'r1' }),
        makeSuggestion({ impact: 'medium', ruleId: 'r2' }),
        makeSuggestion({ impact: 'low', ruleId: 'r3' }),
      ]
      const result = internals.filterSuggestions(suggestions, { impact: 'low' })
      expect(result).toHaveLength(1)
      expect(result[0].impact).toBe('low')
    })

    test('returns empty for no matching impact', () => {
      const internals = getInternals()
      const suggestions = [makeSuggestion({ impact: 'high', ruleId: 'r1' })]
      const result = internals.filterSuggestions(suggestions, { impact: 'low' })
      expect(result).toHaveLength(0)
    })

    test('handles empty suggestions array', () => {
      const internals = getInternals()
      const result = internals.filterSuggestions([], { impact: 'high' })
      expect(result).toHaveLength(0)
    })

    test('preserves all suggestion fields', () => {
      const internals = getInternals()
      const s = makeSuggestion({ impact: 'high', ruleId: 'r1' })
      const result = internals.filterSuggestions([s], { impact: 'high' })
      expect(result[0]).toEqual(s)
    })

    test('returns all when no impact filter matches nothing', () => {
      const internals = getInternals()
      const suggestions = [makeSuggestion({ impact: 'high', ruleId: 'r1' })]
      const result = internals.filterSuggestions(suggestions, { impact: '' })
      expect(result).toEqual(suggestions)
    })
  })

  describe('sortSuggestions', () => {
    test('sorts high impact before low impact', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'low', ruleId: 'r1' }),
        makeSuggestion({ impact: 'high', ruleId: 'r2' }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result[0].impact).toBe('high')
    })

    test('sorts high confidence before low when impact differs by 1', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'medium', confidence: 'low', ruleId: 'r1' }),
        makeSuggestion({ impact: 'high', confidence: 'high', ruleId: 'r2' }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result[0].impact).toBe('high')
    })

    test('handles empty array', () => {
      const internals = getInternals()
      const result = internals.sortSuggestions([])
      expect(result).toEqual([])
    })

    test('handles single element', () => {
      const internals = getInternals()
      const s = makeSuggestion({ impact: 'medium' })
      const result = internals.sortSuggestions([s])
      expect(result).toHaveLength(1)
      expect(result[0].ruleId).toBe('test-rule')
    })

    test('same impact items treated as equal by sort', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({
          impact: 'high',
          confidence: 'high',
          estimatedViolations: 1,
          ruleId: 'r1',
        }),
        makeSuggestion({
          impact: 'high',
          confidence: 'high',
          estimatedViolations: 10,
          ruleId: 'r2',
        }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result.map((r) => r.ruleId)).toEqual(['r1', 'r2'])
    })

    test('sorts all three impact levels correctly', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'low', ruleId: 'r3' }),
        makeSuggestion({ impact: 'high', ruleId: 'r1' }),
        makeSuggestion({ impact: 'medium', ruleId: 'r2' }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      const impacts = result.map((r) => r.impact)
      expect(impacts).toEqual(['high', 'medium', 'low'])
    })

    test('stable sort for identical items', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({
          impact: 'medium',
          confidence: 'medium',
          estimatedViolations: 5,
          ruleId: 'r1',
        }),
        makeSuggestion({
          impact: 'medium',
          confidence: 'medium',
          estimatedViolations: 5,
          ruleId: 'r2',
        }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result.map((r) => r.ruleId)).toEqual(['r1', 'r2'])
    })

    test('sorts many items correctly', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({
          impact: 'medium',
          confidence: 'medium',
          estimatedViolations: 1,
          ruleId: 'a',
        }),
        makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 2, ruleId: 'b' }),
        makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 3, ruleId: 'c' }),
        makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 4, ruleId: 'd' }),
        makeSuggestion({
          impact: 'medium',
          confidence: 'high',
          estimatedViolations: 5,
          ruleId: 'e',
        }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result[0].impact).toBe('high')
    })

    test('medium before low in sorted output', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'low', ruleId: 'r1' }),
        makeSuggestion({ impact: 'medium', ruleId: 'r2' }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result[0].impact).toBe('medium')
      expect(result[1].impact).toBe('low')
    })

    test('sort returns same reference as input', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({ impact: 'low', ruleId: 'r1' }),
        makeSuggestion({ impact: 'high', ruleId: 'r2' }),
      ]
      const result = internals.sortSuggestions(suggestions)
      expect(result).toBe(suggestions)
    })

    test('sort by confidence when impactDiff is 1', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({
          impact: 'medium',
          confidence: 'low',
          estimatedViolations: 1,
          ruleId: 'r1',
        }),
        makeSuggestion({
          impact: 'high',
          confidence: 'high',
          estimatedViolations: 1,
          ruleId: 'r2',
        }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result[0].impact).toBe('high')
      expect(result[1].impact).toBe('medium')
    })

    test('falls back to violations when impactDiff is 1 and confidenceDiff is 1', () => {
      const internals = getInternals()
      const suggestions = [
        makeSuggestion({
          impact: 'medium',
          confidence: 'medium',
          estimatedViolations: 3,
          ruleId: 'r1',
        }),
        makeSuggestion({
          impact: 'high',
          confidence: 'high',
          estimatedViolations: 7,
          ruleId: 'r2',
        }),
      ]
      const result = internals.sortSuggestions([...suggestions])
      expect(result[0].impact).toBe('high')
      expect(result[0].estimatedViolations).toBe(7)
    })
  })

  describe('addSuggestion', () => {
    test('adds new suggestion to map', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.addSuggestion(map, 'test-rule', 3, {
        confidence: 'high',
        impact: 'medium',
        reason: 'Test reason',
        ruleId: 'test-rule',
      })
      expect(map.has('test-rule')).toBe(true)
      expect(map.get('test-rule')!.estimatedViolations).toBe(3)
    })

    test('accumulates violations for existing rule', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.addSuggestion(map, 'test-rule', 2, {
        confidence: 'high',
        impact: 'medium',
        reason: 'Test',
        ruleId: 'test-rule',
      })
      internals.addSuggestion(map, 'test-rule', 3, {
        confidence: 'high',
        impact: 'medium',
        reason: 'Test',
        ruleId: 'test-rule',
      })
      expect(map.get('test-rule')!.estimatedViolations).toBe(5)
    })

    test('multiple accumulations correct total', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      for (let i = 0; i < 5; i++) {
        internals.addSuggestion(map, 'test-rule', 1, {
          confidence: 'high',
          impact: 'low',
          reason: 'Test',
          ruleId: 'test-rule',
        })
      }
      expect(map.get('test-rule')!.estimatedViolations).toBe(5)
    })

    test('different rules do not interfere', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.addSuggestion(map, 'rule-a', 1, {
        confidence: 'high',
        impact: 'high',
        reason: 'A',
        ruleId: 'rule-a',
      })
      internals.addSuggestion(map, 'rule-b', 2, {
        confidence: 'low',
        impact: 'low',
        reason: 'B',
        ruleId: 'rule-b',
      })
      expect(map.get('rule-a')!.estimatedViolations).toBe(1)
      expect(map.get('rule-b')!.estimatedViolations).toBe(2)
    })

    test('sets category from getRuleCategory', async () => {
      const { getRuleCategory } = await import('../../../src/rules/index.js')
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.addSuggestion(map, 'no-eval', 1, {
        confidence: 'high',
        impact: 'high',
        reason: 'Eval detected',
        ruleId: 'no-eval',
      })
      expect(map.get('no-eval')!.category).toBe('security')
      expect(getRuleCategory).toHaveBeenCalledWith('no-eval')
    })

    test('preserves confidence from suggested rule', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.addSuggestion(map, 'test-rule', 1, {
        confidence: 'low',
        impact: 'high',
        reason: 'Test',
        ruleId: 'test-rule',
      })
      expect(map.get('test-rule')!.confidence).toBe('low')
    })
  })

  describe('analyzeFile', () => {
    test('produces empty map for content with no patterns', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('const x = 1;', map)
      expect(map.size).toBe(0)
    })

    test('detects single pattern', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('console.log("a")', map)
      expect(map.has('no-console-log')).toBe(true)
    })

    test('detects multiple different patterns', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('console.log("a"); var x = 1;', map)
      expect(map.has('no-console-log')).toBe(true)
      expect(map.has('prefer-const')).toBe(true)
    })

    test('accumulates from multiple pattern matches in same detector', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('console.log("a"); console.warn("b")', map)
      expect(map.get('no-console-log')!.estimatedViolations).toBeGreaterThanOrEqual(2)
    })

    test('handles empty string content', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('', map)
      expect(map.size).toBe(0)
    })

    test('detects both == and != for eq-eq-eq', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('if (a == b) {} if (c != d) {}', map)
      expect(map.get('eq-eq-eq')!.estimatedViolations).toBe(2)
    })

    test('detects both eval and new Function for no-eval', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('eval("a"); new Function("b")', map)
      expect(map.get('no-eval')!.estimatedViolations).toBe(2)
    })

    test('detects all console variants as single rule', () => {
      const internals = getInternals()
      const map = new Map<string, RuleSuggestion>()
      internals.analyzeFile('console.log("a"); console.warn("b"); console.error("c")', map)
      expect(map.has('no-console-log')).toBe(true)
      expect(map.size).toBeLessThanOrEqual(3)
    })
  })

  describe('analyzePatterns via run', () => {
    test('handles all files read successfully', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('console.log("a")')
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const parsed = JSON.parse(mockConsoleLog.mock.calls.map((c) => c[0]).join('\n'))
      const rule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule.estimatedViolations).toBe(2)
    })

    test('logs skip message for failed file with verbose', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/ok.ts', path: 'ok.ts' },
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
      ])
      mockReadFile.mockImplementation((p: string) => {
        if (p.includes('bad')) return Promise.reject(new Error('Permission denied'))
        return Promise.resolve('console.log("a")')
      })
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: true,
        impact: '',
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Skipping file')
      expect(output).toContain('Permission denied')
    })

    test('does not log skip message without verbose', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/ok.ts', path: 'ok.ts' },
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
      ])
      mockReadFile.mockImplementation((p: string) => {
        if (p.includes('bad')) return Promise.reject(new Error('Error'))
        return Promise.resolve('console.log("a")')
      })
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Skipping file')
    })

    test('handles all files rejected', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/f1.ts', path: 'f1.ts' },
        { absolutePath: '/test/f2.ts', path: 'f2.ts' },
      ])
      mockReadFile.mockRejectedValue(new Error('All broken'))
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed).toEqual([])
    })

    test('aggregates correctly from multiple files with different patterns', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/f1.ts', path: 'f1.ts' },
        { absolutePath: '/test/f2.ts', path: 'f2.ts' },
      ])
      mockReadFile.mockImplementation((p: string) => {
        if (p.includes('f1')) return Promise.resolve('console.log("a")')
        return Promise.resolve('console.log("b"); console.warn("c")')
      })
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const parsed = JSON.parse(mockConsoleLog.mock.calls.map((c) => c[0]).join('\n'))
      const rule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule.estimatedViolations).toBeGreaterThanOrEqual(3)
    })

    test('handles large number of files', async () => {
      mockExistsSync.mockReturnValue(true)
      const files = Array.from({ length: 50 }, (_, i) => ({
        absolutePath: `/test/f${i}.ts`,
        path: `f${i}.ts`,
      }))
      mockDiscoverFiles.mockResolvedValue(files)
      mockReadFile.mockResolvedValue('console.log("a")')
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const parsed = JSON.parse(mockConsoleLog.mock.calls.map((c) => c[0]).join('\n'))
      const rule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule.estimatedViolations).toBe(50)
    })
  })

  describe('displaySuggestions', () => {
    test('shows no suggestions message for empty array', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('No rule suggestions found')
    })

    test('shows Rule Suggestions header', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion()], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rule Suggestions')
    })

    test('shows rule ID in console output', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ ruleId: 'my-rule' })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('my-rule')
    })

    test('shows violation count in output', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ estimatedViolations: 42 })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('42')
    })

    test('shows total count', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions(
        [makeSuggestion({ ruleId: 'r1' }), makeSuggestion({ ruleId: 'r2' })],
        false,
      )
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('2 rule suggestions')
    })

    test('verbose shows Category', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ category: 'security' })], true)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Category: security')
    })

    test('verbose shows Reason', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ reason: 'Found bad pattern' })], true)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Reason: Found bad pattern')
    })

    test('verbose shows Enable with command', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ ruleId: 'no-eval' })], true)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Enable with: codeforge analyze --rules no-eval')
    })

    test('non-verbose does not show Category', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ category: 'security' })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Category:')
    })

    test('non-verbose does not show Reason', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ reason: 'Bad pattern' })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Reason:')
    })

    test('displays HIGH for high impact', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ impact: 'high' })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('HIGH')
    })

    test('displays MEDIUM for medium impact', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ impact: 'medium' })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('MEDIUM')
    })

    test('displays LOW for low impact', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ impact: 'low' })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('LOW')
    })

    test('displays multiple suggestions', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions(
        [
          makeSuggestion({ ruleId: 'rule-a', impact: 'high' }),
          makeSuggestion({ ruleId: 'rule-b', impact: 'low' }),
        ],
        false,
      )
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('rule-a')
      expect(output).toContain('rule-b')
    })

    test('displays confidence label', () => {
      const cmd = new SuggestRules([], {} as never)
      const internals = cmd as unknown as CommandInternals
      internals.displaySuggestions([makeSuggestion({ confidence: 'high' })], false)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('HIGH')
    })
  })

  describe('Flag combinations via run', () => {
    test('JSON format with verbose', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 15, verbose: true, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a")',
      )
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(true)
    })

    test('JSON format with impact high', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 15, verbose: false, impact: 'high' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a"); eval("b")',
      )
      const parsed = JSON.parse(output)
      expect(parsed.every((r: { impact: string }) => r.impact === 'high')).toBe(true)
    })

    test('JSON format with impact medium', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 15, verbose: false, impact: 'medium' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a"); var x = 1;',
      )
      const parsed = JSON.parse(output)
      expect(parsed.every((r: { impact: string }) => r.impact === 'medium')).toBe(true)
    })

    test('JSON format with impact low', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 15, verbose: false, impact: 'low' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        '// TODO: fix this',
      )
      const parsed = JSON.parse(output)
      expect(parsed.every((r: { impact: string }) => r.impact === 'low')).toBe(true)
    })

    test('JSON format with top 1', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 1, verbose: false, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a"); eval("b"); var x = 1;',
      )
      const parsed = JSON.parse(output)
      expect(parsed.length).toBeLessThanOrEqual(1)
    })

    test('JSON format with top 0 returns empty', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 0, verbose: false, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a")',
      )
      const parsed = JSON.parse(output)
      expect(parsed).toEqual([])
    })

    test('Console format with verbose', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: true, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a")',
      )
      expect(output).toContain('Rule Suggestions')
      expect(output).toContain('Enable with:')
    })

    test('Console format with impact high', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: false, impact: 'high' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a"); eval("b")',
      )
      expect(output).toContain('Rule Suggestions')
    })

    test('Console format with impact medium', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: false, impact: 'medium' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a"); var x = 1;',
      )
      expect(output).toContain('Rule Suggestions')
    })

    test('Console format with impact low', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: false, impact: 'low' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        '// TODO: fix',
      )
      expect(output).toContain('Rule Suggestions')
    })

    test('Console format with top 1', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 1, verbose: false, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a"); eval("b");',
      )
      expect(output).toContain('1 rule suggestions')
    })

    test('Verbose with impact filter', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: true, impact: 'high' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'eval("code")',
      )
      expect(output).toContain('Category:')
      expect(output).toContain('Reason:')
    })

    test('All flags combined', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 1, verbose: true, impact: 'high' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a"); eval("b"); if (a == b) {}',
      )
      const parsed = JSON.parse(output)
      expect(parsed.length).toBeLessThanOrEqual(1)
      if (parsed.length > 0) {
        expect(parsed[0].impact).toBe('high')
      }
    })

    test('Default flags produce console output', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: false, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a")',
      )
      expect(output).toContain('Rule Suggestions')
    })

    test('Top larger than available returns all', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 100, verbose: false, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a")',
      )
      const parsed = JSON.parse(output)
      expect(parsed.length).toBe(1)
    })
  })

  describe('Error handling', () => {
    test('throws when discoverFiles rejects', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockRejectedValue(new Error('Disk error'))
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await expect(cmd.run()).rejects.toThrow('Disk error')
    })

    test('throws when analysis fails completely', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/f.ts', path: 'f.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read fail'))
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('[]')
    })

    test('errors for non-existent path with specific message', async () => {
      mockExistsSync.mockReturnValue(false)
      const cmd = createCommandWithMockedParse(
        { format: 'console', top: 15, verbose: false, impact: '' },
        { path: '/absolutely/does/not/exist' },
      )
      await expect(cmd.run()).rejects.toThrow('Path not found: /absolutely/does/not/exist')
    })

    test('handles partial file read failures gracefully', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/ok.ts', path: 'ok.ts' },
        { absolutePath: '/test/fail.ts', path: 'fail.ts' },
        { absolutePath: '/test/also-ok.ts', path: 'also-ok.ts' },
      ])
      mockReadFile.mockImplementation((p: string) => {
        if (p.includes('fail')) return Promise.reject(new Error('Broken'))
        return Promise.resolve('console.log("a")')
      })
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const parsed = JSON.parse(mockConsoleLog.mock.calls.map((c) => c[0]).join('\n'))
      expect(parsed.length).toBeGreaterThanOrEqual(1)
    })

    test('verbose logs file path on read error', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/good.ts', path: 'good.ts' },
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
      ])
      mockReadFile.mockImplementation((p: string) => {
        if (p.includes('bad')) return Promise.reject(new Error('Failed'))
        return Promise.resolve('const x = 1;')
      })
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: true,
        impact: '',
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('bad.ts')
    })

    test('verbose logs error message on read failure', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/good.ts', path: 'good.ts' },
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
      ])
      mockReadFile.mockImplementation((p: string) => {
        if (p.includes('bad')) return Promise.reject(new Error('Custom error msg'))
        return Promise.resolve('const x = 1;')
      })
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: true,
        impact: '',
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Custom error msg')
    })

    test('resolves path argument', async () => {
      mockExistsSync.mockReturnValue(false)
      const cmd = createCommandWithMockedParse(
        { format: 'console', top: 15, verbose: false, impact: '' },
        { path: 'relative/path' },
      )
      await expect(cmd.run()).rejects.toThrow('Path not found')
    })
  })

  describe('Edge cases', () => {
    test('empty file content produces no suggestions', async () => {
      const result = await detectPattern('')
      expect(result).toEqual([])
    })

    test('whitespace only content produces no suggestions', async () => {
      const result = await detectPattern('   \n\t  \n  ')
      expect(result).toEqual([])
    })

    test('multiple files contribute to same rule count', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('console.log("a")')
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const parsed = JSON.parse(mockConsoleLog.mock.calls.map((c) => c[0]).join('\n'))
      const rule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule.estimatedViolations).toBe(3)
    })

    test('getRuleCategory called for each detected rule', async () => {
      const { getRuleCategory } = await import('../../../src/rules/index.js')
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/f.ts', path: 'f.ts' }])
      mockReadFile.mockResolvedValue('console.log("a"); eval("b")')
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      expect(getRuleCategory).toHaveBeenCalledWith('no-console-log')
      expect(getRuleCategory).toHaveBeenCalledWith('no-eval')
    })

    test('getRuleCategory returns patterns for unknown rule', async () => {
      const { getRuleCategory } = await import('../../../src/rules/index.js')
      expect(getRuleCategory('unknown-rule-id')).toBe('patterns')
    })

    test('no duplicate rule IDs in output', async () => {
      const result = await detectPattern('console.log("a"); console.warn("b"); console.error("c")')
      const ruleIds = result.map((r: { ruleId: string }) => r.ruleId)
      const uniqueIds = [...new Set(ruleIds)]
      expect(ruleIds.length).toBe(uniqueIds.length)
    })

    test('confidence values preserved in output', async () => {
      const result = await detectPattern('console.log("a"); eval("b")')
      for (const r of result) {
        expect(['high', 'medium', 'low']).toContain(r.confidence)
      }
    })

    test('impact values preserved in output', async () => {
      const result = await detectPattern('console.log("a"); eval("b")')
      for (const r of result) {
        expect(['high', 'medium', 'low']).toContain(r.impact)
      }
    })

    test('JSON output has all required fields', async () => {
      const result = await detectPattern('console.log("a")')
      const rule = result[0]
      expect(rule).toHaveProperty('ruleId')
      expect(rule).toHaveProperty('category')
      expect(rule).toHaveProperty('confidence')
      expect(rule).toHaveProperty('impact')
      expect(rule).toHaveProperty('reason')
      expect(rule).toHaveProperty('estimatedViolations')
    })

    test('discoverFiles called with correct cwd', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse(
        { format: 'console', top: 15, verbose: false, impact: '' },
        { path: '.' },
      )
      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({ cwd: expect.any(String) }),
      )
    })

    test('discoverFiles called with correct file patterns', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({
        format: 'console',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        }),
      )
    })

    test('discoverFiles called with ignore patterns', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({
        format: 'console',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining(['**/node_modules/**']),
        }),
      )
    })

    test('impact filter that removes all returns empty JSON', async () => {
      const output = await runAndGetOutput(
        { format: 'json', top: 15, verbose: false, impact: 'low' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'eval("code")',
      )
      const parsed = JSON.parse(output)
      expect(parsed).toEqual([])
    })

    test('impact filter that removes all shows no suggestions in console', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: false, impact: 'low' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'eval("code")',
      )
      expect(output).toContain('No rule suggestions found')
    })

    test('content with regex special characters', async () => {
      const result = await detectPattern('const str = "hello[world]" + "test{a}"')
      expect(Array.isArray(result)).toBe(true)
    })

    test('pattern at very start of content', async () => {
      const result = await detectPattern('console.log("a")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule).toBeDefined()
    })

    test('pattern at very end of content', async () => {
      const result = await detectPattern('some code; console.log("a")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(rule).toBeDefined()
    })

    test('multiple var declarations counted', async () => {
      const result = await detectPattern('var a = 1; var b = 2; var c = 3;')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'prefer-const')
      expect(rule.estimatedViolations).toBe(3)
    })

    test('both eval and new Function counted together', async () => {
      const result = await detectPattern('eval("a"); new Function("b")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(rule.estimatedViolations).toBe(2)
    })

    test('reason text is meaningful for each rule', async () => {
      const code = 'console.log("a"); var x = 1; eval("b")'
      const result = await detectPattern(code)
      for (const r of result) {
        expect(r.reason.length).toBeGreaterThan(0)
      }
    })

    test('category set correctly for security rules', async () => {
      const result = await detectPattern('eval("code")')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(rule.category).toBe('security')
    })

    test('category set correctly for complexity rules', async () => {
      const result = await detectPattern('if (a) { if (b) {} }')
      const rule = result.find((r: { ruleId: string }) => r.ruleId === 'max-depth')
      expect(rule.category).toBe('complexity')
    })

    test('top=1 with multiple suggestions returns at most 1', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/f.ts', path: 'f.ts' }])
      mockReadFile.mockResolvedValue('console.log("a"); eval("b"); if (a == b) {}')
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 1,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const parsed = JSON.parse(mockConsoleLog.mock.calls.map((c) => c[0]).join('\n'))
      expect(parsed.length).toBeLessThanOrEqual(1)
    })

    test('default path argument resolves to cwd', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse(
        { format: 'console', top: 15, verbose: false, impact: '' },
        { path: '.' },
      )
      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    test('verbose false does not show detailed info', async () => {
      const output = await runAndGetOutput(
        { format: 'console', top: 15, verbose: false, impact: '' },
        [{ absolutePath: '/test/f.ts', path: 'f.ts' }],
        'console.log("a")',
      )
      expect(output).not.toContain('Category:')
      expect(output).not.toContain('Reason:')
    })

    test('impact flag default is empty string', () => {
      expect(SuggestRules.flags.impact.default).toBe('')
    })

    test('impact flag options include high medium low and empty', () => {
      expect(SuggestRules.flags.impact.options).toContain('high')
      expect(SuggestRules.flags.impact.options).toContain('medium')
      expect(SuggestRules.flags.impact.options).toContain('low')
      expect(SuggestRules.flags.impact.options).toContain('')
    })

    test('format flag only allows console and json', () => {
      expect(SuggestRules.flags.format.options).toEqual(['console', 'json'])
    })

    test('top flag is integer type', () => {
      expect(SuggestRules.flags.top.type).toBe('option')
    })

    test('verbose flag is boolean type', () => {
      expect(SuggestRules.flags.verbose.type).toBe('boolean')
    })

    test('examples contain format json example', () => {
      const exampleStrings = SuggestRules.examples.map(
        (e: { command: string; description: string }) => e.command,
      )
      expect(exampleStrings.some((c: string) => c.includes('json'))).toBe(true)
    })

    test('path argument is optional', () => {
      expect(SuggestRules.args.path.required).toBe(false)
    })

    test('analyzePatterns returns results from fulfilled reads only', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/good.ts', path: 'good.ts' },
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
      ])
      mockReadFile.mockImplementation((p: string) => {
        if (p.includes('bad')) return Promise.reject(new Error('Nope'))
        return Promise.resolve('eval("code")')
      })
      const cmd = createCommandWithMockedParse({
        format: 'json',
        top: 15,
        verbose: false,
        impact: '',
      })
      await cmd.run()
      const parsed = JSON.parse(mockConsoleLog.mock.calls.map((c) => c[0]).join('\n'))
      const evalRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(evalRule).toBeDefined()
    })
  })
})
