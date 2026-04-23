import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface NoUnnecessaryTypeAssertionOptions extends RuleOptions {
  skipBooleanLiterals?: boolean
  skipNullLiterals?: boolean
  skipNumericLiterals?: boolean
  skipStringLiterals?: boolean
}

const DEFAULT_OPTIONS: NoUnnecessaryTypeAssertionOptions = {
  skipBooleanLiterals: false,
  skipNullLiterals: true,
  skipNumericLiterals: false,
  skipStringLiterals: false,
}

function getLiteralType(node: Node): null | string {
  if (Node.isStringLiteral(node)) return 'string'
  if (Node.isNoSubstitutionTemplateLiteral(node)) return 'string'
  if (Node.isNumericLiteral(node)) return 'number'
  if (Node.isBigIntLiteral(node)) return 'bigint'
  const kind = node.getKind()
  if (kind === SyntaxKind.TrueKeyword || kind === SyntaxKind.FalseKeyword) return 'boolean'
  if (Node.isNullLiteral(node)) return 'null'
  return null
}

function getTypeText(node: Node): null | string {
  const text = node.getText().trim()
  if (text === 'string') return 'string'
  if (text === 'number') return 'number'
  if (text === 'boolean') return 'boolean'
  if (text === 'bigint') return 'bigint'
  if (text === 'null') return 'null'
  if (text === 'undefined') return 'undefined'
  return null
}

function isRedundantAssertion(
  expression: Node,
  targetType: string,
  options: NoUnnecessaryTypeAssertionOptions,
): boolean {
  const literalType = getLiteralType(expression)
  if (literalType === null) return false

  if (options.skipStringLiterals && literalType === 'string') return false
  if (options.skipNumericLiterals && literalType === 'number') return false
  if (options.skipBooleanLiterals && literalType === 'boolean') return false
  if (options.skipNullLiterals && literalType === 'null') return false

  return literalType === targetType
}

export const noUnnecessaryTypeAssertionRule: RuleDefinition<NoUnnecessaryTypeAssertionOptions> = {
  create(options: NoUnnecessaryTypeAssertionOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!Node.isAsExpression(node)) return

          const expression = node.getExpression()
          if (!expression) return

          const targetTypeNode = node.getTypeNode()
          if (!targetTypeNode) return

          const targetType = getTypeText(targetTypeNode)
          if (!targetType) return

          if (isRedundantAssertion(expression, targetType, mergedOptions)) {
            const range = getNodeRange(node)
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: `Type assertion '${expression.getText()} as ${targetType}' is redundant. The expression is already of type ${targetType}.`,
              range,
              ruleId: 'no-unnecessary-type-assertion',
              severity: 'info',
              suggestion: 'Remove this type assertion.',
            })
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description:
      'Disallow type assertions that are redundant because TypeScript can already infer the same type',
    fixable: 'code',
    name: 'no-unnecessary-type-assertion',
    recommended: false,
  },
}

export function analyzeNoUnnecessaryTypeAssertion(
  sourceFile: SourceFile,
  options: NoUnnecessaryTypeAssertionOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: NoUnnecessaryTypeAssertionOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode(node: Node, _context: VisitorContext) {
        if (!Node.isAsExpression(node)) return

        const expression = node.getExpression()
        if (!expression) return

        const targetTypeNode = node.getTypeNode()
        if (!targetTypeNode) return

        const targetType = getTypeText(targetTypeNode)
        if (!targetType) return

        if (isRedundantAssertion(expression, targetType, mergedOptions)) {
          const range = getNodeRange(node)
          violations.push({
            filePath: sourceFile.getFilePath(),
            message: `Type assertion '${expression.getText()} as ${targetType}' is redundant. The expression is already of type ${targetType}.`,
            range,
            ruleId: 'no-unnecessary-type-assertion',
            severity: 'info',
            suggestion: 'Remove this type assertion.',
          })
        }
      },
    },
    violations,
  )

  return violations
}
