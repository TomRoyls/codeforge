/**
 * @module rules/patterns/no-undefined
 * Disallows usage of the undefined keyword as an identifier.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUndefinedRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Identifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Identifier') return

        const name = (n as { name?: unknown }).name
        if (name !== 'undefined') return

        context.report({
          loc: extractLocation(n),
          message: 'Unexpected use of \'undefined\'. Consider using a typed null check or void 0 instead.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow usage of undefined as an identifier',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-undefined',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUndefinedRule
