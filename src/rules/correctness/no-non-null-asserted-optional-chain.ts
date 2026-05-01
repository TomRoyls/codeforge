import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noNonNullAssertedOptionalChainRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSNonNullExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSNonNullExpression') return

        const expr = toASTNode((n as { expression?: unknown }).expression)
        if (!expr) return

        if (expr.type === 'OptionalCallExpression' || expr.type === 'OptionalMemberExpression') {
          context.report({
            loc: extractLocation(n),
            message: 'Non-null assertion on optional chain is contradictory. The `?.` implies the value may be null/undefined, but `!` asserts it is not.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow non-null assertions on optional chain expressions',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-non-null-asserted-optional-chain',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNonNullAssertedOptionalChainRule
