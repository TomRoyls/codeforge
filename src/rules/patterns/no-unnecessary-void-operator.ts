import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryVoidOperatorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== 'void') return

        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const argNode = toASTNode(argument)
        if (!argNode) return

        const a = argNode as Record<string, unknown>
        const t = a.type as string

        if (t === 'NumericLiteral' || t === 'StringLiteral' || t === 'BooleanLiteral' || t === 'NullLiteral') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary void operator on a literal. `void literal` always returns undefined regardless.',
            node: n,
          })
        } else if (t === 'Literal') {
          const v = a.value
          if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean' || v === null) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary void operator on a literal. `void literal` always returns undefined regardless.',
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
      description:
        'Disallow unnecessary void operator on literal values.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-void-operator.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryVoidOperatorRule
