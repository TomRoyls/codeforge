/**
 * @module rules/patterns/yoda
 * Requires Yoda conditions where the literal is on the left side of comparison.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'StringLiteral'
    || n.type === 'NumericLiteral'
    || n.type === 'BooleanLiteral'
    || n.type === 'NullLiteral'
    || n.type === 'BigIntLiteral'
    || n.type === 'RegExpLiteral'
}

function isIdentifier(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'Identifier'
}

export const yodaRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const op = (n as { operator?: unknown }).operator
        if (op !== '===' && op !== '!==' && op !== '==' && op !== '!=') return

        const left = (n as { left?: unknown }).left
        const right = (n as { right?: unknown }).right
        if (!left || !right) return

        if (isLiteral(right) && isIdentifier(left)) {
          context.report({
            loc: extractLocation(n),
            message: 'Expected a Yoda condition (literal on the left side).',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Require Yoda conditions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/yoda',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default yodaRule
