import { afterEach, describe, expect, it, vi } from 'vitest'

const mockLoadRules = vi.fn()

vi.mock('../../src/rules/lazy-loader.js', () => ({
  ALL_RULE_IDS: ['no-eval', 'no-console', 'max-params', 'prefer-const', 'no-unused-vars', 'no-undef'],
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
      'prefer-const': 'patterns',
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

vi.mock('../../src/commands/explain-helpers.js', () => ({
  displayExplainOutput: vi.fn(),
  getBestPractices: vi.fn(() => ['Follow the rule consistently', 'Enable auto-fix when available']),
  getExamples: vi.fn(() => [{ description: 'Example', bad: 'eval(x)', good: 'JSON.parse(x)' }]),
  getRelatedRules: vi.fn(() => ['no-implied-eval', 'no-new-func']),
}))

import Explain from '../../src/commands/explain.js'

import { lazyRuleLoader } from '../../src/rules/lazy-loader.js'
import { findClosestMatches } from '../../src/utils/string-similarity.js'
import {
  displayExplainOutput,
  getBestPractices,
  getExamples,
  getRelatedRules,
} from '../../src/commands/explain-helpers.js'
import { getRuleCategory } from '../../src/rules/categories.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createExplainCommand(overrides: Record<string, unknown> = {}): { command: Explain; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Explain.prototype) as Explain
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
  category: 'security' as const,
  description: 'Disallow the use of eval()',
  docs: { description: 'Disallow the use of eval()', url: 'https://example.com/no-eval' },
  name: 'no-eval',
  recommended: true,
  severity: 'error' as const,
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Static properties ───

describe('Explain command static properties', () => {
  it('has correct description', () => {
    expect(Explain.description).toBe('Explain a specific rule in detail')
  })

  it('defines rule-id arg as required', () => {
    const ruleIdArg = Explain.args!['rule-id'] as Record<string, unknown>
    expect(ruleIdArg).toBeDefined()
    expect(ruleIdArg.required).toBe(true)
  })

  it('defines at least 2 examples', () => {
    expect(Explain.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Explain.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── run() - found rule ───

describe('Explain run() - rule found', () => {
  it('loads the specified rule via lazyRuleLoader', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-eval' } })
    mockLoadRules.mockResolvedValue({ 'no-eval': { meta: sampleRuleMeta } })

    await command.run()

    expect(mockLoadRules).toHaveBeenCalledWith(['no-eval'])
  })

  it('calls getRuleCategory when rule meta has no category', async () => {
    const { command } = createExplainCommand()
    const metaNoCategory = { ...sampleRuleMeta, category: undefined as unknown as 'security' }
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-eval' } })
    mockLoadRules.mockResolvedValue({ 'no-eval': { meta: metaNoCategory } })

    await command.run()

    expect(getRuleCategory).toHaveBeenCalledWith('no-eval')
  })

  it('calls getExamples with the rule id', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-eval' } })
    mockLoadRules.mockResolvedValue({ 'no-eval': { meta: sampleRuleMeta } })

    await command.run()

    expect(getExamples).toHaveBeenCalledWith('no-eval')
  })

  it('calls getBestPractices with the rule id', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-eval' } })
    mockLoadRules.mockResolvedValue({ 'no-eval': { meta: sampleRuleMeta } })

    await command.run()

    expect(getBestPractices).toHaveBeenCalledWith('no-eval')
  })

  it('calls getRelatedRules with rule id and category', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-eval' } })
    mockLoadRules.mockResolvedValue({ 'no-eval': { meta: sampleRuleMeta } })

    await command.run()

    expect(getRelatedRules).toHaveBeenCalledWith('no-eval', 'security')
  })

  it('calls displayExplainOutput with all gathered data', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-eval' } })
    mockLoadRules.mockResolvedValue({ 'no-eval': { meta: sampleRuleMeta } })

    await command.run()

    expect(displayExplainOutput).toHaveBeenCalledWith(
      'no-eval',
      'security',
      sampleRuleMeta,
      expect.any(Array),
      expect.any(Array),
      expect.any(Array),
      expect.any(Function),
    )
  })

  it('uses rule meta category when available', async () => {
    const { command } = createExplainCommand()
    const metaWithCategory = { ...sampleRuleMeta, category: 'patterns' as const }
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-console' } })
    mockLoadRules.mockResolvedValue({ 'no-console': { meta: metaWithCategory } })

    await command.run()

    expect(getRelatedRules).toHaveBeenCalledWith('no-console', 'patterns')
  })
})

// ─── run() - rule not found ───

describe('Explain run() - rule not found', () => {
  it('errors when rule is not found in loaded rules', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'nonexistent-rule' } })
    mockLoadRules.mockResolvedValue({})

    await expect(command.run()).rejects.toThrow('not found')
  })

  it('includes "not found" in error message', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'nonexistent-rule' } })
    mockLoadRules.mockResolvedValue({})

    await expect(command.run()).rejects.toThrow()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('not found')
  })

  it('calls findClosestMatches for fuzzy suggestions', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'nonexistent-rule' } })
    mockLoadRules.mockResolvedValue({})

    await expect(command.run()).rejects.toThrow()

    expect(findClosestMatches).toHaveBeenCalledWith('nonexistent-rule', expect.any(Array), {
      limit: 3,
      minScore: 0.4,
    })
  })

  it('includes "Did you mean" in error when suggestions found', async () => {
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'no-evl' } })
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
    const { command } = createExplainCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { 'rule-id': 'xyz' } })
    mockLoadRules.mockResolvedValue({})
    vi.mocked(findClosestMatches).mockReturnValue([])

    await expect(command.run()).rejects.toThrow()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).not.toContain('Did you mean')
    expect(errorMsg).toContain('rules')
  })
})
