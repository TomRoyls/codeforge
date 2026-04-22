export const VALID_CATEGORIES = [
  'complexity',
  'dependencies',
  'performance',
  'security',
  'patterns',
  'correctness',
  'testing',
  'best-practices',
] as const

export const VALID_SEVERITIES = ['error', 'warning', 'info'] as const

export type ValidCategory = (typeof VALID_CATEGORIES)[number]
export type ValidSeverity = (typeof VALID_SEVERITIES)[number]

export function isValidRuleName(name: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(name)
}

export function isValidCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category as ValidCategory)
}

export function isValidSeverity(severity: string): boolean {
  return VALID_SEVERITIES.includes(severity as ValidSeverity)
}

export function toCamelCase(str: string): string {
  return str
    .split('-')
    .map((word, index) => {
      if (index === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}

export function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export interface GenerateRuleContentOptions {
  category: string
  description: string
  fixable: boolean
  ruleName: string
  severity: string
  typescript: boolean
}

export function buildRuleContent(options: GenerateRuleContentOptions): string {
  const { category, description, fixable, ruleName, severity, typescript } = options
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
        // TODO: Implement your visitor logic here
        // Example: visit function declarations
        // visitFunction: (node: FunctionLikeNode) => {
        //   if (/* condition */) {
        //     violations.push({
        //       ruleId: '${ruleName}',
        //       severity: '${severity}',
        //       message: 'Description of the violation',
        //       filePath: node.getSourceFile().getFilePath(),
        //       range: getNodeRange(node),
        //     })
        //   }
        // },
      },
      onComplete: () => violations,
    }
  },
}
`
}

export function buildTestContent(ruleName: string, category: string): string {
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

export function buildDefaultDescription(ruleName: string): string {
  return `Description for ${ruleName} rule`
}
