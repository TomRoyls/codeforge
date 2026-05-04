import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryUint8ClampedArrayCopyWithinSpreadRule: RuleDefinition = {
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
        if (callee.property.name !== 'copyWithin') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: 'uint8ClampedArray.copyWithin(...items) with a single spread is unusual. Consider calling uint8ClampedArray.copyWithin() directly.',
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about uint8ClampedArray.copyWithin(...items) with spread which is unusual since uint8ClampedArray.copyWithin.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-uint-8-clamped-array-copy-within-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryUint8ClampedArrayCopyWithinSpreadRule
