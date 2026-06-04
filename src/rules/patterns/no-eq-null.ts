/**
 * @module rules/patterns/no-eq-null
 * Disallows == and != comparisons against null without explicit type checking.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noEqNullRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const operator = (n as { operator?: unknown }).operator
        if (operator !== '==' && operator !== '!=') return

        const right = (n as { right?: unknown }).right
        const left = (n as { left?: unknown }).left
        if (!right || !left || typeof right !== 'object' || typeof left !== 'object') return

        const rightNode = right as Record<string, unknown>
        const leftNode = left as Record<string, unknown>

        const isNullLiteral = (nd: Record<string, unknown>) =>
          nd.type === 'NullLiteral' ||
          (nd.type === 'Literal' && nd.value === null) ||
          (nd.type === 'Identifier' && nd.name === 'undefined')

        if (!isNullLiteral(rightNode) && !isNullLiteral(leftNode)) return

        context.report({
          loc: extractLocation(n),
          message: `Use '${operator === '!=' ? '!==' : '==='} null' instead of '${operator} null' for type-safe comparison.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow == and != comparisons with null',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-eq-null',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noEqNullRule
