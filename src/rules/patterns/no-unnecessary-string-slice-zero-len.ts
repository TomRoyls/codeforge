import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringSliceZeroLen: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 2) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier' || callee.property.name !== 'slice') return
        const startArg = n.arguments[0]
        if (!startArg || startArg.type !== 'NumericLiteral' || startArg.value !== 0) return
        const endArg = n.arguments[1]
        if (!endArg || endArg.type !== 'NumericLiteral') return
        if ((endArg.value as number) <= 0) return
        context.report({
          loc: extractLocation(n),
          message: `String.prototype.slice(0, ${endArg.value}) can be simplified. Consider using substring() or direct indexing.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Warn about String.prototype.slice(0, n) which could use substring() instead.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-slice-zero-len.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringSliceZeroLen
