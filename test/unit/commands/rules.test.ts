import { describe, test, expect, beforeEach, vi } from 'vitest'

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
})
