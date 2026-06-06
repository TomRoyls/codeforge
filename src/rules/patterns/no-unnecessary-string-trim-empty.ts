import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringTrimEmptyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'trim') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string' || arg.value !== '') return
        context.report({
          loc: extractLocation(n),
          message: `''.trim('') with an empty string argument is unnecessary. trim() takes no arguments.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: "Warn about ''.trim('') which passes an unnecessary empty string argument.",
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-trim-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringTrimEmptyRule
