import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noArrayReduceRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const computed = (callee as { computed?: boolean }).computed
        if (computed) return

        const prop = toASTNode((callee as { property?: unknown }).property)
        if (!prop || prop.type !== 'Identifier') return

        const propName = (prop as { name?: string }).name
        if (propName !== 'reduce') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length < 1) return

        const object = toASTNode((callee as { object?: unknown }).object)
        if (!object) return

        context.report({
          loc: extractLocation(n),
          message:
            'Unexpected use of `Array.prototype.reduce()`. Consider using `for...of`, `Array.prototype.map()`, `Array.prototype.filter()`, or `Array.prototype.flatMap()` for better readability and maintainability.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description: 'Disallow use of `Array.prototype.reduce()`',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-array-reduce',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noArrayReduceRule
