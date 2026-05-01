import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryReturnValueRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const nn = n as Record<string, unknown>
        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = argument as Record<string, unknown>
        if (arg.type === 'Identifier' && arg.name === 'undefined') {
          context.report({
            loc: extractLocation(n),
            message: "Unnecessary 'return undefined'.",
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary return undefined statements',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-return-value',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryReturnValueRule
