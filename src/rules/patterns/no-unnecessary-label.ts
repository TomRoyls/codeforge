import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryLabelRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      LabeledStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'LabeledStatement') return

        const nn = n as Record<string, unknown>
        const label = nn.label
        if (!label || typeof label !== 'object') return

        const l = label as Record<string, unknown>
        if (l.type !== 'Identifier' || typeof l.name !== 'string') return

        const body = nn.body
        if (!body || typeof body !== 'object') return

        const b = body as Record<string, unknown>
        if (b.type === 'BreakStatement' || b.type === 'ContinueStatement') {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary label '${l.name}'.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary labels on break/continue statements',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-label',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryLabelRule
