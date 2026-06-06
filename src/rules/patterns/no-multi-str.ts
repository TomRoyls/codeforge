/**
 * @module rules/patterns/no-multi-str
 * Disallows multiline string literals using backslash line continuations.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMultiStrRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        if (!value.includes('\\\n')) return

        context.report({
          loc: extractLocation(n),
          message: 'Multiline string literal using backslash line continuation is not allowed. Use template literals instead.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow multiline string literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-multi-str',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMultiStrRule
