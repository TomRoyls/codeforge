import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryWaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'Identifier') return

        if (c.name === 'waitFor') {
          const args = nn.arguments
          if (!Array.isArray(args) || args.length === 0) return

          const firstArg = args[0]
          if (!firstArg || typeof firstArg !== 'object') return

          const arg = firstArg as Record<string, unknown>
          if (arg.type === 'Literal' && typeof arg.value === 'number') {
            context.report({
              loc: extractLocation(n),
              message: 'Avoid waitFor with a numeric literal. Prefer waiting for a condition.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow waitFor calls with numeric literal arguments',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-wait',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryWaitRule
