import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryBtoaRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'Identifier' || c.name !== 'btoa') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const arg = firstArg as Record<string, unknown>
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          const str = arg.value as string
          // Check if string is already base64 (only contains base64 chars and optional = padding)
          const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(str)
          if (isBase64 && str.length > 0 && str.length % 4 === 0) {
            try {
              atob(str) // verify it's valid base64
              context.report({
                loc: extractLocation(n),
                message: 'Unnecessary btoa() call. The string appears to already be base64-encoded.',
                node: n,
              })
            } catch {
              // Not valid base64 despite matching the pattern
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary btoa() calls on strings that appear to already be base64-encoded',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-btoa',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBtoaRule
