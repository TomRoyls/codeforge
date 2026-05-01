import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryReturnAwaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const nn = n as Record<string, unknown>
        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = argument as Record<string, unknown>
        if (arg.type === 'AwaitExpression') {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary return await. Remove the await or use a plain return.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary return await expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-return-await',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryReturnAwaitRule
