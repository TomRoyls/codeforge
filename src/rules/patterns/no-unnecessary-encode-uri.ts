import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryEncodeUriRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'Identifier' || (c.name !== 'encodeURI' && c.name !== 'encodeURIComponent')) return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const arg = firstArg as Record<string, unknown>
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          const str = arg.value as string
          if (str === encodeURI(str)) {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary ${String(c.name)}() call. The string does not contain characters that need encoding.`,
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
      description: 'Disallow unnecessary encodeURI() and encodeURIComponent() calls on already-safe strings',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-encode-uri',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryEncodeUriRule
