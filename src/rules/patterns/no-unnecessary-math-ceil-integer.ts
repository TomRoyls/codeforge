import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryMathCeilInteger: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (n.arguments.length !== 1) return
        const callee = n.callee
        if (
          callee.type !== 'MemberExpression' ||
          !callee.computed ||
          (callee.object.type !== 'Identifier' || callee.object.name !== 'Math') ||
          (callee.property.type !== 'Identifier' || callee.property.name !== 'ceil')
        ) {
          if (
            callee.type === 'MemberExpression' &&
            !callee.computed &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'Math' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'ceil'
          ) {
            const arg = n.arguments[0]
            if (
              arg.type === 'NumericLiteral' &&
              Number.isInteger(arg.value) &&
              arg.value >= 0
            ) {
              context.report({
                loc: extractLocation(n),
                message: `Math.ceil() is unnecessary for integer values. The result is already an integer.`,
                node: n,
              })
            }
          }
          return
        }
        const arg = n.arguments[0]
        if (
          arg.type === 'NumericLiteral' &&
          Number.isInteger(arg.value) &&
          arg.value >= 0
        ) {
          context.report({
            loc: extractLocation(n),
            message: `Math.ceil() is unnecessary for integer values. The result is already an integer.`,
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
        'Disallow Math.ceil() on integer literals where the result is already an integer.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-ceil-integer.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryMathCeilInteger
