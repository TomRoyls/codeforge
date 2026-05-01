import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AssignmentExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '=') return

        const left = nn.left
        const right = nn.right
        if (!left || typeof left !== 'object') return
        if (!right || typeof right !== 'object') return

        const l = left as Record<string, unknown>
        const r = right as Record<string, unknown>

        if (
          l.type === 'Identifier' &&
          r.type === 'Identifier' &&
          typeof l.name === 'string' &&
          typeof r.name === 'string' &&
          l.name === r.name
        ) {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary self-assignment of '${l.name}'.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary self-assignment expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-assign',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAssignRule
