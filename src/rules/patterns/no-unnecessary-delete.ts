import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryDeleteRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== 'delete') return

        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = argument as Record<string, unknown>

        if (arg.type === 'MemberExpression') {
          const obj = arg.object
          if (!obj || typeof obj !== 'object') return

          const o = obj as Record<string, unknown>
          if (o.type === 'ThisExpression') {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary delete on this. Set the property to undefined instead.',
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
        'Disallow unnecessary delete operations on object properties.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-delete.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryDeleteRule
