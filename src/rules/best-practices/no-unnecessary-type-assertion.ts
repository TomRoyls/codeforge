import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface NoUnnecessaryTypeAssertionOptions extends RuleOptions {
  skipStringLiterals?: boolean
  skipNumericLiterals?: boolean
  skipBooleanLiterals?: boolean
  skipNullLiterals?: boolean
}

const DEFAULT_OPTIONS: NoUnnecessaryTypeAssertionOptions = {
  skipStringLiterals: false,
  skipNumericLiterals: false,
  skipBooleanLiterals: false,
  skipNullLiterals: true,
}

function getLiteralType(node: Node): string | null {
  if (Node.isStringLiteral(node)) return 'string'
  if (Node.isNoSubstitutionTemplateLiteral(node)) return 'string'
  if (Node.isNumericLiteral(node)) return 'number'
  if (Node.isBigIntLiteral(node)) return 'bigint'
  const kind = node.getKind()
  if (kind === SyntaxKind.TrueKeyword || kind === SyntaxKind.FalseKeyword) return 'boolean'
  if (Node.isNullLiteral(node)) return 'null'
  return null
}

function getTypeText(node: Node): string | null {
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
  meta: {
    name: 'no-unnecessary-type-assertion',
    description:
      'Disallow type assertions that are redundant because TypeScript can already infer the same type',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: NoUnnecessaryTypeAssertionOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
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
              ruleId: 'no-unnecessary-type-assertion',
              severity: 'info',
              message: `Type assertion '${expression.getText()} as ${targetType}' is redundant. The expression is already of type ${targetType}.`,
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion: 'Remove this type assertion.',
            })
          }
        },
      },
      onComplete: () => violations,
    }
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
      visitNode: (node: Node, _context: VisitorContext) => {
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
            ruleId: 'no-unnecessary-type-assertion',
            severity: 'info',
            message: `Type assertion '${expression.getText()} as ${targetType}' is redundant. The expression is already of type ${targetType}.`,
            filePath: sourceFile.getFilePath(),
            range,
            suggestion: 'Remove this type assertion.',
          })
        }
      },
    },
    violations,
  )

  return violations
}
