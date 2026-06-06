import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryMathSignZeroRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier' || callee.object.name !== 'Math') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'sign') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'number') return
        if (arg.value === 0) {
          context.report({
            loc: extractLocation(n),
            message: `Math.sign(0) always returns 0. This call is unnecessary.`,
            node: n,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about Math.sign(0) which always returns 0.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-sign-zero.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryMathSignZeroRule
