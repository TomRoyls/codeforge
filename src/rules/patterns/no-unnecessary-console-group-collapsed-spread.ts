import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryConsoleGroupCollapsedSpreadRule: RuleDefinition = {
  name: 'no-unnecessary-console-group-collapsed-spread',
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'console') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'groupCollapsed') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: `console.groupCollapsed(...items) with a single spread is unusual. Consider passing arguments directly.`,
          node: n,
        })
      },
    }
  },
  meta: {
    description: 'Warn about console.groupCollapsed(...items) with spread which is likely a mistake.',
    message: 'console.groupCollapsed(...items) with a single spread is unusual. Consider passing arguments directly.',
    docs: {
      category: 'patterns',
      description: 'Warn about console.groupCollapsed(...items) with spread which is likely a mistake.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-group-collapsed-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryConsoleGroupCollapsedSpreadRule
