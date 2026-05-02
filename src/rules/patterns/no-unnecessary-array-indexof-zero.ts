import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayIndexofZeroRule: RuleDefinition = {
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
        if (propNode.name !== 'indexOf') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length === 0) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg) as Record<string, unknown>
        if (!argNode) return

        if (argNode.type === 'NumericLiteral' && (argNode as Record<string, unknown>).value === 0) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary .indexOf(0). Consider using .includes(0) for a boolean check instead of comparing the index.',
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
        'Suggest using .includes(0) instead of .indexOf(0) for boolean checks.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-indexof-zero.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryArrayIndexofZeroRule
