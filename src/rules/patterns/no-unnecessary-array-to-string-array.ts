import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayToStringArray: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier' || callee.property.name !== 'from') return
        if (!callee.object || callee.object.type !== 'Identifier' || callee.object.name !== 'Array') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'CallExpression') return
        const innerCallee = arg.callee
        if (!innerCallee || innerCallee.type !== 'MemberExpression' || innerCallee.computed) return
        if (!innerCallee.property || innerCallee.property.type !== 'Identifier' || innerCallee.property.name !== 'toString') return
        context.report({
          loc: extractLocation(n),
          message: `Array.from(arr.toString()) splits a string into characters. Use arr.split('') directly if that is the intent.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Warn about Array.from(arr.toString()) which is likely not the intended behavior.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-string-array.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayToStringArray
