/**
 * @module rules/patterns/no-useless-return
 * Disallows return statements that do not return a value.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUselessReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const argument = (n as { argument?: unknown }).argument
        if (argument === undefined || argument === null) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary return statement.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow return statements with no value',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-return',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessReturnRule
