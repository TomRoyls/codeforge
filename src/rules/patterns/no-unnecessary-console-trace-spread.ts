import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryConsoleTraceSpreadRule: RuleDefinition = {
  check(node: unknown): boolean {
    const n = toASTNode(node)
    if (!n) return false
    const callExpr = n.type === 'ExpressionStatement' ? toASTNode((n as { expression?: unknown }).expression) : n
    if (!callExpr || callExpr.type !== 'CallExpression') return false
    if (!callExpr.arguments || callExpr.arguments.length !== 1) return false
    const callee = callExpr.callee
    if (!callee || callee.type !== 'MemberExpression' || callee.computed) return false
    if (!callee.object || callee.object.type !== 'Identifier') return false
    if (callee.object.name !== 'console') return false
    if (!callee.property || callee.property.type !== 'Identifier') return false
    if (callee.property.name !== 'trace') return false
    const arg = callExpr.arguments[0]
    return !!arg && arg.type === 'SpreadElement'
  },
  name: 'no-unnecessary-console-trace-spread',
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
        if (callee.property.name !== 'trace') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: `console.trace(...items) with a single spread is unusual. Consider passing arguments directly.`,
          node: n,
        })
      },
    }
  },
  meta: {
    description: 'Warn about console.trace(...items) with spread which is likely a mistake.',
    docsUrl: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-trace-spread.ts',
    message: 'console.trace(...items) with a single spread is unusual. Consider passing arguments directly.',
    docs: {
      category: 'patterns',
      description: 'Warn about console.trace(...items) with spread which is likely a mistake.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-trace-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryConsoleTraceSpreadRule
