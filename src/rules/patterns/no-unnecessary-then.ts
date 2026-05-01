import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryThenRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'MemberExpression') return

        const property = c.property
        if (!property || typeof property !== 'object') return

        const p = property as Record<string, unknown>
        if (p.type !== 'Identifier' || p.name !== 'then') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const arg = firstArg as Record<string, unknown>
        if (arg.type === 'ArrowFunctionExpression') {
          const params = arg.params
          if (Array.isArray(params) && params.length === 0) {
            const body = arg.body
            if (body && typeof body === 'object') {
              const b = body as Record<string, unknown>
              if (b.type === 'CallExpression') {
                context.report({
                  loc: extractLocation(n),
                  message: 'Unnecessary .then() wrapper with no-parameter arrow function.',
                  node: n,
                })
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary .then() wrappers with no-parameter arrow functions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-then',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryThenRule
