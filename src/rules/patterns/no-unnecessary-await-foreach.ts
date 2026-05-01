import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryAwaitForeachRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ForOfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ForOfStatement') return

        const nn = n as Record<string, unknown>
        if (nn.await !== true) return

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary await in for-of loop. The loop iterates synchronously even with async iterables.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary await in for-of loops',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-await-foreach',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAwaitForeachRule
