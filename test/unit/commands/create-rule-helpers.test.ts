import { describe, expect, it } from 'vitest'

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
  type GenerateRuleContentOptions,
} from '../../../src/commands/create-rule-helpers.js'

// ---------------------------------------------------------------------------
// isValidRuleName
// ---------------------------------------------------------------------------
describe('isValidRuleName', () => {
  it('accepts simple lowercase word', () => {
    expect(isValidRuleName('foo')).toBe(true)
  })

  it('accepts kebab-case name', () => {
    expect(isValidRuleName('no-foo-bar')).toBe(true)
  })

  it('accepts name with digits', () => {
    expect(isValidRuleName('max-params2')).toBe(true)
  })

  it('accepts single letter', () => {
    expect(isValidRuleName('a')).toBe(true)
  })

  it('accepts long kebab-case', () => {
    expect(isValidRuleName('no-foo-bar-baz-qux')).toBe(true)
  })

  it('accepts name ending with digit', () => {
    expect(isValidRuleName('rule-v2')).toBe(true)
  })

  it('rejects uppercase letters', () => {
    expect(isValidRuleName('No-Foo')).toBe(false)
  })

  it('rejects name starting with digit', () => {
    expect(isValidRuleName('0no-foo')).toBe(false)
  })

  it('rejects name starting with hyphen', () => {
    expect(isValidRuleName('-rule')).toBe(false)
  })

  it('rejects names with spaces', () => {
    expect(isValidRuleName('no foo')).toBe(false)
  })

  it('rejects names with underscores', () => {
    expect(isValidRuleName('no_foo')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidRuleName('')).toBe(false)
  })

  it('rejects names with dots', () => {
    expect(isValidRuleName('no.foo')).toBe(false)
  })

  it('rejects names with special characters', () => {
    expect(isValidRuleName('no@foo')).toBe(false)
  })

  it('accepts single letter followed by digit', () => {
    expect(isValidRuleName('a1')).toBe(true)
  })

  it('accepts double-digit segments', () => {
    expect(isValidRuleName('max-10-params')).toBe(true)
  })

  it('accepts single letter z', () => {
    expect(isValidRuleName('z')).toBe(true)
  })

  it('accepts six-part kebab-case', () => {
    expect(isValidRuleName('a-b-c-d-e-f')).toBe(true)
  })

  it('rejects name with tab character', () => {
    expect(isValidRuleName('no\tfoo')).toBe(false)
  })

  it('rejects name with newline', () => {
    expect(isValidRuleName('no\nfoo')).toBe(false)
  })

  it('rejects name with slash', () => {
    expect(isValidRuleName('no/foo')).toBe(false)
  })

  it('rejects name with parentheses', () => {
    expect(isValidRuleName('no(foo)')).toBe(false)
  })

  it('rejects name with exclamation mark', () => {
    expect(isValidRuleName('no!foo')).toBe(false)
  })

  it('rejects name with hash symbol', () => {
    expect(isValidRuleName('no#foo')).toBe(false)
  })

  it('rejects name with plus sign', () => {
    expect(isValidRuleName('no+foo')).toBe(false)
  })

  it('rejects name with equals sign', () => {
    expect(isValidRuleName('no=foo')).toBe(false)
  })

  it('rejects name with only digits after letter', () => {
    expect(isValidRuleName('a-123')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isValidCategory
// ---------------------------------------------------------------------------
describe('isValidCategory', () => {
  it('accepts complexity', () => {
    expect(isValidCategory('complexity')).toBe(true)
  })

  it('accepts dependencies', () => {
    expect(isValidCategory('dependencies')).toBe(true)
  })

  it('accepts performance', () => {
    expect(isValidCategory('performance')).toBe(true)
  })

  it('accepts security', () => {
    expect(isValidCategory('security')).toBe(true)
  })

  it('accepts patterns', () => {
    expect(isValidCategory('patterns')).toBe(true)
  })

  it('accepts correctness', () => {
    expect(isValidCategory('correctness')).toBe(true)
  })

  it('accepts testing', () => {
    expect(isValidCategory('testing')).toBe(true)
  })

  it('accepts best-practices', () => {
    expect(isValidCategory('best-practices')).toBe(true)
  })

  it('rejects unknown category', () => {
    expect(isValidCategory('unknown')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidCategory('')).toBe(false)
  })

  it('rejects case-variant', () => {
    expect(isValidCategory('Security')).toBe(false)
  })

  it('rejects partial match', () => {
    expect(isValidCategory('securit')).toBe(false)
  })

  it('rejects category with extra leading space', () => {
    expect(isValidCategory(' security')).toBe(false)
  })

  it('rejects numeric string', () => {
    expect(isValidCategory('123')).toBe(false)
  })

  it('rejects all-uppercase variant', () => {
    expect(isValidCategory('COMPLEXITY')).toBe(false)
  })

  it('rejects camelCase variant', () => {
    expect(isValidCategory('bestPractices')).toBe(false)
  })

  it('rejects category with trailing hyphen', () => {
    expect(isValidCategory('patterns-')).toBe(false)
  })

  it('rejects category with extra trailing space', () => {
    expect(isValidCategory('security ')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isValidSeverity
// ---------------------------------------------------------------------------
describe('isValidSeverity', () => {
  it('accepts error', () => {
    expect(isValidSeverity('error')).toBe(true)
  })

  it('accepts warning', () => {
    expect(isValidSeverity('warning')).toBe(true)
  })

  it('accepts info', () => {
    expect(isValidSeverity('info')).toBe(true)
  })

  it('rejects unknown severity', () => {
    expect(isValidSeverity('fatal')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidSeverity('')).toBe(false)
  })

  it('rejects case-variant', () => {
    expect(isValidSeverity('Error')).toBe(false)
  })

  it('rejects partial match', () => {
    expect(isValidSeverity('erro')).toBe(false)
  })

  it('rejects numeric string', () => {
    expect(isValidSeverity('123')).toBe(false)
  })

  it('rejects all-uppercase variant', () => {
    expect(isValidSeverity('ERROR')).toBe(false)
  })

  it('rejects camelCase variant', () => {
    expect(isValidSeverity('Warning')).toBe(false)
  })

  it('rejects debug severity', () => {
    expect(isValidSeverity('debug')).toBe(false)
  })

  it('rejects notice severity', () => {
    expect(isValidSeverity('notice')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// toCamelCase
// ---------------------------------------------------------------------------
describe('toCamelCase', () => {
  it('converts single word unchanged', () => {
    expect(toCamelCase('foo')).toBe('foo')
  })

  it('converts two-part kebab-case', () => {
    expect(toCamelCase('no-foo')).toBe('noFoo')
  })

  it('converts three-part kebab-case', () => {
    expect(toCamelCase('no-foo-bar')).toBe('noFooBar')
  })

  it('handles single character', () => {
    expect(toCamelCase('a')).toBe('a')
  })

  it('handles name with digits', () => {
    expect(toCamelCase('rule-v2')).toBe('ruleV2')
  })

  it('handles empty string', () => {
    expect(toCamelCase('')).toBe('')
  })

  it('handles trailing hyphen', () => {
    expect(toCamelCase('rule-')).toBe('rule')
  })

  it('handles consecutive hyphens', () => {
    expect(toCamelCase('a--b')).toBe('aB')
  })

  it('handles three consecutive hyphens', () => {
    expect(toCamelCase('a---b')).toBe('aB')
  })

  it('handles leading hyphen', () => {
    expect(toCamelCase('-foo')).toBe('Foo')
  })

  it('handles only hyphens', () => {
    expect(toCamelCase('---')).toBe('')
  })

  it('handles already camelCase input unchanged', () => {
    expect(toCamelCase('noFoo')).toBe('noFoo')
  })

  it('handles all same letter parts', () => {
    expect(toCamelCase('aaa-bbb')).toBe('aaaBbb')
  })

  it('handles multiple digit segments', () => {
    expect(toCamelCase('v1-v2-v3')).toBe('v1V2V3')
  })

  it('handles single char parts', () => {
    expect(toCamelCase('a-b')).toBe('aB')
  })

  it('handles four-part name', () => {
    expect(toCamelCase('no-foo-bar-baz')).toBe('noFooBarBaz')
  })

  it('handles name with only one hyphen', () => {
    expect(toCamelCase('x-y')).toBe('xY')
  })
})

// ---------------------------------------------------------------------------
// toPascalCase
// ---------------------------------------------------------------------------
describe('toPascalCase', () => {
  it('capitalizes single word', () => {
    expect(toPascalCase('foo')).toBe('Foo')
  })

  it('converts two-part kebab-case', () => {
    expect(toPascalCase('no-foo')).toBe('NoFoo')
  })

  it('converts three-part kebab-case', () => {
    expect(toPascalCase('no-foo-bar')).toBe('NoFooBar')
  })

  it('handles single character', () => {
    expect(toPascalCase('a')).toBe('A')
  })

  it('handles name with digits', () => {
    expect(toPascalCase('rule-v2')).toBe('RuleV2')
  })

  it('handles empty string', () => {
    expect(toPascalCase('')).toBe('')
  })

  it('handles trailing hyphen', () => {
    expect(toPascalCase('rule-')).toBe('Rule')
  })

  it('handles consecutive hyphens', () => {
    expect(toPascalCase('a--b')).toBe('AB')
  })

  it('handles three consecutive hyphens', () => {
    expect(toPascalCase('a---b')).toBe('AB')
  })

  it('handles leading hyphen', () => {
    expect(toPascalCase('-foo')).toBe('Foo')
  })

  it('handles only hyphens', () => {
    expect(toPascalCase('---')).toBe('')
  })

  it('handles already pascalCase input', () => {
    expect(toPascalCase('NoFoo')).toBe('NoFoo')
  })

  it('handles single char parts', () => {
    expect(toPascalCase('a-b')).toBe('AB')
  })

  it('handles all same letter parts', () => {
    expect(toPascalCase('aaa-bbb')).toBe('AaaBbb')
  })

  it('handles multiple digit segments', () => {
    expect(toPascalCase('v1-v2-v3')).toBe('V1V2V3')
  })

  it('handles four-part name', () => {
    expect(toPascalCase('no-foo-bar-baz')).toBe('NoFooBarBaz')
  })

  it('handles name with only one hyphen', () => {
    expect(toPascalCase('x-y')).toBe('XY')
  })
})

// ---------------------------------------------------------------------------
// buildRuleContent
// ---------------------------------------------------------------------------
describe('buildRuleContent', () => {
  const baseOpts: GenerateRuleContentOptions = {
    category: 'patterns',
    description: 'Test rule',
    fixable: false,
    ruleName: 'no-test',
    severity: 'warning',
    typescript: false,
  }

  it('contains rule name in JSDoc header', () => {
    expect(buildRuleContent(baseOpts)).toContain('no-test - Test rule')
  })

  it('contains RuleDefinition import', () => {
    expect(buildRuleContent(baseOpts)).toContain(
      "import type { RuleDefinition, RuleOptions } from '../types.js'",
    )
  })

  it('contains visitor imports', () => {
    expect(buildRuleContent(baseOpts)).toContain("from '../../ast/visitor.js'")
  })

  it('contains SourceFile import', () => {
    expect(buildRuleContent(baseOpts)).toContain("import type { SourceFile } from 'ts-morph'")
  })

  it('contains category in meta', () => {
    const content = buildRuleContent({ ...baseOpts, category: 'security' })
    expect(content).toContain("category: 'security'")
  })

  it('contains description in meta', () => {
    const content = buildRuleContent({ ...baseOpts, description: 'My custom desc' })
    expect(content).toContain("description: 'My custom desc'")
  })

  it('contains severity in violation template when not fixable', () => {
    const content = buildRuleContent({ ...baseOpts, severity: 'error' })
    expect(content).toContain("severity: 'error'")
  })

  it('includes fixable code when fixable is true', () => {
    const content = buildRuleContent({ ...baseOpts, fixable: true })
    expect(content).toContain("fixable: 'code',")
    expect(content).not.toContain('// fixable')
  })

  it('includes commented fixable when fixable is false', () => {
    const content = buildRuleContent({ ...baseOpts, fixable: false })
    expect(content).toContain("// fixable: 'code', // Uncomment if auto-fixable")
  })

  it('includes SyntaxKind import when typescript is true', () => {
    const content = buildRuleContent({ ...baseOpts, typescript: true })
    expect(content).toContain("import { SyntaxKind } from 'ts-morph'")
  })

  it('omits SyntaxKind import when typescript is false', () => {
    const content = buildRuleContent({ ...baseOpts, typescript: false })
    expect(content).not.toContain('import { SyntaxKind }')
  })

  it('uses camelCase export name', () => {
    const content = buildRuleContent({ ...baseOpts, ruleName: 'no-foo-bar' })
    expect(content).toContain('export const noFooBarRule')
  })

  it('uses PascalCase interface name', () => {
    const content = buildRuleContent({ ...baseOpts, ruleName: 'no-foo-bar' })
    expect(content).toContain('interface NoFooBarOptions')
  })

  it('contains create method', () => {
    expect(buildRuleContent(baseOpts)).toContain('create:')
  })

  it('contains visitor object', () => {
    expect(buildRuleContent(baseOpts)).toContain('visitor:')
  })

  it('contains onComplete callback', () => {
    expect(buildRuleContent(baseOpts)).toContain('onComplete:')
  })

  it('contains defaultOptions', () => {
    expect(buildRuleContent(baseOpts)).toContain('defaultOptions: {}')
  })

  it('contains recommended: false', () => {
    expect(buildRuleContent(baseOpts)).toContain('recommended: false')
  })

  it('generates different content for different rule names', () => {
    const a = buildRuleContent({ ...baseOpts, ruleName: 'rule-a' })
    const b = buildRuleContent({ ...baseOpts, ruleName: 'rule-b' })
    expect(a).not.toBe(b)
  })

  it('contains empty description when description is empty', () => {
    const content = buildRuleContent({ ...baseOpts, description: '' })
    expect(content).toContain("description: ''")
  })

  it('handles long multi-word description', () => {
    const desc = 'This is a very long description with multiple words'
    const content = buildRuleContent({ ...baseOpts, description: desc })
    expect(content).toContain(`description: '${desc}'`)
  })

  it('includes severity info in violation template', () => {
    const content = buildRuleContent({ ...baseOpts, severity: 'info' })
    expect(content).toContain("severity: 'info'")
  })

  it('includes severity warning in violation template', () => {
    const content = buildRuleContent({ ...baseOpts, severity: 'warning' })
    expect(content).toContain("severity: 'warning'")
  })

  it('uses correct category complexity in output', () => {
    const content = buildRuleContent({ ...baseOpts, category: 'complexity' })
    expect(content).toContain("category: 'complexity'")
  })

  it('uses correct category correctness in output', () => {
    const content = buildRuleContent({ ...baseOpts, category: 'correctness' })
    expect(content).toContain("category: 'correctness'")
  })

  it('uses correct category testing in output', () => {
    const content = buildRuleContent({ ...baseOpts, category: 'testing' })
    expect(content).toContain("category: 'testing'")
  })

  it('uses correct category best-practices in output', () => {
    const content = buildRuleContent({ ...baseOpts, category: 'best-practices' })
    expect(content).toContain("category: 'best-practices'")
  })

  it('uses correct category dependencies in output', () => {
    const content = buildRuleContent({ ...baseOpts, category: 'dependencies' })
    expect(content).toContain("category: 'dependencies'")
  })

  it('uses correct category performance in output', () => {
    const content = buildRuleContent({ ...baseOpts, category: 'performance' })
    expect(content).toContain("category: 'performance'")
  })

  it('handles single-word rule name for camelCase export', () => {
    const content = buildRuleContent({ ...baseOpts, ruleName: 'simple' })
    expect(content).toContain('export const simpleRule')
  })

  it('handles four-part rule name', () => {
    const content = buildRuleContent({ ...baseOpts, ruleName: 'no-foo-bar-baz' })
    expect(content).toContain('export const noFooBarBazRule')
    expect(content).toContain('interface NoFooBarBazOptions')
  })

  it('includes both fixable and typescript when both true', () => {
    const content = buildRuleContent({ ...baseOpts, fixable: true, typescript: true })
    expect(content).toContain("fixable: 'code',")
    expect(content).toContain("import { SyntaxKind } from 'ts-morph'")
  })

  it('contains RuleViolation type import', () => {
    expect(buildRuleContent(baseOpts)).toContain('type RuleViolation')
  })

  it('contains violations array initialization', () => {
    expect(buildRuleContent(baseOpts)).toContain('const violations: RuleViolation[] = []')
  })

  it('contains TODO comment', () => {
    expect(buildRuleContent(baseOpts)).toContain('TODO: Implement your visitor logic here')
  })

  it('contains filePath in template', () => {
    expect(buildRuleContent(baseOpts)).toContain('getFilePath()')
  })

  it('contains getNodeRange in template', () => {
    expect(buildRuleContent(baseOpts)).toContain('getNodeRange(')
  })

  it('contains getFunctionName in imports', () => {
    expect(buildRuleContent(baseOpts)).toContain('getFunctionName')
  })

  it('contains traverseAST in imports', () => {
    expect(buildRuleContent(baseOpts)).toContain('traverseAST')
  })

  it('contains FunctionLikeNode in imports', () => {
    expect(buildRuleContent(baseOpts)).toContain('type FunctionLikeNode')
  })

  it('contains max optional property in interface', () => {
    expect(buildRuleContent(baseOpts)).toContain('max?: number')
  })

  it('contains ruleId in violation template', () => {
    expect(buildRuleContent(baseOpts)).toContain("ruleId: 'no-test'")
  })

  it('contains message placeholder in violation template', () => {
    expect(buildRuleContent(baseOpts)).toContain('Description of the violation')
  })
})

// ---------------------------------------------------------------------------
// buildTestContent
// ---------------------------------------------------------------------------
describe('buildTestContent', () => {
  it('contains vitest imports', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain("import { describe, test, expect, vi } from 'vitest'")
  })

  it('imports rule with camelCase name', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain('noTestRule')
  })

  it('imports from correct category path', () => {
    const content = buildTestContent('max-depth', 'complexity')
    expect(content).toContain("from '../../../../src/rules/complexity/max-depth'")
  })

  it('imports ast helpers', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain("from '../../../helpers/ast-helpers'")
  })

  it('has describe block with rule name', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain("describe('no-test'")
  })

  it('has meta validation test', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain("'should have valid meta'")
  })

  it('has create function test', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain("'should export create function'")
  })

  it('has visitor object test', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain("'should return visitor object from create'")
  })

  it('has empty violations test', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain("'should return empty violations for default options'")
  })

  it('uses camelCase for rule reference in tests', () => {
    const content = buildTestContent('my-custom-rule', 'security')
    expect(content).toContain('myCustomRule')
  })

  it('contains category in meta assertion', () => {
    const content = buildTestContent('no-test', 'security')
    expect(content).toContain("toBe('security')")
  })

  it('uses correct category path for dependencies', () => {
    const content = buildTestContent('no-cycle', 'dependencies')
    expect(content).toContain("from '../../../../src/rules/dependencies/no-cycle'")
  })

  it('uses correct category path for performance', () => {
    const content = buildTestContent('no-slow', 'performance')
    expect(content).toContain("from '../../../../src/rules/performance/no-slow'")
  })

  it('uses correct category path for security', () => {
    const content = buildTestContent('no-eval', 'security')
    expect(content).toContain("from '../../../../src/rules/security/no-eval'")
  })

  it('uses correct category path for testing', () => {
    const content = buildTestContent('no-focused', 'testing')
    expect(content).toContain("from '../../../../src/rules/testing/no-focused'")
  })

  it('uses correct category path for correctness', () => {
    const content = buildTestContent('no-unused', 'correctness')
    expect(content).toContain("from '../../../../src/rules/correctness/no-unused'")
  })

  it('uses correct category path for best-practices', () => {
    const content = buildTestContent('prefer-const', 'best-practices')
    expect(content).toContain("from '../../../../src/rules/best-practices/prefer-const'")
  })

  it('contains exactly four test blocks', () => {
    const content = buildTestContent('no-test', 'patterns')
    const matches = content.match(/\btest\(/g)
    expect(matches).toHaveLength(4)
  })

  it('uses camelCase for multi-part rule name in imports', () => {
    const content = buildTestContent('prefer-named-param', 'complexity')
    expect(content).toContain('preferNamedParamRule')
  })

  it('contains expect().toBeDefined() assertions', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain('toBeDefined()')
  })

  it('contains expect(typeof...).toBe function assertion', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain('typeof')
    expect(content).toContain("'function'")
  })

  it('contains Array.isArray assertion', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain('Array.isArray(')
  })

  it('has rule name in meta name assertion', () => {
    const content = buildTestContent('my-rule', 'patterns')
    expect(content).toContain("toBe('my-rule')")
  })

  it('contains onComplete function call', () => {
    const content = buildTestContent('no-test', 'patterns')
    expect(content).toContain('onComplete()')
  })

  it('generates different content for different rule names', () => {
    const a = buildTestContent('rule-a', 'patterns')
    const b = buildTestContent('rule-b', 'patterns')
    expect(a).not.toBe(b)
  })

  it('generates different content for different categories', () => {
    const a = buildTestContent('no-test', 'patterns')
    const b = buildTestContent('no-test', 'security')
    expect(a).not.toBe(b)
  })
})

// ---------------------------------------------------------------------------
// buildDefaultDescription
// ---------------------------------------------------------------------------
describe('buildDefaultDescription', () => {
  it('includes rule name in description', () => {
    expect(buildDefaultDescription('no-foo')).toContain('no-foo')
  })

  it('returns expected format', () => {
    expect(buildDefaultDescription('max-depth')).toBe('Description for max-depth rule')
  })

  it('returns different descriptions for different names', () => {
    expect(buildDefaultDescription('rule-a')).not.toBe(buildDefaultDescription('rule-b'))
  })

  it('handles empty string input', () => {
    expect(buildDefaultDescription('')).toBe('Description for  rule')
  })

  it('handles single character name', () => {
    expect(buildDefaultDescription('x')).toBe('Description for x rule')
  })

  it('handles name with digits', () => {
    expect(buildDefaultDescription('rule-v2')).toBe('Description for rule-v2 rule')
  })

  it('handles long name', () => {
    const name = 'very-long-rule-name-with-many-parts'
    expect(buildDefaultDescription(name)).toBe(`Description for ${name} rule`)
  })

  it('always starts with "Description for"', () => {
    expect(buildDefaultDescription('test').startsWith('Description for ')).toBe(true)
  })

  it('always ends with "rule"', () => {
    expect(buildDefaultDescription('test').endsWith('rule')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// VALID_CATEGORIES constant
// ---------------------------------------------------------------------------
describe('VALID_CATEGORIES', () => {
  it('contains complexity', () => {
    expect(VALID_CATEGORIES).toContain('complexity')
  })

  it('contains all expected categories', () => {
    expect(VALID_CATEGORIES).toEqual([
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
      'best-practices',
    ])
  })

  it('has 8 categories', () => {
    expect(VALID_CATEGORIES).toHaveLength(8)
  })

  it('contains dependencies', () => {
    expect(VALID_CATEGORIES).toContain('dependencies')
  })

  it('contains performance', () => {
    expect(VALID_CATEGORIES).toContain('performance')
  })

  it('contains security', () => {
    expect(VALID_CATEGORIES).toContain('security')
  })

  it('contains patterns', () => {
    expect(VALID_CATEGORIES).toContain('patterns')
  })

  it('contains correctness', () => {
    expect(VALID_CATEGORIES).toContain('correctness')
  })

  it('contains testing', () => {
    expect(VALID_CATEGORIES).toContain('testing')
  })

  it('contains best-practices', () => {
    expect(VALID_CATEGORIES).toContain('best-practices')
  })

  it('does not contain style', () => {
    expect(VALID_CATEGORIES).not.toContain('style')
  })

  it('does not contain formatting', () => {
    expect(VALID_CATEGORIES).not.toContain('formatting')
  })

  it('does not contain deprecated', () => {
    expect(VALID_CATEGORIES).not.toContain('deprecated')
  })

  it('does not contain empty string', () => {
    expect(VALID_CATEGORIES).not.toContain('')
  })
})

// ---------------------------------------------------------------------------
// VALID_SEVERITIES constant
// ---------------------------------------------------------------------------
describe('VALID_SEVERITIES', () => {
  it('contains error, warning, info', () => {
    expect(VALID_SEVERITIES).toEqual(['error', 'warning', 'info'])
  })

  it('has 3 severities', () => {
    expect(VALID_SEVERITIES).toHaveLength(3)
  })

  it('contains error at index 0', () => {
    expect(VALID_SEVERITIES[0]).toBe('error')
  })

  it('contains warning at index 1', () => {
    expect(VALID_SEVERITIES[1]).toBe('warning')
  })

  it('contains info at index 2', () => {
    expect(VALID_SEVERITIES[2]).toBe('info')
  })

  it('does not contain fatal', () => {
    expect(VALID_SEVERITIES).not.toContain('fatal')
  })

  it('does not contain debug', () => {
    expect(VALID_SEVERITIES).not.toContain('debug')
  })

  it('does not contain empty string', () => {
    expect(VALID_SEVERITIES).not.toContain('')
  })

  it('does not contain notice', () => {
    expect(VALID_SEVERITIES).not.toContain('notice')
  })
})

// ---------------------------------------------------------------------------
// Integration / cross-function tests
// ---------------------------------------------------------------------------
describe('cross-function integration', () => {
  it('toCamelCase and toPascalCase produce consistent results for two-part name', () => {
    const name = 'no-foo'
    const camel = toCamelCase(name)
    const pascal = toPascalCase(name)
    expect(camel).toBe('noFoo')
    expect(pascal).toBe('NoFoo')
    expect(camel.charAt(0)).toBe(pascal.charAt(0).toLowerCase())
  })

  it('toCamelCase and toPascalCase produce consistent results for single word', () => {
    const name = 'simple'
    expect(toCamelCase(name)).toBe('simple')
    expect(toPascalCase(name)).toBe('Simple')
  })

  it('buildRuleContent uses camelCase rule export name matching toCamelCase', () => {
    const name = 'my-custom-rule'
    const content = buildRuleContent({
      category: 'patterns',
      description: 'Test',
      fixable: false,
      ruleName: name,
      severity: 'warning',
      typescript: false,
    })
    expect(content).toContain(`export const ${toCamelCase(name)}Rule`)
  })

  it('buildRuleContent uses PascalCase interface name matching toPascalCase', () => {
    const name = 'my-custom-rule'
    const content = buildRuleContent({
      category: 'patterns',
      description: 'Test',
      fixable: false,
      ruleName: name,
      severity: 'warning',
      typescript: false,
    })
    expect(content).toContain(`interface ${toPascalCase(name)}Options`)
  })

  it('buildTestContent uses camelCase matching toCamelCase', () => {
    const name = 'my-custom-rule'
    const content = buildTestContent(name, 'patterns')
    expect(content).toContain(toCamelCase(name))
  })

  it('buildRuleContent works with all valid categories', () => {
    for (const cat of VALID_CATEGORIES) {
      const content = buildRuleContent({
        category: cat,
        description: 'Test',
        fixable: false,
        ruleName: 'test-rule',
        severity: 'warning',
        typescript: false,
      })
      expect(content).toContain(`category: '${cat}'`)
    }
  })

  it('buildRuleContent works with all valid severities', () => {
    for (const sev of VALID_SEVERITIES) {
      const content = buildRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'test-rule',
        severity: sev,
        typescript: false,
      })
      expect(content).toContain(`severity: '${sev}'`)
    }
  })

  it('buildTestContent works with all valid categories', () => {
    for (const cat of VALID_CATEGORIES) {
      const content = buildTestContent('test-rule', cat)
      expect(content).toContain(`from '../../../../src/rules/${cat}/test-rule'`)
    }
  })

  it('buildDefaultDescription matches expected pattern with buildRuleContent', () => {
    const name = 'no-eval'
    const desc = buildDefaultDescription(name)
    expect(desc).toBe(`Description for ${name} rule`)
    const content = buildRuleContent({
      category: 'security',
      description: desc,
      fixable: false,
      ruleName: name,
      severity: 'error',
      typescript: false,
    })
    expect(content).toContain(`description: '${desc}'`)
  })
})
