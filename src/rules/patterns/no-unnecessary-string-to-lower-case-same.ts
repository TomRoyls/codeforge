import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringToLowerCaseSameRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 0) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'toLowerCase') return
        if (!callee.object || callee.object.type !== 'StringLiteral') return
        const val = callee.object.value
        if (val === val.toLowerCase()) {
          context.report({
            loc: extractLocation(n),
            message: `'${val}'.toLowerCase() is unnecessary — the string is already lowercase.`,
            node: n,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about String.prototype.toLowerCase() called on an already-lowercase string literal.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-to-lower-case-same.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringToLowerCaseSameRule
