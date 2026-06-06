import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryDateGetUTCSecondsSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'date') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'getUTCSeconds') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: 'date.getUTCSeconds(...items) with a single spread is unusual. Consider calling date.getUTCSeconds() directly.',
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about date.getUTCSeconds(...items) with spread which is unusual since it takes no arguments.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-date-get-utc-seconds-spread.ts',
    },
    messages: {
      unnecessarySpread: 'date.getUTCSeconds(...items) with a single spread is unusual. Consider calling date.getUTCSeconds() directly.',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryDateGetUTCSecondsSpreadRule
