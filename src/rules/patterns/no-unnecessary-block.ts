import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryBlockRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BlockStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BlockStatement') return

        const nn = n as Record<string, unknown>
        const body = nn.body
        if (!Array.isArray(body) || body.length !== 0) return

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary empty block statement.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary empty block statements',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-block',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBlockRule
