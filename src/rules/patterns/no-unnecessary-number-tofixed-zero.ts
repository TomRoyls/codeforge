import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNumberTofixedZeroRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const c = calleeNode as Record<string, unknown>
        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!propNode || propNode.type !== 'Identifier' || propNode.name !== 'toFixed') return

        const args = nn.arguments
        if (!Array.isArray(args)) return

        if (args.length === 0) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary .toFixed() without digits argument. This is equivalent to .toFixed(0) but less explicit. Pass 0 explicitly for clarity.',
            node: n,
          })
          return
        }

        if (args.length === 1) {
          const arg = args[0]
          if (!arg || typeof arg !== 'object') return
          const argNode = toASTNode(arg) as Record<string, unknown>
          if (!argNode) return

          if (argNode.type === 'Literal' && typeof (argNode as Record<string, unknown>).value === 'number' && (argNode as Record<string, unknown>).value === 0) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary .toFixed(0) on an integer. This returns the same string as String(n) or n.toString().',
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
      description:
        'Flag .toFixed(0) or .toFixed() calls that may be unnecessary on integers.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-tofixed-zero.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNumberTofixedZeroRule
