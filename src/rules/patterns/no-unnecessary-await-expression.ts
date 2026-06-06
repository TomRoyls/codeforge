import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isLiteralValue(node: Record<string, unknown>): boolean {
  const t = node.type as string
  if (t === 'BooleanLiteral') return true
  if (t === 'BigIntLiteral') return true
  if (t === 'NullLiteral') return true
  if (t === 'Literal') {
    const v = node.value
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null || v === undefined
  }
  if (t === 'TemplateLiteral') {
    const quasis = node.quasis
    const exprs = node.expressions
    if (Array.isArray(quasis) && Array.isArray(exprs) && exprs.length === 0 && quasis.length === 1) return true
  }
  return false
}

export const noUnnecessaryAwaitExpressionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AwaitExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AwaitExpression') return

        const nn = n as Record<string, unknown>
        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const argNode = toASTNode(argument)
        if (!argNode) return

        const a = argNode as Record<string, unknown>

        if (isLiteralValue(a)) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary await of a non-Promise literal value. Remove the await keyword.',
            node: n,
          })
        } else if (a.type === 'ArrayExpression') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary await of an array literal. Arrays are not Promises. Remove the await keyword.',
            node: n,
          })
        } else if (a.type === 'ObjectExpression') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary await of an object literal. Objects are not Promises. Remove the await keyword.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary await on non-Promise literal values.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-await-expression.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAwaitExpressionRule
