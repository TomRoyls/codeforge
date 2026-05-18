import { describe, it, expect } from 'vitest'
import {
  generateRuleDoc,
  generateRuleMarkdown,
  getBadges,
  groupByCategory,
  generateIndexContent,
  generateSingleFileContent,
  buildRuleDocsFromLoaded,
} from '../src/commands/docs-helpers.js'
import type { RuleDefinition } from '../src/rules/types.js'

// ─── generateRuleDoc ───────────────────────────────────
describe('generateRuleDoc', () => {
  const mockRuleDef: RuleDefinition = {
    create: () => ({ onComplete: () => [], visitor: {} }),
    defaultOptions: {},
    meta: {
      category: 'security',
      description: 'Disallow eval usage',
      name: 'no-eval',
      recommended: true,
    },
  }

  it('generates a RuleDoc from rule definition', () => {
    const doc = generateRuleDoc('no-eval', mockRuleDef, () => 'fallback')
    expect(doc.name).toBe('no-eval')
    expect(doc.description).toBe('Disallow eval usage')
    expect(doc.category).toBe('security')
    expect(doc.recommended).toBe(true)
    expect(doc.deprecated).toBe(false)
  })

  it('uses fallback category when meta has none', () => {
    const noCat = {
      ...mockRuleDef,
      meta: { ...mockRuleDef.meta, category: undefined as unknown as 'security' },
    }
    const doc = generateRuleDoc('x', noCat, () => 'fallback-cat')
    expect(doc.category).toBe('fallback-cat')
  })

  it('detects fixable from fix function', () => {
    const fixable = {
      ...mockRuleDef,
      fix: () => null,
    }
    const doc = generateRuleDoc('x', fixable, () => 'cat')
    expect(doc.fixable).toBe(true)
  })

  it('detects fixable from meta.fixable', () => {
    const fixable = {
      ...mockRuleDef,
      meta: { ...mockRuleDef.meta, fixable: 'code' as const },
    }
    const doc = generateRuleDoc('x', fixable, () => 'cat')
    expect(doc.fixable).toBe(true)
  })

  it('defaults deprecated to false', () => {
    const doc = generateRuleDoc('no-eval', mockRuleDef, () => 'cat')
    expect(doc.deprecated).toBe(false)
  })

  it('detects deprecated from meta', () => {
    const deprecated = {
      ...mockRuleDef,
      meta: { ...mockRuleDef.meta, deprecated: true },
    }
    const doc = generateRuleDoc('x', deprecated, () => 'cat')
    expect(doc.deprecated).toBe(true)
  })

  it('defaults recommended to false when absent', () => {
    const notRecommended = {
      ...mockRuleDef,
      meta: { ...mockRuleDef.meta, recommended: false },
    }
    const doc = generateRuleDoc('x', notRecommended, () => 'cat')
    expect(doc.recommended).toBe(false)
  })
})

// ─── generateRuleMarkdown ──────────────────────────────
describe('generateRuleMarkdown', () => {
  const baseRule = {
    category: 'security',
    deprecated: false,
    description: 'Test rule',
    fixable: false,
    name: 'no-eval',
    recommended: true,
  }

  it('generates markdown with rule name as header', () => {
    const md = generateRuleMarkdown(baseRule)
    expect(md).toContain('# no-eval')
  })

  it('includes description', () => {
    const md = generateRuleMarkdown(baseRule)
    expect(md).toContain('Test rule')
  })

  it('includes category in table', () => {
    const md = generateRuleMarkdown(baseRule)
    expect(md).toContain('security')
  })

  it('includes recommended badge when recommended', () => {
    const md = generateRuleMarkdown({ ...baseRule, recommended: true })
    expect(md).toContain('recommended')
  })

  it('omits recommended badge when not recommended', () => {
    const md = generateRuleMarkdown({ ...baseRule, recommended: false })
    expect(md).not.toContain('badge/-recommended')
  })

  it('includes fixable badge and note when fixable', () => {
    const md = generateRuleMarkdown({ ...baseRule, fixable: true })
    expect(md).toContain('fixable')
    expect(md).toContain('codeforge fix --rules no-eval')
  })

  it('omits fixable note when not fixable', () => {
    const md = generateRuleMarkdown({ ...baseRule, fixable: false })
    expect(md).not.toContain('codeforge fix --rules')
  })

  it('includes deprecated badge when deprecated', () => {
    const md = generateRuleMarkdown({ ...baseRule, deprecated: true })
    expect(md).toContain('deprecated')
  })

  it('includes How to Use section with JSON example', () => {
    const md = generateRuleMarkdown(baseRule)
    expect(md).toContain('How to Use')
    expect(md).toContain('"no-eval": "error"')
  })

  it('includes property table', () => {
    const md = generateRuleMarkdown(baseRule)
    expect(md).toContain('Fixable')
    expect(md).toContain('Recommended')
    expect(md).toContain('Deprecated')
    expect(md).toContain('Category')
  })
})

// ─── getBadges ─────────────────────────────────────────
describe('getBadges', () => {
  it('returns empty string when no badges apply', () => {
    expect(
      getBadges({
        category: 'test',
        deprecated: false,
        description: '',
        fixable: false,
        name: 'x',
        recommended: false,
      }),
    ).toBe('')
  })

  it('returns recommended badge', () => {
    const badges = getBadges({
      category: 'test',
      deprecated: false,
      description: '',
      fixable: false,
      name: 'x',
      recommended: true,
    })
    expect(badges).toContain('recommended')
  })

  it('returns fixable badge', () => {
    const badges = getBadges({
      category: 'test',
      deprecated: false,
      description: '',
      fixable: true,
      name: 'x',
      recommended: false,
    })
    expect(badges).toContain('fixable')
  })

  it('returns deprecated badge', () => {
    const badges = getBadges({
      category: 'test',
      deprecated: true,
      description: '',
      fixable: false,
      name: 'x',
      recommended: false,
    })
    expect(badges).toContain('deprecated')
  })

  it('returns multiple badges combined', () => {
    const badges = getBadges({
      category: 'test',
      deprecated: true,
      description: '',
      fixable: true,
      name: 'x',
      recommended: true,
    })
    expect(badges).toContain('recommended')
    expect(badges).toContain('fixable')
    expect(badges).toContain('deprecated')
  })
})

// ─── groupByCategory ───────────────────────────────────
describe('groupByCategory', () => {
  it('groups rules by category', () => {
    const rules = [
      { category: 'security', deprecated: false, description: '', fixable: false, name: 'a-rule', recommended: false },
      { category: 'security', deprecated: false, description: '', fixable: false, name: 'b-rule', recommended: false },
      { category: 'complexity', deprecated: false, description: '', fixable: false, name: 'c-rule', recommended: false },
    ]
    const groups = groupByCategory(rules)
    expect(Object.keys(groups)).toContain('security')
    expect(Object.keys(groups)).toContain('complexity')
    expect(groups.security).toHaveLength(2)
    expect(groups.complexity).toHaveLength(1)
  })

  it('sorts rules alphabetically within each category', () => {
    const rules = [
      { category: 'test', deprecated: false, description: '', fixable: false, name: 'z-rule', recommended: false },
      { category: 'test', deprecated: false, description: '', fixable: false, name: 'a-rule', recommended: false },
      { category: 'test', deprecated: false, description: '', fixable: false, name: 'm-rule', recommended: false },
    ]
    const groups = groupByCategory(rules)
    expect(groups.test.map((r) => r.name)).toEqual(['a-rule', 'm-rule', 'z-rule'])
  })

  it('returns empty object for empty input', () => {
    expect(groupByCategory([])).toEqual({})
  })
})

// ─── generateIndexContent ──────────────────────────────
describe('generateIndexContent', () => {
  const rules = [
    { category: 'security', deprecated: false, description: 'Security rule', fixable: true, name: 'no-eval', recommended: true },
    { category: 'complexity', deprecated: false, description: 'Complexity rule', fixable: false, name: 'max-params', recommended: false },
  ]

  it('includes document header', () => {
    const content = generateIndexContent(rules)
    expect(content).toContain('CodeForge Rules Documentation')
  })

  it('includes rule count', () => {
    const content = generateIndexContent(rules)
    expect(content).toContain('2 available rules')
  })

  it('includes overview table', () => {
    const content = generateIndexContent(rules)
    expect(content).toContain('Category')
    expect(content).toContain('Rules')
    expect(content).toContain('Fixable')
  })

  it('includes category headers', () => {
    const content = generateIndexContent(rules)
    expect(content).toContain('### security')
    expect(content).toContain('### complexity')
  })

  it('includes rule links', () => {
    const content = generateIndexContent(rules)
    expect(content).toContain('[no-eval](./no-eval.md)')
    expect(content).toContain('[max-params](./max-params.md)')
  })

  it('includes rule descriptions', () => {
    const content = generateIndexContent(rules)
    expect(content).toContain('Security rule')
    expect(content).toContain('Complexity rule')
  })

  it('handles empty rules array', () => {
    const content = generateIndexContent([])
    expect(content).toContain('0 available rules')
  })
})

// ─── generateSingleFileContent ─────────────────────────
describe('generateSingleFileContent', () => {
  const rules = [
    { category: 'security', deprecated: false, description: 'No eval', fixable: false, name: 'no-eval', recommended: false },
  ]

  it('includes table of contents', () => {
    const content = generateSingleFileContent(rules)
    expect(content).toContain('Table of Contents')
    expect(content).toContain('security')
  })

  it('includes rule markdown content', () => {
    const content = generateSingleFileContent(rules)
    expect(content).toContain('# no-eval')
    expect(content).toContain('No eval')
  })

  it('includes separator between rules', () => {
    const content = generateSingleFileContent(rules)
    expect(content).toContain('---')
  })
})

// ─── buildRuleDocsFromLoaded ───────────────────────────
describe('buildRuleDocsFromLoaded', () => {
  it('builds docs from loaded rules', () => {
    const loaded: Record<string, RuleDefinition> = {
      'no-eval': {
        create: () => ({ onComplete: () => [], visitor: {} }),
        defaultOptions: {},
        meta: { category: 'security', description: 'No eval', name: 'no-eval', recommended: true },
      },
      'max-params': {
        create: () => ({ onComplete: () => [], visitor: {} }),
        defaultOptions: {},
        meta: { category: 'complexity', description: 'Max params', name: 'max-params', recommended: false },
      },
    }

    const docs = buildRuleDocsFromLoaded(loaded, () => 'fallback')
    expect(docs).toHaveLength(2)
    expect(docs[0].name).toBe('max-params') // sorted alphabetically
    expect(docs[1].name).toBe('no-eval')
  })

  it('returns empty array for empty input', () => {
    const docs = buildRuleDocsFromLoaded({}, () => 'cat')
    expect(docs).toEqual([])
  })

  it('sorts docs by name', () => {
    const loaded: Record<string, RuleDefinition> = {
      'z-rule': {
        create: () => ({ onComplete: () => [], visitor: {} }),
        defaultOptions: {},
        meta: { category: 'test', description: '', name: 'z-rule', recommended: false },
      },
      'a-rule': {
        create: () => ({ onComplete: () => [], visitor: {} }),
        defaultOptions: {},
        meta: { category: 'test', description: '', name: 'a-rule', recommended: false },
      },
    }

    const docs = buildRuleDocsFromLoaded(loaded, () => 'cat')
    expect(docs[0].name).toBe('a-rule')
    expect(docs[1].name).toBe('z-rule')
  })
})
