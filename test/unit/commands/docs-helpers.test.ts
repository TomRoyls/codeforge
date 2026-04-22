import { describe, test, expect } from 'vitest'
import {
  type RuleDoc,
  buildRuleDocsFromLoaded,
  generateIndexContent,
  generateRuleDoc,
  generateRuleMarkdown,
  generateSingleFileContent,
  getBadges,
  groupByCategory,
} from '../../../src/commands/docs-helpers.js'

const mockGetRuleCategory = (ruleId: string): string => {
  if (ruleId.startsWith('max-')) return 'complexity'
  if (ruleId.startsWith('no-')) return 'performance'
  return 'style'
}

function makeRuleDoc(overrides: Partial<RuleDoc> = {}): RuleDoc {
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

function makeRuleDef(overrides: Record<string, unknown> = {}) {
  return {
    meta: {
      description: 'A test rule',
      category: 'complexity',
      recommended: true,
      ...overrides,
    },
    create: () => ({}),
    ...overrides,
  }
}

describe('generateRuleDoc', () => {
  test('creates RuleDoc from basic rule definition', () => {
    const ruleDef = makeRuleDef()
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.name).toBe('test-rule')
    expect(result.category).toBe('complexity')
    expect(result.description).toBe('A test rule')
    expect(result.recommended).toBe(true)
    expect(result.deprecated).toBe(false)
  })

  test('uses getRuleCategoryFn when meta.category is undefined', () => {
    const ruleDef = makeRuleDef({ category: undefined })
    const result = generateRuleDoc('no-eval', ruleDef as never, mockGetRuleCategory)
    expect(result.category).toBe('performance')
  })

  test('prefers meta.category over getRuleCategoryFn', () => {
    const ruleDef = makeRuleDef({ category: 'security' })
    const result = generateRuleDoc('no-eval', ruleDef as never, mockGetRuleCategory)
    expect(result.category).toBe('security')
  })

  test('detects fixable from fix function', () => {
    const ruleDef = makeRuleDef()
    ruleDef.fix = () => {}
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
  })

  test('detects fixable from meta.fixable', () => {
    const ruleDef = makeRuleDef({ fixable: 'code' })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
  })

  test('returns fixable false when neither fix nor meta.fixable', () => {
    const ruleDef = makeRuleDef()
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(false)
  })

  test('detects deprecated from meta', () => {
    const ruleDef = makeRuleDef({ deprecated: true })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.deprecated).toBe(true)
  })

  test('defaults deprecated to false', () => {
    const ruleDef = makeRuleDef()
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.deprecated).toBe(false)
  })

  test('defaults recommended to false when not set', () => {
    const ruleDef = makeRuleDef({ recommended: undefined })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.recommended).toBe(false)
  })

  test('sets all flags to true simultaneously', () => {
    const ruleDef = makeRuleDef({ deprecated: true, recommended: true, fixable: 'code' })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
    expect(result.recommended).toBe(true)
    expect(result.deprecated).toBe(true)
  })

  test('preserves description exactly as provided', () => {
    const ruleDef = makeRuleDef({
      description: 'A very specific description with "quotes" and <brackets>',
    })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.description).toBe('A very specific description with "quotes" and <brackets>')
  })

  test('uses style category for non-matching rule IDs via fallback', () => {
    const ruleDef = makeRuleDef({ category: undefined })
    const result = generateRuleDoc('some-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.category).toBe('style')
  })

  test('handles empty description string', () => {
    const ruleDef = makeRuleDef({ description: '' })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.description).toBe('')
  })

  test('detects fixable from fix function even when meta.fixable is falsy', () => {
    const ruleDef = makeRuleDef()
    ruleDef.fix = () => {}
    ruleDef.meta.fixable = undefined
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
  })
})

describe('generateRuleMarkdown', () => {
  test('includes rule name as heading', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'my-rule' }))
    expect(md).toContain('# my-rule')
  })

  test('includes description section', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ description: 'A cool rule' }))
    expect(md).toContain('## Description')
    expect(md).toContain('A cool rule')
  })

  test('includes how to use section with rule name in JSON', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'my-rule' }))
    expect(md).toContain('## How to Use')
    expect(md).toContain('"my-rule": "error"')
  })

  test('includes property table with category', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ category: 'security' }))
    expect(md).toContain('| Category | security |')
  })

  test('shows Yes for fixable rule in property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true }))
    expect(md).toContain('| Fixable | Yes |')
  })

  test('shows No for non-fixable rule in property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: false }))
    expect(md).toContain('| Fixable | No |')
  })

  test('shows Yes for recommended rule in property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    expect(md).toContain('| Recommended | Yes |')
  })

  test('shows No for non-recommended rule in property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: false }))
    expect(md).toContain('| Recommended | No |')
  })

  test('shows Yes for deprecated rule in property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ deprecated: true }))
    expect(md).toContain('| Deprecated | Yes |')
  })

  test('shows No for non-deprecated rule in property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ deprecated: false }))
    expect(md).toContain('| Deprecated | No |')
  })

  test('includes auto-fixable note for fixable rules', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true, name: 'fix-me' }))
    expect(md).toContain('auto-fixable')
    expect(md).toContain('codeforge fix --rules fix-me')
  })

  test('does not include auto-fixable note for non-fixable rules', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: false }))
    expect(md).not.toContain('auto-fixable')
  })

  test('includes recommended badge image when recommended', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    expect(md).toContain('badge/-recommended-blue')
  })

  test('includes fixable badge image when fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true }))
    expect(md).toContain('badge/-fixable-green')
  })

  test('includes deprecated badge image when deprecated', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ deprecated: true }))
    expect(md).toContain('badge/-deprecated-red')
  })

  test('does not include badge section when no badges apply', () => {
    const md = generateRuleMarkdown(
      makeRuleDoc({ recommended: false, fixable: false, deprecated: false }),
    )
    expect(md).not.toContain('img.shields.io')
  })

  test('places badges before the property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    const badgeIndex = md.indexOf('badge/-recommended-blue')
    const tableIndex = md.indexOf('| Property |')
    expect(badgeIndex).toBeLessThan(tableIndex)
  })

  test('includes all three badges when all flags are true', () => {
    const md = generateRuleMarkdown(
      makeRuleDoc({ recommended: true, fixable: true, deprecated: true }),
    )
    expect(md).toContain('badge/-recommended-blue')
    expect(md).toContain('badge/-fixable-green')
    expect(md).toContain('badge/-deprecated-red')
  })

  test('places heading before description section', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'ordering-test' }))
    const headingIndex = md.indexOf('# ordering-test')
    const descIndex = md.indexOf('## Description')
    expect(headingIndex).toBeLessThan(descIndex)
  })

  test('places description before how to use section', () => {
    const md = generateRuleMarkdown(makeRuleDoc())
    const descIndex = md.indexOf('## Description')
    const howToIndex = md.indexOf('## How to Use')
    expect(descIndex).toBeLessThan(howToIndex)
  })

  test('generates valid JSON config example', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'json-test' }))
    const jsonBlock = md.match(/```json\n([\s\S]*?)\n```/)?.[1]
    expect(jsonBlock).toBeDefined()
    const parsed = JSON.parse(jsonBlock!)
    expect(parsed.rules['json-test']).toBe('error')
  })

  test('includes all four property table rows', () => {
    const md = generateRuleMarkdown(makeRuleDoc())
    expect(md).toContain('| Category |')
    expect(md).toContain('| Fixable |')
    expect(md).toContain('| Recommended |')
    expect(md).toContain('| Deprecated |')
  })

  test('handles special characters in rule name', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'no-eval-with-dashes' }))
    expect(md).toContain('# no-eval-with-dashes')
    expect(md).toContain('"no-eval-with-dashes": "error"')
  })

  test('handles special characters in description', () => {
    const md = generateRuleMarkdown(
      makeRuleDoc({ description: 'Use `const` instead of "let" when <possible>' }),
    )
    expect(md).toContain('Use `const` instead of "let" when <possible>')
  })

  test('handles very long description', () => {
    const longDesc = 'A'.repeat(500)
    const md = generateRuleMarkdown(makeRuleDoc({ description: longDesc }))
    expect(md).toContain(longDesc)
  })

  test('handles multiline description', () => {
    const multiDesc = 'Line one\nLine two\nLine three'
    const md = generateRuleMarkdown(makeRuleDoc({ description: multiDesc }))
    expect(md).toContain(multiDesc)
  })

  test('auto-fix note is placed after how to use section', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true, name: 'fix-pos' }))
    const howToIndex = md.indexOf('## How to Use')
    const fixIndex = md.indexOf('auto-fixable')
    expect(howToIndex).toBeLessThan(fixIndex)
  })

  test('badge section ends with double newline before table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    expect(md).toContain('blue)\n\n| Property |')
  })
})

describe('getBadges', () => {
  test('returns empty string for rule with no badges', () => {
    expect(getBadges(makeRuleDoc())).toBe('')
  })

  test('returns recommended badge', () => {
    const result = getBadges(makeRuleDoc({ recommended: true }))
    expect(result).toContain('`recommended`')
  })

  test('returns fixable badge', () => {
    const result = getBadges(makeRuleDoc({ fixable: true }))
    expect(result).toContain('`fixable`')
  })

  test('returns deprecated badge', () => {
    const result = getBadges(makeRuleDoc({ deprecated: true }))
    expect(result).toContain('`deprecated`')
  })

  test('returns all badges when all apply', () => {
    const result = getBadges(makeRuleDoc({ recommended: true, fixable: true, deprecated: true }))
    expect(result).toContain('`recommended`')
    expect(result).toContain('`fixable`')
    expect(result).toContain('`deprecated`')
  })

  test('returns recommended and fixable without deprecated', () => {
    const result = getBadges(makeRuleDoc({ recommended: true, fixable: true, deprecated: false }))
    expect(result).toContain('`recommended`')
    expect(result).toContain('`fixable`')
    expect(result).not.toContain('`deprecated`')
  })

  test('returns badges in correct order: recommended, fixable, deprecated', () => {
    const result = getBadges(makeRuleDoc({ recommended: true, fixable: true, deprecated: true }))
    const recIdx = result.indexOf('`recommended`')
    const fixIdx = result.indexOf('`fixable`')
    const depIdx = result.indexOf('`deprecated`')
    expect(recIdx).toBeLessThan(fixIdx)
    expect(fixIdx).toBeLessThan(depIdx)
  })

  test('returns only recommended and deprecated badges', () => {
    const result = getBadges(makeRuleDoc({ recommended: true, deprecated: true, fixable: false }))
    expect(result).toContain('`recommended`')
    expect(result).toContain('`deprecated`')
    expect(result).not.toContain('`fixable`')
  })

  test('returns only fixable and deprecated badges', () => {
    const result = getBadges(makeRuleDoc({ fixable: true, deprecated: true, recommended: false }))
    expect(result).toContain('`fixable`')
    expect(result).toContain('`deprecated`')
    expect(result).not.toContain('`recommended`')
  })

  test('each badge text is preceded by a space', () => {
    const result = getBadges(makeRuleDoc({ recommended: true }))
    expect(result.startsWith(' ')).toBe(true)
  })

  test('only recommended badge has correct length', () => {
    const result = getBadges(makeRuleDoc({ recommended: true }))
    expect(result).toBe(' `recommended`')
  })
})

describe('groupByCategory', () => {
  test('groups rules by category', () => {
    const rules = [
      makeRuleDoc({ name: 'rule-a', category: 'complexity' }),
      makeRuleDoc({ name: 'rule-b', category: 'complexity' }),
      makeRuleDoc({ name: 'rule-c', category: 'performance' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['complexity']).toHaveLength(2)
    expect(groups['performance']).toHaveLength(1)
  })

  test('returns empty object for empty input', () => {
    const groups = groupByCategory([])
    expect(Object.keys(groups)).toHaveLength(0)
  })

  test('sorts rules within each category by name', () => {
    const rules = [
      makeRuleDoc({ name: 'zebra', category: 'complexity' }),
      makeRuleDoc({ name: 'apple', category: 'complexity' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['complexity'][0].name).toBe('apple')
    expect(groups['complexity'][1].name).toBe('zebra')
  })

  test('handles single rule in single category', () => {
    const rules = [makeRuleDoc({ name: 'solo', category: 'style' })]
    const groups = groupByCategory(rules)
    expect(groups['style']).toHaveLength(1)
    expect(groups['style'][0].name).toBe('solo')
  })

  test('handles many categories', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'complexity' }),
      makeRuleDoc({ name: 'b', category: 'performance' }),
      makeRuleDoc({ name: 'c', category: 'security' }),
      makeRuleDoc({ name: 'd', category: 'style' }),
    ]
    const groups = groupByCategory(rules)
    expect(Object.keys(groups)).toHaveLength(4)
  })

  test('preserves all rule properties after grouping', () => {
    const rules = [
      makeRuleDoc({
        name: 'full-rule',
        category: 'security',
        description: 'Full desc',
        fixable: true,
        recommended: true,
        deprecated: false,
      }),
    ]
    const groups = groupByCategory(rules)
    const grouped = groups['security']![0]
    expect(grouped.name).toBe('full-rule')
    expect(grouped.description).toBe('Full desc')
    expect(grouped.fixable).toBe(true)
    expect(grouped.recommended).toBe(true)
    expect(grouped.deprecated).toBe(false)
  })

  test('sorts rules independently in each category', () => {
    const rules = [
      makeRuleDoc({ name: 'z-cmp', category: 'complexity' }),
      makeRuleDoc({ name: 'a-cmp', category: 'complexity' }),
      makeRuleDoc({ name: 'z-sec', category: 'security' }),
      makeRuleDoc({ name: 'a-sec', category: 'security' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['complexity']![0].name).toBe('a-cmp')
    expect(groups['complexity']![1].name).toBe('z-cmp')
    expect(groups['security']![0].name).toBe('a-sec')
    expect(groups['security']![1].name).toBe('z-sec')
  })

  test('handles many rules in the same category', () => {
    const rules = Array.from({ length: 20 }, (_, i) =>
      makeRuleDoc({ name: `rule-${String(i).padStart(2, '0')}`, category: 'complexity' }),
    )
    const groups = groupByCategory(rules)
    expect(groups['complexity']).toHaveLength(20)
    expect(groups['complexity']![0].name).toBe('rule-00')
    expect(groups['complexity']![19].name).toBe('rule-19')
  })

  test('does not create categories for undefined keys', () => {
    const rules = [makeRuleDoc({ name: 'a', category: 'alpha' })]
    const groups = groupByCategory(rules)
    expect(groups['beta']).toBeUndefined()
  })

  test('handles numeric-prefix names sort correctly', () => {
    const rules = [
      makeRuleDoc({ name: '2-rule', category: 'style' }),
      makeRuleDoc({ name: '10-rule', category: 'style' }),
      makeRuleDoc({ name: '1-rule', category: 'style' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['style']![0].name).toBe('1-rule')
    expect(groups['style']![1].name).toBe('10-rule')
    expect(groups['style']![2].name).toBe('2-rule')
  })
})

describe('generateIndexContent', () => {
  test('includes main heading', () => {
    const content = generateIndexContent([makeRuleDoc()])
    expect(content).toContain('# CodeForge Rules Documentation')
  })

  test('includes rule count', () => {
    const content = generateIndexContent([makeRuleDoc(), makeRuleDoc()])
    expect(content).toContain('2 available rules')
  })

  test('includes overview table with headers', () => {
    const content = generateIndexContent([makeRuleDoc()])
    expect(content).toContain('| Category | Rules | Fixable |')
    expect(content).toContain('|----------|-------|--------|')
  })

  test('includes category in overview table', () => {
    const content = generateIndexContent([makeRuleDoc({ category: 'security' })])
    expect(content).toContain('| security | 1 | 0 |')
  })

  test('counts fixable rules correctly in overview', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'complexity', fixable: true }),
      makeRuleDoc({ name: 'b', category: 'complexity', fixable: false }),
      makeRuleDoc({ name: 'c', category: 'complexity', fixable: true }),
    ]
    const content = generateIndexContent(rules)
    expect(content).toContain('| complexity | 3 | 2 |')
  })

  test('includes Rules by Category section', () => {
    const content = generateIndexContent([makeRuleDoc()])
    expect(content).toContain('## Rules by Category')
  })

  test('includes rule link with name', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'my-rule' })])
    expect(content).toContain('[my-rule](./my-rule.md)')
  })

  test('includes rule description', () => {
    const content = generateIndexContent([makeRuleDoc({ description: 'Checks for bugs' })])
    expect(content).toContain('Checks for bugs')
  })

  test('includes badges for recommended rule', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'rec-rule', recommended: true })])
    expect(content).toContain('`recommended`')
  })

  test('separates categories with headings', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'complexity' }),
      makeRuleDoc({ name: 'b', category: 'security' }),
    ]
    const content = generateIndexContent(rules)
    expect(content).toContain('### complexity')
    expect(content).toContain('### security')
  })

  test('shows zero fixable count for category with no fixable rules', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'style', fixable: false }),
      makeRuleDoc({ name: 'b', category: 'style', fixable: false }),
    ]
    const content = generateIndexContent(rules)
    expect(content).toContain('| style | 2 | 0 |')
  })

  test('lists multiple rules under same category', () => {
    const rules = [
      makeRuleDoc({ name: 'alpha', category: 'complexity' }),
      makeRuleDoc({ name: 'beta', category: 'complexity' }),
    ]
    const content = generateIndexContent(rules)
    expect(content).toContain('[alpha](./alpha.md)')
    expect(content).toContain('[beta](./beta.md)')
  })

  test('formats rules as list items with dash prefix', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'list-item' })])
    expect(content).toContain('- [list-item](./list-item.md)')
  })

  test('includes all badges inline for rule with all flags', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'all-flags', recommended: true, fixable: true, deprecated: true }),
    ])
    expect(content).toContain('`recommended`')
    expect(content).toContain('`fixable`')
    expect(content).toContain('`deprecated`')
  })

  test('includes fixable badge for fixable rule', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'fixable-rule', fixable: true })])
    expect(content).toContain('`fixable`')
  })

  test('content structure follows expected order', () => {
    const content = generateIndexContent([makeRuleDoc()])
    const headingIdx = content.indexOf('# CodeForge Rules Documentation')
    const overviewIdx = content.indexOf('## Overview')
    const rulesByIdx = content.indexOf('## Rules by Category')
    expect(headingIdx).toBeLessThan(overviewIdx)
    expect(overviewIdx).toBeLessThan(rulesByIdx)
  })

  test('rule listing includes dash, link, badges, and description', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'desc-rule', description: 'My desc', recommended: true }),
    ])
    expect(content).toContain('- [desc-rule](./desc-rule.md) `recommended` - My desc')
  })

  test('handles single rule correctly', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'only-one', category: 'style' })])
    expect(content).toContain('1 available rules')
    expect(content).toContain('| style | 1 | 0 |')
    expect(content).toContain('### style')
    expect(content).toContain('[only-one](./only-one.md)')
  })

  test('overview table separates multiple categories', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'alpha' }),
      makeRuleDoc({ name: 'b', category: 'beta' }),
    ]
    const content = generateIndexContent(rules)
    expect(content).toContain('| alpha | 1 | 0 |')
    expect(content).toContain('| beta | 1 | 0 |')
  })
})

describe('generateSingleFileContent', () => {
  test('includes main heading', () => {
    const content = generateSingleFileContent([makeRuleDoc()])
    expect(content).toContain('# CodeForge Rules Documentation')
  })

  test('includes rule count', () => {
    const content = generateSingleFileContent([makeRuleDoc(), makeRuleDoc(), makeRuleDoc()])
    expect(content).toContain('3 available rules')
  })

  test('includes Table of Contents section', () => {
    const content = generateSingleFileContent([makeRuleDoc()])
    expect(content).toContain('## Table of Contents')
  })

  test('includes category links in TOC', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'complexity' }),
      makeRuleDoc({ name: 'b', category: 'security' }),
    ]
    const content = generateSingleFileContent(rules)
    expect(content).toContain('- [complexity](#complexity)')
    expect(content).toContain('- [security](#security)')
  })

  test('includes rule markdown for each rule', () => {
    const rules = [
      makeRuleDoc({ name: 'rule-alpha', description: 'Alpha desc' }),
      makeRuleDoc({ name: 'rule-beta', description: 'Beta desc' }),
    ]
    const content = generateSingleFileContent(rules)
    expect(content).toContain('# rule-alpha')
    expect(content).toContain('# rule-beta')
    expect(content).toContain('Alpha desc')
    expect(content).toContain('Beta desc')
  })

  test('includes horizontal rules between rules', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'complexity' }),
      makeRuleDoc({ name: 'b', category: 'complexity' }),
    ]
    const content = generateSingleFileContent(rules)
    expect(content).toContain('\n---\n')
  })

  test('groups rules under category headings', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'complexity' }),
      makeRuleDoc({ name: 'b', category: 'security' }),
    ]
    const content = generateSingleFileContent(rules)
    expect(content).toContain('## complexity')
    expect(content).toContain('## security')
  })

  test('TOC links use lowercase anchors', () => {
    const rules = [makeRuleDoc({ name: 'a', category: 'Complexity' })]
    const content = generateSingleFileContent(rules)
    expect(content).toContain('- [Complexity](#complexity)')
  })

  test('includes separator after TOC', () => {
    const content = generateSingleFileContent([makeRuleDoc()])
    expect(content).toContain('\n---\n\n## ')
  })

  test('includes complete rule markdown with all sections', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'complete-rule', description: 'Full desc', category: 'style' }),
    ])
    expect(content).toContain('# complete-rule')
    expect(content).toContain('## Description')
    expect(content).toContain('Full desc')
    expect(content).toContain('## How to Use')
    expect(content).toContain('| Property |')
  })

  test('places TOC before rule content', () => {
    const content = generateSingleFileContent([makeRuleDoc({ name: 'toc-order' })])
    const tocIdx = content.indexOf('## Table of Contents')
    const ruleIdx = content.indexOf('# toc-order')
    expect(tocIdx).toBeLessThan(ruleIdx)
  })

  test('separates rules within same category with horizontal rule', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'style' }),
      makeRuleDoc({ name: 'b', category: 'style' }),
    ]
    const content = generateSingleFileContent(rules)
    const ruleAIdx = content.indexOf('# a')
    const ruleBIdx = content.indexOf('# b')
    const separatorBetween = content.indexOf('\n---\n', ruleAIdx)
    expect(separatorBetween).toBeGreaterThan(ruleAIdx)
    expect(separatorBetween).toBeLessThan(ruleBIdx)
  })

  test('handles single rule producing valid markdown', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'solo', description: 'Only rule', category: 'test' }),
    ])
    expect(content).toContain('1 available rules')
    expect(content).toContain('- [test](#test)')
    expect(content).toContain('## test')
    expect(content).toContain('# solo')
    expect(content).toContain('Only rule')
  })

  test('TOC contains all unique categories', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'alpha' }),
      makeRuleDoc({ name: 'b', category: 'beta' }),
      makeRuleDoc({ name: 'c', category: 'gamma' }),
    ]
    const content = generateSingleFileContent(rules)
    expect(content).toContain('- [alpha](#alpha)')
    expect(content).toContain('- [beta](#beta)')
    expect(content).toContain('- [gamma](#gamma)')
  })

  test('rules within categories are sorted by name', () => {
    const rules = [
      makeRuleDoc({ name: 'z-rule', category: 'style' }),
      makeRuleDoc({ name: 'a-rule', category: 'style' }),
    ]
    const content = generateSingleFileContent(rules)
    const aIdx = content.indexOf('# a-rule')
    const zIdx = content.indexOf('# z-rule')
    expect(aIdx).toBeLessThan(zIdx)
  })

  test('fixable rules include auto-fix note in single file output', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'fixable-single', fixable: true, category: 'style' }),
    ])
    expect(content).toContain('auto-fixable')
    expect(content).toContain('codeforge fix --rules fixable-single')
  })
})

describe('buildRuleDocsFromLoaded', () => {
  test('returns empty array for empty loaded rules', () => {
    const result = buildRuleDocsFromLoaded({}, mockGetRuleCategory)
    expect(result).toEqual([])
  })

  test('creates RuleDoc for each loaded rule', () => {
    const loaded = {
      'rule-a': makeRuleDef({ description: 'Rule A', category: 'complexity' }),
      'rule-b': makeRuleDef({ description: 'Rule B', category: 'security' }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result).toHaveLength(2)
  })

  test('sorts rules by name', () => {
    const loaded = {
      'zebra-rule': makeRuleDef({ description: 'Z', category: 'style' }),
      'alpha-rule': makeRuleDef({ description: 'A', category: 'style' }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].name).toBe('alpha-rule')
    expect(result[1].name).toBe('zebra-rule')
  })

  test('uses getRuleCategoryFn for category fallback', () => {
    const loaded = {
      'no-eval': makeRuleDef({ category: undefined }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].category).toBe('performance')
  })

  test('preserves all rule properties', () => {
    const loaded = {
      'test-rule': {
        meta: { description: 'A test', category: 'style', recommended: true, deprecated: false },
        fix: () => {},
        create: () => ({}),
      },
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0]).toEqual({
      category: 'style',
      deprecated: false,
      description: 'A test',
      fixable: true,
      name: 'test-rule',
      recommended: true,
    })
  })

  test('handles single rule', () => {
    const loaded = {
      'single-rule': makeRuleDef({ description: 'Only one', category: 'test' }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('single-rule')
    expect(result[0].category).toBe('test')
  })

  test('detects fixable from fix function on loaded rule', () => {
    const loaded = {
      'fix-rule': {
        meta: { description: 'Has fix', category: 'style', recommended: false, deprecated: false },
        fix: () => {},
        create: () => ({}),
      },
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].fixable).toBe(true)
  })

  test('detects fixable from meta.fixable on loaded rule', () => {
    const loaded = {
      'meta-fix-rule': makeRuleDef({ fixable: 'code' }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].fixable).toBe(true)
  })

  test('handles rules with mixed properties', () => {
    const loaded = {
      'rule-a': makeRuleDef({
        description: 'A',
        category: 'alpha',
        recommended: true,
        deprecated: false,
      }),
      'rule-b': makeRuleDef({
        description: 'B',
        category: 'beta',
        recommended: false,
        deprecated: true,
      }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].recommended).toBe(true)
    expect(result[0].deprecated).toBe(false)
    expect(result[1].recommended).toBe(false)
    expect(result[1].deprecated).toBe(true)
  })

  test('handles many loaded rules sorted correctly', () => {
    const loaded: Record<string, ReturnType<typeof makeRuleDef>> = {}
    for (const name of ['zebra', 'mango', 'alpha', 'beta']) {
      loaded[name] = makeRuleDef({ description: name, category: 'style' })
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result.map((r) => r.name)).toEqual(['alpha', 'beta', 'mango', 'zebra'])
  })

  test('handles rule with all undefined optional fields', () => {
    const loaded = {
      'minimal-rule': {
        meta: {
          description: 'Minimal',
          category: undefined,
          recommended: undefined,
          deprecated: undefined,
        },
        create: () => ({}),
      },
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].category).toBe('style')
    expect(result[0].recommended).toBe(false)
    expect(result[0].deprecated).toBe(false)
    expect(result[0].fixable).toBe(false)
  })
})

describe('generateRuleDoc fixable detection', () => {
  test('detects fixable from meta.fixable true', () => {
    const ruleDef = {
      meta: { description: 'X', category: 'complexity', recommended: false, fixable: true },
      create: () => ({}),
    }
    const result = generateRuleDoc('x', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
  })

  test('detects fixable from fix function on rule definition', () => {
    const ruleDef = {
      meta: { description: 'X', category: 'complexity', recommended: false },
      create: () => ({}),
      fix: () => ({ range: [0, 1], text: '' }),
    }
    const result = generateRuleDoc('x', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
  })

  test('not fixable when both fix and meta.fixable are absent', () => {
    const ruleDef = {
      meta: { description: 'X', category: 'complexity', recommended: false },
      create: () => ({}),
    }
    const result = generateRuleDoc('x', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(false)
  })

  test('uses getRuleCategoryFn fallback when meta.category is undefined', () => {
    const ruleDef = { meta: { description: 'X', recommended: false }, create: () => ({}) }
    const result = generateRuleDoc('max-lines', ruleDef as never, mockGetRuleCategory)
    expect(result.category).toBe('complexity')
  })
})

describe('getBadges combinations', () => {
  test('returns empty string when no flags set', () => {
    expect(getBadges(makeRuleDoc())).toBe('')
  })

  test('returns recommended badge only', () => {
    expect(getBadges(makeRuleDoc({ recommended: true }))).toBe(' `recommended`')
  })

  test('returns fixable badge only', () => {
    expect(getBadges(makeRuleDoc({ fixable: true }))).toBe(' `fixable`')
  })

  test('returns deprecated badge only', () => {
    expect(getBadges(makeRuleDoc({ deprecated: true }))).toBe(' `deprecated`')
  })

  test('returns all three badges', () => {
    expect(getBadges(makeRuleDoc({ recommended: true, fixable: true, deprecated: true }))).toBe(
      ' `recommended` `fixable` `deprecated`',
    )
  })

  test('returns recommended and fixable', () => {
    expect(getBadges(makeRuleDoc({ recommended: true, fixable: true }))).toBe(
      ' `recommended` `fixable`',
    )
  })
})

describe('generateRuleMarkdown content structure', () => {
  test('includes rule name as heading', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'my-rule' }))
    expect(md).toContain('# my-rule')
  })

  test('includes description section', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ description: 'My custom desc' }))
    expect(md).toContain('## Description')
    expect(md).toContain('My custom desc')
  })

  test('includes how to use section', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'sample-rule' }))
    expect(md).toContain('## How to Use')
    expect(md).toContain('"sample-rule"')
    expect(md).toContain('"error"')
  })

  test('includes fixable note when fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'fix-me', fixable: true }))
    expect(md).toContain('codeforge fix --rules fix-me')
  })

  test('omits fixable note when not fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'no-fix', fixable: false }))
    expect(md).not.toContain('codeforge fix --rules')
  })

  test('includes recommended badge image when recommended', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    expect(md).toContain('badge/-recommended-blue')
  })

  test('includes deprecated badge image when deprecated', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ deprecated: true }))
    expect(md).toContain('badge/-deprecated-red')
  })

  test('includes fixable badge image when fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true }))
    expect(md).toContain('badge/-fixable-green')
  })

  test('property table has all four properties', () => {
    const md = generateRuleMarkdown(
      makeRuleDoc({ category: 'security', fixable: true, recommended: true, deprecated: false }),
    )
    expect(md).toContain('| Category | security |')
    expect(md).toContain('| Fixable | Yes |')
    expect(md).toContain('| Recommended | Yes |')
    expect(md).toContain('| Deprecated | No |')
  })

  test('no badges section when no flags', () => {
    const md = generateRuleMarkdown(
      makeRuleDoc({ recommended: false, fixable: false, deprecated: false }),
    )
    expect(md).not.toContain('img.shields.io')
  })
})

describe('groupByCategory edge cases', () => {
  test('returns empty object for empty array', () => {
    expect(groupByCategory([])).toEqual({})
  })

  test('sorts rules within each category alphabetically', () => {
    const rules = [
      makeRuleDoc({ name: 'zebra', category: 'a' }),
      makeRuleDoc({ name: 'alpha', category: 'a' }),
      makeRuleDoc({ name: 'mid', category: 'a' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['a'].map((r) => r.name)).toEqual(['alpha', 'mid', 'zebra'])
  })

  test('handles single category with single rule', () => {
    const rules = [makeRuleDoc({ name: 'only', category: 'solo' })]
    const groups = groupByCategory(rules)
    expect(Object.keys(groups)).toEqual(['solo'])
    expect(groups['solo'].length).toBe(1)
  })

  test('separates rules into distinct categories', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'cat1' }),
      makeRuleDoc({ name: 'b', category: 'cat2' }),
      makeRuleDoc({ name: 'c', category: 'cat1' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['cat1'].length).toBe(2)
    expect(groups['cat2'].length).toBe(1)
  })
})

describe('generateIndexContent format', () => {
  test('includes overview header', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'x', category: 'test' })])
    expect(content).toContain('## Overview')
  })

  test('includes category count in overview table', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'a', category: 'alpha' }),
      makeRuleDoc({ name: 'b', category: 'alpha', fixable: true }),
    ])
    expect(content).toContain('| alpha | 2 | 1 |')
  })

  test('includes rules by category section', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'my-rule', category: 'demo', description: 'Demo rule' }),
    ])
    expect(content).toContain('## Rules by Category')
    expect(content).toContain('### demo')
    expect(content).toContain('[my-rule](./my-rule.md)')
    expect(content).toContain('Demo rule')
  })

  test('reports 0 fixable for non-fixable rules', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'a', category: 'cat' })])
    expect(content).toContain('| cat | 1 | 0 |')
  })

  test('includes total rule count in header', () => {
    const content = generateIndexContent([makeRuleDoc(), makeRuleDoc({ name: 'r2' })])
    expect(content).toContain('all 2 available rules')
  })
})

describe('generateSingleFileContent format', () => {
  test('includes table of contents', () => {
    const content = generateSingleFileContent([makeRuleDoc({ name: 'x', category: 'catA' })])
    expect(content).toContain('## Table of Contents')
    expect(content).toContain('[catA](#cata)')
  })

  test('includes rule markdown for each rule', () => {
    const content = generateSingleFileContent([makeRuleDoc({ name: 'demo', category: 'cat' })])
    expect(content).toContain('# demo')
    expect(content).toContain('---')
  })

  test('separates rules with horizontal rules', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'a', category: 'c' }),
      makeRuleDoc({ name: 'b', category: 'c' }),
    ])
    const hrCount = (content.match(/---/g) || []).length
    expect(hrCount).toBeGreaterThanOrEqual(2)
  })
})

describe('generateRuleDoc additional coverage', () => {
  test('handles meta.fixable as whitespace string', () => {
    const ruleDef = makeRuleDef({ fixable: 'whitespace' })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
  })

  test('handles meta.fixable as empty string (falsy)', () => {
    const ruleDef = makeRuleDef({ fixable: '' })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(false)
  })

  test('handles meta.fixable = false', () => {
    const ruleDef = makeRuleDef({ fixable: false })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(false)
  })

  test('handles unicode description', () => {
    const ruleDef = makeRuleDef({ description: '日本語の説明 🎉 émoji' })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.description).toBe('日本語の説明 🎉 émoji')
  })

  test('handles ruleId with dots', () => {
    const ruleDef = makeRuleDef()
    const result = generateRuleDoc('my.plugin.rule', ruleDef as never, mockGetRuleCategory)
    expect(result.name).toBe('my.plugin.rule')
  })

  test('handles ruleId with slashes', () => {
    const ruleDef = makeRuleDef()
    const result = generateRuleDoc('plugin/rule-name', ruleDef as never, mockGetRuleCategory)
    expect(result.name).toBe('plugin/rule-name')
  })

  test('handles ruleId with underscores', () => {
    const ruleDef = makeRuleDef()
    const result = generateRuleDoc('no_underscore_rule', ruleDef as never, mockGetRuleCategory)
    expect(result.name).toBe('no_underscore_rule')
  })

  test('returns correct name when ruleId is numeric string', () => {
    const ruleDef = makeRuleDef()
    const result = generateRuleDoc('123', ruleDef as never, mockGetRuleCategory)
    expect(result.name).toBe('123')
  })

  test('handles both fix function and meta.fixable set simultaneously', () => {
    const ruleDef = makeRuleDef({ fixable: 'code' })
    ruleDef.fix = () => {}
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.fixable).toBe(true)
  })

  test('uses getRuleCategoryFn for max- prefix rules', () => {
    const ruleDef = makeRuleDef({ category: undefined })
    const result = generateRuleDoc('max-lines', ruleDef as never, mockGetRuleCategory)
    expect(result.category).toBe('complexity')
  })

  test('handles meta.recommended as explicit true', () => {
    const ruleDef = makeRuleDef({ recommended: true })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.recommended).toBe(true)
  })

  test('handles meta.recommended as explicit false', () => {
    const ruleDef = makeRuleDef({ recommended: false })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.recommended).toBe(false)
  })

  test('handles meta.deprecated as explicit true', () => {
    const ruleDef = makeRuleDef({ deprecated: true })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.deprecated).toBe(true)
  })

  test('handles meta.deprecated as explicit false', () => {
    const ruleDef = makeRuleDef({ deprecated: false })
    const result = generateRuleDoc('test-rule', ruleDef as never, mockGetRuleCategory)
    expect(result.deprecated).toBe(false)
  })
})

describe('generateRuleMarkdown additional coverage', () => {
  test('badge images use shields.io domain', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    expect(md).toContain('https://img.shields.io/badge/')
  })

  test('recommended badge has correct alt text', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ recommended: true }))
    expect(md).toContain('![Recommended]')
  })

  test('fixable badge has correct alt text', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true }))
    expect(md).toContain('![Fixable]')
  })

  test('deprecated badge has correct alt text', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ deprecated: true }))
    expect(md).toContain('![Deprecated]')
  })

  test('includes enable instruction text', () => {
    const md = generateRuleMarkdown(makeRuleDoc())
    expect(md).toContain('Enable this rule in your configuration')
  })

  test('JSON config uses correct rule name', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'custom-name' }))
    expect(md).toContain('"custom-name": "error"')
  })

  test('property table has header separator', () => {
    const md = generateRuleMarkdown(makeRuleDoc())
    expect(md).toContain('|----------|-------|')
  })

  test('content starts with heading', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'start-test' }))
    expect(md.startsWith('# start-test')).toBe(true)
  })

  test('does not contain auto-fix text for non-fixable rules', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: false }))
    expect(md).not.toContain('This rule is auto-fixable')
  })

  test('auto-fix text includes correct rule name', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true, name: 'auto-fix-test' }))
    expect(md).toContain('codeforge fix --rules auto-fix-test')
  })

  test('handles category with spaces in property table', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ category: 'best practices' }))
    expect(md).toContain('| Category | best practices |')
  })

  test('fixable note ends with newline', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true, name: 'newline-test' }))
    expect(md).toContain('to apply fixes.\n')
  })

  test('json code block is properly fenced', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'fence-test' }))
    expect(md).toContain('```json\n')
    expect(md).toContain('\n```')
  })
})

describe('getBadges additional coverage', () => {
  test('recommended+deprecated combo returns correct string', () => {
    const result = getBadges(makeRuleDoc({ recommended: true, deprecated: true, fixable: false }))
    expect(result).toBe(' `recommended` `deprecated`')
  })

  test('each badge starts with space', () => {
    const result = getBadges(makeRuleDoc({ recommended: true, fixable: true, deprecated: true }))
    const badges = result.split('`').filter((_, i) => i % 2 === 1)
    for (const badge of badges) {
      expect(badge).toBeTruthy()
    }
  })

  test('three badges produces three segments', () => {
    const result = getBadges(makeRuleDoc({ recommended: true, fixable: true, deprecated: true }))
    const parts = result.trim().split(' ')
    expect(parts).toHaveLength(3)
  })

  test('empty string has zero length for no-badges rule', () => {
    expect(getBadges(makeRuleDoc())).toHaveLength(0)
  })

  test('single recommended badge string length is correct', () => {
    const result = getBadges(makeRuleDoc({ recommended: true }))
    expect(result.length).toBe(' `recommended`'.length)
  })

  test('single fixable badge string length is correct', () => {
    const result = getBadges(makeRuleDoc({ fixable: true }))
    expect(result.length).toBe(' `fixable`'.length)
  })

  test('single deprecated badge string length is correct', () => {
    const result = getBadges(makeRuleDoc({ deprecated: true }))
    expect(result.length).toBe(' `deprecated`'.length)
  })
})

describe('groupByCategory additional coverage', () => {
  test('handles empty string category', () => {
    const rules = [makeRuleDoc({ name: 'empty-cat', category: '' })]
    const groups = groupByCategory(rules)
    expect(groups['']).toHaveLength(1)
  })

  test('does not modify the original array', () => {
    const rules = [
      makeRuleDoc({ name: 'z', category: 'cat' }),
      makeRuleDoc({ name: 'a', category: 'cat' }),
    ]
    const originalOrder = rules.map((r) => r.name)
    groupByCategory(rules)
    expect(rules.map((r) => r.name)).toEqual(originalOrder)
  })

  test('treats different case categories as separate', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'Style' }),
      makeRuleDoc({ name: 'b', category: 'style' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['Style']).toHaveLength(1)
    expect(groups['style']).toHaveLength(1)
  })

  test('handles category names with spaces', () => {
    const rules = [makeRuleDoc({ name: 'a', category: 'best practices' })]
    const groups = groupByCategory(rules)
    expect(groups['best practices']).toHaveLength(1)
  })

  test('handles category names with special characters', () => {
    const rules = [makeRuleDoc({ name: 'a', category: 'cat/sub' })]
    const groups = groupByCategory(rules)
    expect(groups['cat/sub']).toHaveLength(1)
  })

  test('handles rules with identical names in different categories', () => {
    const rules = [
      makeRuleDoc({ name: 'same', category: 'alpha' }),
      makeRuleDoc({ name: 'same', category: 'beta' }),
    ]
    const groups = groupByCategory(rules)
    expect(groups['alpha']).toHaveLength(1)
    expect(groups['beta']).toHaveLength(1)
  })

  test('returns object with correct number of keys', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'x' }),
      makeRuleDoc({ name: 'b', category: 'y' }),
      makeRuleDoc({ name: 'c', category: 'z' }),
    ]
    const groups = groupByCategory(rules)
    expect(Object.keys(groups)).toHaveLength(3)
  })
})

describe('generateIndexContent additional coverage', () => {
  test('handles empty rules array', () => {
    const content = generateIndexContent([])
    expect(content).toContain('0 available rules')
  })

  test('overview table includes all categories', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'alpha' }),
      makeRuleDoc({ name: 'b', category: 'beta' }),
      makeRuleDoc({ name: 'c', category: 'gamma' }),
    ]
    const content = generateIndexContent(rules)
    expect(content).toContain('| alpha |')
    expect(content).toContain('| beta |')
    expect(content).toContain('| gamma |')
  })

  test('each category section ends with a blank line', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'a', category: 'cat' })])
    expect(content).toContain('### cat\n\n')
  })

  test('correctly counts fixable across multiple categories', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'cat1', fixable: true }),
      makeRuleDoc({ name: 'b', category: 'cat1', fixable: false }),
      makeRuleDoc({ name: 'c', category: 'cat2', fixable: true }),
      makeRuleDoc({ name: 'd', category: 'cat2', fixable: true }),
    ]
    const content = generateIndexContent(rules)
    expect(content).toContain('| cat1 | 2 | 1 |')
    expect(content).toContain('| cat2 | 2 | 2 |')
  })

  test('rule listing uses dash prefix for markdown list', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'list-check' })])
    expect(content).toMatch(/^- \[list-check\]/m)
  })

  test('includes deprecated badge in listing', () => {
    const content = generateIndexContent([makeRuleDoc({ name: 'dep-rule', deprecated: true })])
    expect(content).toContain('`deprecated`')
  })

  test('description is separated from badges with dash', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'desc-check', description: 'Hello world', recommended: true }),
    ])
    expect(content).toContain('`recommended` - Hello world')
  })

  test('rule without badges still has dash and description', () => {
    const content = generateIndexContent([
      makeRuleDoc({ name: 'no-badge', description: 'Plain rule' }),
    ])
    expect(content).toContain('./no-badge.md) - Plain rule')
  })
})

describe('generateSingleFileContent additional coverage', () => {
  test('handles empty rules array', () => {
    const content = generateSingleFileContent([])
    expect(content).toContain('0 available rules')
    expect(content).toContain('## Table of Contents')
  })

  test('category heading uses ## level', () => {
    const content = generateSingleFileContent([makeRuleDoc({ name: 'a', category: 'cat' })])
    expect(content).toContain('## cat\n\n')
  })

  test('rule heading uses # level', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'heading-test', category: 'cat' }),
    ])
    expect(content).toContain('# heading-test')
  })

  test('TOC link uses lowercase anchor for mixed case category', () => {
    const content = generateSingleFileContent([makeRuleDoc({ name: 'a', category: 'MyCategory' })])
    expect(content).toContain('- [MyCategory](#mycategory)')
  })

  test('each rule ends with horizontal rule', () => {
    const content = generateSingleFileContent([makeRuleDoc({ name: 'a', category: 'cat' })])
    expect(content).toContain('# a')
    expect(content).toMatch(/# a[\s\S]*\n---\n/)
  })

  test('deprecated badge appears in single file output', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'dep-single', deprecated: true, category: 'cat' }),
    ])
    expect(content).toContain('badge/-deprecated-red')
  })

  test('recommended badge appears in single file output', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'rec-single', recommended: true, category: 'cat' }),
    ])
    expect(content).toContain('badge/-recommended-blue')
  })

  test('includes description for each rule', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'desc-a', description: 'Desc A', category: 'cat' }),
    ])
    expect(content).toContain('Desc A')
  })

  test('rules from different categories get different section headings', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'a', category: 'alpha' }),
      makeRuleDoc({ name: 'b', category: 'beta' }),
    ])
    const alphaIdx = content.indexOf('## alpha')
    const betaIdx = content.indexOf('## beta')
    expect(alphaIdx).toBeGreaterThan(-1)
    expect(betaIdx).toBeGreaterThan(-1)
  })

  test('multiple rules in same category are all present', () => {
    const content = generateSingleFileContent([
      makeRuleDoc({ name: 'rule-a', category: 'cat' }),
      makeRuleDoc({ name: 'rule-b', category: 'cat' }),
      makeRuleDoc({ name: 'rule-c', category: 'cat' }),
    ])
    expect(content).toContain('# rule-a')
    expect(content).toContain('# rule-b')
    expect(content).toContain('# rule-c')
  })
})

describe('buildRuleDocsFromLoaded additional coverage', () => {
  test('returns RuleDoc array with correct length', () => {
    const loaded = {
      a: makeRuleDef({ description: 'A', category: 'x' }),
      b: makeRuleDef({ description: 'B', category: 'y' }),
      c: makeRuleDef({ description: 'C', category: 'z' }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result).toHaveLength(3)
  })

  test('does not modify the input object', () => {
    const loaded = {
      'z-rule': makeRuleDef({ description: 'Z', category: 'style' }),
      'a-rule': makeRuleDef({ description: 'A', category: 'style' }),
    }
    const keysBefore = Object.keys(loaded)
    buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(Object.keys(loaded)).toEqual(keysBefore)
  })

  test('handles rules with same description', () => {
    const loaded = {
      'rule-a': makeRuleDef({ description: 'Same desc', category: 'style' }),
      'rule-b': makeRuleDef({ description: 'Same desc', category: 'style' }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result).toHaveLength(2)
    expect(result[0].description).toBe('Same desc')
    expect(result[1].description).toBe('Same desc')
  })

  test('handles rule with fix and meta.fixable both present', () => {
    const loaded = {
      'both-fix': {
        meta: { description: 'Both', category: 'style', recommended: true, fixable: 'code' },
        fix: () => {},
        create: () => ({}),
      },
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].fixable).toBe(true)
  })

  test('sort is stable for same-prefixed names', () => {
    const loaded: Record<string, ReturnType<typeof makeRuleDef>> = {}
    const names = ['rule-c', 'rule-a', 'rule-b', 'rule-d']
    for (const name of names) {
      loaded[name] = makeRuleDef({ description: name, category: 'style' })
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result.map((r) => r.name)).toEqual(['rule-a', 'rule-b', 'rule-c', 'rule-d'])
  })

  test('handles rule with numeric name', () => {
    const loaded = {
      '100': makeRuleDef({ description: 'Numeric', category: 'style' }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].name).toBe('100')
  })

  test('correctly handles recommended true and fixable true', () => {
    const loaded = {
      'rec-fix': makeRuleDef({
        description: 'Rec+Fix',
        category: 'style',
        recommended: true,
        fixable: 'code',
      }),
    }
    const result = buildRuleDocsFromLoaded(loaded as never, mockGetRuleCategory)
    expect(result[0].recommended).toBe(true)
    expect(result[0].fixable).toBe(true)
  })
})

describe('generateRuleMarkdown ordering and structure', () => {
  test('property table appears before description', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ name: 'order-test' }))
    const tableIdx = md.indexOf('| Property |')
    const descIdx = md.indexOf('## Description')
    expect(tableIdx).toBeLessThan(descIdx)
  })

  test('how to use appears before fixable note', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true, name: 'order-fix' }))
    const howToIdx = md.indexOf('## How to Use')
    const fixIdx = md.indexOf('auto-fixable')
    expect(howToIdx).toBeLessThan(fixIdx)
  })

  test('output ends with newline when fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: true, name: 'end-test' }))
    expect(md.endsWith('\n')).toBe(true)
  })

  test('output ends with newline when not fixable', () => {
    const md = generateRuleMarkdown(makeRuleDoc({ fixable: false, name: 'end-test2' }))
    expect(md.endsWith('\n')).toBe(true)
  })
})

describe('generateIndexContent with varied inputs', () => {
  test('handles many rules in same category sorted alphabetically', () => {
    const rules = [
      makeRuleDoc({ name: 'z-rule', category: 'cat' }),
      makeRuleDoc({ name: 'a-rule', category: 'cat' }),
      makeRuleDoc({ name: 'm-rule', category: 'cat' }),
    ]
    const content = generateIndexContent(rules)
    const aIdx = content.indexOf('[a-rule]')
    const mIdx = content.indexOf('[m-rule]')
    const zIdx = content.indexOf('[z-rule]')
    expect(aIdx).toBeLessThan(mIdx)
    expect(mIdx).toBeLessThan(zIdx)
  })

  test('total rule count matches input array length', () => {
    const rules = Array.from({ length: 5 }, (_, i) =>
      makeRuleDoc({ name: `rule-${i}`, category: 'cat' }),
    )
    const content = generateIndexContent(rules)
    expect(content).toContain('5 available rules')
  })

  test('overview table has exactly one row per category', () => {
    const rules = [
      makeRuleDoc({ name: 'a', category: 'x' }),
      makeRuleDoc({ name: 'b', category: 'y' }),
    ]
    const content = generateIndexContent(rules)
    const lines = content.split('\n').filter((l) => l.startsWith('|') && l.includes('| 1 |'))
    expect(lines).toHaveLength(2)
  })
})
