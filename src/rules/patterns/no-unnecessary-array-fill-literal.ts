import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFillLiteralRule: RuleDefinition = {
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
        if (!propNode || propNode.type !== 'Identifier') return
        if (propNode.name !== 'fill') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length < 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg) as Record<string, unknown>
        if (!argNode) return

        if (argNode.type === 'Literal' && typeof (argNode as Record<string, unknown>).value === 'number' && (argNode as Record<string, unknown>).value === 0) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary .fill(0) on an array. New arrays are already filled with undefined. If you need zeros, consider Array.from() with a mapping function.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Flag .fill(0) on arrays which may indicate confusion about default array values.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-fill-literal.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryArrayFillLiteralRule
