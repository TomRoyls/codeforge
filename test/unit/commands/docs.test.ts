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

describe('Docs Command', () => {
  let Docs: typeof import('../../../src/commands/docs.js').default

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    Docs = (await import('../../../src/commands/docs.js')).default
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Docs.description).toBe('Generate markdown documentation for all rules')
    })

    test('has examples defined', () => {
      expect(Docs.examples).toBeDefined()
      expect(Docs.examples.length).toBeGreaterThan(0)
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

    test('single flag has default false', () => {
      expect(Docs.flags.single.default).toBe(false)
    })

    test('category flag has char c', () => {
      expect(Docs.flags.category.char).toBe('c')
    })

    test('category flag has correct options', () => {
      expect(Docs.flags.category.options).toContain('complexity')
      expect(Docs.flags.category.options).toContain('performance')
      expect(Docs.flags.category.options).toContain('security')
    })
  })

  describe('getRules', () => {
    function getTestableCommand(): {
      getRules: () => Array<{
        category: string
        deprecated: boolean
        description: string
        fixable: boolean
        name: string
        recommended: boolean
      }>
    } {
      return new Docs([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns array of rules', () => {
      const rules = getTestableCommand().getRules()
      expect(Array.isArray(rules)).toBe(true)
      expect(rules.length).toBe(4)
    })

    test('each rule has required properties', () => {
      const rules = getTestableCommand().getRules()
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

    test('detects deprecated rules', () => {
      const rules = getTestableCommand().getRules()
      const deprecatedRule = rules.find((r) => r.name === 'deprecated-rule')
      expect(deprecatedRule?.deprecated).toBe(true)
    })

    test('non-deprecated rules have deprecated false', () => {
      const rules = getTestableCommand().getRules()
      const maxComplexity = rules.find((r) => r.name === 'max-complexity')
      expect(maxComplexity?.deprecated).toBe(false)
    })
  })

  describe('generateRuleMarkdown', () => {
    function getTestableCommand(): {
      generateRuleMarkdown: (rule: {
        category: string
        deprecated: boolean
        description: string
        fixable: boolean
        name: string
        recommended: boolean
      }) => string
    } {
      return new Docs([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('includes rule name as heading', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: false,
        description: 'Test description',
        fixable: false,
        name: 'test-rule',
        recommended: false,
      })
      expect(markdown).toContain('# test-rule')
    })

    test('includes description section', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: false,
        description: 'Test rule description',
        fixable: false,
        name: 'test-rule',
        recommended: false,
      })
      expect(markdown).toContain('## Description')
      expect(markdown).toContain('Test rule description')
    })

    test('includes how to use section', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: false,
        description: 'Test description',
        fixable: false,
        name: 'test-rule',
        recommended: false,
      })
      expect(markdown).toContain('## How to Use')
      expect(markdown).toContain('"test-rule": "error"')
    })

    test('includes fix note for fixable rules', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: false,
        description: 'Test description',
        fixable: true,
        name: 'test-rule',
        recommended: false,
      })
      expect(markdown).toContain('auto-fixable')
    })

    test('does not include fix note for non-fixable rules', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: false,
        description: 'Test description',
        fixable: false,
        name: 'test-rule',
        recommended: false,
      })
      expect(markdown).not.toContain('auto-fixable')
    })

    test('includes recommended badge for recommended rules', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: false,
        description: 'Test description',
        fixable: false,
        name: 'test-rule',
        recommended: true,
      })
      expect(markdown).toContain('recommended')
    })

    test('includes deprecated badge for deprecated rules', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: true,
        description: 'Test description',
        fixable: false,
        name: 'test-rule',
        recommended: false,
      })
      expect(markdown).toContain('deprecated')
    })

    test('includes property table', () => {
      const cmd = getTestableCommand()
      const markdown = cmd.generateRuleMarkdown({
        category: 'complexity',
        deprecated: false,
        description: 'Test description',
        fixable: true,
        name: 'test-rule',
        recommended: true,
      })
      expect(markdown).toContain('| Category | complexity |')
      expect(markdown).toContain('| Fixable | Yes |')
      expect(markdown).toContain('| Recommended | Yes |')
      expect(markdown).toContain('| Deprecated | No |')
    })
  })

  describe('groupByCategory', () => {
    function getTestableCommand(): {
      groupByCategory: (
        rules: Array<{
          category: string
          deprecated: boolean
          description: string
          fixable: boolean
          name: string
          recommended: boolean
        }>,
      ) => Record<
        string,
        Array<{
          category: string
          deprecated: boolean
          description: string
          fixable: boolean
          name: string
          recommended: boolean
        }>
      >
    } {
      return new Docs([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('groups rules by category', () => {
      const cmd = getTestableCommand()
      const rules = [
        {
          category: 'complexity',
          deprecated: false,
          description: 'A',
          fixable: false,
          name: 'rule-a',
          recommended: false,
        },
        {
          category: 'complexity',
          deprecated: false,
          description: 'B',
          fixable: false,
          name: 'rule-b',
          recommended: false,
        },
        {
          category: 'performance',
          deprecated: false,
          description: 'C',
          fixable: false,
          name: 'rule-c',
          recommended: false,
        },
      ]
      const groups = cmd.groupByCategory(rules)
      expect(groups['complexity'].length).toBe(2)
      expect(groups['performance'].length).toBe(1)
    })

    test('sorts rules within each category', () => {
      const cmd = getTestableCommand()
      const rules = [
        {
          category: 'complexity',
          deprecated: false,
          description: 'Z',
          fixable: false,
          name: 'zebra',
          recommended: false,
        },
        {
          category: 'complexity',
          deprecated: false,
          description: 'A',
          fixable: false,
          name: 'apple',
          recommended: false,
        },
      ]
      const groups = cmd.groupByCategory(rules)
      expect(groups['complexity'][0].name).toBe('apple')
      expect(groups['complexity'][1].name).toBe('zebra')
    })
  })

  describe('getBadges', () => {
    function getTestableCommand(): {
      getBadges: (rule: {
        category: string
        deprecated: boolean
        description: string
        fixable: boolean
        name: string
        recommended: boolean
      }) => string
    } {
      return new Docs([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns empty string for rule with no badges', () => {
      const cmd = getTestableCommand()
      const badges = cmd.getBadges({
        category: 'complexity',
        deprecated: false,
        description: 'Test',
        fixable: false,
        name: 'test-rule',
        recommended: false,
      })
      expect(badges).toBe('')
    })

    test('returns recommended badge', () => {
      const cmd = getTestableCommand()
      const badges = cmd.getBadges({
        category: 'complexity',
        deprecated: false,
        description: 'Test',
        fixable: false,
        name: 'test-rule',
        recommended: true,
      })
      expect(badges).toContain('recommended')
    })

    test('returns fixable badge', () => {
      const cmd = getTestableCommand()
      const badges = cmd.getBadges({
        category: 'complexity',
        deprecated: false,
        description: 'Test',
        fixable: true,
        name: 'test-rule',
        recommended: false,
      })
      expect(badges).toContain('fixable')
    })

    test('returns deprecated badge', () => {
      const cmd = getTestableCommand()
      const badges = cmd.getBadges({
        category: 'complexity',
        deprecated: true,
        description: 'Test',
        fixable: false,
        name: 'test-rule',
        recommended: false,
      })
      expect(badges).toContain('deprecated')
    })

    test('returns multiple badges', () => {
      const cmd = getTestableCommand()
      const badges = cmd.getBadges({
        category: 'complexity',
        deprecated: true,
        description: 'Test',
        fixable: true,
        name: 'test-rule',
        recommended: true,
      })
      expect(badges).toContain('recommended')
      expect(badges).toContain('fixable')
      expect(badges).toContain('deprecated')
    })
  })

  describe('generateSingleFile', () => {
    function getTestableCommand(): {
      generateSingleFile: (
        rules: Array<{
          category: string
          deprecated: boolean
          description: string
          fixable: boolean
          name: string
          recommended: boolean
        }>,
        outputDir: string,
      ) => Promise<void>
    } {
      return new Docs([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('generates single file with multiple categories', async () => {
      const cmd = getTestableCommand()
      const rules = [
        {
          category: 'complexity',
          deprecated: false,
          description: 'Rule A',
          fixable: false,
          name: 'rule-a',
          recommended: false,
        },
        {
          category: 'performance',
          deprecated: false,
          description: 'Rule B',
          fixable: true,
          name: 'rule-b',
          recommended: false,
        },
      ]
      const outputDir = '/tmp/test-docs'
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await cmd.generateSingleFile(rules, outputDir)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('RULES.md'),
        expect.stringContaining('rule-a'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('RULES.md'),
        expect.stringContaining('rule-b'),
      )
    })
  })

  describe('generateIndexFile', () => {
    function getTestableCommand(): {
      generateIndexFile: (
        rules: Array<{
          category: string
          deprecated: boolean
          description: string
          fixable: boolean
          name: string
          recommended: boolean
        }>,
        outputDir: string,
      ) => Promise<void>
    } {
      return new Docs([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('generates index file with categories', async () => {
      const cmd = getTestableCommand()
      const rules = [
        {
          category: 'complexity',
          deprecated: false,
          description: 'Complexity rule',
          fixable: false,
          name: 'max-complexity',
          recommended: true,
        },
        {
          category: 'performance',
          deprecated: false,
          description: 'Performance rule',
          fixable: true,
          name: 'no-await-loop',
          recommended: false,
        },
      ]
      const outputDir = '/tmp/test-docs'
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await cmd.generateIndexFile(rules, outputDir)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('README.md'),
        expect.stringContaining('complexity'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('README.md'),
        expect.stringContaining('performance'),
      )
    })
  })

  describe('generatePerRuleFiles', () => {
    function getTestableCommand(): {
      generatePerRuleFiles: (
        rules: Array<{
          category: string
          deprecated: boolean
          description: string
          fixable: boolean
          name: string
          recommended: boolean
        }>,
        outputDir: string,
      ) => Promise<void>
    } {
      return new Docs([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('generates file for each rule', async () => {
      const cmd = getTestableCommand()
      const rules = [
        {
          category: 'complexity',
          deprecated: false,
          description: 'Rule A',
          fixable: false,
          name: 'rule-a',
          recommended: false,
        },
        {
          category: 'complexity',
          deprecated: false,
          description: 'Rule B',
          fixable: true,
          name: 'rule-b',
          recommended: true,
        },
      ]
      const outputDir = '/tmp/test-docs'
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await cmd.generatePerRuleFiles(rules, outputDir)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('rule-a.md'),
        expect.any(String),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('rule-b.md'),
        expect.any(String),
      )
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Docs([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      return command
    }

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
  })
})
