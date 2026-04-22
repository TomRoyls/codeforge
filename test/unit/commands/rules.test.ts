import { describe, test, expect, beforeEach, vi } from 'vitest'

interface MockRuleInfo {
  category: string
  description: string
  fixable: boolean
  name: string
  recommended: boolean
  severity: string
}

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'max-complexity': {
      meta: {
        name: 'max-complexity',
        description: 'Enforce a maximum cyclomatic complexity threshold',
        category: 'complexity',
        recommended: true,
      },
      defaultOptions: { max: 10 },
      create: vi.fn(),
    },
    'max-params': {
      meta: {
        name: 'max-params',
        description: 'Enforce maximum number of parameters',
        category: 'complexity',
        recommended: true,
      },
      defaultOptions: { max: 4 },
      create: vi.fn(),
      fix: vi.fn(),
    },
    'no-await-in-loop': {
      meta: {
        name: 'no-await-in-loop',
        description: 'Disallow await inside loops',
        category: 'performance',
        recommended: false,
        fixable: true,
      },
      defaultOptions: {},
      create: vi.fn(),
      fix: vi.fn(),
    },
    'no-eval': {
      meta: {
        name: 'no-eval',
        description: 'Disallow the use of eval',
        category: 'security',
        severity: 'error',
        recommended: true,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'no-console': {
      meta: {
        name: 'no-console',
        description: 'Disallow console statements in production code',
        category: 'style',
        severity: 'warning',
        recommended: false,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'prefer-const': {
      meta: {
        name: 'prefer-const',
        description: 'Prefer const declarations for variables',
        category: 'style',
        severity: 'warning',
        recommended: true,
        fixable: true,
      },
      defaultOptions: {},
      create: vi.fn(),
      fix: vi.fn(),
    },
    'no-circular-deps': {
      meta: {
        name: 'no-circular-deps',
        description: 'Detect circular dependencies in module imports',
        category: 'dependencies',
        severity: 'error',
        recommended: true,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'no-unsafe-regex': {
      meta: {
        name: 'no-unsafe-regex',
        description: 'Disallow unsafe regular expressions that could cause ReDoS',
        category: 'security',
        severity: 'warning',
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'no-magic-numbers': {
      meta: {
        name: 'no-magic-numbers',
        description: 'Disallow magic numbers in code',
        category: 'patterns',
        severity: 'info',
        recommended: false,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'no-duplicate-imports': {
      meta: {
        name: 'no-duplicate-imports',
        description: 'Disallow duplicate import statements',
        category: 'dependencies',
        severity: 'warning',
        recommended: true,
        fixable: true,
      },
      defaultOptions: {},
      create: vi.fn(),
      fix: vi.fn(),
    },
    'consistent-return': {
      meta: {
        name: 'consistent-return',
        description: 'Require consistent return statements in functions',
        category: 'correctness',
        severity: 'error',
        recommended: false,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'no-dead-code': {
      meta: {
        name: 'no-dead-code',
        description: 'Detect unreachable code after return statements',
        category: 'correctness',
        severity: 'error',
        recommended: true,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'no-nested-ternary': {
      meta: {
        name: 'no-nested-ternary',
        description: 'Disallow nested ternary expressions',
        category: 'complexity',
        severity: 'warning',
        recommended: false,
        fixable: true,
      },
      defaultOptions: {},
      create: vi.fn(),
      fix: vi.fn(),
    },
    'prefer-template': {
      meta: {
        name: 'prefer-template',
        description: 'Prefer template literals over string concatenation',
        category: 'style',
        severity: 'info',
        recommended: false,
        fixable: true,
      },
      defaultOptions: {},
      create: vi.fn(),
      fix: vi.fn(),
    },
    'test-fallback-category': {
      meta: {
        name: 'test-fallback-category',
        description: 'A test rule for category fallback testing',
        severity: 'info',
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'long-desc-rule': {
      meta: {
        name: 'long-desc-rule',
        description:
          'This is a very long description that exceeds the normal column width and should be truncated in table output when it goes beyond the maximum description column width',
        category: 'patterns',
        severity: 'info',
        recommended: false,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
  },
  getRuleCategory: vi.fn((ruleId: string) => {
    if (ruleId.startsWith('max-')) return 'complexity'
    if (ruleId.startsWith('no-')) return 'performance'
    return 'complexity'
  }),
}))

describe('Rules Command', () => {
  let Rules: typeof import('../../../src/commands/rules.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Rules = (await import('../../../src/commands/rules.js')).default
  })

  function createCmd(flags: Record<string, unknown>) {
    const command = new Rules([], {} as never)
    const mocked = command as unknown as { parse: ReturnType<typeof vi.fn> }
    mocked.parse = vi.fn().mockResolvedValue({ args: {}, flags })
    return command
  }

  function fullFlags(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      format: 'table',
      category: undefined,
      fixable: false,
      search: undefined,
      severity: undefined,
      ...overrides,
    }
  }

  async function capture(flags: Record<string, unknown>): Promise<string> {
    mockConsoleLog.mockClear()
    const cmd = createCmd(fullFlags(flags))
    await cmd.run()
    return mockConsoleLog.mock.calls.map((c: unknown[]) => String(c[0])).join('\n')
  }

  async function jsonRules(overrides: Record<string, unknown> = {}): Promise<MockRuleInfo[]> {
    const output = await capture({ ...overrides, format: 'json' })
    return JSON.parse(output)
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Rules.description).toBe('List all available rules')
    })

    test('has examples defined', () => {
      expect(Rules.examples).toBeDefined()
      expect(Rules.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Rules.flags).toBeDefined()
      expect(Rules.flags.format).toBeDefined()
      expect(Rules.flags.category).toBeDefined()
      expect(Rules.flags.fixable).toBeDefined()
    })

    test('format flag has correct options', () => {
      expect(Rules.flags.format.options).toContain('json')
      expect(Rules.flags.format.options).toContain('table')
    })

    test('format flag has default value table', () => {
      expect(Rules.flags.format.default).toBe('table')
    })

    test('category flag has correct options', () => {
      expect(Rules.flags.category.options).toContain('complexity')
      expect(Rules.flags.category.options).toContain('performance')
      expect(Rules.flags.category.options).toContain('security')
      expect(Rules.flags.category.options).toContain('patterns')
      expect(Rules.flags.category.options).toContain('dependencies')
    })

    test('fixable flag has default false', () => {
      expect(Rules.flags.fixable.default).toBe(false)
    })

    test('search flag has char s', () => {
      expect(Rules.flags.search.char).toBe('s')
    })
  })

  describe('Flag characters', () => {
    test('format flag has char f', () => {
      expect(Rules.flags.format.char).toBe('f')
    })

    test('category flag has char c', () => {
      expect(Rules.flags.category.char).toBe('c')
    })
  })

  describe('getRules', () => {
    function getTestableCommand(): {
      getRules: () => Array<{
        category: string
        description: string
        fixable: boolean
        name: string
        recommended: boolean
      }>
    } {
      return new Rules([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns array of rules', () => {
      const rules = getTestableCommand().getRules()
      expect(Array.isArray(rules)).toBe(true)
      expect(rules.length).toBeGreaterThan(0)
    })

    test('each rule has required properties', () => {
      const rules = getTestableCommand().getRules()
      for (const rule of rules) {
        expect(rule).toHaveProperty('name')
        expect(rule).toHaveProperty('category')
        expect(rule).toHaveProperty('description')
        expect(rule).toHaveProperty('fixable')
        expect(rule).toHaveProperty('recommended')
      }
    })

    test('rules are sorted by name', () => {
      const rules = getTestableCommand().getRules()
      const names = rules.map((r) => r.name)
      const sorted = [...names].sort()
      expect(names).toEqual(sorted)
    })

    test('detects fixable rules from fix function', () => {
      const rules = getTestableCommand().getRules()
      const maxParams = rules.find((r) => r.name === 'max-params')
      expect(maxParams?.fixable).toBe(true)
    })

    test('detects fixable rules from meta.fixable', () => {
      const rules = getTestableCommand().getRules()
      const noAwaitInLoop = rules.find((r) => r.name === 'no-await-in-loop')
      expect(noAwaitInLoop?.fixable).toBe(true)
    })

    test('non-fixable rules have fixable false', () => {
      const rules = getTestableCommand().getRules()
      const maxComplexity = rules.find((r) => r.name === 'max-complexity')
      expect(maxComplexity?.fixable).toBe(false)
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Rules([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      return command
    }

    test('outputs JSON format when format is json', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'json',
        category: undefined,
        fixable: false,
        search: undefined,
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(true)
    })

    test('JSON output contains required fields', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'json',
        category: undefined,
        fixable: false,
        search: undefined,
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      const firstRule = parsed[0]
      expect(firstRule).toHaveProperty('name')
      expect(firstRule).toHaveProperty('category')
      expect(firstRule).toHaveProperty('description')
      expect(firstRule).toHaveProperty('fixable')
      expect(firstRule).toHaveProperty('recommended')
    })

    test('filters by category', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'json',
        category: 'performance',
        fixable: false,
        search: undefined,
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.every((r: { category: string }) => r.category === 'performance')).toBe(true)
    })

    test('filters by fixable', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'json',
        category: undefined,
        fixable: true,
        search: undefined,
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.every((r: { fixable: boolean }) => r.fixable === true)).toBe(true)
    })

    test('filters by search term', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'json',
        category: undefined,
        fixable: false,
        search: 'loop',
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(
        parsed.every((r: { description: string }) => r.description.toLowerCase().includes('loop')),
      ).toBe(true)
    })

    test('outputs table format by default', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'table',
        category: undefined,
        fixable: false,
        search: undefined,
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rule')
      expect(output).toContain('Category')
      expect(output).toContain('Description')
      expect(output).toContain('Fixable')
    })

    test('shows total rule count', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'table',
        category: undefined,
        fixable: false,
        search: undefined,
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Total:')
      expect(output).toContain('rules')
    })

    test('shows legend', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'table',
        category: undefined,
        fixable: false,
        search: undefined,
      })
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('recommended')
      expect(output).toContain('fixable')
    })
  })

  describe('Command metadata - severity flag', () => {
    test('severity flag is defined', () => {
      expect(Rules.flags.severity).toBeDefined()
    })

    test('severity flag has correct options', () => {
      expect(Rules.flags.severity.options).toContain('error')
      expect(Rules.flags.severity.options).toContain('warning')
      expect(Rules.flags.severity.options).toContain('info')
    })

    test('severity flag options has exactly three values', () => {
      expect(Rules.flags.severity.options).toHaveLength(3)
    })

    test('severity flag has no char alias', () => {
      expect(Rules.flags.severity.char).toBeUndefined()
    })

    test('severity flag has no default value', () => {
      expect(Rules.flags.severity.default).toBeUndefined()
    })
  })

  describe('Command metadata - flag descriptions', () => {
    test('format flag has description', () => {
      expect(Rules.flags.format.description).toBe('Output format')
    })

    test('category flag has description', () => {
      expect(Rules.flags.category.description).toBe('Filter rules by category')
    })

    test('fixable flag has description', () => {
      expect(Rules.flags.fixable.description).toBe(
        'Show only rules that can automatically fix issues',
      )
    })

    test('search flag has description', () => {
      expect(Rules.flags.search.description).toBe('Search rules by keyword in description')
    })

    test('severity flag has description', () => {
      expect(Rules.flags.severity.description).toBe('Filter rules by severity level')
    })
  })

  describe('Command metadata - examples', () => {
    test('has exactly five examples', () => {
      expect(Rules.examples).toHaveLength(5)
    })

    test('each example has command and description', () => {
      for (const example of Rules.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect(typeof example.command).toBe('string')
        expect(typeof example.description).toBe('string')
      }
    })

    test('examples include json format example', () => {
      const hasJsonExample = Rules.examples.some(
        (e: { command: string }) => e.command.includes('format') && e.command.includes('json'),
      )
      expect(hasJsonExample).toBe(true)
    })

    test('examples include category filter example', () => {
      const hasCategoryExample = Rules.examples.some((e: { command: string }) =>
        e.command.includes('category'),
      )
      expect(hasCategoryExample).toBe(true)
    })

    test('examples include search example', () => {
      const hasSearchExample = Rules.examples.some((e: { command: string }) =>
        e.command.includes('search'),
      )
      expect(hasSearchExample).toBe(true)
    })

    test('examples include severity example', () => {
      const hasSeverityExample = Rules.examples.some((e: { command: string }) =>
        e.command.includes('severity'),
      )
      expect(hasSeverityExample).toBe(true)
    })
  })

  describe('Command metadata - category options complete', () => {
    test('category options include all seven categories', () => {
      const options = Rules.flags.category.options
      expect(options).toContain('complexity')
      expect(options).toContain('correctness')
      expect(options).toContain('dependencies')
      expect(options).toContain('patterns')
      expect(options).toContain('performance')
      expect(options).toContain('security')
      expect(options).toContain('style')
    })

    test('category options has exactly seven values', () => {
      expect(Rules.flags.category.options).toHaveLength(7)
    })

    test('format options has exactly two values', () => {
      expect(Rules.flags.format.options).toHaveLength(2)
    })
  })

  describe('getRules - rule count and completeness', () => {
    function getRules(): MockRuleInfo[] {
      const cmd = new Rules([], {} as never)
      return (cmd as unknown as { getRules: () => MockRuleInfo[] }).getRules()
    }

    test('returns 16 rules from mock data', () => {
      expect(getRules()).toHaveLength(16)
    })

    test('includes all expected rule names', () => {
      const names = getRules().map((r) => r.name)
      expect(names).toContain('max-complexity')
      expect(names).toContain('max-params')
      expect(names).toContain('no-await-in-loop')
      expect(names).toContain('no-eval')
      expect(names).toContain('no-console')
      expect(names).toContain('prefer-const')
      expect(names).toContain('no-circular-deps')
      expect(names).toContain('no-unsafe-regex')
      expect(names).toContain('no-magic-numbers')
      expect(names).toContain('no-duplicate-imports')
      expect(names).toContain('consistent-return')
      expect(names).toContain('no-dead-code')
      expect(names).toContain('no-nested-ternary')
      expect(names).toContain('prefer-template')
      expect(names).toContain('test-fallback-category')
      expect(names).toContain('long-desc-rule')
    })

    test('all rule names are unique', () => {
      const names = getRules().map((r) => r.name)
      expect(new Set(names).size).toBe(names.length)
    })

    test('every rule has a non-empty name', () => {
      for (const rule of getRules()) {
        expect(rule.name.length).toBeGreaterThan(0)
      }
    })

    test('every rule has a non-empty description', () => {
      for (const rule of getRules()) {
        expect(rule.description.length).toBeGreaterThan(0)
      }
    })

    test('every rule has a non-empty category', () => {
      for (const rule of getRules()) {
        expect(rule.category.length).toBeGreaterThan(0)
      }
    })

    test('every rule fixable is boolean', () => {
      for (const rule of getRules()) {
        expect(typeof rule.fixable).toBe('boolean')
      }
    })

    test('every rule recommended is boolean', () => {
      for (const rule of getRules()) {
        expect(typeof rule.recommended).toBe('boolean')
      }
    })

    test('every rule severity is a string', () => {
      for (const rule of getRules()) {
        expect(typeof rule.severity).toBe('string')
      }
    })
  })

  describe('getRules - individual rule properties', () => {
    function getRules(): MockRuleInfo[] {
      const cmd = new Rules([], {} as never)
      return (cmd as unknown as { getRules: () => MockRuleInfo[] }).getRules()
    }

    test('max-complexity has category complexity', () => {
      const rule = getRules().find((r) => r.name === 'max-complexity')
      expect(rule?.category).toBe('complexity')
    })

    test('max-complexity is recommended', () => {
      const rule = getRules().find((r) => r.name === 'max-complexity')
      expect(rule?.recommended).toBe(true)
    })

    test('max-complexity is not fixable', () => {
      const rule = getRules().find((r) => r.name === 'max-complexity')
      expect(rule?.fixable).toBe(false)
    })

    test('max-params has category complexity', () => {
      const rule = getRules().find((r) => r.name === 'max-params')
      expect(rule?.category).toBe('complexity')
    })

    test('max-params is fixable via fix function', () => {
      const rule = getRules().find((r) => r.name === 'max-params')
      expect(rule?.fixable).toBe(true)
    })

    test('no-await-in-loop has category performance', () => {
      const rule = getRules().find((r) => r.name === 'no-await-in-loop')
      expect(rule?.category).toBe('performance')
    })

    test('no-await-in-loop is not recommended', () => {
      const rule = getRules().find((r) => r.name === 'no-await-in-loop')
      expect(rule?.recommended).toBe(false)
    })

    test('no-eval has category security', () => {
      const rule = getRules().find((r) => r.name === 'no-eval')
      expect(rule?.category).toBe('security')
    })

    test('no-eval has severity error', () => {
      const rule = getRules().find((r) => r.name === 'no-eval')
      expect(rule?.severity).toBe('error')
    })

    test('no-eval is recommended', () => {
      const rule = getRules().find((r) => r.name === 'no-eval')
      expect(rule?.recommended).toBe(true)
    })

    test('no-console has category style', () => {
      const rule = getRules().find((r) => r.name === 'no-console')
      expect(rule?.category).toBe('style')
    })

    test('no-console has severity warning', () => {
      const rule = getRules().find((r) => r.name === 'no-console')
      expect(rule?.severity).toBe('warning')
    })

    test('prefer-const is fixable', () => {
      const rule = getRules().find((r) => r.name === 'prefer-const')
      expect(rule?.fixable).toBe(true)
    })

    test('prefer-const is recommended', () => {
      const rule = getRules().find((r) => r.name === 'prefer-const')
      expect(rule?.recommended).toBe(true)
    })

    test('no-circular-deps has category dependencies', () => {
      const rule = getRules().find((r) => r.name === 'no-circular-deps')
      expect(rule?.category).toBe('dependencies')
    })

    test('no-circular-deps has severity error', () => {
      const rule = getRules().find((r) => r.name === 'no-circular-deps')
      expect(rule?.severity).toBe('error')
    })

    test('consistent-return has category correctness', () => {
      const rule = getRules().find((r) => r.name === 'consistent-return')
      expect(rule?.category).toBe('correctness')
    })

    test('no-magic-numbers has category patterns', () => {
      const rule = getRules().find((r) => r.name === 'no-magic-numbers')
      expect(rule?.category).toBe('patterns')
    })

    test('long-desc-rule has category patterns', () => {
      const rule = getRules().find((r) => r.name === 'long-desc-rule')
      expect(rule?.category).toBe('patterns')
    })
  })

  describe('getRules - severity defaults and fallbacks', () => {
    function getRules(): MockRuleInfo[] {
      const cmd = new Rules([], {} as never)
      return (cmd as unknown as { getRules: () => MockRuleInfo[] }).getRules()
    }

    test('rules without severity default to info', () => {
      const rule = getRules().find((r) => r.name === 'max-complexity')
      expect(rule?.severity).toBe('info')
    })

    test('max-params severity defaults to info', () => {
      const rule = getRules().find((r) => r.name === 'max-params')
      expect(rule?.severity).toBe('info')
    })

    test('no-await-in-loop severity defaults to info', () => {
      const rule = getRules().find((r) => r.name === 'no-await-in-loop')
      expect(rule?.severity).toBe('info')
    })

    test('explicit error severity is preserved', () => {
      const rule = getRules().find((r) => r.name === 'no-eval')
      expect(rule?.severity).toBe('error')
    })

    test('explicit warning severity is preserved', () => {
      const rule = getRules().find((r) => r.name === 'no-console')
      expect(rule?.severity).toBe('warning')
    })

    test('test-fallback-category severity is info', () => {
      const rule = getRules().find((r) => r.name === 'test-fallback-category')
      expect(rule?.severity).toBe('info')
    })

    test('no-unsafe-regex recommended defaults to false', () => {
      const rule = getRules().find((r) => r.name === 'no-unsafe-regex')
      expect(rule?.recommended).toBe(false)
    })

    test('test-fallback-category recommended defaults to false', () => {
      const rule = getRules().find((r) => r.name === 'test-fallback-category')
      expect(rule?.recommended).toBe(false)
    })
  })

  describe('getRules - category fallback', () => {
    test('test-fallback-category uses getRuleCategory when meta.category missing', () => {
      const cmd = new Rules([], {} as never)
      const rules = (cmd as unknown as { getRules: () => MockRuleInfo[] }).getRules()
      const rule = rules.find((r) => r.name === 'test-fallback-category')
      expect(rule?.category).toBe('complexity')
    })
  })

  describe('getRules - fixable detection details', () => {
    function getRules(): MockRuleInfo[] {
      const cmd = new Rules([], {} as never)
      return (cmd as unknown as { getRules: () => MockRuleInfo[] }).getRules()
    }

    test('fixable count is 6', () => {
      const fixable = getRules().filter((r) => r.fixable)
      expect(fixable).toHaveLength(6)
    })

    test('recommended count is 7', () => {
      const recommended = getRules().filter((r) => r.recommended)
      expect(recommended).toHaveLength(7)
    })

    test('error severity count is 4', () => {
      const errors = getRules().filter((r) => r.severity === 'error')
      expect(errors).toHaveLength(4)
    })

    test('warning severity count is 5', () => {
      const warnings = getRules().filter((r) => r.severity === 'warning')
      expect(warnings).toHaveLength(5)
    })

    test('info severity count is 7', () => {
      const infos = getRules().filter((r) => r.severity === 'info')
      expect(infos).toHaveLength(7)
    })

    test('no-duplicate-imports is fixable via both fix and meta.fixable', () => {
      const rule = getRules().find((r) => r.name === 'no-duplicate-imports')
      expect(rule?.fixable).toBe(true)
    })

    test('no-nested-ternary is fixable', () => {
      const rule = getRules().find((r) => r.name === 'no-nested-ternary')
      expect(rule?.fixable).toBe(true)
    })

    test('prefer-template is fixable', () => {
      const rule = getRules().find((r) => r.name === 'prefer-template')
      expect(rule?.fixable).toBe(true)
    })

    test('no-dead-code is not fixable', () => {
      const rule = getRules().find((r) => r.name === 'no-dead-code')
      expect(rule?.fixable).toBe(false)
    })

    test('consistent-return is not fixable', () => {
      const rule = getRules().find((r) => r.name === 'consistent-return')
      expect(rule?.fixable).toBe(false)
    })
  })

  describe('getRules - category counts', () => {
    function getRules(): MockRuleInfo[] {
      const cmd = new Rules([], {} as never)
      return (cmd as unknown as { getRules: () => MockRuleInfo[] }).getRules()
    }

    test('complexity category has 4 rules', () => {
      expect(getRules().filter((r) => r.category === 'complexity')).toHaveLength(4)
    })

    test('performance category has 1 rule', () => {
      expect(getRules().filter((r) => r.category === 'performance')).toHaveLength(1)
    })

    test('security category has 2 rules', () => {
      expect(getRules().filter((r) => r.category === 'security')).toHaveLength(2)
    })

    test('style category has 3 rules', () => {
      expect(getRules().filter((r) => r.category === 'style')).toHaveLength(3)
    })

    test('dependencies category has 2 rules', () => {
      expect(getRules().filter((r) => r.category === 'dependencies')).toHaveLength(2)
    })

    test('correctness category has 2 rules', () => {
      expect(getRules().filter((r) => r.category === 'correctness')).toHaveLength(2)
    })

    test('patterns category has 2 rules', () => {
      expect(getRules().filter((r) => r.category === 'patterns')).toHaveLength(2)
    })
  })

  describe('JSON output - no filters', () => {
    test('returns all 16 rules with no filters', async () => {
      const rules = await jsonRules()
      expect(rules).toHaveLength(16)
    })

    test('output is valid JSON', async () => {
      const output = await capture({ format: 'json' })
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('output is a JSON array', async () => {
      const rules = await jsonRules()
      expect(Array.isArray(rules)).toBe(true)
    })

    test('rules are sorted alphabetically in JSON output', async () => {
      const rules = await jsonRules()
      const names = rules.map((r) => r.name)
      const sorted = [...names].sort()
      expect(names).toEqual(sorted)
    })

    test('first rule is consistent-return', async () => {
      const rules = await jsonRules()
      expect(rules[0].name).toBe('consistent-return')
    })

    test('each JSON rule has six properties', async () => {
      const rules = await jsonRules()
      for (const rule of rules) {
        expect(Object.keys(rule).sort()).toEqual(
          ['category', 'description', 'fixable', 'name', 'recommended', 'severity'].sort(),
        )
      }
    })
  })

  describe('JSON output - category filtering', () => {
    test('category complexity returns 4 rules', async () => {
      const rules = await jsonRules({ category: 'complexity' })
      expect(rules).toHaveLength(4)
      expect(rules.every((r) => r.category === 'complexity')).toBe(true)
    })

    test('category performance returns 1 rule', async () => {
      const rules = await jsonRules({ category: 'performance' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-await-in-loop')
    })

    test('category security returns 2 rules', async () => {
      const rules = await jsonRules({ category: 'security' })
      expect(rules).toHaveLength(2)
      expect(rules.every((r) => r.category === 'security')).toBe(true)
    })

    test('category style returns 3 rules', async () => {
      const rules = await jsonRules({ category: 'style' })
      expect(rules).toHaveLength(3)
      expect(rules.every((r) => r.category === 'style')).toBe(true)
    })

    test('category dependencies returns 2 rules', async () => {
      const rules = await jsonRules({ category: 'dependencies' })
      expect(rules).toHaveLength(2)
      expect(rules.every((r) => r.category === 'dependencies')).toBe(true)
    })

    test('category correctness returns 2 rules', async () => {
      const rules = await jsonRules({ category: 'correctness' })
      expect(rules).toHaveLength(2)
      expect(rules.every((r) => r.category === 'correctness')).toBe(true)
    })

    test('category patterns returns 2 rules', async () => {
      const rules = await jsonRules({ category: 'patterns' })
      expect(rules).toHaveLength(2)
      expect(rules.every((r) => r.category === 'patterns')).toBe(true)
    })

    test('category style includes no-console prefer-const prefer-template', async () => {
      const rules = await jsonRules({ category: 'style' })
      const names = rules.map((r) => r.name)
      expect(names).toContain('no-console')
      expect(names).toContain('prefer-const')
      expect(names).toContain('prefer-template')
    })

    test('category dependencies includes both dep rules', async () => {
      const rules = await jsonRules({ category: 'dependencies' })
      const names = rules.map((r) => r.name)
      expect(names).toContain('no-circular-deps')
      expect(names).toContain('no-duplicate-imports')
    })
  })

  describe('JSON output - fixable filtering', () => {
    test('fixable true returns 6 rules', async () => {
      const rules = await jsonRules({ fixable: true })
      expect(rules).toHaveLength(6)
      expect(rules.every((r) => r.fixable)).toBe(true)
    })

    test('fixable false returns all 16 rules', async () => {
      const rules = await jsonRules({ fixable: false })
      expect(rules).toHaveLength(16)
    })

    test('fixable true includes max-params', async () => {
      const rules = await jsonRules({ fixable: true })
      const names = rules.map((r) => r.name)
      expect(names).toContain('max-params')
    })

    test('fixable true does not include max-complexity', async () => {
      const rules = await jsonRules({ fixable: true })
      const names = rules.map((r) => r.name)
      expect(names).not.toContain('max-complexity')
    })
  })

  describe('JSON output - severity filtering', () => {
    test('severity error returns 4 rules', async () => {
      const rules = await jsonRules({ severity: 'error' })
      expect(rules).toHaveLength(4)
      expect(rules.every((r) => r.severity === 'error')).toBe(true)
    })

    test('severity warning returns 5 rules', async () => {
      const rules = await jsonRules({ severity: 'warning' })
      expect(rules).toHaveLength(5)
      expect(rules.every((r) => r.severity === 'warning')).toBe(true)
    })

    test('severity info returns 7 rules', async () => {
      const rules = await jsonRules({ severity: 'info' })
      expect(rules).toHaveLength(7)
      expect(rules.every((r) => r.severity === 'info')).toBe(true)
    })

    test('severity error includes no-eval', async () => {
      const rules = await jsonRules({ severity: 'error' })
      const names = rules.map((r) => r.name)
      expect(names).toContain('no-eval')
    })

    test('severity error includes no-circular-deps', async () => {
      const rules = await jsonRules({ severity: 'error' })
      const names = rules.map((r) => r.name)
      expect(names).toContain('no-circular-deps')
    })

    test('severity warning includes prefer-const', async () => {
      const rules = await jsonRules({ severity: 'warning' })
      const names = rules.map((r) => r.name)
      expect(names).toContain('prefer-const')
    })
  })

  describe('JSON output - search filtering', () => {
    test('search loop returns 1 rule', async () => {
      const rules = await jsonRules({ search: 'loop' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-await-in-loop')
    })

    test('search eval returns 1 rule', async () => {
      const rules = await jsonRules({ search: 'eval' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-eval')
    })

    test('search circular returns 1 rule', async () => {
      const rules = await jsonRules({ search: 'circular' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-circular-deps')
    })

    test('search is case insensitive with uppercase', async () => {
      const rules = await jsonRules({ search: 'LOOP' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-await-in-loop')
    })

    test('search is case insensitive with mixed case', async () => {
      const rules = await jsonRules({ search: 'LooP' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-await-in-loop')
    })

    test('search with no match returns empty array', async () => {
      const rules = await jsonRules({ search: 'xyznonexistent' })
      expect(rules).toHaveLength(0)
    })

    test('search const returns prefer-const', async () => {
      const rules = await jsonRules({ search: 'const' })
      expect(rules.length).toBeGreaterThan(0)
      expect(rules.every((r) => r.description.toLowerCase().includes('const'))).toBe(true)
    })

    test('search import returns import-related rules', async () => {
      const rules = await jsonRules({ search: 'import' })
      expect(rules.length).toBeGreaterThan(0)
      const names = rules.map((r) => r.name)
      expect(names).toContain('no-circular-deps')
      expect(names).toContain('no-duplicate-imports')
    })

    test('search return returns multiple rules', async () => {
      const rules = await jsonRules({ search: 'return' })
      expect(rules.length).toBeGreaterThanOrEqual(2)
    })

    test('search disallow returns rules with disallow in description', async () => {
      const rules = await jsonRules({ search: 'disallow' })
      expect(rules.length).toBeGreaterThan(0)
      expect(rules.every((r) => r.description.toLowerCase().includes('disallow'))).toBe(true)
    })

    test('search code returns rules with code in description', async () => {
      const rules = await jsonRules({ search: 'code' })
      expect(rules.length).toBeGreaterThanOrEqual(2)
    })

    test('search regular returns no-unsafe-regex', async () => {
      const rules = await jsonRules({ search: 'regular' })
      expect(rules.length).toBeGreaterThan(0)
      const names = rules.map((r) => r.name)
      expect(names).toContain('no-unsafe-regex')
    })

    test('search await returns no-await-in-loop', async () => {
      const rules = await jsonRules({ search: 'await' })
      expect(rules.some((r) => r.name === 'no-await-in-loop')).toBe(true)
    })

    test('search template returns prefer-template', async () => {
      const rules = await jsonRules({ search: 'template' })
      expect(rules.some((r) => r.name === 'prefer-template')).toBe(true)
    })
  })

  describe('Table output - structure', () => {
    test('contains top border', async () => {
      const output = await capture({})
      expect(output).toContain('\u250C')
    })

    test('contains bottom border', async () => {
      const output = await capture({})
      expect(output).toContain('\u2514')
    })

    test('contains header separator', async () => {
      const output = await capture({})
      expect(output).toContain('\u251C')
    })

    test('contains Rule header', async () => {
      const output = await capture({})
      expect(output).toContain(' Rule')
    })

    test('contains Category header', async () => {
      const output = await capture({})
      expect(output).toContain(' Category')
    })

    test('contains Severity header', async () => {
      const output = await capture({})
      expect(output).toContain(' Severity')
    })

    test('contains Description header', async () => {
      const output = await capture({})
      expect(output).toContain(' Description')
    })

    test('contains Fixable header', async () => {
      const output = await capture({})
      expect(output).toContain(' Fixable')
    })

    test('contains vertical border characters', async () => {
      const output = await capture({})
      expect(output).toContain('\u2502')
    })

    test('contains total count with number', async () => {
      const output = await capture({})
      expect(output).toContain('Total: 16 rules')
    })

    test('contains legend line', async () => {
      const output = await capture({})
      expect(output).toContain('★ = recommended, ✓ = fixable')
    })

    test('ends with empty line after table', async () => {
      await capture({})
      const calls = mockConsoleLog.mock.calls.map((c: unknown[]) => String(c[0]))
      const emptyLineIndex = calls.findIndex((c) => c === '')
      expect(emptyLineIndex).toBeGreaterThan(-1)
    })
  })

  describe('Table output - rule content', () => {
    test('contains rule name max-complexity', async () => {
      const output = await capture({})
      expect(output).toContain('max-complexity')
    })

    test('contains rule name no-eval', async () => {
      const output = await capture({})
      expect(output).toContain('no-eval')
    })

    test('contains category name security', async () => {
      const output = await capture({})
      expect(output).toContain('security')
    })

    test('contains category name dependencies', async () => {
      const output = await capture({})
      expect(output).toContain('dependencies')
    })

    test('contains category name correctness', async () => {
      const output = await capture({})
      expect(output).toContain('correctness')
    })

    test('contains category name style', async () => {
      const output = await capture({})
      expect(output).toContain('style')
    })

    test('contains recommended star character', async () => {
      const output = await capture({})
      expect(output).toContain('\u2605')
    })

    test('contains fixable checkmark character', async () => {
      const output = await capture({})
      expect(output).toContain('\u2713')
    })

    test('contains non-fixable cross character', async () => {
      const output = await capture({})
      expect(output).toContain('\u2717')
    })

    test('long description is truncated with ellipsis', async () => {
      const output = await capture({})
      expect(output).toContain('...')
    })
  })

  describe('Table output - filtering', () => {
    test('category filter shows only matching rules', async () => {
      const output = await capture({ category: 'security' })
      expect(output).toContain('no-eval')
      expect(output).toContain('no-unsafe-regex')
      expect(output).not.toContain('max-complexity')
    })

    test('category filter updates total count', async () => {
      const output = await capture({ category: 'security' })
      expect(output).toContain('Total: 2 rules')
    })

    test('fixable filter shows only fixable rules in table', async () => {
      const output = await capture({ fixable: true })
      expect(output).toContain('Total: 6 rules')
      expect(output).toContain('max-params')
      expect(output).not.toContain('max-complexity')
    })

    test('search filter works in table mode', async () => {
      const output = await capture({ search: 'loop' })
      expect(output).toContain('no-await-in-loop')
      expect(output).toContain('Total: 1 rules')
    })

    test('severity filter works in table mode', async () => {
      const output = await capture({ severity: 'error' })
      expect(output).toContain('no-eval')
      expect(output).toContain('Total: 4 rules')
    })

    test('severity warning filter in table mode', async () => {
      const output = await capture({ severity: 'warning' })
      expect(output).toContain('Total: 5 rules')
    })

    test('severity info filter in table mode', async () => {
      const output = await capture({ severity: 'info' })
      expect(output).toContain('Total: 7 rules')
    })

    test('search with no results shows zero count', async () => {
      const output = await capture({ search: 'xyznonexistent' })
      expect(output).toContain('Total: 0 rules')
    })

    test('empty filtered table still has header', async () => {
      const output = await capture({ search: 'xyznonexistent' })
      expect(output).toContain('Rule')
      expect(output).toContain('Category')
    })

    test('category correctness filter in table', async () => {
      const output = await capture({ category: 'correctness' })
      expect(output).toContain('consistent-return')
      expect(output).toContain('no-dead-code')
      expect(output).toContain('Total: 2 rules')
    })

    test('category patterns filter in table', async () => {
      const output = await capture({ category: 'patterns' })
      expect(output).toContain('no-magic-numbers')
      expect(output).toContain('Total: 2 rules')
    })

    test('combined category and severity in table', async () => {
      const output = await capture({ category: 'security', severity: 'error' })
      expect(output).toContain('no-eval')
      expect(output).toContain('Total: 1 rules')
    })
  })

  describe('Combined filters - JSON', () => {
    test('category + fixable', async () => {
      const rules = await jsonRules({ category: 'style', fixable: true })
      expect(rules.length).toBeGreaterThan(0)
      expect(rules.every((r) => r.category === 'style' && r.fixable)).toBe(true)
    })

    test('category + severity', async () => {
      const rules = await jsonRules({ category: 'security', severity: 'error' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-eval')
    })

    test('category + search', async () => {
      const rules = await jsonRules({ category: 'dependencies', search: 'circular' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-circular-deps')
    })

    test('fixable + severity', async () => {
      const rules = await jsonRules({ fixable: true, severity: 'warning' })
      expect(rules).toHaveLength(3)
      expect(rules.every((r) => r.fixable && r.severity === 'warning')).toBe(true)
    })

    test('fixable + search', async () => {
      const rules = await jsonRules({ fixable: true, search: 'ternary' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-nested-ternary')
    })

    test('severity + search', async () => {
      const rules = await jsonRules({ severity: 'error', search: 'eval' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-eval')
    })

    test('category + fixable + severity', async () => {
      const rules = await jsonRules({ category: 'style', fixable: true, severity: 'warning' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('prefer-const')
    })

    test('all four filters combined', async () => {
      const rules = await jsonRules({
        category: 'style',
        fixable: true,
        severity: 'warning',
        search: 'const',
      })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('prefer-const')
    })

    test('category complexity + fixable returns fixable complexity rules', async () => {
      const rules = await jsonRules({ category: 'complexity', fixable: true })
      const names = rules.map((r) => r.name)
      expect(names).toContain('max-params')
      expect(names).toContain('no-nested-ternary')
    })

    test('category correctness + severity error', async () => {
      const rules = await jsonRules({ category: 'correctness', severity: 'error' })
      expect(rules).toHaveLength(2)
    })

    test('fixable + severity info returns fixable info rules', async () => {
      const rules = await jsonRules({ fixable: true, severity: 'info' })
      expect(rules).toHaveLength(3)
      expect(rules.every((r) => r.fixable && r.severity === 'info')).toBe(true)
    })

    test('combined filters producing empty result', async () => {
      const rules = await jsonRules({
        category: 'security',
        fixable: true,
        severity: 'error',
        search: 'nonexistent',
      })
      expect(rules).toHaveLength(0)
    })

    test('category + severity with no match returns empty', async () => {
      const rules = await jsonRules({ category: 'performance', severity: 'error' })
      expect(rules).toHaveLength(0)
    })

    test('fixable + severity error returns empty (no fixable error rules)', async () => {
      const rules = await jsonRules({ fixable: true, severity: 'error' })
      expect(rules).toHaveLength(0)
    })

    test('search + severity with intersection', async () => {
      const rules = await jsonRules({ search: 'disallow', severity: 'error' })
      expect(rules.length).toBeGreaterThan(0)
      expect(rules.every((r) => r.severity === 'error')).toBe(true)
    })

    test('category dependencies + fixable true', async () => {
      const rules = await jsonRules({ category: 'dependencies', fixable: true })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-duplicate-imports')
    })
  })

  describe('Edge cases', () => {
    test('run completes without error for empty category result', async () => {
      const rules = await jsonRules({ category: 'style', severity: 'error' })
      expect(rules).toHaveLength(0)
    })

    test('search with uppercase is case insensitive', async () => {
      const rules = await jsonRules({ search: 'EVAL' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-eval')
    })

    test('undefined category does not filter', async () => {
      const rules = await jsonRules({ category: undefined })
      expect(rules).toHaveLength(16)
    })

    test('undefined search does not filter', async () => {
      const rules = await jsonRules({ search: undefined })
      expect(rules).toHaveLength(16)
    })

    test('undefined severity does not filter', async () => {
      const rules = await jsonRules({ severity: undefined })
      expect(rules).toHaveLength(16)
    })

    test('fixable false does not filter', async () => {
      const rules = await jsonRules({ fixable: false })
      expect(rules).toHaveLength(16)
    })

    test('command can be instantiated', () => {
      const cmd = new Rules([], {} as never)
      expect(cmd).toBeDefined()
    })

    test('run method returns a promise', async () => {
      const cmd = createCmd(fullFlags())
      const result = cmd.run()
      expect(result).toBeInstanceOf(Promise)
      await result
    })

    test('JSON output contains severity field in every rule', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.severity === 'string')).toBe(true)
    })

    test('JSON output contains recommended field in every rule', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.recommended === 'boolean')).toBe(true)
    })

    test('parse is called once during run', async () => {
      const cmd = createCmd(fullFlags({ format: 'json' }))
      await cmd.run()
      const mocked = cmd as unknown as { parse: ReturnType<typeof vi.fn> }
      expect(mocked.parse).toHaveBeenCalledOnce()
    })
  })

  describe('Run - format switching', () => {
    test('format json does not output table headers', async () => {
      const output = await capture({ format: 'json' })
      expect(output).not.toContain('\u2502')
      expect(output).not.toContain('Rule')
    })

    test('format table does not output raw JSON', async () => {
      const output = await capture({ format: 'table' })
      expect(output.startsWith('[')).toBe(false)
      expect(output.startsWith('{')).toBe(false)
    })

    test('format json with filters still produces valid JSON', async () => {
      const output = await capture({ format: 'json', category: 'security' })
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(2)
    })

    test('table format with all filters', async () => {
      const output = await capture({
        format: 'table',
        category: 'security',
        severity: 'warning',
      })
      expect(output).toContain('no-unsafe-regex')
      expect(output).toContain('Total: 1 rules')
    })
  })

  describe('Table output - description truncation', () => {
    test('long description appears truncated in table', async () => {
      const output = await capture({})
      const fullDesc =
        'This is a very long description that exceeds the normal column width and should be truncated in table output when it goes beyond the maximum description column width'
      expect(output).not.toContain(fullDesc)
    })

    test('short description appears in full in table', async () => {
      const output = await capture({})
      expect(output).toContain('Disallow the use of eval')
    })
  })

  describe('JSON output - field types', () => {
    test('name field is string', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.name === 'string')).toBe(true)
    })

    test('category field is string', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.category === 'string')).toBe(true)
    })

    test('description field is string', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.description === 'string')).toBe(true)
    })

    test('fixable field is boolean', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.fixable === 'boolean')).toBe(true)
    })

    test('recommended field is boolean', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.recommended === 'boolean')).toBe(true)
    })

    test('severity field is string', async () => {
      const rules = await jsonRules()
      expect(rules.every((r) => typeof r.severity === 'string')).toBe(true)
    })
  })

  describe('Search behavior - edge cases', () => {
    test('search for single character matches descriptions containing it', async () => {
      const rules = await jsonRules({ search: 'a' })
      expect(rules.every((r) => r.description.toLowerCase().includes('a'))).toBe(true)
    })

    test('search preserves alphabetical sorting', async () => {
      const rules = await jsonRules({ search: 'disallow' })
      const names = rules.map((r) => r.name)
      const sorted = [...names].sort()
      expect(names).toEqual(sorted)
    })

    test('search term found in middle of description', async () => {
      const rules = await jsonRules({ search: 'inside' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-await-in-loop')
    })

    test('search term found at start of description', async () => {
      const rules = await jsonRules({ search: 'enforce' })
      expect(rules.length).toBeGreaterThan(0)
      expect(rules.every((r) => r.description.toLowerCase().startsWith('enforce'))).toBe(true)
    })

    test('search applies after category filter', async () => {
      const rules = await jsonRules({ category: 'complexity', search: 'parameters' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('max-params')
    })

    test('search applies after fixable filter', async () => {
      const rules = await jsonRules({ fixable: true, search: 'import' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('no-duplicate-imports')
    })

    test('search applies after severity filter', async () => {
      const rules = await jsonRules({ severity: 'error', search: 'return' })
      expect(rules).toHaveLength(2)
      const names = rules.map((r) => r.name)
      expect(names).toContain('consistent-return')
      expect(names).toContain('no-dead-code')
    })

    test('search result count reflects all prior filters', async () => {
      const allRules = await jsonRules({ category: 'complexity' })
      const filteredRules = await jsonRules({ category: 'complexity', search: 'param' })
      expect(filteredRules.length).toBeLessThanOrEqual(allRules.length)
    })
  })

  describe('Severity filtering - details', () => {
    test('error severity rules include no-eval no-circular-deps consistent-return no-dead-code', async () => {
      const rules = await jsonRules({ severity: 'error' })
      const names = rules.map((r) => r.name).sort()
      expect(names).toEqual(['consistent-return', 'no-circular-deps', 'no-dead-code', 'no-eval'])
    })

    test('warning severity rules are correct', async () => {
      const rules = await jsonRules({ severity: 'warning' })
      const names = rules.map((r) => r.name).sort()
      expect(names).toEqual([
        'no-console',
        'no-duplicate-imports',
        'no-nested-ternary',
        'no-unsafe-regex',
        'prefer-const',
      ])
    })

    test('info severity rules include rules without explicit severity', async () => {
      const rules = await jsonRules({ severity: 'info' })
      const names = rules.map((r) => r.name)
      expect(names).toContain('max-complexity')
      expect(names).toContain('max-params')
      expect(names).toContain('no-await-in-loop')
    })

    test('severity filter produces valid JSON for each level', async () => {
      for (const sev of ['error', 'warning', 'info']) {
        const output = await capture({ format: 'json', severity: sev })
        const parsed = JSON.parse(output)
        expect(Array.isArray(parsed)).toBe(true)
        expect(parsed.every((r: MockRuleInfo) => r.severity === sev)).toBe(true)
      }
    })
  })

  describe('Table output - multiple log calls', () => {
    test('table output uses multiple log calls', async () => {
      mockConsoleLog.mockClear()
      const cmd = createCmd(fullFlags())
      await cmd.run()
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(5)
    })

    test('last log call contains legend', async () => {
      const cmd = createCmd(fullFlags())
      await cmd.run()
      const lastCall = mockConsoleLog.mock.calls[mockConsoleLog.mock.calls.length - 1]
      expect(String(lastCall[0])).toContain('recommended')
    })

    test('second to last log call contains total', async () => {
      const cmd = createCmd(fullFlags())
      await cmd.run()
      const totalCall = mockConsoleLog.mock.calls[mockConsoleLog.mock.calls.length - 2]
      expect(String(totalCall[0])).toContain('Total:')
    })

    test('JSON output uses single log call', async () => {
      mockConsoleLog.mockClear()
      const cmd = createCmd(fullFlags({ format: 'json' }))
      await cmd.run()
      expect(mockConsoleLog.mock.calls.length).toBe(1)
    })
  })

  describe('Filter interaction - order independence', () => {
    test('category then fixable same as fixable then category', async () => {
      const result1 = await jsonRules({ category: 'style', fixable: true })
      const count1 = result1.length
      const result2 = await jsonRules({ fixable: true, category: 'style' })
      expect(result2).toHaveLength(count1)
    })

    test('all filters AND together correctly', async () => {
      const rules = await jsonRules({
        category: 'dependencies',
        fixable: true,
        severity: 'warning',
        search: 'import',
      })
      for (const rule of rules) {
        expect(rule.category).toBe('dependencies')
        expect(rule.fixable).toBe(true)
        expect(rule.severity).toBe('warning')
        expect(rule.description.toLowerCase()).toContain('import')
      }
    })
  })
})
