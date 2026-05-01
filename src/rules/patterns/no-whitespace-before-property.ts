/**
 * @module rules/patterns/no-whitespace-before-property
 * Disallows whitespace before property access dot notation.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, toASTNode } from '../../utils/ast-helpers.js'

export const noWhitespaceBeforePropertyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MemberExpression') return

        const obj = (n as { object?: unknown }).object
        const property = (n as { property?: unknown }).property
        if (!obj || !property) return

        const objRange = getRange(obj)
        const propRange = getRange(property)
        if (!objRange || !propRange) return

        const source = context.getSource()
        const between = source.slice(objRange[1], propRange[0])

        if (!between.includes('.')) return

        const dotIndex = between.indexOf('.')
        if (dotIndex > 0 && /\s/.test(between.slice(0, dotIndex))) {
          context.report({
            loc: extractLocation(n),
            message: 'Unexpected whitespace before property access dot.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow whitespace before property access dot notation',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-whitespace-before-property',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noWhitespaceBeforePropertyRule
