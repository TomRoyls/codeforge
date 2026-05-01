import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryMathMaxSingleRule: RuleDefinition = {
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
        const obj = c.object
        const prop = c.property
        if (!obj || !prop || typeof obj !== 'object' || typeof prop !== 'object') return

        const objNode = toASTNode(obj) as Record<string, unknown>
        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!objNode) return

        if (objNode.type !== 'Identifier' || objNode.name !== 'Math') return
        if (propNode.type !== 'Identifier') return

        const methodName = propNode.name as string
        if (methodName !== 'max' && methodName !== 'min') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length <= 1) {
          context.report({
            loc: extractLocation(n),
            message:
              `Unnecessary Math.${methodName}() with 0 or 1 argument. ${methodName === 'max' ? 'Math.max(x) always returns x. Use the value directly.' : 'Math.min(x) always returns x. Use the value directly.'}`,
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
        'Disallow Math.max() and Math.min() with 0 or 1 argument.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-math-max-single.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryMathMaxSingleRule
