import { describe, expect, it } from 'vitest'

import type { RuleDoc } from '../../src/commands/docs-helpers.js'

import Docs from '../../src/commands/docs.js'

// ─── Helpers

function makeRuleDoc(overrides: Partial<RuleDoc> = {}): RuleDoc {
  return {
    category: overrides.category ?? 'complexity',
    deprecated: overrides.deprecated ?? false,
    description: overrides.description ?? 'A test rule',
    fixable: overrides.fixable ?? false,
    name: overrides.name ?? 'test-rule',
    recommended: overrides.recommended ?? false,
  }
}

// ─── Command Properties ───

describe('Docs Command', () => {
  it('has correct static description', () => {
    expect(Docs.description).toBe('Generate markdown documentation for all rules')
  })

  it('has static examples defined', () => {
    expect(Docs.examples).toBeInstanceOf(Array)
    expect(Docs.examples.length).toBeGreaterThanOrEqual(2)
  })

  it('has category flag with correct options', () => {
    expect(Docs.flags.category).toBeDefined()
    expect(Docs.flags.category?.description).toBe('Filter rules by category')
    expect(Docs.flags.category?.options).toContain('complexity')
    expect(Docs.flags.category?.options).toContain('security')
    expect(Docs.flags.category?.options).toContain('performance')
  })

  it('has output flag with default value', () => {
    expect(Docs.flags.output).toBeDefined()
    expect(Docs.flags.output?.default).toBe('docs/rules')
    expect(Docs.flags.output?.description).toContain('Output directory')
  })

  it('has single flag with correct default', () => {
    expect(Docs.flags.single).toBeDefined()
    expect(Docs.flags.single?.default).toBe(false)
    expect(Docs.flags.single?.description).toContain('single combined file')
  })
})

// ─── Instance Methods ───

describe('Docs Instance Methods', () => {
  it('generateRuleMarkdown generates markdown with rule name as heading', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ name: 'test-rule' })
    const markdown = cmd.generateRuleMarkdown(ruleDoc)
    expect(markdown).toContain('# test-rule')
  })

  it('generateRuleMarkdown includes description', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ description: 'Test description' })
    const markdown = cmd.generateRuleMarkdown(ruleDoc)
    expect(markdown).toContain('Test description')
    expect(markdown).toContain('## Description')
  })

  it('generateRuleMarkdown includes category in property table', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ category: 'security' })
    const markdown = cmd.generateRuleMarkdown(ruleDoc)
    expect(markdown).toContain('| Category | security |')
  })

  it('generateRuleMarkdown includes recommended badge when recommended is true', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ recommended: true })
    const markdown = cmd.generateRuleMarkdown(ruleDoc)
    expect(markdown).toContain('recommended')
  })

  it('generateRuleMarkdown includes fixable badge when fixable is true', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ name: 'test-rule', fixable: true })
    const markdown = cmd.generateRuleMarkdown(ruleDoc)
    expect(markdown).toContain('fixable')
    expect(markdown).toContain('auto-fixable')
  })

  it('getBadges returns empty string for plain rule', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc()
    const badges = cmd.getBadges(ruleDoc)
    expect(badges).toBe('')
  })

  it('getBadges returns recommended badge text', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ recommended: true })
    const badges = cmd.getBadges(ruleDoc)
    expect(badges).toContain('recommended')
  })

  it('getBadges returns fixable badge text', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ fixable: true })
    const badges = cmd.getBadges(ruleDoc)
    expect(badges).toContain('fixable')
  })

  it('getBadges returns deprecated badge text', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ deprecated: true })
    const badges = cmd.getBadges(ruleDoc)
    expect(badges).toContain('deprecated')
  })

  it('getBadges combines multiple badges', () => {
    const cmd = new Docs([], {} as never)
    const ruleDoc = makeRuleDoc({ recommended: true, fixable: true })
    const badges = cmd.getBadges(ruleDoc)
    expect(badges).toContain('recommended')
    expect(badges).toContain('fixable')
  })

  it('groupByCategory groups rules by category', () => {
    const cmd = new Docs([], {} as never)
    const rules = [
      makeRuleDoc({ name: 'a', category: 'security' }),
      makeRuleDoc({ name: 'b', category: 'complexity' }),
      makeRuleDoc({ name: 'c', category: 'security' }),
    ]
    const groups = cmd.groupByCategory(rules)
    expect(groups.security).toHaveLength(2)
    expect(groups.complexity).toHaveLength(1)
  })

  it('groupByCategory sorts rules within each category alphabetically by name', () => {
    const cmd = new Docs([], {} as never)
    const rules = [
      makeRuleDoc({ name: 'z-rule', category: 'security' }),
      makeRuleDoc({ name: 'a-rule', category: 'security' }),
      makeRuleDoc({ name: 'm-rule', category: 'security' }),
    ]
    const groups = cmd.groupByCategory(rules)
    expect(groups.security!.map((r) => r.name)).toEqual(['a-rule', 'm-rule', 'z-rule'])
  })

  it('groupByCategory returns empty object for empty array', () => {
    const cmd = new Docs([], {} as never)
    const groups = cmd.groupByCategory([])
    expect(groups).toEqual({})
  })
})