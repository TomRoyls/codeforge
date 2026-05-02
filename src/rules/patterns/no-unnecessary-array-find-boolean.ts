import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFindBoolean: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier' || callee.property.name !== 'find') return
        const arg = n.arguments[0]
        if (arg.type !== 'ArrowFunctionExpression' && arg.type !== 'FunctionExpression') return
        if (arg.params.length !== 1) return
        const body = arg.body
        if (body.type === 'BlockStatement') return
        if (body.type === 'BooleanLiteral' && body.value === true) {
          context.report({
            loc: extractLocation(n),
            message: `Array.prototype.find(() => true) always returns the first element. Use arr[0] instead.`,
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
        'Disallow Array.prototype.find(() => true) which always returns the first element.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-boolean.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFindBoolean
