import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryFloat64ArrayToStringSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'float64Array') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'toString') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: 'float64Array.toString(...items) with a single spread is unusual. Consider calling float64Array.toString() directly.',
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about float64Array.toString(...items) with spread which is unusual since float64Array.toString.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-float-64-array-to-string-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryFloat64ArrayToStringSpreadRule
