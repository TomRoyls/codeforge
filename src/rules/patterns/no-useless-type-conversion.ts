import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUselessTypeConversionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return
        const c = callee as Record<string, unknown>

        if (c.type !== 'Identifier') return
        const name = c.name

        const redundantCasts: Record<string, string> = {
          Boolean: 'boolean',
          Number: 'number',
          String: 'string',
        }

        const targetType = redundantCasts[name as string]
        if (!targetType) return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const arg = args[0] as Record<string, unknown>
        if (!arg || typeof arg !== 'object') return

        if (arg.type === 'Literal') {
          if (targetType === 'boolean' && typeof arg.value === 'boolean') {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary Boolean() call on already-boolean value.`,
              node: n,
            })
          } else if (targetType === 'number' && typeof arg.value === 'number') {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary Number() call on already-number value.`,
              node: n,
            })
          } else if (targetType === 'string' && typeof arg.value === 'string') {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary String() call on already-string value.`,
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
      description: 'Disallow unnecessary type conversion calls',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-type-conversion',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessTypeConversionRule
