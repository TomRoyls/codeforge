import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFromSpread: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier' || callee.object.name !== 'Array') return
        if (!callee.property || callee.property.type !== 'Identifier' || callee.property.name !== 'from') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'ArrayExpression') return
        const hasSpread = arg.elements && arg.elements.some(
          (el: unknown) => el !== null && toASTNode(el)?.type === 'SpreadElement',
        )
        if (!hasSpread) return
        context.report({
          loc: extractLocation(n),
          message: `Array.from([...arr]) is unnecessary. Use Array.from(arr) or [...arr] directly.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Array.from() with a spread array literal that can be simplified.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-from-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFromSpread
