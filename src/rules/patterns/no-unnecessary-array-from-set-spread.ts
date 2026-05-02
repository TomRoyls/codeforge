import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFromSetSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'from') return
        if (!callee.object || callee.object.type !== 'Identifier' || callee.object.name !== 'Array') return
        const arg = n.arguments[0]
        if (!arg) return
        if (arg.type === 'NewExpression') {
          const newCallee = arg.callee
          if (newCallee && newCallee.type === 'Identifier' && newCallee.name === 'Set') {
            context.report({
              loc: extractLocation(n),
              message: `Array.from(new Set(arr)) creates a unique array. Consider using [...new Set(arr)] instead.`,
              node: n,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Suggest using spread syntax instead of Array.from(new Set()).',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-from-set-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFromSetSpreadRule
