import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringConstructorNonEmptyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return
        if (!n.callee || n.callee.type !== 'Identifier' || n.callee.name !== 'String') return
        if (!n.arguments || n.arguments.length !== 1) return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'StringLiteral') return
        context.report({
          loc: extractLocation(n),
          message: `new String('...') creates a String object, not a primitive. Use the literal directly.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: "Warn about new String('...') which creates a String object instead of a primitive.",
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-constructor-non-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringConstructorNonEmptyRule
