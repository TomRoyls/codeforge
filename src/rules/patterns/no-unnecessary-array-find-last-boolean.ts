import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFindLastBooleanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'findLast') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'ArrowFunctionExpression') return
        if (!arg.body) return
        if (arg.body.type === 'BooleanLiteral' && arg.body.value === true) {
          context.report({
            loc: extractLocation(n),
            message: `arr.findLast(() => true) returns the last element. Use arr.at(-1) or arr[arr.length - 1] instead.`,
            node: n,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about Array.prototype.findLast(() => true) which just returns the last element.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-last-boolean.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFindLastBooleanRule
