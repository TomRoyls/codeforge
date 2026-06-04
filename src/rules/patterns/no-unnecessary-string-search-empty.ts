import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringSearchEmptyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'search') return
        const arg = n.arguments[0]
        if (!arg) return
        if ((arg.type === 'StringLiteral' || (arg.type === 'Literal' && typeof arg.value === 'string')) && arg.value === '') {
          context.report({
            loc: extractLocation(n),
            message: `str.search('') always returns 0. Use str.indexOf('') or check length instead.`,
            node: n,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about String.prototype.search("") which always returns 0.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-search-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringSearchEmptyRule
