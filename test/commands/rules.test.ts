import { beforeEach, describe, expect, it, vi } from 'vitest'

import Rules from '../../src/commands/rules.js'

// ─── Mocks ───

const mockLoadAllRules = vi.fn().mockResolvedValue({})
const mockGetRuleCategory = vi.fn((id: string) => {
  const map: Record<string, string> = {
    'no-eval': 'security',
    'max-params': 'complexity',
    'prefer-const': 'patterns',
    'no-circular-deps': 'dependencies',
    'no-await-in-loop': 'performance',
    'expect-expect': 'testing',
  }
  return map[id] ?? 'patterns'
})
const mockMapRulesToInfo = vi.fn()
const mockFilterRules = vi.fn()
const mockFormatTable = vi.fn()

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: { loadAllRules: (...a: unknown[]) => mockLoadAllRules(...a) },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: (...a: unknown[]) => mockGetRuleCategory(...a),
}))

vi.mock('../../src/commands/rules-helpers.js', () => ({
  filterRules: (...a: unknown[]) => mockFilterRules(...a),
  formatTable: (...a: unknown[]) => mockFormatTable(...a),
  mapRulesToInfo: (...a: unknown[]) => mockMapRulesToInfo(...a),
}))

import { lazyRuleLoader } from '../../src/rules/lazy-loader.js'
import { getRuleCategory } from '../../src/rules/categories.js'
import { filterRules, formatTable, mapRulesToInfo } from '../../src/commands/rules-helpers.js'

// ─── Helpers ───

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '')

interface RulesPrivate {
  log: (...args: unknown[]) => void
  parse: () => Promise<{ flags: Record<string, unknown> }>
}

function createInstance(): { cmd: Rules; p: RulesPrivate; logs: string[] } {
  const logs: string[] = []
  const cmd = new Rules([], {} as never)
  const p = cmd as unknown as RulesPrivate
  p.log = (...args: unknown[]) => { logs.push(args.map(String).join(' ')) }
  return { cmd, p, logs }
}

function makeRuleInfo(overrides: Record<string, unknown> = {}) {
  return {
    category: overrides.category ?? 'patterns',
    description: overrides.description ?? 'A rule',
    fixable: overrides.fixable ?? false,
    name: overrides.name ?? 'test-rule',
    recommended: overrides.recommended ?? false,
    severity: overrides.severity ?? 'info',
  }
}

function resetMocks() {
  vi.clearAllMocks()
  mockLoadAllRules.mockResolvedValue({})
  mockGetRuleCategory.mockImplementation((id: string) => {
    const map: Record<string, string> = {
      'no-eval': 'security', 'max-params': 'complexity', 'prefer-const': 'patterns',
    }
    return map[id] ?? 'patterns'
  })
  mockMapRulesToInfo.mockReturnValue([])
  mockFilterRules.mockImplementation((r: unknown[]) => r)
  mockFormatTable.mockImplementation((_r: unknown[], logFn: (m: string) => void) => {
    logFn('Total: 0 rules')
    logFn('★ = recommended, ✓ = fixable')
  })
}

// ─── Static properties ───

describe('Rules command - static properties', () => {
  it('has a description', () => {
    expect(Rules.description).toBe('List all available rules')
  })

  it('defines category flag with valid options', () => {
    const categoryFlag = Rules.flags.category
    expect(categoryFlag).toBeDefined()
    expect(categoryFlag.options).toEqual([
      'complexity', 'correctness', 'dependencies', 'patterns', 'performance', 'security', 'style', 'testing',
    ])
  })

  it('defines format flag defaulting to table', () => {
    const formatFlag = Rules.flags.format
    expect(formatFlag).toBeDefined()
    expect(formatFlag.default).toBe('table')
    expect(formatFlag.options).toEqual(['json', 'table'])
  })

  it('defines fixable flag defaulting to false', () => {
    const fixableFlag = Rules.flags.fixable
    expect(fixableFlag).toBeDefined()
    expect(fixableFlag.default).toBe(false)
  })

  it('defines search flag with char s', () => {
    expect(Rules.flags.search).toBeDefined()
    expect(Rules.flags.search.char).toBe('s')
  })

  it('defines severity flag with valid options', () => {
    const severityFlag = Rules.flags.severity
    expect(severityFlag).toBeDefined()
    expect(severityFlag.options).toEqual(['error', 'warning', 'info'])
  })

  it('category flag has char c', () => {
    expect(Rules.flags.category.char).toBe('c')
  })

  it('format flag has char f', () => {
    expect(Rules.flags.format.char).toBe('f')
  })

  it('provides 5 usage examples', () => {
    expect(Rules.examples).toHaveLength(5)
  })

  it('each example has command and description', () => {
    for (const ex of Rules.examples) {
      expect(typeof ex.command).toBe('string')
      expect(typeof ex.description).toBe('string')
    }
  })
})

// ─── getRules method ───

describe('Rules command - getRules()', () => {
  beforeEach(resetMocks)

  it('calls loadAllRules and mapRulesToInfo', async () => {
    const loaded = { 'no-eval': { meta: { description: 'No eval' } } }
    mockLoadAllRules.mockResolvedValue(loaded)
    mockMapRulesToInfo.mockReturnValue([makeRuleInfo({ name: 'no-eval' })])

    const { cmd } = createInstance()
    const rules = await cmd.getRules()

    expect(mockLoadAllRules).toHaveBeenCalledOnce()
    expect(mockMapRulesToInfo).toHaveBeenCalledWith(loaded, getRuleCategory)
    expect(rules).toHaveLength(1)
    expect(rules[0]!.name).toBe('no-eval')
  })

  it('returns empty array when no rules loaded', async () => {
    mockLoadAllRules.mockResolvedValue({})
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd } = createInstance()
    const rules = await cmd.getRules()

    expect(rules).toHaveLength(0)
  })

  it('returns rules with correct shape', async () => {
    mockLoadAllRules.mockResolvedValue({})
    mockMapRulesToInfo.mockReturnValue([
      makeRuleInfo({ name: 'no-eval', category: 'security', fixable: true, recommended: true, severity: 'error', description: 'No eval' }),
    ])

    const { cmd } = createInstance()
    const rules = await cmd.getRules()
    const rule = rules[0]!

    expect(rule.name).toBe('no-eval')
    expect(rule.category).toBe('security')
    expect(rule.fixable).toBe(true)
    expect(rule.recommended).toBe(true)
    expect(rule.severity).toBe('error')
    expect(rule.description).toBe('No eval')
  })
})

// ─── run() - table output ───

describe('Rules command - run() table output', () => {
  beforeEach(resetMocks)

  it('outputs rules as table by default', async () => {
    const rules = [makeRuleInfo({ name: 'no-eval' })]
    mockMapRulesToInfo.mockReturnValue(rules)
    mockFormatTable.mockImplementation((_r: unknown[], logFn: (m: string) => void) => {
      logFn('Total: 1 rules')
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false } })

    await cmd.run()

    expect(mockFormatTable).toHaveBeenCalledWith(rules, expect.any(Function))
    expect(logs.some((l) => l.includes('Total: 1 rules'))).toBe(true)
  })

  it('calls filterRules with default empty filters', async () => {
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false } })

    await cmd.run()

    expect(mockFilterRules).toHaveBeenCalledWith([], {
      category: undefined,
      fixable: undefined,
      search: undefined,
      severity: undefined,
    })
  })
})

// ─── run() - JSON output ───

describe('Rules command - run() JSON output', () => {
  beforeEach(resetMocks)

  it('outputs rules as JSON when format=json', async () => {
    const rules = [
      makeRuleInfo({ name: 'no-eval', severity: 'error' }),
      makeRuleInfo({ name: 'max-params', severity: 'warning' }),
    ]
    mockMapRulesToInfo.mockReturnValue(rules)

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false } })

    await cmd.run()

    expect(logs).toHaveLength(1)
    const parsed = JSON.parse(logs[0]!)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].name).toBe('no-eval')
    expect(parsed[1].name).toBe('max-params')
  })

  it('JSON output includes all rule properties', async () => {
    mockMapRulesToInfo.mockReturnValue([
      makeRuleInfo({ name: 'test-rule', category: 'security', description: 'Test', fixable: true, recommended: true, severity: 'error' }),
    ])

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output[0]).toEqual({
      name: 'test-rule', category: 'security', description: 'Test',
      fixable: true, recommended: true, severity: 'error',
    })
  })

  it('JSON output is pretty-printed', async () => {
    mockMapRulesToInfo.mockReturnValue([makeRuleInfo()])

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false } })

    await cmd.run()

    expect(logs[0]!).toContain('\n')
    expect(logs[0]!).toContain('  ')
  })
})

// ─── run() - category filtering ───

describe('Rules command - run() category filter', () => {
  beforeEach(resetMocks)

  it('passes category to filterRules', async () => {
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false, category: 'security' } })

    await cmd.run()

    expect(mockFilterRules).toHaveBeenCalledWith([], {
      category: 'security',
      fixable: undefined,
      search: undefined,
      severity: undefined,
    })
  })

  it('security category returns only security rules', async () => {
    const all = [
      makeRuleInfo({ name: 'no-eval', category: 'security' }),
      makeRuleInfo({ name: 'max-params', category: 'complexity' }),
    ]
    mockMapRulesToInfo.mockReturnValue(all)
    mockFilterRules.mockImplementation((rules) => {
      return (rules as typeof all).filter((r) => r.category === 'security')
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false, category: 'security' } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(1)
    expect(output[0].category).toBe('security')
  })
})

// ─── run() - fixable filter ───

describe('Rules command - run() fixable filter', () => {
  beforeEach(resetMocks)

  it('passes fixable=true when --fixable used', async () => {
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: true } })

    await cmd.run()

    expect(mockFilterRules).toHaveBeenCalledWith([], {
      category: undefined,
      fixable: true,
      search: undefined,
      severity: undefined,
    })
  })

  it('filters to only fixable rules', async () => {
    const all = [
      makeRuleInfo({ name: 'no-eval', fixable: true }),
      makeRuleInfo({ name: 'max-params', fixable: false }),
      makeRuleInfo({ name: 'prefer-const', fixable: true }),
    ]
    mockMapRulesToInfo.mockReturnValue(all)
    mockFilterRules.mockImplementation((rules) => {
      return (rules as typeof all).filter((r) => r.fixable)
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: true } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(2)
    expect(output.every((r: { fixable: boolean }) => r.fixable)).toBe(true)
  })

  it('passes fixable=undefined when flag absent', async () => {
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false } })

    await cmd.run()

    const callArgs = mockFilterRules.mock.calls[0]!
    expect(callArgs[1].fixable).toBeUndefined()
  })
})

// ─── run() - search filter ───

describe('Rules command - run() search filter', () => {
  beforeEach(resetMocks)

  it('passes search term to filterRules', async () => {
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false, search: 'async' } })

    await cmd.run()

    expect(mockFilterRules).toHaveBeenCalledWith([], {
      category: undefined,
      fixable: undefined,
      search: 'async',
      severity: undefined,
    })
  })

  it('filters rules by keyword in description', async () => {
    const all = [
      makeRuleInfo({ name: 'no-await-in-loop', description: 'Disallow await inside loops' }),
      makeRuleInfo({ name: 'max-params', description: 'Limit function parameters' }),
    ]
    mockMapRulesToInfo.mockReturnValue(all)
    mockFilterRules.mockImplementation((rules) => {
      return (rules as typeof all).filter((r) => r.description.toLowerCase().includes('await'))
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false, search: 'await' } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(1)
    expect(output[0].name).toBe('no-await-in-loop')
  })

  it('returns empty when search matches nothing', async () => {
    mockMapRulesToInfo.mockReturnValue([makeRuleInfo({ description: 'Limit parameters' })])
    mockFilterRules.mockReturnValue([])

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false, search: 'nonexistent-xyz' } })

    await cmd.run()

    expect(JSON.parse(logs[0]!)).toEqual([])
  })
})

// ─── run() - severity filter ───

describe('Rules command - run() severity filter', () => {
  beforeEach(resetMocks)

  it('passes severity to filterRules', async () => {
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false, severity: 'error' } })

    await cmd.run()

    expect(mockFilterRules).toHaveBeenCalledWith([], {
      category: undefined,
      fixable: undefined,
      search: undefined,
      severity: 'error',
    })
  })

  it('returns only error-level rules', async () => {
    const all = [
      makeRuleInfo({ name: 'no-eval', severity: 'error' }),
      makeRuleInfo({ name: 'max-params', severity: 'warning' }),
      makeRuleInfo({ name: 'prefer-const', severity: 'info' }),
    ]
    mockMapRulesToInfo.mockReturnValue(all)
    mockFilterRules.mockImplementation((rules) => {
      return (rules as typeof all).filter((r) => r.severity === 'error')
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false, severity: 'error' } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(1)
    expect(output[0].severity).toBe('error')
  })

  it('warning filter returns only warnings', async () => {
    const all = [
      makeRuleInfo({ name: 'no-eval', severity: 'error' }),
      makeRuleInfo({ name: 'max-params', severity: 'warning' }),
    ]
    mockMapRulesToInfo.mockReturnValue(all)
    mockFilterRules.mockImplementation((rules) => {
      return (rules as typeof all).filter((r) => r.severity === 'warning')
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false, severity: 'warning' } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(1)
    expect(output[0].name).toBe('max-params')
  })
})

// ─── run() - combined filters ───

describe('Rules command - run() combined filters', () => {
  beforeEach(resetMocks)

  it('applies category and fixable together', async () => {
    const all = [
      makeRuleInfo({ name: 'no-eval', category: 'security', fixable: true }),
      makeRuleInfo({ name: 'no-hardcoded-credentials', category: 'security', fixable: false }),
      makeRuleInfo({ name: 'max-params', category: 'complexity', fixable: false }),
    ]
    mockMapRulesToInfo.mockReturnValue(all)
    mockFilterRules.mockImplementation((rules, f) => {
      let result = rules as typeof all
      if (f.category) result = result.filter((r) => r.category === f.category)
      if (f.fixable) result = result.filter((r) => r.fixable)
      return result
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: true, category: 'security' } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(1)
    expect(output[0].name).toBe('no-eval')
    expect(output[0].category).toBe('security')
    expect(output[0].fixable).toBe(true)
  })

  it('applies search and severity together', async () => {
    const all = [
      makeRuleInfo({ name: 'no-eval', description: 'Disallow eval usage', severity: 'error' }),
      makeRuleInfo({ name: 'no-eval-strings', description: 'Disallow eval in strings', severity: 'warning' }),
    ]
    mockMapRulesToInfo.mockReturnValue(all)
    mockFilterRules.mockImplementation((rules, f) => {
      let result = rules as typeof all
      if (f.search) {
        const s = (f.search as string).toLowerCase()
        result = result.filter((r) => r.description.toLowerCase().includes(s))
      }
      if (f.severity) result = result.filter((r) => r.severity === f.severity)
      return result
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false, search: 'eval', severity: 'error' } })

    await cmd.run()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(1)
    expect(output[0].name).toBe('no-eval')
  })

  it('applies all four filters simultaneously', async () => {
    mockMapRulesToInfo.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({
      flags: { format: 'json', fixable: true, category: 'security', search: 'eval', severity: 'error' },
    })

    await cmd.run()

    expect(mockFilterRules).toHaveBeenCalledWith([], {
      category: 'security',
      fixable: true,
      search: 'eval',
      severity: 'error',
    })
  })
})

// ─── run() - empty results ───

describe('Rules command - run() empty results', () => {
  beforeEach(resetMocks)

  it('outputs empty JSON array when no rules match', async () => {
    mockMapRulesToInfo.mockReturnValue([])
    mockFilterRules.mockReturnValue([])

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: false } })

    await cmd.run()

    expect(JSON.parse(logs[0]!)).toEqual([])
  })

  it('calls formatTable with empty array for table with no matches', async () => {
    mockMapRulesToInfo.mockReturnValue([])
    mockFilterRules.mockReturnValue([])

    const { cmd, p } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false } })

    await cmd.run()

    expect(mockFormatTable).toHaveBeenCalledWith([], expect.any(Function))
  })
})

// ─── Full pipeline ───

describe('Rules command - full pipeline', () => {
  beforeEach(resetMocks)

  it('loads, maps, filters, and outputs JSON', async () => {
    const loaded = { 'no-eval': { meta: { description: 'No eval' } } }
    const mapped = [
      makeRuleInfo({ name: 'no-eval', fixable: true }),
      makeRuleInfo({ name: 'prefer-const', fixable: true }),
      makeRuleInfo({ name: 'max-params', fixable: false }),
    ]
    mockLoadAllRules.mockResolvedValue(loaded)
    mockMapRulesToInfo.mockReturnValue(mapped)
    mockFilterRules.mockImplementation((rules) => {
      return (rules as typeof mapped).filter((r) => r.fixable)
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'json', fixable: true } })

    await cmd.run()

    expect(mockLoadAllRules).toHaveBeenCalledOnce()
    expect(mockMapRulesToInfo).toHaveBeenCalledWith(loaded, getRuleCategory)
    expect(mockFilterRules).toHaveBeenCalled()

    const output = JSON.parse(logs[0]!)
    expect(output).toHaveLength(2)
    expect(output.every((r: { fixable: boolean }) => r.fixable)).toBe(true)
  })

  it('table output passes filtered rules to formatTable', async () => {
    const mapped = [makeRuleInfo({ name: 'no-eval' })]
    mockMapRulesToInfo.mockReturnValue(mapped)
    mockFormatTable.mockImplementation((_r: unknown[], logFn: (m: string) => void) => {
      logFn('Total: 1 rules')
      logFn('★ = recommended, ✓ = fixable')
    })

    const { cmd, p, logs } = createInstance()
    p.parse = vi.fn().mockResolvedValue({ flags: { format: 'table', fixable: false } })

    await cmd.run()

    expect(mockFormatTable).toHaveBeenCalledWith(mapped, expect.any(Function))
    const stripped = logs.map(stripAnsi)
    expect(stripped.some((l) => l.includes('Total: 1 rules'))).toBe(true)
    expect(stripped.some((l) => l.includes('★ = recommended, ✓ = fixable'))).toBe(true)
  })
})
