import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringTrimStartEmptyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 0) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'trimStart' && callee.property.name !== 'trimLeft') return
        if (!callee.object || callee.object.type !== 'StringLiteral') return
        if (callee.object.value === '') {
          context.report({
            loc: extractLocation(n),
            message: `''.trimStart() on an empty string is unnecessary.`,
            node: n,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about empty string literals calling trimStart()/trimLeft().',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-trim-start-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringTrimStartEmptyRule
