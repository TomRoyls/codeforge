import { afterEach, describe, expect, it, vi } from 'vitest'

const mockLoadRules = vi.fn()

vi.mock('../../src/rules/lazy-loader.js', () => ({
  ALL_RULE_IDS: ['no-eval', 'no-console', 'max-params', 'prefer-const', 'max-depth', 'no-unused-vars'],
  lazyRuleLoader: {
    loadRules: (...args: unknown[]) => mockLoadRules(...args),
  },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn((ruleId: string) => {
    const map: Record<string, string> = {
      'no-eval': 'security',
      'no-console': 'patterns',
      'max-params': 'complexity',
      'max-depth': 'complexity',
    }
    return map[ruleId] ?? 'patterns'
  }),
}))

vi.mock('../../src/utils/string-similarity.js', () => ({
  findClosestMatches: vi.fn((_input: string, candidates: string[], options: Record<string, unknown>) => {
    const minScore = (options.minScore as number) ?? 0.3
    const limit = (options.limit as number) ?? 5
    const results = candidates
      .filter((c) => c.length > 2)
      .slice(0, limit)
      .map((c) => ({ candidate: c, score: 0.5 + Math.random() * 0.5 }))
    return results.filter((r) => r.score >= minScore)
  }),
}))

vi.mock('../../src/commands/why-helpers.js', () => ({
  analyzeViolation: vi.fn((_ruleId: string, violation: string) => {
    const suggestions: string[] = []
    if (violation.includes('parameter')) {
      suggestions.push('Consider grouping related parameters into an options object')
    }
    if (suggestions.length === 0) {
      suggestions.push('Review the rule documentation for specific guidance')
    }
    return suggestions
  }),
  formatBestPractices: vi.fn((_ruleId: string, logFn: (msg: string) => void) => {
    logFn('  • Follow general code quality guidelines')
  }),
  formatCommonViolations: vi.fn((_ruleId: string, logFn: (msg: string) => void) => {
    logFn('  • Using too many parameters in a function')
  }),
  formatFixes: vi.fn((_ruleId: string, logFn: (msg: string) => void) => {
    logFn('  • Extract parameters into an options object')
  }),
}))

import Why from '../../src/commands/why.js'

import { lazyRuleLoader } from '../../src/rules/lazy-loader.js'
import { findClosestMatches } from '../../src/utils/string-similarity.js'
import {
  analyzeViolation,
  formatBestPractices,
  formatCommonViolations,
  formatFixes,
} from '../../src/commands/why-helpers.js'
import { getRuleCategory } from '../../src/rules/categories.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createWhyCommand(overrides: Record<string, unknown> = {}): { command: Why; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Why.prototype) as Why
  Object.assign(command, {
    config: { bin: 'codeforge' },
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    error: vi.fn((msg: string) => {
      throw new Error(msg)
    }),
    parse: vi.fn(),
    ...overrides,
  })
  return { command, logs }
}

const sampleRuleMeta = {
  category: 'complexity' as const,
  description: 'Enforce a maximum number of parameters in function definitions',
  name: 'max-params',
  recommended: true,
  severity: 'warning' as const,
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Static properties ───

describe('Why command static properties', () => {
  it('has correct description', () => {
    expect(Why.description).toBe('Explain why a specific rule violation occurs and how to fix it')
  })

  it('defines ruleId arg as required', () => {
    const ruleIdArg = Why.args!.ruleId as Record<string, unknown>
    expect(ruleIdArg).toBeDefined()
    expect(ruleIdArg.required).toBe(true)
  })

  it('has violation flag with char v', () => {
    const violationFlag = Why.flags!.violation as Record<string, unknown>
    expect(violationFlag).toBeDefined()
    expect(violationFlag.char).toBe('v')
  })

  it('defines at least 2 examples', () => {
    expect(Why.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Why.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── run() - rule found without violation flag ───

describe('Why run() - rule found, no violation flag', () => {
  it('loads the specified rule via lazyRuleLoader', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    expect(mockLoadRules).toHaveBeenCalledWith(['max-params'])
  })

  it('logs rule id and category', async () => {
    const { command, logs } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    const plain = logs.map(stripAnsi).join('\n')
    expect(plain).toContain('Rule: max-params')
    expect(plain).toContain('Category:')
  })

  it('logs rule description when present', async () => {
    const { command, logs } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    const plain = logs.map(stripAnsi).join('\n')
    expect(plain).toContain('Description')
    expect(plain).toContain('maximum number of parameters')
  })

  it('calls formatCommonViolations with rule id', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    expect(formatCommonViolations).toHaveBeenCalledWith('max-params', expect.any(Function))
  })

  it('calls formatFixes with rule id', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    expect(formatFixes).toHaveBeenCalledWith('max-params', expect.any(Function))
  })

  it('calls formatBestPractices with rule id', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    expect(formatBestPractices).toHaveBeenCalledWith('max-params', expect.any(Function))
  })

  it('logs hint to run explain command', async () => {
    const { command, logs } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    const plain = logs.map(stripAnsi).join('\n')
    expect(plain).toContain('codeforge explain max-params')
    expect(plain).toContain('more details')
  })
})

// ─── run() - rule found with violation flag ───

describe('Why run() - rule found with --violation', () => {
  it('logs the specific violation message', async () => {
    const { command, logs } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { ruleId: 'max-params' },
      flags: { violation: 'Function has too many parameter arguments' },
    })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    const plain = logs.map(stripAnsi).join('\n')
    expect(plain).toContain('Your specific violation')
    expect(plain).toContain('Function has too many parameter arguments')
  })

  it('calls analyzeViolation with rule id and violation', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { ruleId: 'max-params' },
      flags: { violation: 'Too many parameter in function' },
    })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    expect(analyzeViolation).toHaveBeenCalledWith('max-params', 'Too many parameter in function')
  })

  it('logs violation analysis suggestions', async () => {
    const { command, logs } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { ruleId: 'max-params' },
      flags: { violation: 'Too many parameter in function' },
    })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: sampleRuleMeta } })

    await command.run()

    const plain = logs.map(stripAnsi).join('\n')
    expect(plain).toContain('grouping related parameters')
  })
})

// ─── run() - rule not found ───

describe('Why run() - rule not found', () => {
  it('errors when rule is not found', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'nonexistent-rule' }, flags: {} })
    mockLoadRules.mockResolvedValue({})

    await expect(command.run()).rejects.toThrow('not found')
  })

  it('includes "not found" in error message', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'nonexistent-rule' }, flags: {} })
    mockLoadRules.mockResolvedValue({})

    await expect(command.run()).rejects.toThrow()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('not found')
  })

  it('calls findClosestMatches for fuzzy suggestions', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'nonexistent-rule' }, flags: {} })
    mockLoadRules.mockResolvedValue({})

    await expect(command.run()).rejects.toThrow()

    expect(findClosestMatches).toHaveBeenCalledWith('nonexistent-rule', expect.any(Array), {
      limit: 3,
      minScore: 0.4,
    })
  })

  it('includes "Did you mean" in error when suggestions found', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'no-evl' }, flags: {} })
    mockLoadRules.mockResolvedValue({})
    vi.mocked(findClosestMatches).mockReturnValue([
      { candidate: 'no-eval', score: 0.85 },
    ])

    await expect(command.run()).rejects.toThrow()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('Did you mean')
    expect(errorMsg).toContain('no-eval')
  })

  it('omits "Did you mean" when no suggestions found', async () => {
    const { command } = createWhyCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'zzz' }, flags: {} })
    mockLoadRules.mockResolvedValue({})
    vi.mocked(findClosestMatches).mockReturnValue([])

    await expect(command.run()).rejects.toThrow()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).not.toContain('Did you mean')
    expect(errorMsg).toContain('rules')
  })

  it('references bin name in error message', async () => {
    const { command } = createWhyCommand({ config: { bin: 'codeforge' } })
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'nonexistent' }, flags: {} })
    mockLoadRules.mockResolvedValue({})
    vi.mocked(findClosestMatches).mockReturnValue([])

    await expect(command.run()).rejects.toThrow()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('codeforge')
  })
})

// ─── run() - rule without description ───

describe('Why run() - rule without description', () => {
  it('omits description section when rule has no description', async () => {
    const { command, logs } = createWhyCommand()
    const metaNoDesc = { ...sampleRuleMeta, description: undefined }
    vi.mocked(command.parse).mockResolvedValue({ args: { ruleId: 'max-params' }, flags: {} })
    mockLoadRules.mockResolvedValue({ 'max-params': { meta: metaNoDesc } })

    await command.run()

    const plain = logs.map(stripAnsi).join('\n')
    expect(plain).not.toContain('Description:')
  })
})
