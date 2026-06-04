/**
 * @module rules/patterns/no-tabs
 * Disallows tabs in string literals.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noTabsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || (n.type !== 'Literal' && n.type !== 'StringLiteral')) return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        if (!value.includes('\t')) return

        context.report({
          loc: extractLocation(n),
          message: 'Unexpected tab character in string literal. Use spaces for indentation.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow tabs in string literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-tabs',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noTabsRule
