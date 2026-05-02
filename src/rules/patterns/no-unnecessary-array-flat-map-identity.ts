import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFlatMapIdentityRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'flatMap') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'ArrowFunctionExpression') return
        if (!arg.body) return
        if (arg.body.type !== 'Identifier') return
        if (!arg.params || arg.params.length !== 1) return
        const param = arg.params[0]
        if (!param || param.type !== 'Identifier') return
        if (param.name === arg.body.name) {
          context.report({
            loc: extractLocation(n),
            message: `arr.flatMap(x => x) is equivalent to arr.flat(). Use arr.flat() directly.`,
            node: n,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about Array.prototype.flatMap(x => x) which is equivalent to flat().',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-flat-map-identity.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFlatMapIdentityRule
