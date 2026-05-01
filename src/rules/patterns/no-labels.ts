/**
 * @module rules/patterns/no-labels
 * Disallows labeled statements.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noLabelsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      LabeledStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'LabeledStatement') return

        context.report({
          loc: extractLocation(n),
          message: 'Unexpected labeled statement.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow labeled statements',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-labels',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noLabelsRule
