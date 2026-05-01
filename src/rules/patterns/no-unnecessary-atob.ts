import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryAtobRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'Identifier' || c.name !== 'atob') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const arg = firstArg as Record<string, unknown>
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          const str = arg.value as string
          // If the string is already valid base64-decoded content (i.e., not base64),
          // atob would produce garbage or throw - but we can check if it looks like
          // a non-base64 string that doesn't need decoding
          try {
            if (str === atob(btoa(str))) {
              // The string round-trips cleanly, meaning it's plain text being unnecessarily decoded
              context.report({
                loc: extractLocation(n),
                message: 'Unnecessary atob() call on a plain string that does not appear to be base64-encoded.',
                node: n,
              })
            }
          } catch {
            // atob throws on invalid base64 - the call is wrong but not "unnecessary"
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary atob() calls on strings that are not base64-encoded',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-atob',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAtobRule
