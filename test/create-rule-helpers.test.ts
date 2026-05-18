import { describe, it, expect } from 'vitest'
import {
  VALID_CATEGORIES,
  VALID_SEVERITIES,
  isValidRuleName,
  isValidCategory,
  isValidSeverity,
  toCamelCase,
  toPascalCase,
  buildRuleContent,
  buildTestContent,
  buildDefaultDescription,
} from '../src/commands/create-rule-helpers.js'

// ─── VALID_CATEGORIES ──────────────────────────────────
describe('VALID_CATEGORIES', () => {
  it('is a non-empty array', () => {
    expect(VALID_CATEGORIES.length).toBeGreaterThan(0)
  })

  it('includes core categories', () => {
    expect(VALID_CATEGORIES).toContain('complexity')
    expect(VALID_CATEGORIES).toContain('security')
    expect(VALID_CATEGORIES).toContain('performance')
    expect(VALID_CATEGORIES).toContain('patterns')
  })

  it('has 8 categories', () => {
    expect(VALID_CATEGORIES).toHaveLength(8)
  })
})

// ─── VALID_SEVERITIES ──────────────────────────────────
describe('VALID_SEVERITIES', () => {
  it('includes error, warning, info', () => {
    expect(VALID_SEVERITIES).toContain('error')
    expect(VALID_SEVERITIES).toContain('warning')
    expect(VALID_SEVERITIES).toContain('info')
  })

  it('has 3 severities', () => {
    expect(VALID_SEVERITIES).toHaveLength(3)
  })
})

// ─── isValidRuleName ───────────────────────────────────
describe('isValidRuleName', () => {
  it('accepts simple lowercase name', () => {
    expect(isValidRuleName('myrule')).toBe(true)
  })

  it('accepts kebab-case name', () => {
    expect(isValidRuleName('my-rule')).toBe(true)
  })

  it('accepts name with numbers', () => {
    expect(isValidRuleName('rule-123')).toBe(true)
  })

  it('accepts single letter', () => {
    expect(isValidRuleName('a')).toBe(true)
  })

  it('rejects uppercase letters', () => {
    expect(isValidRuleName('MyRule')).toBe(false)
  })

  it('rejects name starting with number', () => {
    expect(isValidRuleName('1rule')).toBe(false)
  })

  it('rejects name starting with hyphen', () => {
    expect(isValidRuleName('-rule')).toBe(false)
  })

  it('rejects name with spaces', () => {
    expect(isValidRuleName('my rule')).toBe(false)
  })

  it('rejects name with underscores', () => {
    expect(isValidRuleName('my_rule')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidRuleName('')).toBe(false)
  })

  it('rejects camelCase', () => {
    expect(isValidRuleName('myRule')).toBe(false)
  })
})

// ─── isValidCategory ───────────────────────────────────
describe('isValidCategory', () => {
  it('returns true for valid categories', () => {
    for (const cat of VALID_CATEGORIES) {
      expect(isValidCategory(cat)).toBe(true)
    }
  })

  it('returns false for invalid category', () => {
    expect(isValidCategory('invalid')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidCategory('')).toBe(false)
  })

  it('is case-sensitive', () => {
    expect(isValidCategory('Security')).toBe(false)
    expect(isValidCategory('SECURITY')).toBe(false)
  })
})

// ─── isValidSeverity ───────────────────────────────────
describe('isValidSeverity', () => {
  it('returns true for valid severities', () => {
    expect(isValidSeverity('error')).toBe(true)
    expect(isValidSeverity('warning')).toBe(true)
    expect(isValidSeverity('info')).toBe(true)
  })

  it('returns false for invalid severity', () => {
    expect(isValidSeverity('critical')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidSeverity('')).toBe(false)
  })
})

// ─── toCamelCase ───────────────────────────────────────
describe('toCamelCase', () => {
  it('converts single word to lowercase', () => {
    expect(toCamelCase('hello')).toBe('hello')
  })

  it('converts kebab-case to camelCase', () => {
    expect(toCamelCase('my-cool-rule')).toBe('myCoolRule')
  })

  it('handles two-word kebab-case', () => {
    expect(toCamelCase('max-params')).toBe('maxParams')
  })

  it('handles single character segments', () => {
    expect(toCamelCase('a-b-c')).toBe('aBC')
  })

  it('returns unchanged if no hyphens', () => {
    expect(toCamelCase('rule')).toBe('rule')
  })

  it('handles already camelCase input (no hyphens)', () => {
    expect(toCamelCase('myRule')).toBe('myRule')
  })
})

// ─── toPascalCase ──────────────────────────────────────
describe('toPascalCase', () => {
  it('capitalizes single word', () => {
    expect(toPascalCase('hello')).toBe('Hello')
  })

  it('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('my-cool-rule')).toBe('MyCoolRule')
  })

  it('handles two-word kebab-case', () => {
    expect(toPascalCase('max-params')).toBe('MaxParams')
  })

  it('handles single character segments', () => {
    expect(toPascalCase('a-b-c')).toBe('ABC')
  })

  it('handles already PascalCase input (no hyphens)', () => {
    expect(toPascalCase('Rule')).toBe('Rule')
  })
})

// ─── buildRuleContent ──────────────────────────────────
describe('buildRuleContent', () => {
  const baseOpts = {
    category: 'security',
    description: 'Test rule description',
    fixable: false,
    ruleName: 'no-eval',
    severity: 'error',
    typescript: false,
  }

  it('includes rule name in content', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain('no-eval')
  })

  it('includes description in content', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain('Test rule description')
  })

  it('includes category in content', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain('security')
  })

  it('includes severity in content', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain("'error'")
  })

  it('includes PascalCase interface name', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain('NoEvalOptions')
  })

  it('includes camelCase export name', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain('noEvalRule')
  })

  it('includes commented fixable line when not fixable', () => {
    const content = buildRuleContent({ ...baseOpts, fixable: false })
    expect(content).toContain('// fixable')
  })

  it('includes active fixable line when fixable', () => {
    const content = buildRuleContent({ ...baseOpts, fixable: true })
    expect(content).toContain("fixable: 'code',")
  })

  it('includes ts-morph import when typescript is true', () => {
    const content = buildRuleContent({ ...baseOpts, typescript: true })
    expect(content).toContain('SyntaxKind')
  })

  it('omits ts-morph import when typescript is false', () => {
    const content = buildRuleContent({ ...baseOpts, typescript: false })
    expect(content).not.toContain('SyntaxKind')
  })

  it('includes RuleDefinition import', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain('RuleDefinition')
  })

  it('includes visitor pattern', () => {
    const content = buildRuleContent(baseOpts)
    expect(content).toContain('visitor:')
    expect(content).toContain('onComplete:')
  })

  it('handles multi-segment rule name', () => {
    const content = buildRuleContent({ ...baseOpts, ruleName: 'no-unsafe-eval' })
    expect(content).toContain('noUnsafeEvalRule')
    expect(content).toContain('NoUnsafeEvalOptions')
  })
})

// ─── buildTestContent ──────────────────────────────────
describe('buildTestContent', () => {
  it('includes rule name in test', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain("'no-eval'")
  })

  it('includes category in import path', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain('security/no-eval')
  })

  it('includes vitest imports', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain('vitest')
    expect(content).toContain('describe')
    expect(content).toContain('test')
    expect(content).toContain('expect')
  })

  it('includes camelCase rule reference', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain('noEvalRule')
  })

  it('includes meta validation test', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain('valid meta')
  })

  it('includes create function test', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain('create function')
  })

  it('includes visitor object test', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain('visitor object')
  })

  it('handles multi-segment names', () => {
    const content = buildTestContent('max-params', 'complexity')
    expect(content).toContain('maxParamsRule')
    expect(content).toContain('complexity/max-params')
  })
})

// ─── buildDefaultDescription ───────────────────────────
describe('buildDefaultDescription', () => {
  it('includes the rule name', () => {
    expect(buildDefaultDescription('no-eval')).toContain('no-eval')
  })

  it('has expected format', () => {
    expect(buildDefaultDescription('my-rule')).toBe('Description for my-rule rule')
  })

  it('handles simple names', () => {
    expect(buildDefaultDescription('foo')).toBe('Description for foo rule')
  })
})
