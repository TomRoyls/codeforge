import { describe, expect, it } from 'vitest'

import {
  buildDefaultDescription,
  buildRuleContent,
  buildTestContent,
  isValidCategory,
  isValidRuleName,
  isValidSeverity,
  toCamelCase,
  toPascalCase,
  VALID_CATEGORIES,
  VALID_SEVERITIES,
} from '../../src/commands/create-rule-helpers.js'

// ─── isValidRuleName ───

describe('isValidRuleName', () => {
  it('accepts lowercase alphanumeric with hyphens', () => {
    expect(isValidRuleName('my-rule')).toBe(true)
    expect(isValidRuleName('no-eval')).toBe(true)
    expect(isValidRuleName('max-params')).toBe(true)
    expect(isValidRuleName('a')).toBe(true)
    expect(isValidRuleName('rule123')).toBe(true)
    expect(isValidRuleName('rule-1-2-3')).toBe(true)
  })

  it('rejects names starting with number', () => {
    expect(isValidRuleName('1-rule')).toBe(false)
  })

  it('rejects names with uppercase', () => {
    expect(isValidRuleName('MyRule')).toBe(false)
    expect(isValidRuleName('my-Rule')).toBe(false)
  })

  it('rejects names with underscores', () => {
    expect(isValidRuleName('my_rule')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidRuleName('')).toBe(false)
  })

  it('rejects names with spaces', () => {
    expect(isValidRuleName('my rule')).toBe(false)
  })

  it('rejects names starting with hyphen', () => {
    expect(isValidRuleName('-rule')).toBe(false)
  })
})

// ─── isValidCategory ───

describe('isValidCategory', () => {
  it('accepts all valid categories', () => {
    for (const cat of VALID_CATEGORIES) {
      expect(isValidCategory(cat)).toBe(true)
    }
  })

  it('rejects invalid categories', () => {
    expect(isValidCategory('invalid')).toBe(false)
    expect(isValidCategory('')).toBe(false)
    expect(isValidCategory('Security')).toBe(false)
  })
})

// ─── isValidSeverity ───

describe('isValidSeverity', () => {
  it('accepts all valid severities', () => {
    for (const sev of VALID_SEVERITIES) {
      expect(isValidSeverity(sev)).toBe(true)
    }
  })

  it('rejects invalid severities', () => {
    expect(isValidSeverity('critical')).toBe(false)
    expect(isValidSeverity('')).toBe(false)
    expect(isValidSeverity('Error')).toBe(false)
  })
})

// ─── toCamelCase ───

describe('toCamelCase', () => {
  it('converts kebab-case to camelCase', () => {
    expect(toCamelCase('my-rule')).toBe('myRule')
    expect(toCamelCase('no-eval')).toBe('noEval')
    expect(toCamelCase('max-params')).toBe('maxParams')
  })

  it('handles single word', () => {
    expect(toCamelCase('rule')).toBe('rule')
  })

  it('handles multiple hyphens', () => {
    expect(toCamelCase('a-b-c-d')).toBe('aBCD')
  })
})

// ─── toPascalCase ───

describe('toPascalCase', () => {
  it('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('my-rule')).toBe('MyRule')
    expect(toPascalCase('no-eval')).toBe('NoEval')
  })

  it('handles single word', () => {
    expect(toPascalCase('rule')).toBe('Rule')
  })

  it('handles multiple hyphens', () => {
    expect(toPascalCase('a-b-c-d')).toBe('ABCD')
  })
})

// ─── buildRuleContent ───

describe('buildRuleContent', () => {
  it('includes rule name in meta', () => {
    const content = buildRuleContent({
      category: 'security',
      description: 'Test rule',
      fixable: false,
      ruleName: 'no-eval',
      severity: 'error',
      typescript: false,
    })
    expect(content).toContain("name: 'no-eval'")
    expect(content).toContain("category: 'security'")
    expect(content).toContain('Test rule')
    expect(content).toContain("severity: 'error'")
  })

  it('includes typescript import when typescript is true', () => {
    const content = buildRuleContent({
      category: 'patterns',
      description: 'desc',
      fixable: false,
      ruleName: 'my-rule',
      severity: 'warning',
      typescript: true,
    })
    expect(content).toContain("import { SyntaxKind } from 'ts-morph'")
  })

  it('omits typescript import when typescript is false', () => {
    const content = buildRuleContent({
      category: 'patterns',
      description: 'desc',
      fixable: false,
      ruleName: 'my-rule',
      severity: 'warning',
      typescript: false,
    })
    expect(content).not.toContain("import { SyntaxKind } from 'ts-morph'")
  })

  it('includes fixable line when fixable is true', () => {
    const content = buildRuleContent({
      category: 'patterns',
      description: 'desc',
      fixable: true,
      ruleName: 'fix-rule',
      severity: 'error',
      typescript: false,
    })
    expect(content).toContain("fixable: 'code'")
  })

  it('comments fixable line when fixable is false', () => {
    const content = buildRuleContent({
      category: 'patterns',
      description: 'desc',
      fixable: false,
      ruleName: 'no-fix',
      severity: 'error',
      typescript: false,
    })
    expect(content).toContain("// fixable: 'code'")
  })

  it('uses PascalCase for interface and type names', () => {
    const content = buildRuleContent({
      category: 'complexity',
      description: 'desc',
      fixable: false,
      ruleName: 'max-depth',
      severity: 'warning',
      typescript: false,
    })
    expect(content).toContain('MaxDepthOptions')
  })
})

// ─── buildTestContent ───

describe('buildTestContent', () => {
  it('includes rule name and category', () => {
    const content = buildTestContent('my-rule', 'security')
    expect(content).toContain('my-rule')
    expect(content).toContain('security')
    expect(content).toContain('myRuleRule')
  })

  it('uses camelCase for variable name', () => {
    const content = buildTestContent('no-eval', 'patterns')
    expect(content).toContain('noEvalRule')
  })
})

// ─── buildDefaultDescription ───

describe('buildDefaultDescription', () => {
  it('includes rule name in description', () => {
    expect(buildDefaultDescription('my-rule')).toContain('my-rule')
  })

  it('returns proper format', () => {
    expect(buildDefaultDescription('no-eval')).toBe('Description for no-eval rule')
  })
})
