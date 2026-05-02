import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringSplitLengthRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MemberExpression' || n.computed) return
        if (!n.property || n.property.type !== 'Identifier' || n.property.name !== 'length') return
        const obj = n.object
        if (!obj || obj.type !== 'CallExpression') return
        if (!obj.callee || obj.callee.type !== 'MemberExpression' || obj.callee.computed) return
        if (!obj.callee.property || obj.callee.property.type !== 'Identifier') return
        if (obj.callee.property.name !== 'split') return
        if (!obj.arguments || obj.arguments.length !== 1) return
        const arg = obj.arguments[0]
        if (!arg || arg.type !== 'StringLiteral' || arg.value !== '') return
        context.report({
          loc: extractLocation(n),
          message: `str.split('').length to count characters is inefficient. Use str.length directly.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: "Warn about str.split('').length which can be replaced with str.length.",
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-split-length.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringSplitLengthRule
