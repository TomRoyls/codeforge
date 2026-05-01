import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryPromiseWrapRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'Identifier' || c.name !== 'Promise') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const arg = firstArg as Record<string, unknown>
        if (arg.type === 'MemberExpression') {
          const obj = arg.object
          if (obj && typeof obj === 'object') {
            const o = obj as Record<string, unknown>
            if (o.type === 'Identifier' && o.name === 'Promise') {
              context.report({
                loc: extractLocation(n),
                message: 'Unnecessary Promise wrapper around Promise method.',
                node: n,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary Promise wrappers around existing promises',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-promise-wrap',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryPromiseWrapRule
