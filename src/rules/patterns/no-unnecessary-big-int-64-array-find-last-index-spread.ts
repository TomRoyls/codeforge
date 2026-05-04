import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryBigInt64ArrayFindLastIndexSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'bigInt64Array') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'findLastIndex') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: 'bigInt64Array.findLastIndex(...items) with a single spread is unusual. Consider calling bigInt64Array.findLastIndex() directly.',
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about bigInt64Array.findLastIndex(...items) with spread which is unusual since bigInt64Array.findLastIndex.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-big-int-64-array-find-last-index-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryBigInt64ArrayFindLastIndexSpreadRule
