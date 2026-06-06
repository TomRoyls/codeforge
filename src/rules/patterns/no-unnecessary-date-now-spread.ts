import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryDateNowSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        // Skip optional chaining (Date?.now(...) or Date.now?.(...))
        const parentNode = (node as { parent?: { type?: string } }).parent
          ?? (n as { parent?: { type?: string } }).parent
          ?? (n as { _parent?: { type?: string } })._parent
        if (parentNode?.type === 'ChainExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee) return
        if (callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'Date') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'now') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
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
      description: 'Warn about Date.now(...items) with spread which is unusual since Date.now takes no arguments.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-date-now-spread.ts',
    },
    messages: {
      unnecessarySpread: 'Date.now(...items) with a single spread is unusual. Consider calling Date.now() directly.',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryDateNowSpreadRule
