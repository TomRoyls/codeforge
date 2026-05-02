import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFlatSingleLevel: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (n.arguments.length > 1) return
        const callee = n.callee
        if (callee.type !== 'MemberExpression' || callee.computed) return
        if (callee.property.type !== 'Identifier' || callee.property.name !== 'flat') return
        if (n.arguments.length === 0) return
        const arg = n.arguments[0]
        if (arg.type !== 'NumericLiteral' || arg.value !== 1) return
        context.report({
          loc: extractLocation(n),
          message: `Array.prototype.flat(1) is unnecessary. flat() without arguments defaults to depth 1.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Array.prototype.flat(1) which is equivalent to flat() with no arguments.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-flat-single-level.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFlatSingleLevel
