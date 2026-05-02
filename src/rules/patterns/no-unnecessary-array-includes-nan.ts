import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayIncludesNaN: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier' || callee.property.name !== 'includes') return
        const arg = n.arguments[0]
        if (!arg) return
        if (arg.type === 'Identifier' && arg.name === 'NaN') {
          context.report({
            loc: extractLocation(n),
            message: `Array.prototype.includes(NaN) works but may indicate a code smell. Consider using Number.isNaN() for explicit NaN checks.`,
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
        'Warn about Array.prototype.includes(NaN) which may indicate a code smell.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-includes-nan.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayIncludesNaN
