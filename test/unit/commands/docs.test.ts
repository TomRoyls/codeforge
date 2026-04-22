import { describe, test, expect, beforeEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

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
        fixable: 'code' as const,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
    'deprecated-rule': {
      meta: {
        name: 'deprecated-rule',
        description: 'A deprecated rule',
        category: 'style',
        recommended: false,
        deprecated: true,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
  },
  getRuleCategory: vi.fn((ruleId: string) => {
    if (ruleId.startsWith('max-')) return 'complexity'
    if (ruleId.startsWith('no-')) return 'performance'
    return 'style'
  }),
}))

interface RuleDoc {
  category: string
  deprecated: boolean
  description: string
  fixable: boolean
  name: string
  recommended: boolean
}

describe('Docs Command', () => {
  let Docs: typeof import('../../../src/commands/docs.js').default

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    Docs = (await import('../../../src/commands/docs.js')).default
  })

  // Helper: create a testable Docs instance (exposes private methods)
  function createTestableInstance(): {
    getRules: () => RuleDoc[]
    generateRuleMarkdown: (rule: RuleDoc) => string
    groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
    getBadges: (rule: RuleDoc) => string
    generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
    generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
    generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
  } {
    return new Docs([], {} as never) as unknown as ReturnType<typeof createTestableInstance>
  }

  // Helper: create a sample rule
  function makeRule(overrides: Partial<RuleDoc> = {}): RuleDoc {
    return {
      category: 'complexity',
      deprecated: false,
      description: 'Test rule description',
      fixable: false,
      name: 'test-rule',
      recommended: false,
      ...overrides,
    }
  }

  // Helper: create command with mocked parse for run() tests
  function createCommandWithMockedParse(flags: Record<string, unknown>) {
    const command = new Docs([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: {},
      flags,
    })
    return command
  }

  // ────────────────────────────────────────────────────────────────────────
  // 1. Command metadata (18 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Docs.description).toBe('Generate markdown documentation for all rules')
    })

    test('has examples defined', () => {
      expect(Docs.examples).toBeDefined()
      expect(Docs.examples.length).toBeGreaterThan(0)
    })

    test('each example has command and description', () => {
      for (const example of Docs.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect(typeof example.command).toBe('string')
        expect(typeof example.description).toBe('string')
      }
    })

    test('examples reference the docs command id', () => {
      for (const example of Docs.examples) {
        // oclif uses template syntax: <%= config.bin %> <%= command.id %>
        expect(example.command).toContain('command.id')
      }
    })

    test('has all required flags', () => {
      expect(Docs.flags).toBeDefined()
      expect(Docs.flags.output).toBeDefined()
      expect(Docs.flags.category).toBeDefined()
      expect(Docs.flags.single).toBeDefined()
    })

    test('output flag has default value', () => {
      expect(Docs.flags.output.default).toBe('docs/rules')
    })

    test('output flag has char o', () => {
      expect(Docs.flags.output.char).toBe('o')
    })

    test('output flag has description', () => {
      expect(Docs.flags.output.description).toBe('Output directory for generated documentation')
    })

    test('single flag has default false', () => {
      expect(Docs.flags.single.default).toBe(false)
    })

    test('single flag has description', () => {
      expect(Docs.flags.single.description).toBe(
        'Generate a single combined file instead of per-rule files',
      )
    })

    test('category flag has char c', () => {
      expect(Docs.flags.category.char).toBe('c')
    })

    test('category flag has description', () => {
      expect(Docs.flags.category.description).toBe('Filter rules by category')
    })

    test('category flag includes complexity option', () => {
      expect(Docs.flags.category.options).toContain('complexity')
    })

    test('category flag includes performance option', () => {
      expect(Docs.flags.category.options).toContain('performance')
    })

    test('category flag includes security option', () => {
      expect(Docs.flags.category.options).toContain('security')
    })

    test('category flag includes style option', () => {
      expect(Docs.flags.category.options).toContain('style')
    })

    test('category flag includes correctness option', () => {
      expect(Docs.flags.category.options).toContain('correctness')
    })

    test('category flag includes dependencies option', () => {
      expect(Docs.flags.category.options).toContain('dependencies')
    })

    test('category flag includes patterns option', () => {
      expect(Docs.flags.category.options).toContain('patterns')
    })

    test('category flag has exactly 7 options', () => {
      expect(Docs.flags.category.options).toHaveLength(7)
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 2. getRules (16 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('getRules', () => {
    test('returns array of rules', () => {
      const rules = createTestableInstance().getRules()
      expect(Array.isArray(rules)).toBe(true)
      expect(rules.length).toBe(4)
    })

    test('each rule has required properties', () => {
      const rules = createTestableInstance().getRules()
      for (const rule of rules) {
        expect(rule).toHaveProperty('name')
        expect(rule).toHaveProperty('category')
        expect(rule).toHaveProperty('description')
        expect(rule).toHaveProperty('fixable')
        expect(rule).toHaveProperty('recommended')
        expect(rule).toHaveProperty('deprecated')
      }
    })

    test('rules are sorted by name', () => {
      const rules = createTestableInstance().getRules()
      const names = rules.map((r) => r.name)
      const sorted = [...names].sort()
      expect(names).toEqual(sorted)
    })

    test('detects fixable rules from fix function', () => {
      const rules = createTestableInstance().getRules()
      const maxParams = rules.find((r) => r.name === 'max-params')
      expect(maxParams?.fixable).toBe(true)
    })

    test('detects fixable rules from meta.fixable', () => {
      const rules = createTestableInstance().getRules()
      const noAwaitInLoop = rules.find((r) => r.name === 'no-await-in-loop')
      expect(noAwaitInLoop?.fixable).toBe(true)
    })

    test('non-fixable rules have fixable false', () => {
      const rules = createTestableInstance().getRules()
      const maxComplexity = rules.find((r) => r.name === 'max-complexity')
      expect(maxComplexity?.fixable).toBe(false)
    })

    test('detects deprecated rules', () => {
      const rules = createTestableInstance().getRules()
      const deprecatedRule = rules.find((r) => r.name === 'deprecated-rule')
      expect(deprecatedRule?.deprecated).toBe(true)
    })

    test('non-deprecated rules have deprecated false', () => {
      const rules = createTestableInstance().getRules()
      const maxComplexity = rules.find((r) => r.name === 'max-complexity')
      expect(maxComplexity?.deprecated).toBe(false)
    })

    test('extracts description from meta', () => {
      const rules = createTestableInstance().getRules()
      const maxComplexity = rules.find((r) => r.name === 'max-complexity')
      expect(maxComplexity?.description).toBe('Enforce a maximum cyclomatic complexity threshold')
    })

    test('extracts category from meta', () => {
      const rules = createTestableInstance().getRules()
      const maxComplexity = rules.find((r) => r.name === 'max-complexity')
      expect(maxComplexity?.category).toBe('complexity')
    })

    test('detects recommended rules', () => {
      const rules = createTestableInstance().getRules()
      const maxComplexity = rules.find((r) => r.name === 'max-complexity')
      expect(maxComplexity?.recommended).toBe(true)
    })

    test('non-recommended rules have recommended false', () => {
      const rules = createTestableInstance().getRules()
      const noAwaitInLoop = rules.find((r) => r.name === 'no-await-in-loop')
      expect(noAwaitInLoop?.recommended).toBe(false)
    })

    test('all rule names are strings', () => {
      const rules = createTestableInstance().getRules()
      for (const rule of rules) {
        expect(typeof rule.name).toBe('string')
        expect(rule.name.length).toBeGreaterThan(0)
      }
    })

    test('all descriptions are non-empty strings', () => {
      const rules = createTestableInstance().getRules()
      for (const rule of rules) {
        expect(typeof rule.description).toBe('string')
        expect(rule.description.length).toBeGreaterThan(0)
      }
    })

    test('all fixable values are booleans', () => {
      const rules = createTestableInstance().getRules()
      for (const rule of rules) {
        expect(typeof rule.fixable).toBe('boolean')
      }
    })

    test('all deprecated values are booleans', () => {
      const rules = createTestableInstance().getRules()
      for (const rule of rules) {
        expect(typeof rule.deprecated).toBe('boolean')
      }
    })

    test('all recommended values are booleans', () => {
      const rules = createTestableInstance().getRules()
      for (const rule of rules) {
        expect(typeof rule.recommended).toBe('boolean')
      }
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 3. generateRuleMarkdown (40 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('generateRuleMarkdown', () => {
    test('includes rule name as heading', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ name: 'my-rule' }))
      expect(markdown).toContain('# my-rule')
    })

    test('includes description section heading', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('## Description')
    })

    test('includes description text', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ description: 'Custom rule description text' }),
      )
      expect(markdown).toContain('Custom rule description text')
    })

    test('includes How to Use section', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('## How to Use')
    })

    test('includes JSON config example with rule name', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ name: 'my-custom-rule' }),
      )
      expect(markdown).toContain('"my-custom-rule": "error"')
    })

    test('includes json code block fence', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('```json')
    })

    test('includes Enable this rule text', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('Enable this rule in your configuration')
    })

    test('includes fix note for fixable rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ fixable: true }))
      expect(markdown).toContain('auto-fixable')
    })

    test('fix note mentions codeforge fix command', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ fixable: true, name: 'my-fixable-rule' }),
      )
      expect(markdown).toContain('codeforge fix --rules my-fixable-rule')
    })

    test('does not include fix note for non-fixable rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ fixable: false }))
      expect(markdown).not.toContain('auto-fixable')
    })

    test('includes recommended shield image for recommended rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: true }),
      )
      expect(markdown).toContain('![Recommended]')
      expect(markdown).toContain('recommended-blue')
    })

    test('does not include recommended shield for non-recommended rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: false }),
      )
      expect(markdown).not.toContain('recommended-blue')
    })

    test('includes fixable shield image for fixable rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ fixable: true }))
      expect(markdown).toContain('![Fixable]')
      expect(markdown).toContain('fixable-green')
    })

    test('does not include fixable shield for non-fixable rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ fixable: false }))
      expect(markdown).not.toContain('fixable-green')
    })

    test('includes deprecated shield image for deprecated rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ deprecated: true }))
      expect(markdown).toContain('![Deprecated]')
      expect(markdown).toContain('deprecated-red')
    })

    test('does not include deprecated shield for non-deprecated rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ deprecated: false }),
      )
      expect(markdown).not.toContain('deprecated-red')
    })

    test('includes property table header', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('| Property | Value |')
    })

    test('includes category in property table', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ category: 'performance' }),
      )
      expect(markdown).toContain('| Category | performance |')
    })

    test('shows Fixable Yes for fixable rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ fixable: true }))
      expect(markdown).toContain('| Fixable | Yes |')
    })

    test('shows Fixable No for non-fixable rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ fixable: false }))
      expect(markdown).toContain('| Fixable | No |')
    })

    test('shows Recommended Yes for recommended rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: true }),
      )
      expect(markdown).toContain('| Recommended | Yes |')
    })

    test('shows Recommended No for non-recommended rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: false }),
      )
      expect(markdown).toContain('| Recommended | No |')
    })

    test('shows Deprecated Yes for deprecated rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ deprecated: true }))
      expect(markdown).toContain('| Deprecated | Yes |')
    })

    test('shows Deprecated No for non-deprecated rules', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ deprecated: false }),
      )
      expect(markdown).toContain('| Deprecated | No |')
    })

    test('contains all four property rows', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('| Category |')
      expect(markdown).toContain('| Fixable |')
      expect(markdown).toContain('| Recommended |')
      expect(markdown).toContain('| Deprecated |')
    })

    test('generates valid markdown with table separator', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('|----------|-------|')
    })

    test('combines badges and table correctly', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: true, fixable: true }),
      )
      // Badges should appear before the table
      const badgeIdx = markdown.indexOf('![Recommended]')
      const tableIdx = markdown.indexOf('| Property')
      expect(badgeIdx).toBeLessThan(tableIdx)
    })

    test('handles rule with all badges enabled', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: true, fixable: true, deprecated: true }),
      )
      expect(markdown).toContain('recommended-blue')
      expect(markdown).toContain('fixable-green')
      expect(markdown).toContain('deprecated-red')
    })

    test('handles rule with no badges', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: false, fixable: false, deprecated: false }),
      )
      expect(markdown).not.toContain('shields.io')
    })

    test('output starts with rule heading', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ name: 'abc-rule' }))
      expect(markdown.startsWith('# abc-rule')).toBe(true)
    })

    test('includes "rules" key in JSON example', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('"rules"')
    })

    test('includes "error" as default severity in JSON example', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('"error"')
    })

    test('fix note contains backtick-wrapped command', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ fixable: true, name: 'test-fix' }),
      )
      expect(markdown).toContain('`codeforge fix --rules test-fix`')
    })

    test('handles single-character rule name', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ name: 'x' }))
      expect(markdown).toContain('# x')
      expect(markdown).toContain('"x": "error"')
    })

    test('handles hyphenated rule name', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ name: 'no-eval-strings' }),
      )
      expect(markdown).toContain('# no-eval-strings')
      expect(markdown).toContain('"no-eval-strings": "error"')
    })

    test('handles long description', () => {
      const longDesc = 'A'.repeat(500)
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ description: longDesc }),
      )
      expect(markdown).toContain(longDesc)
    })

    test('handles different categories correctly', () => {
      const categories = ['complexity', 'performance', 'security', 'style', 'correctness']
      for (const cat of categories) {
        const markdown = createTestableInstance().generateRuleMarkdown(makeRule({ category: cat }))
        expect(markdown).toContain(`| Category | ${cat} |`)
      }
    })

    test('deprecated rule with fixable generates both shield images', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ deprecated: true, fixable: true }),
      )
      expect(markdown).toContain('deprecated-red')
      expect(markdown).toContain('fixable-green')
    })

    test('recommended non-fixable non-deprecated rule', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(
        makeRule({ recommended: true, fixable: false, deprecated: false }),
      )
      expect(markdown).toContain('recommended-blue')
      expect(markdown).not.toContain('fixable-green')
      expect(markdown).not.toContain('deprecated-red')
      expect(markdown).not.toContain('auto-fixable')
    })

    test('contains table separator row', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      expect(markdown).toContain('|----------|')
    })

    test('JSON example is wrapped in code fence', () => {
      const markdown = createTestableInstance().generateRuleMarkdown(makeRule())
      const jsonStart = markdown.indexOf('```json')
      const jsonEnd = markdown.indexOf('```', jsonStart + 7)
      expect(jsonStart).toBeGreaterThan(-1)
      expect(jsonEnd).toBeGreaterThan(jsonStart)
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 4. getBadges (15 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('getBadges', () => {
    test('returns empty string for rule with no badges', () => {
      const badges = createTestableInstance().getBadges(makeRule())
      expect(badges).toBe('')
    })

    test('returns recommended badge text', () => {
      const badges = createTestableInstance().getBadges(makeRule({ recommended: true }))
      expect(badges).toContain('recommended')
    })

    test('returns fixable badge text', () => {
      const badges = createTestableInstance().getBadges(makeRule({ fixable: true }))
      expect(badges).toContain('fixable')
    })

    test('returns deprecated badge text', () => {
      const badges = createTestableInstance().getBadges(makeRule({ deprecated: true }))
      expect(badges).toContain('deprecated')
    })

    test('recommended badge uses backtick formatting', () => {
      const badges = createTestableInstance().getBadges(makeRule({ recommended: true }))
      expect(badges).toContain('`recommended`')
    })

    test('fixable badge uses backtick formatting', () => {
      const badges = createTestableInstance().getBadges(makeRule({ fixable: true }))
      expect(badges).toContain('`fixable`')
    })

    test('deprecated badge uses backtick formatting', () => {
      const badges = createTestableInstance().getBadges(makeRule({ deprecated: true }))
      expect(badges).toContain('`deprecated`')
    })

    test('returns all three badges when all are true', () => {
      const badges = createTestableInstance().getBadges(
        makeRule({ recommended: true, fixable: true, deprecated: true }),
      )
      expect(badges).toContain('`recommended`')
      expect(badges).toContain('`fixable`')
      expect(badges).toContain('`deprecated`')
    })

    test('recommended and fixable only returns those two', () => {
      const badges = createTestableInstance().getBadges(
        makeRule({ recommended: true, fixable: true, deprecated: false }),
      )
      expect(badges).toContain('`recommended`')
      expect(badges).toContain('`fixable`')
      expect(badges).not.toContain('`deprecated`')
    })

    test('recommended and deprecated only returns those two', () => {
      const badges = createTestableInstance().getBadges(
        makeRule({ recommended: true, fixable: false, deprecated: true }),
      )
      expect(badges).toContain('`recommended`')
      expect(badges).toContain('`deprecated`')
      expect(badges).not.toContain('`fixable`')
    })

    test('fixable and deprecated only returns those two', () => {
      const badges = createTestableInstance().getBadges(
        makeRule({ recommended: false, fixable: true, deprecated: true }),
      )
      expect(badges).toContain('`fixable`')
      expect(badges).toContain('`deprecated`')
      expect(badges).not.toContain('`recommended`')
    })

    test('only recommended returns single badge', () => {
      const badges = createTestableInstance().getBadges(
        makeRule({ recommended: true, fixable: false, deprecated: false }),
      )
      expect(badges).toContain('`recommended`')
      expect(badges).not.toContain('`fixable`')
      expect(badges).not.toContain('`deprecated`')
    })

    test('only fixable returns single badge', () => {
      const badges = createTestableInstance().getBadges(
        makeRule({ recommended: false, fixable: true, deprecated: false }),
      )
      expect(badges).toContain('`fixable`')
      expect(badges).not.toContain('`recommended`')
      expect(badges).not.toContain('`deprecated`')
    })

    test('only deprecated returns single badge', () => {
      const badges = createTestableInstance().getBadges(
        makeRule({ recommended: false, fixable: false, deprecated: true }),
      )
      expect(badges).toContain('`deprecated`')
      expect(badges).not.toContain('`recommended`')
      expect(badges).not.toContain('`fixable`')
    })

    test('badge output is a string', () => {
      const badges = createTestableInstance().getBadges(makeRule({ recommended: true }))
      expect(typeof badges).toBe('string')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 5. groupByCategory (20 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('groupByCategory', () => {
    test('groups rules by category', () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'rule-a' }),
        makeRule({ category: 'complexity', name: 'rule-b' }),
        makeRule({ category: 'performance', name: 'rule-c' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(groups['complexity'].length).toBe(2)
      expect(groups['performance'].length).toBe(1)
    })

    test('sorts rules within each category by name', () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'zebra' }),
        makeRule({ category: 'complexity', name: 'apple' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(groups['complexity'][0].name).toBe('apple')
      expect(groups['complexity'][1].name).toBe('zebra')
    })

    test('returns empty object for empty input', () => {
      const groups = createTestableInstance().groupByCategory([])
      expect(Object.keys(groups)).toHaveLength(0)
    })

    test('handles single rule', () => {
      const groups = createTestableInstance().groupByCategory([
        makeRule({ category: 'style', name: 'solo' }),
      ])
      expect(groups['style']).toHaveLength(1)
      expect(groups['style'][0].name).toBe('solo')
    })

    test('handles all rules in same category', () => {
      const rules = [
        makeRule({ category: 'security', name: 'rule-a' }),
        makeRule({ category: 'security', name: 'rule-b' }),
        makeRule({ category: 'security', name: 'rule-c' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(Object.keys(groups)).toHaveLength(1)
      expect(groups['security']).toHaveLength(3)
    })

    test('handles each rule in different category', () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'rule-a' }),
        makeRule({ category: 'performance', name: 'rule-b' }),
        makeRule({ category: 'security', name: 'rule-c' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(Object.keys(groups)).toHaveLength(3)
      for (const key of Object.keys(groups)) {
        expect(groups[key]).toHaveLength(1)
      }
    })

    test('preserves all rule properties after grouping', () => {
      const rule = makeRule({
        category: 'complexity',
        name: 'full-rule',
        description: 'Full description',
        fixable: true,
        recommended: true,
        deprecated: false,
      })
      const groups = createTestableInstance().groupByCategory([rule])
      const grouped = groups['complexity'][0]
      expect(grouped.name).toBe('full-rule')
      expect(grouped.description).toBe('Full description')
      expect(grouped.fixable).toBe(true)
      expect(grouped.recommended).toBe(true)
      expect(grouped.deprecated).toBe(false)
    })

    test('uses category names as object keys', () => {
      const rules = [
        makeRule({ category: 'alpha', name: 'rule-a' }),
        makeRule({ category: 'beta', name: 'rule-b' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(Object.keys(groups)).toContain('alpha')
      expect(Object.keys(groups)).toContain('beta')
    })

    test('sorts within multiple categories independently', () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'z-rule' }),
        makeRule({ category: 'complexity', name: 'a-rule' }),
        makeRule({ category: 'performance', name: 'y-rule' }),
        makeRule({ category: 'performance', name: 'b-rule' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(groups['complexity'][0].name).toBe('a-rule')
      expect(groups['complexity'][1].name).toBe('z-rule')
      expect(groups['performance'][0].name).toBe('b-rule')
      expect(groups['performance'][1].name).toBe('y-rule')
    })

    test('handles large number of categories', () => {
      const rules = ['cat-a', 'cat-b', 'cat-c', 'cat-d', 'cat-e'].map((cat, i) =>
        makeRule({ category: cat, name: `rule-${i}` }),
      )
      const groups = createTestableInstance().groupByCategory(rules)
      expect(Object.keys(groups)).toHaveLength(5)
    })

    test('handles rules with same name in different categories', () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'same-name' }),
        makeRule({ category: 'performance', name: 'same-name' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(groups['complexity'][0].name).toBe('same-name')
      expect(groups['performance'][0].name).toBe('same-name')
    })

    test('does not mutate original array', () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'z-rule' }),
        makeRule({ category: 'complexity', name: 'a-rule' }),
      ]
      const namesBefore = rules.map((r) => r.name)
      createTestableInstance().groupByCategory(rules)
      const namesAfter = rules.map((r) => r.name)
      expect(namesBefore).toEqual(namesAfter)
    })

    test('handles single category with single rule', () => {
      const groups = createTestableInstance().groupByCategory([
        makeRule({ category: 'unique', name: 'only' }),
      ])
      expect(groups['unique']).toHaveLength(1)
    })

    test('handles mixed categories with varying counts', () => {
      const rules = [
        makeRule({ category: 'alpha', name: 'a1' }),
        makeRule({ category: 'alpha', name: 'a2' }),
        makeRule({ category: 'alpha', name: 'a3' }),
        makeRule({ category: 'beta', name: 'b1' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      expect(groups['alpha']).toHaveLength(3)
      expect(groups['beta']).toHaveLength(1)
    })

    test('returns plain object (not array)', () => {
      const groups = createTestableInstance().groupByCategory([
        makeRule({ category: 'test', name: 'r' }),
      ])
      expect(typeof groups).toBe('object')
      expect(Array.isArray(groups)).toBe(false)
    })

    test('each group value is an array', () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'a' }),
        makeRule({ category: 'performance', name: 'b' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      for (const key of Object.keys(groups)) {
        expect(Array.isArray(groups[key])).toBe(true)
      }
    })

    test('correctly groups with many rules per category', () => {
      const rules = Array.from({ length: 10 }, (_, i) =>
        makeRule({ category: i < 5 ? 'group-a' : 'group-b', name: `rule-${i}` }),
      )
      const groups = createTestableInstance().groupByCategory(rules)
      expect(groups['group-a']).toHaveLength(5)
      expect(groups['group-b']).toHaveLength(5)
    })

    test('sorted order is alphabetical within category', () => {
      const rules = [
        makeRule({ category: 'cat', name: 'mmm' }),
        makeRule({ category: 'cat', name: 'aaa' }),
        makeRule({ category: 'cat', name: 'zzz' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      const names = groups['cat'].map((r) => r.name)
      expect(names).toEqual(['aaa', 'mmm', 'zzz'])
    })

    test('does not create empty category entries', () => {
      const groups = createTestableInstance().groupByCategory([
        makeRule({ category: 'only-cat', name: 'r' }),
      ])
      const keys = Object.keys(groups)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('only-cat')
    })

    test('handles rules with numeric-like names in sorting', () => {
      const rules = [
        makeRule({ category: 'cat', name: 'rule-9' }),
        makeRule({ category: 'cat', name: 'rule-10' }),
        makeRule({ category: 'cat', name: 'rule-1' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      const names = groups['cat'].map((r) => r.name)
      // localeCompare sorts 'rule-1' < 'rule-10' < 'rule-9'
      expect(names[0]).toBe('rule-1')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 6. generateSingleFile (22 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('generateSingleFile', () => {
    test('writes to RULES.md', async () => {
      const rules = [makeRule({ name: 'alpha-rule' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('RULES.md'),
        expect.any(String),
      )
    })

    test('output file path includes output directory', async () => {
      const rules = [makeRule()]
      await createTestableInstance().generateSingleFile(rules, '/custom/dir')
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('/custom/dir'),
        expect.any(String),
      )
    })

    test('contains rule names in content', async () => {
      const rules = [makeRule({ name: 'rule-alpha' }), makeRule({ name: 'rule-beta' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const call = vi.mocked(fs.writeFile).mock.calls[0]
      expect(call).toBeDefined()
      const content = call[1] as string
      expect(content).toContain('rule-alpha')
      expect(content).toContain('rule-beta')
    })

    test('contains Table of Contents heading', async () => {
      const rules = [makeRule({ category: 'complexity' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('## Table of Contents')
    })

    test('contains main title heading', async () => {
      const rules = [makeRule()]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('# CodeForge Rules Documentation')
    })

    test('contains rule count in description', async () => {
      const rules = [makeRule(), makeRule(), makeRule()]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('3 available rules')
    })

    test('contains horizontal rule separators between rules', async () => {
      const rules = [makeRule()]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('---')
    })

    test('contains category headings', async () => {
      const rules = [makeRule({ category: 'performance' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('## performance')
    })

    test('contains TOC link for each category', async () => {
      const rules = [makeRule({ category: 'alpha' }), makeRule({ category: 'beta' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('#alpha')
      expect(content).toContain('#beta')
    })

    test('groups rules by category in output', async () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'rule-a' }),
        makeRule({ category: 'performance', name: 'rule-b' }),
      ]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('## complexity')
      expect(content).toContain('## performance')
    })

    test('handles single rule', async () => {
      const rules = [makeRule({ name: 'only-rule' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('only-rule')
      expect(content).toContain('1 available rules')
    })

    test('handles empty rules array', async () => {
      await createTestableInstance().generateSingleFile([], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('0 available rules')
    })

    test('writes file once (single writeFile call)', async () => {
      const rules = [makeRule(), makeRule(), makeRule()]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledTimes(1)
    })

    test('calls this.error on write failure', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('disk full'))
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
        warn: ReturnType<typeof vi.fn>
      }
      instanceMock.error = vi.fn()
      instanceMock.warn = vi.fn()
      await instanceMock.generateSingleFile([makeRule()], '/tmp/out')
      expect(instanceMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write combined rules doc'),
      )
    })

    test('includes rule descriptions in output', async () => {
      const rules = [makeRule({ description: 'My special description' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('My special description')
    })

    test('includes property tables for rules', async () => {
      const rules = [makeRule({ category: 'security' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('| Category | security |')
    })

    test('handles multiple categories correctly', async () => {
      const rules = [
        makeRule({ category: 'cat-a', name: 'r1' }),
        makeRule({ category: 'cat-b', name: 'r2' }),
        makeRule({ category: 'cat-c', name: 'r3' }),
      ]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('## cat-a')
      expect(content).toContain('## cat-b')
      expect(content).toContain('## cat-c')
    })

    test('TOC links use lowercase anchors', async () => {
      const rules = [makeRule({ category: 'MyCategory' })]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('#mycategory')
    })

    test('includes rules from same category together', async () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'rule-a' }),
        makeRule({ category: 'complexity', name: 'rule-b' }),
        makeRule({ category: 'performance', name: 'rule-c' }),
      ]
      await createTestableInstance().generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      // Both complexity rules should be under the same heading
      const complexityIdx = content.indexOf('## complexity')
      const performanceIdx = content.indexOf('## performance')
      const ruleAIdx = content.indexOf('rule-a')
      const ruleBIdx = content.indexOf('rule-b')
      expect(ruleAIdx).toBeGreaterThan(complexityIdx)
      expect(ruleBIdx).toBeGreaterThan(complexityIdx)
      expect(ruleAIdx).toBeLessThan(performanceIdx)
      expect(ruleBIdx).toBeLessThan(performanceIdx)
    })

    test('handles error with non-Error object', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce('string error')
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
        warn: ReturnType<typeof vi.fn>
      }
      instanceMock.error = vi.fn()
      instanceMock.warn = vi.fn()
      await instanceMock.generateSingleFile([makeRule()], '/tmp/out')
      expect(instanceMock.error).toHaveBeenCalledWith(expect.stringContaining('string error'))
    })

    test('file path joins outputDir with RULES.md', async () => {
      await createTestableInstance().generateSingleFile([makeRule()], '/my/output')
      expect(fs.writeFile).toHaveBeenCalledWith('/my/output/RULES.md', expect.any(String))
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 7. generateIndexFile (25 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('generateIndexFile', () => {
    test('writes to README.md', async () => {
      const rules = [makeRule({ name: 'some-rule' })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('README.md'),
        expect.any(String),
      )
    })

    test('file path joins outputDir with README.md', async () => {
      await createTestableInstance().generateIndexFile([makeRule()], '/my/output')
      expect(fs.writeFile).toHaveBeenCalledWith('/my/output/README.md', expect.any(String))
    })

    test('contains main title', async () => {
      await createTestableInstance().generateIndexFile([makeRule()], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('# CodeForge Rules Documentation')
    })

    test('contains rule count', async () => {
      const rules = [makeRule(), makeRule()]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('2 available rules')
    })

    test('contains Overview section', async () => {
      await createTestableInstance().generateIndexFile([makeRule()], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('## Overview')
    })

    test('contains overview table header', async () => {
      await createTestableInstance().generateIndexFile([makeRule()], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('| Category | Rules | Fixable |')
    })

    test('contains category in overview table', async () => {
      const rules = [makeRule({ category: 'security' })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('security')
    })

    test('counts rules per category in overview', async () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'a' }),
        makeRule({ category: 'complexity', name: 'b' }),
        makeRule({ category: 'performance', name: 'c' }),
      ]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      // complexity should have 2 rules
      expect(content).toMatch(/\| complexity \| 2 \|/)
      // performance should have 1 rule
      expect(content).toMatch(/\| performance \| 1 \|/)
    })

    test('counts fixable rules per category', async () => {
      const rules = [
        makeRule({ category: 'complexity', fixable: true, name: 'a' }),
        makeRule({ category: 'complexity', fixable: false, name: 'b' }),
      ]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toMatch(/\| complexity \| 2 \| 1 \|/)
    })

    test('contains Rules by Category section', async () => {
      await createTestableInstance().generateIndexFile([makeRule()], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('## Rules by Category')
    })

    test('contains category subheadings', async () => {
      const rules = [makeRule({ category: 'complexity' }), makeRule({ category: 'performance' })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('### complexity')
      expect(content).toContain('### performance')
    })

    test('contains rule links with .md extension', async () => {
      const rules = [makeRule({ name: 'my-rule' })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('[my-rule](./my-rule.md)')
    })

    test('contains rule descriptions in list', async () => {
      const rules = [makeRule({ name: 'r', description: 'My rule desc' })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('My rule desc')
    })

    test('includes badges inline with rule links', async () => {
      const rules = [makeRule({ name: 'r', recommended: true })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('`recommended`')
    })

    test('writes file once', async () => {
      await createTestableInstance().generateIndexFile([makeRule(), makeRule()], '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledTimes(1)
    })

    test('calls this.warn on write failure', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('write fail'))
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        warn: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
      }
      instanceMock.warn = vi.fn()
      instanceMock.error = vi.fn()
      await instanceMock.generateIndexFile([makeRule()], '/tmp/out')
      expect(instanceMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write index file'),
      )
    })

    test('handles empty rules array', async () => {
      await createTestableInstance().generateIndexFile([], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('0 available rules')
    })

    test('handles single rule', async () => {
      await createTestableInstance().generateIndexFile([makeRule({ name: 'only-one' })], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('only-one')
      expect(content).toContain('1 available rules')
    })

    test('handles warn with non-Error object', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce('not-an-error')
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        warn: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
      }
      instanceMock.warn = vi.fn()
      instanceMock.error = vi.fn()
      await instanceMock.generateIndexFile([makeRule()], '/tmp/out')
      expect(instanceMock.warn).toHaveBeenCalledWith(expect.stringContaining('not-an-error'))
    })

    test('overview table has separator row', async () => {
      await createTestableInstance().generateIndexFile([makeRule()], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('|----------|-------|--------|')
    })

    test('rules are listed under correct category subheading', async () => {
      const rules = [
        makeRule({ category: 'complexity', name: 'c-rule' }),
        makeRule({ category: 'performance', name: 'p-rule' }),
      ]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      const cIdx = content.indexOf('### complexity')
      const pIdx = content.indexOf('### performance')
      const cRuleIdx = content.indexOf('c-rule')
      const pRuleIdx = content.indexOf('p-rule')
      expect(cRuleIdx).toBeGreaterThan(cIdx)
      expect(pRuleIdx).toBeGreaterThan(pIdx)
    })

    test('fixable badge appears for fixable rules', async () => {
      const rules = [makeRule({ name: 'fix-r', fixable: true })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('`fixable`')
    })

    test('deprecated badge appears for deprecated rules', async () => {
      const rules = [makeRule({ name: 'dep-r', deprecated: true })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('`deprecated`')
    })

    test('each rule link is a list item', async () => {
      const rules = [makeRule({ name: 'listed-rule' })]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('- [listed-rule]')
    })

    test('zero fixable count when all rules are non-fixable', async () => {
      const rules = [
        makeRule({ category: 'cat-a', fixable: false, name: 'r1' }),
        makeRule({ category: 'cat-a', fixable: false, name: 'r2' }),
      ]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toMatch(/\| cat-a \| 2 \| 0 \|/)
    })

    test('all fixable count when all rules are fixable', async () => {
      const rules = [
        makeRule({ category: 'cat-a', fixable: true, name: 'r1' }),
        makeRule({ category: 'cat-a', fixable: true, name: 'r2' }),
      ]
      await createTestableInstance().generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toMatch(/\| cat-a \| 2 \| 2 \|/)
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 8. generatePerRuleFiles (18 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('generatePerRuleFiles', () => {
    test('generates file for each rule', async () => {
      const rules = [makeRule({ name: 'rule-a' }), makeRule({ name: 'rule-b' })]
      await createTestableInstance().generatePerRuleFiles(rules, '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('rule-a.md'),
        expect.any(String),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('rule-b.md'),
        expect.any(String),
      )
    })

    test('writes correct number of files', async () => {
      const rules = [makeRule(), makeRule(), makeRule()]
      await createTestableInstance().generatePerRuleFiles(rules, '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledTimes(3)
    })

    test('writes zero files for empty rules', async () => {
      await createTestableInstance().generatePerRuleFiles([], '/tmp/out')
      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    test('writes single file for single rule', async () => {
      await createTestableInstance().generatePerRuleFiles([makeRule()], '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledTimes(1)
    })

    test('file name matches rule name with .md extension', async () => {
      await createTestableInstance().generatePerRuleFiles(
        [makeRule({ name: 'my-special-rule' })],
        '/out',
      )
      expect(fs.writeFile).toHaveBeenCalledWith('/out/my-special-rule.md', expect.any(String))
    })

    test('file content contains rule heading', async () => {
      await createTestableInstance().generatePerRuleFiles(
        [makeRule({ name: 'heading-test' })],
        '/tmp/out',
      )
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('# heading-test')
    })

    test('file content contains description', async () => {
      await createTestableInstance().generatePerRuleFiles(
        [makeRule({ description: 'Per-file desc' })],
        '/tmp/out',
      )
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('Per-file desc')
    })

    test('file content contains property table', async () => {
      await createTestableInstance().generatePerRuleFiles([makeRule()], '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('| Property | Value |')
    })

    test('calls warn on write failure for individual rule', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('permission denied'))
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        warn: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
      }
      instanceMock.warn = vi.fn()
      instanceMock.error = vi.fn()
      await instanceMock.generatePerRuleFiles([makeRule({ name: 'failing-rule' })], '/tmp/out')
      expect(instanceMock.warn).toHaveBeenCalledWith(expect.stringContaining('failing-rule'))
    })

    test('continues writing other rules after one fails', async () => {
      vi.mocked(fs.writeFile)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(undefined)
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        warn: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
      }
      instanceMock.warn = vi.fn()
      instanceMock.error = vi.fn()
      await instanceMock.generatePerRuleFiles(
        [makeRule({ name: 'fail' }), makeRule({ name: 'success' })],
        '/tmp/out',
      )
      expect(fs.writeFile).toHaveBeenCalledTimes(2)
    })

    test('warns with rule name in message', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('bad'))
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        warn: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
      }
      instanceMock.warn = vi.fn()
      instanceMock.error = vi.fn()
      await instanceMock.generatePerRuleFiles([makeRule({ name: 'my-bad-rule' })], '/tmp/out')
      expect(instanceMock.warn).toHaveBeenCalledWith(expect.stringContaining('my-bad-rule'))
    })

    test('handles non-Error write rejection', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce('string error')
      const instance = new Docs([], {} as never)
      const instanceMock = instance as unknown as {
        warn: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        parse: ReturnType<typeof vi.fn>
        generatePerRuleFiles: (rules: RuleDoc[], outputDir: string) => Promise<void>
        getRules: () => RuleDoc[]
        groupByCategory: (rules: RuleDoc[]) => Record<string, RuleDoc[]>
        generateRuleMarkdown: (rule: RuleDoc) => string
        getBadges: (rule: RuleDoc) => string
        generateSingleFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
        generateIndexFile: (rules: RuleDoc[], outputDir: string) => Promise<void>
      }
      instanceMock.warn = vi.fn()
      instanceMock.error = vi.fn()
      await instanceMock.generatePerRuleFiles([makeRule()], '/tmp/out')
      expect(instanceMock.warn).toHaveBeenCalledWith(expect.stringContaining('string error'))
    })

    test('uses join to construct file paths', async () => {
      await createTestableInstance().generatePerRuleFiles([makeRule({ name: 'test' })], '/base/dir')
      expect(fs.writeFile).toHaveBeenCalledWith('/base/dir/test.md', expect.any(String))
    })

    test('writes fixable note for fixable rules', async () => {
      await createTestableInstance().generatePerRuleFiles(
        [makeRule({ name: 'fix-me', fixable: true })],
        '/tmp/out',
      )
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('auto-fixable')
    })

    test('writes recommended shield for recommended rules', async () => {
      await createTestableInstance().generatePerRuleFiles(
        [makeRule({ name: 'rec-rule', recommended: true })],
        '/tmp/out',
      )
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('recommended-blue')
    })

    test('writes deprecated shield for deprecated rules', async () => {
      await createTestableInstance().generatePerRuleFiles(
        [makeRule({ name: 'dep-rule', deprecated: true })],
        '/tmp/out',
      )
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('deprecated-red')
    })

    test('multiple rules each get unique file content', async () => {
      const rules = [
        makeRule({ name: 'unique-a', description: 'Desc A' }),
        makeRule({ name: 'unique-b', description: 'Desc B' }),
      ]
      await createTestableInstance().generatePerRuleFiles(rules, '/tmp/out')
      const callA = vi.mocked(fs.writeFile).mock.calls[0]
      const callB = vi.mocked(fs.writeFile).mock.calls[1]
      const contentA = callA[1] as string
      const contentB = callB[1] as string
      expect(contentA).toContain('Desc A')
      expect(contentB).toContain('Desc B')
      expect(contentA).toContain('# unique-a')
      expect(contentB).toContain('# unique-b')
    })

    test('handles hyphenated rule names in filenames', async () => {
      await createTestableInstance().generatePerRuleFiles(
        [makeRule({ name: 'no-eval-strings' })],
        '/tmp/out',
      )
      expect(fs.writeFile).toHaveBeenCalledWith('/tmp/out/no-eval-strings.md', expect.any(String))
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 9. run() method (30 tests)
  // ────────────────────────────────────────────────────────────────────────
  describe('run', () => {
    test('generates per-rule files by default', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: false,
      })
      await cmd.run()
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/test-docs', { recursive: true })
    })

    test('generates single file when --single flag is set', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: true,
      })
      await cmd.run()
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/test-docs', { recursive: true })
    })

    test('filters rules by category', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: false,
      })
      await cmd.run()
      expect(fs.mkdir).toHaveBeenCalled()
    })

    test('handles no rules found', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'nonexistent-category',
        single: false,
      })
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      await cmd.run()
      expect(consoleSpy).toHaveBeenCalledWith('No rules found matching the criteria')
      consoleSpy.mockRestore()
    })

    test('creates output directory with recursive option', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/deep/nested/dir',
        category: undefined,
        single: false,
      })
      await cmd.run()
      expect(fs.mkdir).toHaveBeenCalledWith('/deep/nested/dir', { recursive: true })
    })

    test('resolves output directory path', async () => {
      const cmd = createCommandWithMockedParse({
        output: 'relative/path',
        category: undefined,
        single: false,
      })
      await cmd.run()
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('relative/path'), {
        recursive: true,
      })
    })

    test('logs completion message with rule count', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: false,
      })
      const logSpy = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await cmd.run()
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Generated documentation'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\d+ rules/))
      logSpy.mockRestore()
    })

    test('logs output directory in completion message', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/my/special/dir',
        category: undefined,
        single: false,
      })
      const logSpy = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await cmd.run()
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('/my/special/dir'))
      logSpy.mockRestore()
    })

    test('calls mkdir before writing files', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/first',
        category: undefined,
        single: false,
      })
      await cmd.run()
      const mkdirCall = vi.mocked(fs.mkdir).mock.calls[0]
      expect(mkdirCall).toBeDefined()
    })

    test('writes per-rule files when single is false', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: false,
      })
      await cmd.run()
      // Should write individual .md files and README.md
      const calls = vi.mocked(fs.writeFile).mock.calls
      const hasRuleFiles = calls.some((call) => (call[0] as string).endsWith('.md'))
      expect(hasRuleFiles).toBe(true)
    })

    test('writes RULES.md when single is true', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: true,
      })
      await cmd.run()
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('RULES.md'),
        expect.any(String),
      )
    })

    test('does not write RULES.md when single is false', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: false,
      })
      await cmd.run()
      const calls = vi.mocked(fs.writeFile).mock.calls
      const hasRulesDotMd = calls.some((call) => (call[0] as string).includes('RULES.md'))
      expect(hasRulesDotMd).toBe(false)
    })

    test('calls error on mkdir failure', async () => {
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error('no space'))
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: false,
      })
      const errorSpy = vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('no space')
      })
      await expect(cmd.run()).rejects.toThrow('no space')
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to create'))
      errorSpy.mockRestore()
    })

    test('handles mkdir error with non-Error object', async () => {
      vi.mocked(fs.mkdir).mockRejectedValueOnce('string-error')
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: false,
      })
      const errorSpy = vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('bail')
      })
      await expect(cmd.run()).rejects.toThrow('bail')
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('string-error'))
      errorSpy.mockRestore()
    })

    test('does not create files when no rules found', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'nonexistent-category',
        single: false,
      })
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      await cmd.run()
      expect(fs.writeFile).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    test('does not create directory when no rules found', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'nonexistent-category',
        single: false,
      })
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      await cmd.run()
      expect(fs.mkdir).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    test('uses default output directory when not specified', async () => {
      const cmd = createCommandWithMockedParse({
        output: 'docs/rules',
        category: undefined,
        single: false,
      })
      await cmd.run()
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('docs/rules'), {
        recursive: true,
      })
    })

    test('with single flag only writes one file', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: true,
      })
      await cmd.run()
      // Single mode: only RULES.md
      expect(fs.writeFile).toHaveBeenCalledTimes(1)
    })

    test('without single flag writes per-rule and index files', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: false,
      })
      await cmd.run()
      // Per-rule mode: should write multiple files (2 rule files + 1 README)
      expect(fs.writeFile).toHaveBeenCalled()
      const callCount = vi.mocked(fs.writeFile).mock.calls.length
      expect(callCount).toBeGreaterThan(1)
    })

    test('filters complexity rules correctly', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'complexity',
        single: true,
      })
      await cmd.run()
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      // Should contain max-complexity and max-params (complexity rules)
      expect(content).toContain('max-complexity')
      expect(content).toContain('max-params')
      // Should NOT contain no-await-in-loop (performance) or deprecated-rule (style)
      expect(content).not.toContain('no-await-in-loop')
      expect(content).not.toContain('deprecated-rule')
    })

    test('filters performance rules correctly', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'performance',
        single: true,
      })
      await cmd.run()
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('no-await-in-loop')
      expect(content).not.toContain('max-complexity')
    })

    test('completion message includes correct rule count for filtered category', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'performance',
        single: false,
      })
      const logSpy = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await cmd.run()
      // Only 1 performance rule (no-await-in-loop)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1 rules'))
      logSpy.mockRestore()
    })

    test('handles category flag with style', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'style',
        single: true,
      })
      await cmd.run()
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('deprecated-rule')
    })

    test('returns early when category has no matching rules', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: 'security',
        single: false,
      })
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      await cmd.run()
      expect(consoleSpy).toHaveBeenCalledWith('No rules found matching the criteria')
      expect(fs.mkdir).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    test('with no flags generates all rules', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: false,
      })
      const logSpy = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await cmd.run()
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('4 rules'))
      logSpy.mockRestore()
    })

    test('single mode with all rules generates RULES.md', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: true,
      })
      await cmd.run()
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('max-complexity')
      expect(content).toContain('max-params')
      expect(content).toContain('no-await-in-loop')
      expect(content).toContain('deprecated-rule')
    })

    test('per-rule mode with all rules writes individual files', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: false,
      })
      await cmd.run()
      // 4 rules + 1 README = 5 writeFile calls
      expect(fs.writeFile).toHaveBeenCalledTimes(5)
    })

    test('parse is called with Docs class', async () => {
      const cmd = createCommandWithMockedParse({
        output: '/tmp/test-docs',
        category: undefined,
        single: false,
      })
      await cmd.run()
      // The mock parse function was called
      const mockParse = (cmd as unknown as { parse: ReturnType<typeof vi.fn> }).parse
      expect(mockParse).toHaveBeenCalled()
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 10. Integration-style tests (cross-method behavior)
  // ────────────────────────────────────────────────────────────────────────
  describe('Integration behavior', () => {
    test('getRules output feeds groupByCategory correctly', () => {
      const instance = createTestableInstance()
      const rules = instance.getRules()
      const groups = instance.groupByCategory(rules)
      expect(Object.keys(groups).length).toBeGreaterThan(0)
      const totalRules = Object.values(groups).reduce((sum, g) => sum + g.length, 0)
      expect(totalRules).toBe(rules.length)
    })

    test('getRules output feeds generateRuleMarkdown correctly', () => {
      const instance = createTestableInstance()
      const rules = instance.getRules()
      for (const rule of rules) {
        const md = instance.generateRuleMarkdown(rule)
        expect(md).toContain(`# ${rule.name}`)
        expect(md).toContain(rule.description)
      }
    })

    test('getRules output feeds generateSingleFile correctly', async () => {
      const instance = createTestableInstance()
      const rules = instance.getRules()
      await instance.generateSingleFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      for (const rule of rules) {
        expect(content).toContain(rule.name)
      }
    })

    test('getRules output feeds generateIndexFile correctly', async () => {
      const instance = createTestableInstance()
      const rules = instance.getRules()
      await instance.generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain(`${rules.length} available rules`)
    })

    test('getRules output feeds generatePerRuleFiles correctly', async () => {
      const instance = createTestableInstance()
      const rules = instance.getRules()
      await instance.generatePerRuleFiles(rules, '/tmp/out')
      expect(fs.writeFile).toHaveBeenCalledTimes(rules.length)
    })

    test('getBadges output appears in generateIndexFile content', async () => {
      const instance = createTestableInstance()
      const rules = [makeRule({ name: 'rec', recommended: true })]
      await instance.generateIndexFile(rules, '/tmp/out')
      const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      expect(content).toContain('`recommended`')
    })

    test('generateRuleMarkdown and getBadges are consistent', () => {
      const instance = createTestableInstance()
      const rule = makeRule({ recommended: true, fixable: true, deprecated: true })
      const badges = instance.getBadges(rule)
      const md = instance.generateRuleMarkdown(rule)
      // Badges in markdown use image syntax, getBadges uses backticks
      // But both should mention the badge concepts
      expect(badges).toContain('recommended')
      expect(md).toContain('recommended')
      expect(badges).toContain('fixable')
      expect(md).toContain('fixable')
      expect(badges).toContain('deprecated')
      expect(md).toContain('deprecated')
    })

    test('groupByCategory preserves total count of rules', () => {
      const rules = [
        makeRule({ category: 'a', name: 'r1' }),
        makeRule({ category: 'b', name: 'r2' }),
        makeRule({ category: 'a', name: 'r3' }),
      ]
      const groups = createTestableInstance().groupByCategory(rules)
      const total = Object.values(groups).reduce((s, g) => s + g.length, 0)
      expect(total).toBe(3)
    })
  })
})
