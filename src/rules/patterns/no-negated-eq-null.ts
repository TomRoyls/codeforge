/**
 * @module rules/patterns/no-negated-eq-null
 * Disallows negated equality checks against null or undefined.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noNegatedEqNullRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const operator = (n as { operator?: unknown }).operator
        if (operator !== '!=' && operator !== '!==') return

        const left = (n as { left?: unknown }).left
        const right = (n as { right?: unknown }).right

        const isNullOrUndefined = (nd: unknown): boolean => {
          const astNd = toASTNode(nd)
          if (!astNd) return false
          if (astNd.type === 'NullLiteral') return true
          if (astNd.type === 'Identifier') {
            const name = (astNd as { name?: unknown }).name
            return name === 'undefined'
          }
          return false
        }

        if (isNullOrUndefined(left) || isNullOrUndefined(right)) {
          context.report({
            loc: extractLocation(n),
            message: 'Use `== null` or `=== undefined` instead of negated comparison.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow negated equality checks against null or undefined',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-negated-eq-null',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNegatedEqNullRule
