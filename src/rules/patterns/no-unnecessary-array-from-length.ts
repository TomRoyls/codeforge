import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFromLengthRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.callee || n.callee.type !== 'MemberExpression' || n.callee.computed) return
        if (!n.callee.property || n.callee.property.type !== 'Identifier') return
        if (n.callee.property.name !== 'from') return
        if (!n.callee.object || n.callee.object.type !== 'Identifier' || n.callee.object.name !== 'Array') return
        if (!n.arguments || n.arguments.length !== 1) return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'MemberExpression') return
        if (!arg.property || arg.property.type !== 'Identifier' || arg.property.name !== 'length') return
        context.report({
          loc: extractLocation(n),
          message: `Array.from(x.length) creates an array from the length value, not an array of that length. Use Array(x.length) or Array.from({ length: x.length }) instead.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about Array.from(x.length) which likely does not do what the developer expects.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-from-length.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFromLengthRule
