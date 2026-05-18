import { describe, expect, it, vi } from 'vitest'

import type { RuleDoc } from '../../src/commands/docs-helpers.js'
import type { RuleDefinition, RuleMeta } from '../../src/rules/types.js'

import {
  buildRuleDocsFromLoaded,
  generateIndexContent,
  generateRuleDoc,
  generateRuleMarkdown,
  generateSingleFileContent,
  getBadges,
  groupByCategory,
} from '../../src/commands/docs-helpers.js'

// ─── Helpers ───

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

function makeRuleDef(opts: {
  category?: RuleMeta['category']
  deprecated?: boolean
  description?: string
  fixable?: 'code' | 'whitespace'
  recommended?: boolean
  withFix?: boolean
} = {}): RuleDefinition {
  return {
    create: vi.fn(),
    defaultOptions: {},
    ...(opts.withFix === true ? { fix: vi.fn() } : {}),
    meta: {
      category: opts.category ?? 'complexity',
      ...(opts.deprecated !== undefined ? { deprecated: opts.deprecated } : {}),
      description: opts.description ?? 'A test rule',
      ...(opts.fixable !== undefined ? { fixable: opts.fixable } : {}),
      name: 'mock-rule',
      recommended: opts.recommended ?? false,
    },
  }
}

// ─── generateRuleDoc ───

describe('generateRuleDoc', () => {
  it('creates RuleDoc with all basic fields from meta', () => {
    const ruleDef = makeRuleDef({
      category: 'security',
      deprecated: false,
      description: 'Disallow eval',
      recommended: true,
    })
    const doc = generateRuleDoc('no-eval', ruleDef, () => 'patterns')
    expect(doc).toEqual({
      category: 'security',
      deprecated: false,
      description: 'Disallow eval',
      fixable: false,
      name: 'no-eval',
      recommended: true,
    })
  })

  it('uses meta.category when present', () => {
    const ruleDef = makeRuleDef({ category: 'performance' })
    const doc = generateRuleDoc('my-rule', ruleDef, () => 'fallback')
    expect(doc.category).toBe('performance')
  })

  it('falls back to getRuleCategoryFn when category is undefined', () => {
    const ruleDef: RuleDefinition = {
      create: vi.fn(),
      defaultOptions: {},
      meta: {
        description: 'No category',
        name: 'no-cat',
        recommended: false,
      } as RuleMeta,
    }
    const doc = generateRuleDoc('no-cat', ruleDef, (id) => `cat-${id}`)
    expect(doc.category).toBe('cat-no-cat')
  })

  it('sets deprecated from meta.deprecated', () => {
    const ruleDef = makeRuleDef({ deprecated: true })
    const doc = generateRuleDoc('old-rule', ruleDef, () => 'patterns')
    expect(doc.deprecated).toBe(true)
  })

  it('defaults deprecated to false when undefined', () => {
    const ruleDef = makeRuleDef()
    const doc = generateRuleDoc('rule', ruleDef, () => 'patterns')
    expect(doc.deprecated).toBe(false)
  })

  it('sets fixable to true when ruleDef.fix is present', () => {
    const ruleDef = makeRuleDef({ withFix: true })
    const doc = generateRuleDoc('fixable-rule', ruleDef, () => 'patterns')
    expect(doc.fixable).toBe(true)
  })

  it('sets fixable to true when meta.fixable is set', () => {
    const ruleDef = makeRuleDef({ fixable: 'code' })
    const doc = generateRuleDoc('fixable-rule', ruleDef, () => 'patterns')
    expect(doc.fixable).toBe(true)
  })

  it('sets fixable to false when no fix source exists', () => {
    const ruleDef = makeRuleDef()
    const doc = generateRuleDoc('no-fix', ruleDef, () => 'patterns')
    expect(doc.fixable).toBe(false)
  })

  it('sets recommended from meta.recommended, defaults to false', () => {
    const ruleDefWith = makeRuleDef({ recommended: true })
    const ruleDefWithout = makeRuleDef()
    expect(generateRuleDoc('a', ruleDefWith, () => 'x').recommended).toBe(true)
    expect(generateRuleDoc('b', ruleDefWithout, () => 'x').recommended).toBe(false)
  })
})

// ─── generateRuleMarkdown ───

describe('generateRuleMarkdown', () => {
  it('produces markdown with rule name as heading', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'no-eval' }))
    expect(md).toContain('# no-eval')
  })

  it('includes description in the Description section', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ description: 'Disallow eval usage' }))
    expect(md).toContain('Disallow eval usage')
    expect(md).toContain('## Description')
  })

  it('includes recommended badge image when recommended', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    expect(md).toContain('![Recommended](')
    expect(md).toContain('recommended')
  })

  it('includes fixable badge image and auto-fix note when fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'no-eval', fixable: true }))
    expect(md).toContain('![Fixable](')
    expect(md).toContain('auto-fixable')
    expect(md).toContain('codeforge fix --rules no-eval')
  })

  it('omits fixable note when not fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: false }))
    expect(md).not.toContain('auto-fixable')
  })

  it('includes deprecated badge image when deprecated', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ deprecated: true }))
    expect(md).toContain('![Deprecated](')
  })

  it('includes JSON config example with rule name', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'max-params' }))
    expect(md).toContain('"max-params"')
    expect(md).toContain('"error"')
    expect(md).toContain('## How to Use')
  })

  it('includes property table with all fields', () => {
    const md = generateRuleMarkdown(
      makeRuleDoc({
        category: 'security',
        fixable: true,
        recommended: true,
        deprecated: false,
      }),
    )
    expect(md).toContain('| Category | security |')
    expect(md).toContain('| Fixable | Yes |')
    expect(md).toContain('| Recommended | Yes |')
    expect(md).toContain('| Deprecated | No |')
  })

  it('omits badges section entirely when no flags are set', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: false, fixable: false, deprecated: false }))
    expect(md).not.toContain('![Recommended]')
    expect(md).not.toContain('![Fixable]')
    expect(md).not.toContain('![Deprecated]')
  })
})

// ─── getBadges ───

describe('getBadges', () => {
  it('returns empty string for plain rule with no flags', () => {
    expect(getBadges(makeRuleDoc())).toBe('')
  })

  it('returns recommended badge text', () => {
    const result = getBadges(makeRuleDoc({ recommended: true }))
    expect(result).toBe(' `recommended`')
  })

  it('returns fixable badge text', () => {
    const result = getBadges(makeRuleDoc({ fixable: true }))
    expect(result).toBe(' `fixable`')
  })

  it('returns deprecated badge text', () => {
    const result = getBadges(makeRuleDoc({ deprecated: true }))
    expect(result).toBe(' `deprecated`')
  })

  it('combines all three badges when all flags are true', () => {
    const result = getBadges(
      makeRuleDoc({ recommended: true, fixable: true, deprecated: true }),
    )
    expect(result).toContain('`recommended`')
    expect(result).toContain('`fixable`')
    expect(result).toContain('`deprecated`')
  })
})

// ─── groupByCategory ───

describe('groupByCategory', () => {
  it('groups rules by category', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'security' }),
      makeRuleDoc({ name: 'b', category: 'complexity' }),
      makeRuleDoc({ name: 'c', category: 'security' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups.security).toHaveLength(2)
    expect(groups.complexity).toHaveLength(1)
  })

  it('sorts rules within each category alphabetically by name', () => {
    const rules = [
      makeRuleDoc({ name: 'z-rule', category: 'security' }),
      makeRuleDoc({ name: 'a-rule', category: 'security' }),
      makeRuleDoc({ name: 'm-rule', category: 'security' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups.security!.map((r) => r.name)).toEqual(['a-rule', 'm-rule', 'z-rule'])
  })

  it('returns empty object for empty array', () => {
    expect(groupByCategory([])).toEqual({})
  })

  it('handles single rule in single category', () => {
    const groups = groupByCategory([makeRuleDoc({ name: 'only', category: 'style' })])
    expect(Object.keys(groups)).toEqual(['style'])
    expect(groups.style).toHaveLength(1)
    expect(groups.style![0]!.name).toBe('only')
  })
})

// ─── generateIndexContent ───

describe('generateIndexContent', () => {
  it('generates overview header with correct rule count', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'rule-a' }),
      makeRuleDoc({ name: 'rule-b' }),
    ])
    expect(content).toContain('# CodeForge Rules Documentation')
    expect(content).toContain('2 available rules')
  })

  it('includes category overview table with headers', () => {
    const content = generateIndexContent([
      makeRuleDoc({ category: 'security' }),
      makeRuleDoc({ category: 'complexity' }),
    ])
    expect(content).toContain('| Category | Rules | Fixable |')
    expect(content).toContain('|----------|-------|--------|')
    expect(content).toContain('| security |')
    expect(content).toContain('| complexity |')
  })

  it('counts fixable rules correctly in overview table', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'a', category: 'security', fixable: true }),
      makeRuleDoc({ name: 'b', category: 'security', fixable: false }),
      makeRuleDoc({ name: 'c', category: 'security', fixable: true }),
    ])
    expect(content).toContain('| security | 3 | 2 |')
  })

  it('includes rules by category section with links and descriptions', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'no-eval', category: 'security', description: 'No eval' }),
    ])
    expect(content).toContain('## Rules by Category')
    expect(content).toContain('### security')
    expect(content).toContain('[no-eval](./no-eval.md)')
    expect(content).toContain('No eval')
  })

  it('handles empty rules array', () => {
    const content = generateIndexContent([])
    expect(content).toContain('0 available rules')
    expect(content).toContain('## Rules by Category')
  })
})

