import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNumberToExponentialDefaultRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length > 1) return
        if (n.arguments.length === 1) {
          const arg = n.arguments[0]
          if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'number' || arg.value !== undefined) return
        }
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'toExponential') return
        if (n.arguments.length === 0) {
          context.report({
            loc: extractLocation(n),
            message: `num.toExponential() without arguments uses default fraction digits. Consider using toString() or explicit digits.`,
            node: n,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about num.toExponential() called without explicit fraction digits.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-to-exponential-default.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryNumberToExponentialDefaultRule
