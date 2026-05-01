/**
 * @module rules/patterns/no-continue
 * Disallows use of continue statements.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noContinueRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ContinueStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ContinueStatement') return

        context.report({
          loc: extractLocation(n),
          message: 'Unexpected continue statement.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow continue statements',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-continue',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noContinueRule
