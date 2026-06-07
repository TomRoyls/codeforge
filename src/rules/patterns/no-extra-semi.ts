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
import { getRange, toASTNode } from '../../utils/ast-helpers.js'

export const noExtraSemiRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      EmptyStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'EmptyStatement') return

        const range = getRange(node)

        context.report({
          fix: range
            ? {
                range,
                text: '',
              }
            : undefined,
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
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noExtraSemiRule
