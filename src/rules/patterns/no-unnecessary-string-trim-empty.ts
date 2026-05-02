import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringTrimEmpty: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (n.arguments.length !== 1) return
        const callee = n.callee
        if (callee.type !== 'MemberExpression' || callee.computed) return
        if (callee.property.type !== 'Identifier' || callee.property.name !== 'trim') return
        const arg = n.arguments[0]
        if (arg.type !== 'StringLiteral') return
        if (arg.value !== '') return
        context.report({
          loc: extractLocation(n),
          message: `Trimming an empty string literal is unnecessary. The result is always an empty string.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow String.prototype.trim() on empty string literals.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-trim-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringTrimEmpty
