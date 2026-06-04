import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringReplaceEmpty: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 2) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'replace' && callee.property.name !== 'replaceAll') return
        const arg = n.arguments[1]
        if (!arg || (arg.type !== 'StringLiteral' && !(arg.type === 'Literal' && typeof arg.value === 'string'))) return
        if (arg.value !== '') return
        const firstArg = n.arguments[0]
        if (!firstArg) return
        if (firstArg.type === 'StringLiteral' || (firstArg.type === 'Literal' && typeof firstArg.value === 'string')) {
          context.report({
            loc: extractLocation(n),
            message: `Replacing a string with an empty string removes it. Consider using remove() or a more explicit approach.`,
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
        'Warn about String.prototype.replace() or replaceAll() with empty string replacement.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-replace-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringReplaceEmpty
