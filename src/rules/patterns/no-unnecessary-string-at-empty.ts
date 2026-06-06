import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringAtEmptyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'at') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string' || arg.value !== '') return
        context.report({
          loc: extractLocation(n),
          message: `str.at('') with an empty string is unusual. at() expects a numeric index.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: "Warn about str.at('') which passes an empty string instead of a numeric index.",
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-at-empty.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryStringAtEmptyRule
