import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryDateGetSecondsSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        // Skip optional chaining (date?.getSeconds)
        if ((callee as Record<string, unknown>).optional === true) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'date') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'getSeconds') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        // Only report when result is discarded (ExpressionStatement) or used in
        // complex expressions. Skip simple assignments, chaining, and optional chaining.
        const parent = (node as Record<string, unknown>).parent as Record<string, unknown> | undefined
        if (parent && (parent.type === 'VariableDeclarator' || parent.type === 'MemberExpression')) return
        context.report({
          loc: extractLocation(n),
          messageId: 'unnecessarySpread',
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about date.getSeconds(...items) with spread which is unusual since it takes no arguments.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-date-get-seconds-spread.ts',
    },
    messages: {
      unnecessarySpread: 'date.getSeconds(...items) with a single spread is unusual. Consider calling date.getSeconds() directly.',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryDateGetSecondsSpreadRule
