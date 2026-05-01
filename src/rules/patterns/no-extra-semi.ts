/**
 * @module rules/patterns/no-extra-semi
 * Disallows unnecessary semicolons.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noExtraSemiRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      EmptyStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'EmptyStatement') return

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary semicolon.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary semicolons',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-extra-semi',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noExtraSemiRule
