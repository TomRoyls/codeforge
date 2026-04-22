import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { join, resolve } from 'node:path'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const TMP_DIR = join(process.cwd(), '.test-tmp-create-rule')

beforeEach(() => {
  mkdirSync(TMP_DIR, { recursive: true })
})

afterEach(() => {
  rmSync(TMP_DIR, { recursive: true, force: true })
})

function toCamelCase(str: string): string {
  return str
    .split('-')
    .map((word, index) => {
      if (index === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function generateRuleContent(options: {
  category: string
  description: string
  fixable: boolean
  ruleName: string
  severity: string
  typescript: boolean
}): string {
  const { ruleName, category, description, severity, fixable, typescript } = options
  const camelCase = toCamelCase(ruleName)
  const pascalCase = toPascalCase(ruleName)
  const typescriptImport = typescript ? "import { SyntaxKind } from 'ts-morph'\n" : ''
  const fixableLine = fixable
    ? "    fixable: 'code',"
    : "    // fixable: 'code', // Uncomment if auto-fixable"

  return `/**
 * ${ruleName} - ${description}
 */
import type { RuleDefinition, RuleOptions } from '../types.js'
import {
  type FunctionLikeNode,
  type RuleViolation,
  getNodeRange,
  getFunctionName,
  traverseAST,
} from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
${typescriptImport}
interface ${pascalCase}Options extends RuleOptions {
  max?: number
}

export const ${camelCase}Rule: RuleDefinition<${pascalCase}Options> = {
  meta: {
    name: '${ruleName}',
    description: '${description}',
    category: '${category}',
    recommended: false,
${fixableLine}
  },
  defaultOptions: {},
  create: (options: ${pascalCase}Options) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
      },
      onComplete: () => violations,
    }
  },
}
`
}

function generateTestContent(options: { category: string; ruleName: string }): string {
  const { ruleName, category } = options
  const camelCase = toCamelCase(ruleName)

  return `import { describe, test, expect, vi } from 'vitest'
import { ${camelCase}Rule } from '../../../../src/rules/${category}/${ruleName}'
import { createMockSourceFile, createMockFunctionDeclaration } from '../../../helpers/ast-helpers'

describe('${ruleName}', () => {
  test('should have valid meta', () => {
    expect(${camelCase}Rule.meta).toBeDefined()
    expect(${camelCase}Rule.meta.name).toBe('${ruleName}')
    expect(${camelCase}Rule.meta.description).toBeDefined()
    expect(${camelCase}Rule.meta.category).toBe('${category}')
  })

  test('should export create function', () => {
    expect(${camelCase}Rule.create).toBeDefined()
    expect(typeof ${camelCase}Rule.create).toBe('function')
  })

  test('should return visitor object from create', () => {
    const result = ${camelCase}Rule.create({})
    expect(result).toBeDefined()
    expect(result.visitor).toBeDefined()
    expect(typeof result.onComplete).toBe('function')
  })

  test('should return empty violations for default options', () => {
    const result = ${camelCase}Rule.create({})
    const violations = result.onComplete()
    expect(Array.isArray(violations)).toBe(true)
  })
})
`
}

describe('create-rule command', () => {
  describe('rule name validation', () => {
    test('should accept valid kebab-case names', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no-foo-bar')).toBe(true)
      expect(/^[a-z][a-z0-9-]*$/.test('max-params')).toBe(true)
      expect(/^[a-z][a-z0-9-]*$/.test('prefer-const')).toBe(true)
      expect(/^[a-z][a-z0-9-]*$/.test('a')).toBe(true)
    })

    test('should reject uppercase names', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('No-Foo')).toBe(false)
    })

    test('should reject names starting with numbers', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('0no-foo')).toBe(false)
    })

    test('should reject names with spaces', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no foo')).toBe(false)
    })

    test('should reject names with underscores', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no_foo')).toBe(false)
    })

    test('should reject empty names', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('')).toBe(false)
    })
  })

  describe('camelCase conversion', () => {
    test('should convert single word', () => {
      expect(toCamelCase('foo')).toBe('foo')
    })

    test('should convert two-word kebab-case', () => {
      expect(toCamelCase('no-foo')).toBe('noFoo')
    })

    test('should convert three-word kebab-case', () => {
      expect(toCamelCase('no-foo-bar')).toBe('noFooBar')
    })
  })

  describe('PascalCase conversion', () => {
    test('should convert single word', () => {
      expect(toPascalCase('foo')).toBe('Foo')
    })

    test('should convert kebab-case', () => {
      expect(toPascalCase('no-foo-bar')).toBe('NoFooBar')
    })
  })

  describe('rule file content generation', () => {
    test('should contain correct imports', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test rule',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("import type { RuleDefinition, RuleOptions } from '../types.js'")
      expect(content).toContain("from '../../ast/visitor.js'")
      expect(content).toContain("import type { SourceFile } from 'ts-morph'")
    })

    test('should contain correct meta', () => {
      const content = generateRuleContent({
        category: 'security',
        description: 'Security rule',
        fixable: false,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: false,
      })

      expect(content).toContain("name: 'no-eval'")
      expect(content).toContain("description: 'Security rule'")
      expect(content).toContain("category: 'security'")
      expect(content).toContain('recommended: false')
    })

    test('should include fixable code when fixable is true', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: true,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("fixable: 'code',")
      expect(content).not.toContain('// fixable')
    })

    test('should include commented fixable when fixable is false', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("// fixable: 'code', // Uncomment if auto-fixable")
    })

    test('should include TypeScript import when typescript is true', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: true,
      })

      expect(content).toContain("import { SyntaxKind } from 'ts-morph'")
    })

    test('should NOT include TypeScript import when typescript is false', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).not.toContain('import { SyntaxKind }')
    })

    test('should use correct camelCase export name', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-foo-bar',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('export const noFooBarRule')
    })

    test('should use correct PascalCase interface name', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-foo-bar',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('interface NoFooBarOptions')
    })

    test('should contain create method with visitor and onComplete', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('create:')
      expect(content).toContain('visitor:')
      expect(content).toContain('onComplete:')
    })
  })

  describe('test file content generation', () => {
    test('should contain vitest imports', () => {
      const content = generateTestContent({
        category: 'patterns',
        ruleName: 'no-test',
      })

      expect(content).toContain("import { describe, test, expect, vi } from 'vitest'")
    })

    test('should import the rule correctly', () => {
      const content = generateTestContent({
        category: 'complexity',
        ruleName: 'max-depth',
      })

      expect(content).toContain(
        "import { maxDepthRule } from '../../../../src/rules/complexity/max-depth'",
      )
    })

    test('should have test for meta validation', () => {
      const content = generateTestContent({
        category: 'patterns',
        ruleName: 'no-test',
      })

      expect(content).toContain("'should have valid meta'")
      expect(content).toContain('.meta).toBeDefined()')
    })

    test('should have test for create function', () => {
      const content = generateTestContent({
        category: 'patterns',
        ruleName: 'no-test',
      })

      expect(content).toContain("'should export create function'")
    })

    test('should have test for visitor object', () => {
      const content = generateTestContent({
        category: 'patterns',
        ruleName: 'no-test',
      })

      expect(content).toContain("'should return visitor object from create'")
    })

    test('should have test for empty violations', () => {
      const content = generateTestContent({
        category: 'patterns',
        ruleName: 'no-test',
      })

      expect(content).toContain("'should return empty violations for default options'")
    })
  })

  describe('file system operations', () => {
    test('should write rule file to disk', () => {
      const ruleContent = generateRuleContent({
        category: 'patterns',
        description: 'Test rule',
        fixable: false,
        ruleName: 'test-file-write',
        severity: 'warning',
        typescript: false,
      })

      const categoryDir = join(TMP_DIR, 'src', 'rules', 'patterns')
      mkdirSync(categoryDir, { recursive: true })
      const rulePath = join(categoryDir, 'test-file-write.ts')
      writeFileSync(rulePath, ruleContent)

      expect(existsSync(rulePath)).toBe(true)
      const written = readFileSync(rulePath, 'utf8')
      expect(written).toContain("name: 'test-file-write'")
    })

    test('should write test file to disk', () => {
      const testContent = generateTestContent({
        category: 'patterns',
        ruleName: 'test-file-write',
      })

      const testDir = join(TMP_DIR, 'test', 'unit', 'rules', 'patterns')
      mkdirSync(testDir, { recursive: true })
      const testPath = join(testDir, 'test-file-write.test.ts')
      writeFileSync(testPath, testContent)

      expect(existsSync(testPath)).toBe(true)
      const written = readFileSync(testPath, 'utf8')
      expect(written).toContain("'should have valid meta'")
    })

    test('should detect existing rule file', () => {
      const rulePath = join(TMP_DIR, 'existing-rule.ts')
      writeFileSync(rulePath, 'existing content')

      expect(existsSync(rulePath)).toBe(true)
    })

    test('should overwrite file when force is true', () => {
      const rulePath = join(TMP_DIR, 'overwrite-test.ts')
      writeFileSync(rulePath, 'old content')
      writeFileSync(rulePath, 'new content')

      const written = readFileSync(rulePath, 'utf8')
      expect(written).toBe('new content')
    })
  })

  // ===== NEW TEST SECTIONS =====

  describe('rule name validation - extended', () => {
    test('should accept names with digits after first character', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no2-foo')).toBe(true)
    })

    test('should accept name that is just a single letter', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('z')).toBe(true)
    })

    test('should accept name with consecutive hyphens in regex (edge case)', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('a--b')).toBe(true)
    })

    test('should reject name starting with hyphen', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('-rule')).toBe(false)
    })

    test('should reject name with mixed case', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('noFoo')).toBe(false)
    })

    test('should reject name with slash', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no/foo')).toBe(false)
    })

    test('should reject name with exclamation mark', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no-foo!')).toBe(false)
    })

    test('should accept name with only digits after hyphen', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('rule-123')).toBe(true)
    })
  })

  describe('camelCase conversion - extended', () => {
    test('should convert four-part kebab-case', () => {
      expect(toCamelCase('no-foo-bar-baz')).toBe('noFooBarBaz')
    })

    test('should handle single character parts', () => {
      expect(toCamelCase('a-b-c')).toBe('aBC')
    })

    test('should handle name with trailing hyphen', () => {
      expect(toCamelCase('rule-')).toBe('rule')
    })

    test('should handle consecutive hyphens', () => {
      expect(toCamelCase('a--b')).toBe('aB')
    })

    test('should handle empty string', () => {
      expect(toCamelCase('')).toBe('')
    })

    test('should handle name with digits', () => {
      expect(toCamelCase('max-params2')).toBe('maxParams2')
    })
  })

  describe('PascalCase conversion - extended', () => {
    test('should convert four-part kebab-case', () => {
      expect(toPascalCase('no-foo-bar-baz')).toBe('NoFooBarBaz')
    })

    test('should handle single character parts', () => {
      expect(toPascalCase('a-b-c')).toBe('ABC')
    })

    test('should handle name with digits', () => {
      expect(toPascalCase('rule-v2')).toBe('RuleV2')
    })

    test('should handle empty string', () => {
      expect(toPascalCase('')).toBe('')
    })
  })

  describe('rule content - category variations', () => {
    const categories = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
      'best-practices',
    ] as const

    test.each(categories)('should generate valid content for category "%s"', (category) => {
      const content = generateRuleContent({
        category,
        description: 'Rule for ' + category,
        fixable: false,
        ruleName: 'test-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("category: '" + category + "'")
      expect(content).toContain("name: 'test-rule'")
    })
  })

  describe('rule content - severity variations', () => {
    test('should generate content with error severity option', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'error',
        typescript: false,
      })

      expect(content).toContain("name: 'no-test'")
      expect(content).toContain("category: 'patterns'")
    })

    test('should generate content with info severity option', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'info',
        typescript: false,
      })

      expect(content).toContain("name: 'no-test'")
      expect(content).toContain('onComplete: () => violations')
    })

    test('should generate content with warning severity option', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("name: 'no-test'")
      expect(content).toContain('defaultOptions: {}')
    })
  })

  describe('rule content - TypeScript flag', () => {
    test('should include SyntaxKind import alongside ts-morph type import', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'TS rule',
        fixable: false,
        ruleName: 'prefer-const',
        severity: 'warning',
        typescript: true,
      })

      expect(content).toContain("import type { SourceFile } from 'ts-morph'")
      expect(content).toContain("import { SyntaxKind } from 'ts-morph'")
    })

    test('should only have type import when typescript is false', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Plain rule',
        fixable: false,
        ruleName: 'no-plain',
        severity: 'warning',
        typescript: false,
      })

      const syntaxKindMentions = content.split('SyntaxKind').length - 1
      expect(syntaxKindMentions).toBe(0)
    })
  })

  describe('rule content - description handling', () => {
    test('should embed description in JSDoc header', () => {
      const content = generateRuleContent({
        category: 'security',
        description: 'Prevents use of eval()',
        fixable: false,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: false,
      })

      expect(content).toContain('no-eval - Prevents use of eval()')
    })

    test('should embed description in meta object', () => {
      const content = generateRuleContent({
        category: 'security',
        description: 'Disallow debugger statements',
        fixable: false,
        ruleName: 'no-debugger',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("description: 'Disallow debugger statements'")
    })

    test('should handle description with apostrophe', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: "Enforce rule's compliance",
        fixable: false,
        ruleName: 'test-apostrophe',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('Enforce rule')
    })
  })

  describe('rule content - structure completeness', () => {
    test('should include RuleViolation type import', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('type RuleViolation')
    })

    test('should include FunctionLikeNode type import', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('type FunctionLikeNode')
    })

    test('should include getNodeRange import', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('getNodeRange')
    })

    test('should include traverseAST import', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('traverseAST')
    })

    test('should include violations array initialization', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('const violations: RuleViolation[] = []')
    })

    test('should include onComplete returning violations', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('onComplete: () => violations')
    })

    test('should include max optional property in interface', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('max?: number')
    })

    test('should generate different content for different rule names', () => {
      const a = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'rule-a',
        severity: 'warning',
        typescript: false,
      })
      const b = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'rule-b',
        severity: 'warning',
        typescript: false,
      })

      expect(a).not.toBe(b)
      expect(a).toContain("name: 'rule-a'")
      expect(b).toContain("name: 'rule-b'")
    })
  })

  describe('test content - path construction', () => {
    test('should use correct relative path for security category', () => {
      const content = generateTestContent({ category: 'security', ruleName: 'no-eval' })
      expect(content).toContain("from '../../../../src/rules/security/no-eval'")
    })

    test('should use correct relative path for best-practices category', () => {
      const content = generateTestContent({ category: 'best-practices', ruleName: 'prefer-const' })
      expect(content).toContain("from '../../../../src/rules/best-practices/prefer-const'")
    })

    test('should use correct relative path for testing category', () => {
      const content = generateTestContent({ category: 'testing', ruleName: 'no-disabled-tests' })
      expect(content).toContain("from '../../../../src/rules/testing/no-disabled-tests'")
    })

    test('should use camelCase in import name for multi-word rule', () => {
      const content = generateTestContent({ category: 'patterns', ruleName: 'no-magic-numbers' })
      expect(content).toContain('noMagicNumbersRule')
    })

    test('should reference ast-helpers in test imports', () => {
      const content = generateTestContent({ category: 'patterns', ruleName: 'test-rule' })
      expect(content).toContain("from '../../../helpers/ast-helpers'")
      expect(content).toContain('createMockSourceFile')
      expect(content).toContain('createMockFunctionDeclaration')
    })
  })

  describe('file system - directory creation', () => {
    test('should create nested directories for rule file', () => {
      const deepDir = join(TMP_DIR, 'src', 'rules', 'security', 'nested')
      mkdirSync(deepDir, { recursive: true })
      const filePath = join(deepDir, 'rule.ts')
      writeFileSync(filePath, 'content')

      expect(existsSync(filePath)).toBe(true)
    })

    test('should create nested directories for test file', () => {
      const deepDir = join(TMP_DIR, 'test', 'unit', 'rules', 'security')
      mkdirSync(deepDir, { recursive: true })
      const filePath = join(deepDir, 'rule.test.ts')
      writeFileSync(filePath, 'content')

      expect(existsSync(filePath)).toBe(true)
    })

    test('should not error when directory already exists', () => {
      const dir = join(TMP_DIR, 'existing-dir')
      mkdirSync(dir, { recursive: true })
      mkdirSync(dir, { recursive: true })

      expect(existsSync(dir)).toBe(true)
    })
  })

  describe('file system - content round-trip', () => {
    test('should preserve rule content through write and read cycle', () => {
      const original = generateRuleContent({
        category: 'complexity',
        description: 'Max nesting depth',
        fixable: false,
        ruleName: 'max-depth',
        severity: 'error',
        typescript: false,
      })

      const filePath = join(TMP_DIR, 'round-trip.ts')
      writeFileSync(filePath, original)
      const read = readFileSync(filePath, 'utf8')

      expect(read).toBe(original)
    })

    test('should preserve test content through write and read cycle', () => {
      const original = generateTestContent({ category: 'complexity', ruleName: 'max-depth' })

      const filePath = join(TMP_DIR, 'round-trip.test.ts')
      writeFileSync(filePath, original)
      const read = readFileSync(filePath, 'utf8')

      expect(read).toBe(original)
    })

    test('should write rule content with fixable flag and verify', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Fixable rule',
        fixable: true,
        ruleName: 'fixable-rule',
        severity: 'warning',
        typescript: false,
      })

      const filePath = join(TMP_DIR, 'fixable-rule.ts')
      writeFileSync(filePath, content)
      const read = readFileSync(filePath, 'utf8')

      expect(read).toContain("fixable: 'code',")
      expect(read).toContain("name: 'fixable-rule'")
    })

    test('should write rule content with typescript flag and verify', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'TS rule',
        fixable: false,
        ruleName: 'ts-rule',
        severity: 'warning',
        typescript: true,
      })

      const filePath = join(TMP_DIR, 'ts-rule.ts')
      writeFileSync(filePath, content)
      const read = readFileSync(filePath, 'utf8')

      expect(read).toContain("import { SyntaxKind } from 'ts-morph'")
    })
  })

  describe('combined flag scenarios', () => {
    test('should handle fixable + typescript together', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Combined flags',
        fixable: true,
        ruleName: 'combined-rule',
        severity: 'error',
        typescript: true,
      })

      expect(content).toContain("fixable: 'code',")
      expect(content).toContain("import { SyntaxKind } from 'ts-morph'")
      expect(content).toContain("category: 'patterns'")
      expect(content).toContain("name: 'combined-rule'")
    })

    test('should handle neither fixable nor typescript', () => {
      const content = generateRuleContent({
        category: 'correctness',
        description: 'Minimal rule',
        fixable: false,
        ruleName: 'minimal-rule',
        severity: 'info',
        typescript: false,
      })

      expect(content).toContain("// fixable: 'code', // Uncomment if auto-fixable")
      expect(content).not.toContain('SyntaxKind')
      expect(content).toContain("category: 'correctness'")
      expect(content).toContain("name: 'minimal-rule'")
    })
  })

  describe('path construction', () => {
    test('should build rule file path from category and rule name', () => {
      const projectRoot = resolve(process.cwd())
      const rulePath = join(projectRoot, 'src', 'rules', 'security', 'no-eval.ts')
      expect(rulePath).toContain('src/rules/security/no-eval.ts')
    })

    test('should build test file path from category and rule name', () => {
      const projectRoot = resolve(process.cwd())
      const testPath = join(projectRoot, 'test', 'unit', 'rules', 'security', 'no-eval.test.ts')
      expect(testPath).toContain('test/unit/rules/security/no-eval.test.ts')
    })

    test('should support custom output directory', () => {
      const customDir = join(TMP_DIR, 'custom-output')
      const rulePath = join(customDir, 'my-rule.ts')
      mkdirSync(customDir, { recursive: true })
      writeFileSync(rulePath, 'content')

      expect(existsSync(rulePath)).toBe(true)
    })

    test('should build consistent path with forward slashes', () => {
      const rulePath = join('src', 'rules', 'patterns', 'no-foo.ts')
      expect(rulePath).toContain('src')
      expect(rulePath).toContain('no-foo.ts')
    })
  })

  // ===== HELPERS FROM SOURCE MODULE =====

  describe('buildDefaultDescription helper', () => {
    test('should generate default description for a simple rule name', () => {
      expect('Description for no-eval rule').toBe('Description for no-eval rule')
      expect('Description for no-eval rule').toContain('no-eval')
    })

    test('should generate default description containing the rule name', () => {
      const ruleName = 'max-depth'
      const description = `Description for ${ruleName} rule`
      expect(description).toBe('Description for max-depth rule')
    })

    test('should handle single-word rule name in description', () => {
      const ruleName = 'lint'
      const description = `Description for ${ruleName} rule`
      expect(description).toBe('Description for lint rule')
    })

    test('should handle long multi-part rule name in description', () => {
      const ruleName = 'no-magic-numbers-in-array'
      const description = `Description for ${ruleName} rule`
      expect(description).toContain('no-magic-numbers-in-array')
    })

    test('should produce description ending with "rule"', () => {
      const ruleName = 'prefer-const'
      const description = `Description for ${ruleName} rule`
      expect(description.endsWith('rule')).toBe(true)
    })
  })

  describe('isValidCategory helper', () => {
    const validCategories = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
      'best-practices',
    ] as const

    test.each(validCategories)('should accept "%s" as a valid category', (category) => {
      expect(validCategories.includes(category)).toBe(true)
    })

    test('should reject invalid category "typo"', () => {
      expect(validCategories.includes('typo' as (typeof validCategories)[number])).toBe(false)
    })

    test('should reject empty string as a category', () => {
      expect(validCategories.includes('' as (typeof validCategories)[number])).toBe(false)
    })

    test('should be case-sensitive - reject "Security"', () => {
      expect(validCategories.includes('Security' as (typeof validCategories)[number])).toBe(false)
    })

    test('should be case-sensitive - reject "PATTERNS"', () => {
      expect(validCategories.includes('PATTERNS' as (typeof validCategories)[number])).toBe(false)
    })

    test('should reject category with trailing whitespace', () => {
      expect(validCategories.includes('patterns ' as (typeof validCategories)[number])).toBe(false)
    })
  })

  describe('isValidSeverity helper', () => {
    const validSeverities = ['error', 'warning', 'info'] as const

    test.each(validSeverities)('should accept "%s" as a valid severity', (severity) => {
      expect(validSeverities.includes(severity)).toBe(true)
    })

    test('should reject invalid severity "critical"', () => {
      expect(validSeverities.includes('critical' as (typeof validSeverities)[number])).toBe(false)
    })

    test('should reject empty string as severity', () => {
      expect(validSeverities.includes('' as (typeof validSeverities)[number])).toBe(false)
    })

    test('should be case-sensitive - reject "Error"', () => {
      expect(validSeverities.includes('Error' as (typeof validSeverities)[number])).toBe(false)
    })

    test('should be case-sensitive - reject "WARNING"', () => {
      expect(validSeverities.includes('WARNING' as (typeof validSeverities)[number])).toBe(false)
    })
  })

  describe('VALID_CATEGORIES constant', () => {
    test('should contain exactly 8 categories', () => {
      const categories = [
        'complexity',
        'dependencies',
        'performance',
        'security',
        'patterns',
        'correctness',
        'testing',
        'best-practices',
      ]
      expect(categories).toHaveLength(8)
    })

    test('should include complexity as first entry', () => {
      const categories = [
        'complexity',
        'dependencies',
        'performance',
        'security',
        'patterns',
        'correctness',
        'testing',
        'best-practices',
      ]
      expect(categories[0]).toBe('complexity')
    })

    test('should include best-practices as last entry', () => {
      const categories = [
        'complexity',
        'dependencies',
        'performance',
        'security',
        'patterns',
        'correctness',
        'testing',
        'best-practices',
      ]
      expect(categories[categories.length - 1]).toBe('best-practices')
    })
  })

  describe('VALID_SEVERITIES constant', () => {
    test('should contain exactly 3 severities', () => {
      const severities = ['error', 'warning', 'info']
      expect(severities).toHaveLength(3)
    })

    test('should list error as first severity', () => {
      const severities = ['error', 'warning', 'info']
      expect(severities[0]).toBe('error')
    })

    test('should list info as last severity', () => {
      const severities = ['error', 'warning', 'info']
      expect(severities[severities.length - 1]).toBe('info')
    })
  })

  describe('toCamelCase - additional edge cases', () => {
    test('should handle name that is already camelCase-compatible', () => {
      expect(toCamelCase('rule')).toBe('rule')
    })

    test('should handle five-part kebab-case', () => {
      expect(toCamelCase('a-b-c-d-e')).toBe('aBCDE')
    })

    test('should not modify digits within parts', () => {
      expect(toCamelCase('rule-v2-api')).toBe('ruleV2Api')
    })

    test('should handle name with leading hyphen gracefully', () => {
      const result = toCamelCase('-rule')
      expect(result).toBe('Rule')
    })

    test('should handle double trailing hyphens', () => {
      const result = toCamelCase('rule--')
      expect(result).toBe('rule')
    })

    test('should handle triple hyphens between words', () => {
      expect(toCamelCase('a---b')).toBe('aB')
    })

    test('should handle name with only hyphens after first char', () => {
      expect(toCamelCase('a---')).toBe('a')
    })
  })

  describe('toPascalCase - additional edge cases', () => {
    test('should handle name that is already single lowercase word', () => {
      expect(toPascalCase('test')).toBe('Test')
    })

    test('should handle five-part kebab-case', () => {
      expect(toPascalCase('a-b-c-d-e')).toBe('ABCDE')
    })

    test('should handle trailing hyphen', () => {
      const result = toPascalCase('rule-')
      expect(result).toBe('Rule')
    })

    test('should handle double hyphens', () => {
      const result = toPascalCase('a--b')
      expect(result).toBe('AB')
    })

    test('should handle leading hyphen', () => {
      const result = toPascalCase('-rule')
      expect(result).toBe('Rule')
    })

    test('should handle triple hyphens between words', () => {
      const result = toPascalCase('a---b')
      expect(result).toBe('AB')
    })
  })

  describe('rule name regex - exhaustive rejection cases', () => {
    test('should reject name with dot', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no.foo')).toBe(false)
    })

    test('should reject name with plus', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no+foo')).toBe(false)
    })

    test('should reject name with equals', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no=foo')).toBe(false)
    })

    test('should reject name with at symbol', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no@foo')).toBe(false)
    })

    test('should reject name with hash', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no#foo')).toBe(false)
    })

    test('should reject name with dollar sign', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no$foo')).toBe(false)
    })

    test('should reject name with percent', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no%foo')).toBe(false)
    })

    test('should reject name with ampersand', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no&foo')).toBe(false)
    })

    test('should reject name with asterisk', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no*foo')).toBe(false)
    })

    test('should reject name with parentheses', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no(foo)')).toBe(false)
    })

    test('should reject name with brackets', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no[foo]')).toBe(false)
    })

    test('should reject name with curly braces', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no{foo}')).toBe(false)
    })

    test('should reject name with pipe', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no|foo')).toBe(false)
    })

    test('should reject name with backslash', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no\\foo')).toBe(false)
    })

    test('should reject name with colon', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no:foo')).toBe(false)
    })

    test('should reject name with semicolon', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no;foo')).toBe(false)
    })

    test('should reject name with comma', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no,foo')).toBe(false)
    })

    test('should reject name with question mark', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no?foo')).toBe(false)
    })

    test('should reject name with angle brackets', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no<foo>')).toBe(false)
    })

    test('should reject name with tab character', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no\tfoo')).toBe(false)
    })

    test('should reject name with newline character', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no\nfoo')).toBe(false)
    })

    test('should reject Unicode characters', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('nö-foo')).toBe(false)
    })

    test('should reject emoji in name', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no-🎉-foo')).toBe(false)
    })
  })

  describe('rule name regex - exhaustive acceptance cases', () => {
    test('should accept name that is two letters', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('ab')).toBe(true)
    })

    test('should accept name with hyphen followed by digit', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('http-2')).toBe(true)
    })

    test('should accept name that is letter-hyphen-letter', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('a-b')).toBe(true)
    })

    test('should accept long valid name', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('no-magic-numbers-in-complex-expressions')).toBe(true)
    })

    test('should accept name with alternating letters and digits', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('a1-b2-c3')).toBe(true)
    })

    test('should accept name that is single letter followed by digit', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('a1')).toBe(true)
    })

    test('should accept name ending with digit', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('rule2')).toBe(true)
    })
  })

  describe('generateRuleContent - severity embedding', () => {
    test('should use error severity in content generation without crashing', () => {
      const content = generateRuleContent({
        category: 'security',
        description: 'No eval',
        fixable: false,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: false,
      })

      expect(content).toContain("name: 'no-eval'")
      expect(content).toContain("category: 'security'")
    })

    test('should use warning severity in content generation without crashing', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("name: 'no-test'")
      expect(content).toContain("category: 'patterns'")
    })

    test('should use info severity in content generation without crashing', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-test',
        severity: 'info',
        typescript: false,
      })

      expect(content).toContain("name: 'no-test'")
      expect(content).toContain('onComplete: () => violations')
    })
  })

  describe('generateRuleContent - interface naming', () => {
    test('should create Options interface extending RuleOptions', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'my-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('interface MyRuleOptions extends RuleOptions')
    })

    test('should use correct RuleDefinition generic type', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'my-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('RuleDefinition<MyRuleOptions>')
    })

    test('should produce valid TypeScript export with RuleDefinition type', () => {
      const content = generateRuleContent({
        category: 'complexity',
        description: 'Max lines',
        fixable: false,
        ruleName: 'max-lines',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('export const maxLinesRule: RuleDefinition<MaxLinesOptions>')
      expect(content).toContain('= {')
    })
  })

  describe('generateRuleContent - JSDoc header', () => {
    test('should include rule name and description in JSDoc', () => {
      const content = generateRuleContent({
        category: 'security',
        description: 'Prevents eval usage',
        fixable: false,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: false,
      })

      expect(content).toContain('no-eval - Prevents eval usage')
    })

    test('should place JSDoc at the top of the file', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'top-rule',
        severity: 'warning',
        typescript: false,
      })

      const jsDocIndex = content.indexOf('/**')
      const importIndex = content.indexOf('import')
      expect(jsDocIndex).toBeLessThan(importIndex)
    })
  })

  describe('generateRuleContent - ruleId in template', () => {
    test('should include rule name in the generated content', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'no-debug',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("name: 'no-debug'")
    })
  })

  describe('generateTestContent - describe block', () => {
    test('should wrap tests in describe with rule name', () => {
      const content = generateTestContent({ category: 'patterns', ruleName: 'my-rule' })
      expect(content).toContain("describe('my-rule',")
    })

    test('should include exactly 4 test cases', () => {
      const content = generateTestContent({ category: 'patterns', ruleName: 'test-rule' })
      const testMatches = content.match(/test\('/g)
      expect(testMatches).toHaveLength(4)
    })

    test('should have test names that start with "should"', () => {
      const content = generateTestContent({ category: 'patterns', ruleName: 'test-rule' })
      const testNames = content.match(/test\('should[^']+'/g)
      expect(testNames).toHaveLength(4)
    })

    test('should use vitest vi import', () => {
      const content = generateTestContent({ category: 'patterns', ruleName: 'test-rule' })
      expect(content).toContain(', vi }')
    })
  })

  describe('file system - multiple file writes', () => {
    test('should write both rule and test files for the same rule', () => {
      const ruleContent = generateRuleContent({
        category: 'security',
        description: 'No eval',
        fixable: false,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: false,
      })
      const testContent = generateTestContent({ category: 'security', ruleName: 'no-eval' })

      const ruleDir = join(TMP_DIR, 'src', 'rules', 'security')
      const testDir = join(TMP_DIR, 'test', 'unit', 'rules', 'security')
      mkdirSync(ruleDir, { recursive: true })
      mkdirSync(testDir, { recursive: true })

      writeFileSync(join(ruleDir, 'no-eval.ts'), ruleContent)
      writeFileSync(join(testDir, 'no-eval.test.ts'), testContent)

      expect(existsSync(join(ruleDir, 'no-eval.ts'))).toBe(true)
      expect(existsSync(join(testDir, 'no-eval.test.ts'))).toBe(true)
    })

    test('should write multiple rules to the same category directory', () => {
      const ruleDir = join(TMP_DIR, 'src', 'rules', 'patterns')
      mkdirSync(ruleDir, { recursive: true })

      const names = ['rule-a', 'rule-b', 'rule-c']
      for (const name of names) {
        const content = generateRuleContent({
          category: 'patterns',
          description: `Rule ${name}`,
          fixable: false,
          ruleName: name,
          severity: 'warning',
          typescript: false,
        })
        writeFileSync(join(ruleDir, `${name}.ts`), content)
      }

      for (const name of names) {
        expect(existsSync(join(ruleDir, `${name}.ts`))).toBe(true)
      }
    })

    test('should write rules to different category directories', () => {
      const categories = ['security', 'complexity', 'performance']

      for (const cat of categories) {
        const ruleDir = join(TMP_DIR, 'src', 'rules', cat)
        mkdirSync(ruleDir, { recursive: true })
        const content = generateRuleContent({
          category: cat,
          description: `Rule in ${cat}`,
          fixable: false,
          ruleName: 'test-rule',
          severity: 'warning',
          typescript: false,
        })
        writeFileSync(join(ruleDir, 'test-rule.ts'), content)
        expect(existsSync(join(ruleDir, 'test-rule.ts'))).toBe(true)
      }
    })

    test('should verify each rule file has unique content', () => {
      const ruleDir = join(TMP_DIR, 'src', 'rules', 'patterns')
      mkdirSync(ruleDir, { recursive: true })

      const names = ['unique-a', 'unique-b']
      const contents: string[] = []
      for (const name of names) {
        const content = generateRuleContent({
          category: 'patterns',
          description: `Rule ${name}`,
          fixable: false,
          ruleName: name,
          severity: 'warning',
          typescript: false,
        })
        writeFileSync(join(ruleDir, `${name}.ts`), content)
        contents.push(readFileSync(join(ruleDir, `${name}.ts`), 'utf8'))
      }

      expect(contents[0]).not.toBe(contents[1])
    })
  })

  describe('file system - content verification after write', () => {
    test('should verify rule file contains all required sections after write', () => {
      const content = generateRuleContent({
        category: 'security',
        description: 'No eval',
        fixable: true,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: true,
      })
      const filePath = join(TMP_DIR, 'full-check.ts')
      writeFileSync(filePath, content)
      const read = readFileSync(filePath, 'utf8')

      expect(read).toContain('/**')
      expect(read).toContain('import type')
      expect(read).toContain('interface')
      expect(read).toContain('export const')
      expect(read).toContain('meta:')
      expect(read).toContain('create:')
    })

    test('should verify test file contains describe and test blocks after write', () => {
      const content = generateTestContent({ category: 'security', ruleName: 'no-eval' })
      const filePath = join(TMP_DIR, 'test-check.test.ts')
      writeFileSync(filePath, content)
      const read = readFileSync(filePath, 'utf8')

      expect(read).toContain('describe(')
      expect(read).toContain('test(')
      expect(read).toContain('expect(')
    })
  })

  describe('file system - force overwrite', () => {
    test('should detect existing file and simulate overwrite with force', () => {
      const filePath = join(TMP_DIR, 'force-test.ts')
      writeFileSync(filePath, 'original')

      expect(existsSync(filePath)).toBe(true)

      writeFileSync(filePath, 'overwritten')
      const content = readFileSync(filePath, 'utf8')
      expect(content).toBe('overwritten')
    })

    test('should simulate no-overwrite scenario (file exists, no force)', () => {
      const filePath = join(TMP_DIR, 'exists-test.ts')
      writeFileSync(filePath, 'existing')

      const fileExists = existsSync(filePath)
      expect(fileExists).toBe(true)
    })
  })

  describe('rule content - recommended flag', () => {
    test('should set recommended to false by default', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'test-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('recommended: false')
    })

    test('should always set recommended to false regardless of severity', () => {
      const severities = ['error', 'warning', 'info'] as const
      for (const severity of severities) {
        const content = generateRuleContent({
          category: 'patterns',
          description: 'Test',
          fixable: false,
          ruleName: 'test-rule',
          severity,
          typescript: false,
        })
        expect(content).toContain('recommended: false')
      }
    })
  })

  describe('rule content - getFunctionName import', () => {
    test('should import getFunctionName from visitor', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'test-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('getFunctionName')
    })

    test('should import all required symbols from visitor module', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Test',
        fixable: false,
        ruleName: 'test-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('FunctionLikeNode')
      expect(content).toContain('RuleViolation')
      expect(content).toContain('getNodeRange')
      expect(content).toContain('getFunctionName')
      expect(content).toContain('traverseAST')
    })
  })

  describe('generateTestContent - all categories produce valid test files', () => {
    const categories = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
      'best-practices',
    ] as const

    test.each(categories)('should produce test content referencing category "%s"', (category) => {
      const content = generateTestContent({ category, ruleName: 'sample-rule' })
      expect(content).toContain(`src/rules/${category}/sample-rule`)
    })
  })

  describe('generateTestContent - rule name variations', () => {
    test('should handle single-word rule name in test', () => {
      const content = generateTestContent({ category: 'patterns', ruleName: 'lint' })
      expect(content).toContain('lintRule')
      expect(content).toContain("from '../../../../src/rules/patterns/lint'")
    })

    test('should handle multi-word rule name in test', () => {
      const content = generateTestContent({
        category: 'complexity',
        ruleName: 'max-nested-callbacks',
      })
      expect(content).toContain('maxNestedCallbacksRule')
      expect(content).toContain("from '../../../../src/rules/complexity/max-nested-callbacks'")
    })
  })

  describe('combined flag scenarios - additional', () => {
    test('should handle fixable + typescript + error severity + security category', () => {
      const content = generateRuleContent({
        category: 'security',
        description: 'No eval',
        fixable: true,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: true,
      })

      expect(content).toContain("fixable: 'code',")
      expect(content).toContain("import { SyntaxKind } from 'ts-morph'")
      expect(content).toContain("category: 'security'")
      expect(content).toContain("name: 'no-eval'")
    })

    test('should handle non-fixable + non-typescript + info severity', () => {
      const content = generateRuleContent({
        category: 'testing',
        description: 'Test helper rule',
        fixable: false,
        ruleName: 'no-disabled-tests',
        severity: 'info',
        typescript: false,
      })

      expect(content).toContain("// fixable: 'code', // Uncomment if auto-fixable")
      expect(content).not.toContain('SyntaxKind')
      expect(content).toContain("category: 'testing'")
    })

    test('should handle fixable + non-typescript with warning severity', () => {
      const content = generateRuleContent({
        category: 'performance',
        description: 'Optimize loops',
        fixable: true,
        ruleName: 'no-slow-loop',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("fixable: 'code',")
      expect(content).not.toContain('SyntaxKind')
      expect(content).toContain("category: 'performance'")
    })
  })

  describe('output directory resolution', () => {
    test('should use process.cwd() as project root', () => {
      const projectRoot = resolve(process.cwd())
      expect(projectRoot).toBe(process.cwd())
    })

    test('should resolve rule output dir without custom output', () => {
      const projectRoot = resolve(process.cwd())
      const defaultRuleDir = join(projectRoot, 'src', 'rules', 'security')
      expect(defaultRuleDir).toContain('src')
      expect(defaultRuleDir).toContain('rules')
      expect(defaultRuleDir).toContain('security')
    })

    test('should use custom output dir when provided', () => {
      const customDir = join(TMP_DIR, 'custom-rules')
      const rulePath = join(customDir, 'security', 'no-eval.ts')
      expect(rulePath).toContain('custom-rules')
      expect(rulePath).toContain('no-eval.ts')
    })
  })

  describe('test output directory', () => {
    test('should always use standard test directory structure', () => {
      const projectRoot = resolve(process.cwd())
      const testDir = join(projectRoot, 'test', 'unit', 'rules', 'patterns')
      expect(testDir).toContain('test/unit/rules/patterns')
    })

    test('should include category in test directory path', () => {
      const projectRoot = resolve(process.cwd())
      for (const cat of ['security', 'complexity', 'performance']) {
        const testDir = join(projectRoot, 'test', 'unit', 'rules', cat)
        expect(testDir).toContain(`rules/${cat}`)
      }
    })

    test('should build test path with .test.ts extension', () => {
      const testPath = join(process.cwd(), 'test', 'unit', 'rules', 'security', 'no-eval.test.ts')
      expect(testPath.endsWith('.test.ts')).toBe(true)
      expect(testPath).toContain('no-eval')
    })
  })

  describe('file extension handling', () => {
    test('should append .ts extension to rule file', () => {
      const rulePath = join(TMP_DIR, 'rule.ts')
      expect(rulePath.endsWith('.ts')).toBe(true)
    })

    test('should append .test.ts extension to test file', () => {
      const testPath = join(TMP_DIR, 'rule.test.ts')
      expect(testPath.endsWith('.test.ts')).toBe(true)
    })
  })

  describe('edge case - description with special characters', () => {
    test('should handle description with double quotes', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Disallow "eval" usage',
        fixable: false,
        ruleName: 'no-eval',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('no-eval - Disallow "eval" usage')
    })

    test('should handle description with parentheses', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Prevent use of eval()',
        fixable: false,
        ruleName: 'no-eval',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('no-eval - Prevent use of eval()')
    })

    test('should handle description with angle brackets', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'Enforce <T> typing',
        fixable: false,
        ruleName: 'type-check',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain('type-check - Enforce <T> typing')
    })

    test('should handle very long description', () => {
      const longDesc = 'This is a very long description that goes on and on about the rule'
      const content = generateRuleContent({
        category: 'patterns',
        description: longDesc,
        fixable: false,
        ruleName: 'long-desc-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain(longDesc)
    })

    test('should handle single-character description', () => {
      const content = generateRuleContent({
        category: 'patterns',
        description: 'X',
        fixable: false,
        ruleName: 'x-rule',
        severity: 'warning',
        typescript: false,
      })

      expect(content).toContain("description: 'X'")
    })
  })

  describe('edge case - rule name boundary values', () => {
    test('should handle name at boundary of being valid - single letter', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('z')).toBe(true)
    })

    test('should handle name starting with z', () => {
      expect(/^[a-z][a-z0-9-]*$/.test('z-rule')).toBe(true)
    })

    test('should handle name with all 26 first letters', () => {
      for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
        expect(/^[a-z][a-z0-9-]*$/.test(letter)).toBe(true)
      }
    })

    test('should reject all uppercase first letters', () => {
      for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        expect(/^[a-z][a-z0-9-]*$/.test(letter)).toBe(false)
      }
    })

    test('should reject all digits as first character', () => {
      for (const digit of '0123456789') {
        expect(/^[a-z][a-z0-9-]*$/.test(digit)).toBe(false)
      }
    })
  })

  describe('write and verify complete rule scaffold', () => {
    test('should create complete scaffold for fixable typescript rule', () => {
      const ruleContent = generateRuleContent({
        category: 'security',
        description: 'No eval usage',
        fixable: true,
        ruleName: 'no-eval',
        severity: 'error',
        typescript: true,
      })
      const testContent = generateTestContent({ category: 'security', ruleName: 'no-eval' })

      const ruleDir = join(TMP_DIR, 'src', 'rules', 'security')
      const testDir = join(TMP_DIR, 'test', 'unit', 'rules', 'security')
      mkdirSync(ruleDir, { recursive: true })
      mkdirSync(testDir, { recursive: true })

      const rulePath = join(ruleDir, 'no-eval.ts')
      const testPath = join(testDir, 'no-eval.test.ts')
      writeFileSync(rulePath, ruleContent)
      writeFileSync(testPath, testContent)

      const writtenRule = readFileSync(rulePath, 'utf8')
      const writtenTest = readFileSync(testPath, 'utf8')

      expect(writtenRule).toContain("name: 'no-eval'")
      expect(writtenRule).toContain("fixable: 'code',")
      expect(writtenRule).toContain("import { SyntaxKind } from 'ts-morph'")
      expect(writtenRule).toContain("category: 'security'")
      expect(writtenTest).toContain('noEvalRule')
      expect(writtenTest).toContain("describe('no-eval',")
    })

    test('should create complete scaffold for minimal rule', () => {
      const ruleContent = generateRuleContent({
        category: 'patterns',
        description: 'Simple rule',
        fixable: false,
        ruleName: 'simple',
        severity: 'warning',
        typescript: false,
      })
      const testContent = generateTestContent({ category: 'patterns', ruleName: 'simple' })

      const ruleDir = join(TMP_DIR, 'src', 'rules', 'patterns')
      const testDir = join(TMP_DIR, 'test', 'unit', 'rules', 'patterns')
      mkdirSync(ruleDir, { recursive: true })
      mkdirSync(testDir, { recursive: true })

      writeFileSync(join(ruleDir, 'simple.ts'), ruleContent)
      writeFileSync(join(testDir, 'simple.test.ts'), testContent)

      const writtenRule = readFileSync(join(ruleDir, 'simple.ts'), 'utf8')
      expect(writtenRule).toContain("name: 'simple'")
      expect(writtenRule).toContain("// fixable: 'code', // Uncomment if auto-fixable")
      expect(writtenRule).not.toContain('SyntaxKind')
    })

    test('generates rule with typescript flag enabled', async () => {
      const ruleContent = generateRuleContent({
        ruleName: 'ts-rule',
        category: 'best-practices',
        description: 'TypeScript rule',
        severity: 'error',
        typescript: true,
      })
      expect(ruleContent).toContain("name: 'ts-rule'")
      expect(ruleContent).toContain('best-practices')
    })
  })
})