// ─── generateSingleFileContent ───

describe('generateSingleFileContent', () => {
  it('generates table of contents with category headings', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ category: 'security' }),
      makeRuleDoc({ category: 'complexity' }),
    ])
    expect(content).toContain('## Table of Contents')
    expect(content).toContain('- [security]')
    expect(content).toContain('- [complexity]')
  })

  it('uses lowercase anchors for category links in TOC', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ category: 'Security' }),
    ])
    expect(content).toContain('[Security](#security)')
  })

  it('includes full rule markdown for each rule', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'no-eval', description: 'Bad eval' }),
    ])
    expect(content).toContain('# no-eval')
    expect(content).toContain('Bad eval')
    expect(content).toContain('## Description')
  })

  it('includes separators between rules', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'a', category: 'style' }),
      makeRuleDoc({ name: 'b', category: 'style' }),
    ])
    expect(content).toContain('\n---\n')
  })

  it('includes rule count in header', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'a' }),
      makeRuleDoc({ name: 'b' }),
      makeRuleDoc({ name: 'c' }),
    ])
    expect(content).toContain('3 available rules')
  })
})

// ─── buildRuleDocsFromLoaded ───

describe('buildRuleDocsFromLoaded', () => {
  it('maps loaded rules to RuleDoc array', () => {
    const loaded: Record<string, RuleDefinition> = {
      'no-eval': makeRuleDef({ category: 'security', description: 'No eval' }),
      'max-params': makeRuleDef({
        category: 'complexity',
        description: 'Max params',
        withFix: true,
      }),
    }
    const docs = buildRuleDocsFromLoaded(loaded, () => 'patterns')
    expect(docs).toHaveLength(2)
    const noEval = docs.find((d) => d.name === 'no-eval')!
    const maxParams = docs.find((d) => d.name === 'max-params')!
    expect(noEval.fixable).toBe(false)
    expect(maxParams.fixable).toBe(true)
    expect(noEval.category).toBe('security')
    expect(maxParams.category).toBe('complexity')
  })

  it('sorts results alphabetically by name', () => {
    const loaded: Record<string, RuleDefinition> = {
      'z-rule': makeRuleDef({ description: 'Z' }),
      'a-rule': makeRuleDef({ description: 'A' }),
      'm-rule': makeRuleDef({ description: 'M' }),
    }
    const docs = buildRuleDocsFromLoaded(loaded, () => 'patterns')
    expect(docs.map((d) => d.name)).toEqual(['a-rule', 'm-rule', 'z-rule'])
  })

  it('uses getRuleCategoryFn as fallback for category', () => {
    const loaded: Record<string, RuleDefinition> = {
      'no-cat': {
        create: vi.fn(),
        defaultOptions: {},
        meta: {
          description: 'No category',
          name: 'no-cat',
          recommended: false,
        } as RuleMeta,
      },
    }
    const docs = buildRuleDocsFromLoaded(loaded, (id) => `cat-${id}`)
    expect(docs[0]!.category).toBe('cat-no-cat')
  })

  it('handles empty loaded rules object', () => {
    const docs = buildRuleDocsFromLoaded({}, () => 'patterns')
    expect(docs).toEqual([])
  })

  it('propagates deprecated and recommended flags', () => {
    const loaded: Record<string, RuleDefinition> = {
      'old-rule': makeRuleDef({ deprecated: true, recommended: true }),
      'new-rule': makeRuleDef({ deprecated: false, recommended: false }),
    }
    const docs = buildRuleDocsFromLoaded(loaded, () => 'patterns')
    const oldRule = docs.find((d) => d.name === 'old-rule')!
    const newRule = docs.find((d) => d.name === 'new-rule')!
    expect(oldRule.deprecated).toBe(true)
    expect(oldRule.recommended).toBe(true)
    expect(newRule.deprecated).toBe(false)
    expect(newRule.recommended).toBe(false)
  })
})
