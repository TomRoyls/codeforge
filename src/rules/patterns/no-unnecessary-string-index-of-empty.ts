import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringIndexOfEmptyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'indexOf') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string' || arg.value !== '') return
        context.report({
          loc: extractLocation(n),
          message: `str.indexOf('') always returns 0. This is likely unintentional.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: "Warn about str.indexOf('') which always returns 0.",
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-index-of-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringIndexOfEmptyRule
