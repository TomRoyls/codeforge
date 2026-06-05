import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SuggestRules from '../../src/commands/suggest-rules.js'

// ─── Top-level mocks ───

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue(''),
}))

vi.mock('ora', () => ({
  default: () => ({
    fail: vi.fn().mockReturnThis(),
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    text: '',
  }),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn((ruleId: string) => {
    const map: Record<string, string> = {
      'eq-eq-eq': 'patterns',
      'max-depth': 'complexity',
      'max-lines-per-function': 'complexity',
      'no-async-without-await': 'patterns',
      'no-console': 'patterns',
      'no-duplicate-code': 'patterns',
      'no-eval': 'security',
      'no-explicit-any': 'patterns',
      'no-magic-numbers': 'patterns',
      'no-unsafe-type-assertion': 'security',
      'prefer-const': 'patterns',
      'prefer-nullish-coalescing': 'patterns',
    }
    return map[ruleId] ?? 'patterns'
  }),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface SuggestRulesPrivate {
  addSuggestion: (
    suggestionMap: Map<string, unknown>,
    ruleId: string,
    matches: number,
    suggested: { confidence: string; impact: string; reason: string; ruleId: string },
  ) => void
  analyzeFile: (content: string, suggestionMap: Map<string, unknown>) => void
  displaySuggestions: (suggestions: Array<Record<string, unknown>>, verbose: boolean) => void
  filterSuggestions: (
    suggestions: Array<Record<string, unknown>>,
    flags: { impact: string },
  ) => Array<Record<string, unknown>>
  findMatches: (content: string, pattern: RegExp | string) => number
  log: (...args: unknown[]) => void
  sortSuggestions: (suggestions: Array<Record<string, unknown>>) => Array<Record<string, unknown>>
}

function createInstance(): { command: SuggestRules; p: SuggestRulesPrivate; logs: string[] } {
  const logs: string[] = []
  const command = new SuggestRules([], {} as never)
  const p = command as unknown as SuggestRulesPrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, p, logs }
}

// ─── Static properties ───

describe('SuggestRules command static properties', () => {
  it('has correct description', () => {
    expect(SuggestRules.description).toBe(
      'Analyze codebase and suggest which rules would be most beneficial',
    )
  })

  it('has examples defined', () => {
    expect(SuggestRules.examples).toBeDefined()
    expect(SuggestRules.examples!.length).toBeGreaterThan(0)
  })

  it('defines path arg as optional string', () => {
    const pathArg = SuggestRules.args!.path
    expect(pathArg).toBeDefined()
    expect(pathArg!.default).toBe('.')
    expect(pathArg!.required).toBe(false)
  })

  it('has format flag with console default and json option', () => {
    const formatFlag = SuggestRules.flags!.format as Record<string, unknown>
    expect(formatFlag).toBeDefined()
    expect(formatFlag.default).toBe('console')
    expect(formatFlag.options).toContain('json')
    expect(formatFlag.options).toContain('console')
  })

  it('has impact flag with correct options', () => {
    const impactFlag = SuggestRules.flags!.impact as Record<string, unknown>
    expect(impactFlag).toBeDefined()
    expect(impactFlag.options).toContain('high')
    expect(impactFlag.options).toContain('medium')
    expect(impactFlag.options).toContain('low')
  })

  it('has top flag with correct default', () => {
    const topFlag = SuggestRules.flags!.top as Record<string, unknown>
    expect(topFlag).toBeDefined()
    expect(topFlag.default).toBe(15)
  })

  it('has verbose flag with char v', () => {
    const verboseFlag = SuggestRules.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })

  it('defines at least 3 examples', () => {
    expect(SuggestRules.examples!.length).toBeGreaterThanOrEqual(3)
  })

  it('each example has command and description', () => {
    for (const example of SuggestRules.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── findMatches ───

describe('findMatches', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('returns 0 when no string match found', () => {
    expect(instance.p.findMatches('const x = 1', 'console.log')).toBe(0)
  })

  it('counts string pattern occurrences', () => {
    expect(instance.p.findMatches('console.log("a"); console.log("b")', 'console.log')).toBe(2)
  })

  it('counts overlapping string patterns correctly', () => {
    expect(instance.p.findMatches('aaa', 'aa')).toBe(2)
  })

  it('returns 0 when no regex match found', () => {
    expect(instance.p.findMatches('const x = 1', /\b\d{4,}\b/)).toBe(0)
  })

  it('counts regex matches', () => {
    expect(instance.p.findMatches('eval("a") and eval("b")', /eval\(/)).toBe(2)
  })

  it('handles non-global regex by making it global', () => {
    expect(instance.p.findMatches('foo foo foo', /foo/)).toBe(3)
  })

  it('returns 0 for empty content', () => {
    expect(instance.p.findMatches('', 'anything')).toBe(0)
  })

  it('returns 0 for empty content with regex', () => {
    expect(instance.p.findMatches('', /\d+/)).toBe(0)
  })
})

// ─── addSuggestion ───

describe('addSuggestion', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('adds a new suggestion to the map', () => {
    const map = new Map<string, unknown>()
    instance.p.addSuggestion(map, 'no-eval', 5, {
      confidence: 'high',
      impact: 'high',
      reason: 'Found eval usage',
      ruleId: 'no-eval',
    })

    expect(map.size).toBe(1)
    const entry = map.get('no-eval') as Record<string, unknown>
    expect(entry.estimatedViolations).toBe(5)
    expect(entry.impact).toBe('high')
    expect(entry.confidence).toBe('high')
  })

  it('accumulates estimatedViolations for same ruleId', () => {
    const map = new Map<string, unknown>()
    instance.p.addSuggestion(map, 'no-eval', 3, {
      confidence: 'high',
      impact: 'high',
      reason: 'Found eval usage',
      ruleId: 'no-eval',
    })
    instance.p.addSuggestion(map, 'no-eval', 4, {
      confidence: 'high',
      impact: 'high',
      reason: 'Found eval usage',
      ruleId: 'no-eval',
    })

    const entry = map.get('no-eval') as Record<string, unknown>
    expect(entry.estimatedViolations).toBe(7)
  })

  it('stores category from getRuleCategory', async () => {
    const { getRuleCategory } = await import('../../src/rules/categories.js')
    const map = new Map<string, unknown>()
    instance.p.addSuggestion(map, 'no-eval', 1, {
      confidence: 'high',
      impact: 'high',
      reason: 'test',
      ruleId: 'no-eval',
    })

    expect(getRuleCategory).toHaveBeenCalledWith('no-eval')
    const entry = map.get('no-eval') as Record<string, unknown>
    expect(entry.category).toBe('security')
  })

  it('preserves reason from the suggested rule', () => {
    const map = new Map<string, unknown>()
    instance.p.addSuggestion(map, 'prefer-const', 2, {
      confidence: 'high',
      impact: 'medium',
      reason: 'Found var declarations',
      ruleId: 'prefer-const',
    })

    const entry = map.get('prefer-const') as Record<string, unknown>
    expect(entry.reason).toBe('Found var declarations')
  })

  it('handles multiple different rules independently', () => {
    const map = new Map<string, unknown>()
    instance.p.addSuggestion(map, 'no-eval', 2, {
      confidence: 'high',
      impact: 'high',
      reason: 'eval',
      ruleId: 'no-eval',
    })
    instance.p.addSuggestion(map, 'prefer-const', 4, {
      confidence: 'high',
      impact: 'medium',
      reason: 'var',
      ruleId: 'prefer-const',
    })

    expect(map.size).toBe(2)
    expect((map.get('no-eval') as Record<string, unknown>).estimatedViolations).toBe(2)
    expect((map.get('prefer-const') as Record<string, unknown>).estimatedViolations).toBe(4)
  })
})

// ─── analyzeFile ───

describe('analyzeFile', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('detects console.log patterns', () => {
    const map = new Map<string, unknown>()
    instance.p.analyzeFile('console.log("hello"); console.warn("bad")', map)

    expect(map.size).toBeGreaterThanOrEqual(1)
    expect(map.has('no-console')).toBe(true)
    const entry = map.get('no-console') as Record<string, unknown>
    expect(entry.estimatedViolations).toBe(2)
  })

  it('detects any type usage', () => {
    const map = new Map<string, unknown>()
    instance.p.analyzeFile('const x: any = 1; const y: any = 2', map)

    expect(map.has('no-explicit-any')).toBe(true)
    const entry = map.get('no-explicit-any') as Record<string, unknown>
    expect(entry.estimatedViolations).toBe(2)
  })

  it('detects var declarations', () => {
    const map = new Map<string, unknown>()
    instance.p.analyzeFile('var x = 1; var y = 2;', map)

    expect(map.has('prefer-const')).toBe(true)
  })

  it('detects eval usage', () => {
    const map = new Map<string, unknown>()
    instance.p.analyzeFile('eval("dangerous")', map)

    expect(map.has('no-eval')).toBe(true)
    const entry = map.get('no-eval') as Record<string, unknown>
    expect(entry.impact).toBe('high')
  })

  it('produces empty map for clean code', () => {
    const map = new Map<string, unknown>()
    instance.p.analyzeFile('const x = 1; const y = 2;', map)

    // Clean code should have no var, no any, no eval, no console.log
    expect(map.has('no-eval')).toBe(false)
    expect(map.has('no-explicit-any')).toBe(false)
    expect(map.has('no-console')).toBe(false)
    expect(map.has('prefer-const')).toBe(false)
  })

  it('detects loose equality', () => {
    const map = new Map<string, unknown>()
    instance.p.analyzeFile('if (a == b) {}', map)

    expect(map.has('eq-eq-eq')).toBe(true)
  })

  it('detects multiple pattern types in same content', () => {
    const map = new Map<string, unknown>()
    instance.p.analyzeFile('var x: any = eval("code"); console.log(x);', map)

    expect(map.size).toBeGreaterThanOrEqual(4)
    expect(map.has('prefer-const')).toBe(true)
    expect(map.has('no-explicit-any')).toBe(true)
    expect(map.has('no-eval')).toBe(true)
    expect(map.has('no-console')).toBe(true)
  })
})

// ─── filterSuggestions ───

describe('filterSuggestions', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('returns all suggestions when impact is empty', () => {
    const suggestions = [
      { impact: 'high', ruleId: 'a' },
      { impact: 'medium', ruleId: 'b' },
      { impact: 'low', ruleId: 'c' },
    ]

    const result = instance.p.filterSuggestions(suggestions, { impact: '' })
    expect(result).toHaveLength(3)
  })

  it('filters to high-impact only', () => {
    const suggestions = [
      { impact: 'high', ruleId: 'a' },
      { impact: 'medium', ruleId: 'b' },
      { impact: 'low', ruleId: 'c' },
    ]

    const result = instance.p.filterSuggestions(suggestions, { impact: 'high' })
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('a')
  })

  it('filters to medium-impact only', () => {
    const suggestions = [
      { impact: 'high', ruleId: 'a' },
      { impact: 'medium', ruleId: 'b' },
      { impact: 'low', ruleId: 'c' },
    ]

    const result = instance.p.filterSuggestions(suggestions, { impact: 'medium' })
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('b')
  })

  it('filters to low-impact only', () => {
    const suggestions = [
      { impact: 'high', ruleId: 'a' },
      { impact: 'medium', ruleId: 'b' },
      { impact: 'low', ruleId: 'c' },
    ]

    const result = instance.p.filterSuggestions(suggestions, { impact: 'low' })
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('c')
  })

  it('returns empty when no suggestions match impact filter', () => {
    const suggestions = [
      { impact: 'medium', ruleId: 'b' },
      { impact: 'low', ruleId: 'c' },
    ]

    const result = instance.p.filterSuggestions(suggestions, { impact: 'high' })
    expect(result).toHaveLength(0)
  })
})

// ─── sortSuggestions ───

describe('sortSuggestions', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('sorts by impact: high > medium > low', () => {
    const suggestions = [
      { confidence: 'high', estimatedViolations: 1, impact: 'low', ruleId: 'c' },
      { confidence: 'high', estimatedViolations: 1, impact: 'high', ruleId: 'a' },
      { confidence: 'high', estimatedViolations: 1, impact: 'medium', ruleId: 'b' },
    ]

    const result = instance.p.sortSuggestions(suggestions)
    expect(result[0].ruleId).toBe('a')
    expect(result[1].ruleId).toBe('b')
    expect(result[2].ruleId).toBe('c')
  })

  it('breaks ties by confidence: high > medium > low', () => {
    const suggestions = [
      { confidence: 'low', estimatedViolations: 1, impact: 'high', ruleId: 'b' },
      { confidence: 'high', estimatedViolations: 1, impact: 'high', ruleId: 'a' },
    ]

    const result = instance.p.sortSuggestions(suggestions)
    expect(result[0].ruleId).toBe('a')
    expect(result[1].ruleId).toBe('b')
  })

  it('breaks further ties by estimatedViolations descending', () => {
    const suggestions = [
      { confidence: 'high', estimatedViolations: 5, impact: 'high', ruleId: 'a' },
      { confidence: 'high', estimatedViolations: 10, impact: 'high', ruleId: 'b' },
    ]

    const result = instance.p.sortSuggestions(suggestions)
    expect(result[0].ruleId).toBe('b')
    expect(result[1].ruleId).toBe('a')
  })

  it('handles empty array', () => {
    const result = instance.p.sortSuggestions([])
    expect(result).toEqual([])
  })

  it('handles single element', () => {
    const suggestions = [
      { confidence: 'medium', estimatedViolations: 3, impact: 'medium', ruleId: 'only' },
    ]
    const result = instance.p.sortSuggestions(suggestions)
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('only')
  })
})

// ─── displaySuggestions ───

describe('displaySuggestions', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('shows "No rule suggestions found" when empty', () => {
    instance.p.displaySuggestions([], false)

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('No rule suggestions found')
  })

  it('shows Rule Suggestions header', () => {
    instance.p.displaySuggestions(
      [{ category: 'patterns', confidence: 'high', estimatedViolations: 3, impact: 'high', reason: 'test', ruleId: 'no-eval' }],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Rule Suggestions')
  })

  it('shows rule ID in output', () => {
    instance.p.displaySuggestions(
      [{ category: 'security', confidence: 'high', estimatedViolations: 5, impact: 'high', reason: 'eval usage', ruleId: 'no-eval' }],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('no-eval')
  })

  it('shows impact level in output', () => {
    instance.p.displaySuggestions(
      [{ category: 'patterns', confidence: 'high', estimatedViolations: 2, impact: 'high', reason: 'test', ruleId: 'test-rule' }],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('HIGH')
  })

  it('shows confidence level in output', () => {
    instance.p.displaySuggestions(
      [{ category: 'patterns', confidence: 'medium', estimatedViolations: 2, impact: 'high', reason: 'test', ruleId: 'test-rule' }],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('MEDIUM')
  })

  it('shows estimated violations count', () => {
    instance.p.displaySuggestions(
      [{ category: 'patterns', confidence: 'high', estimatedViolations: 7, impact: 'high', reason: 'test', ruleId: 'test-rule' }],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('~7 violations')
  })

  it('shows verbose details when verbose is true', () => {
    instance.p.displaySuggestions(
      [{ category: 'security', confidence: 'high', estimatedViolations: 1, impact: 'high', reason: 'eval found', ruleId: 'no-eval' }],
      true,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Category: security')
    expect(output).toContain('Reason: eval found')
    expect(output).toContain('codeforge analyze --rules no-eval')
  })

  it('does not show verbose details when verbose is false', () => {
    instance.p.displaySuggestions(
      [{ category: 'security', confidence: 'high', estimatedViolations: 1, impact: 'high', reason: 'eval found', ruleId: 'no-eval' }],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).not.toContain('Category:')
    expect(output).not.toContain('Reason:')
  })

  it('shows total suggestions count', () => {
    instance.p.displaySuggestions(
      [
        { category: 'patterns', confidence: 'high', estimatedViolations: 1, impact: 'high', reason: 'a', ruleId: 'rule-a' },
        { category: 'patterns', confidence: 'medium', estimatedViolations: 2, impact: 'medium', reason: 'b', ruleId: 'rule-b' },
      ],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Total: 2 rule suggestions')
  })

  it('displays multiple suggestions each on own line', () => {
    instance.p.displaySuggestions(
      [
        { category: 'patterns', confidence: 'high', estimatedViolations: 1, impact: 'high', reason: 'a', ruleId: 'rule-a' },
        { category: 'security', confidence: 'high', estimatedViolations: 1, impact: 'high', reason: 'b', ruleId: 'no-eval' },
      ],
      false,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('rule-a')
    expect(output).toContain('no-eval')
  })
})
