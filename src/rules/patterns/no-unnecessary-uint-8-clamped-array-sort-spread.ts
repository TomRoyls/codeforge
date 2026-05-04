import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryUint8ClampedArraySortSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'uint8ClampedArray') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'sort') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: 'uint8ClampedArray.sort(...items) with a single spread is unusual. Consider calling uint8ClampedArray.sort() directly.',
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about uint8ClampedArray.sort(...items) with spread which is unusual since uint8ClampedArray.sort.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-uint-8-clamped-array-sort-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryUint8ClampedArraySortSpreadRule
