/**
 * @module rules/patterns/no-empty-alternative
 * Disallows empty alternatives in regex alternations.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noEmptyAlternativeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      RegExpLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'RegExpLiteral') return

        const pattern = (n as { pattern?: string }).pattern
        if (!pattern || typeof pattern !== 'string') return

        if (!pattern.includes('|')) return

        const parts = pattern.split('|')
        for (const part of parts) {
          if (part === '') {
            context.report({
              loc: extractLocation(n),
              message: 'Empty alternative in regex alternation. This matches the empty string and is likely a mistake.',
              node: n,
            })
            return
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow empty alternatives in regex alternations',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-empty-alternative',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noEmptyAlternativeRule
