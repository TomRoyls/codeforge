import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { getParentNode, toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayToReversedNoUse: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 0) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'toReversed' && callee.property.name !== 'toSorted') return
        const parent = getParentNode(n)
        if (!parent) return
        if (parent.type === 'ExpressionStatement') {
          context.report({
            loc: extractLocation(n),
            message: `${callee.property.name}() result is not used. These methods return a new array without mutating the original.`,
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
        'Disallow toReversed()/toSorted() used as a statement where the result is discarded.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-reversed-no-use.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayToReversedNoUse
