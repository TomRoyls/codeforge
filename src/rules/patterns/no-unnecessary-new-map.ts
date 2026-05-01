import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNewMapRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        const c = calleeNode as Record<string, unknown>
        if (c.type !== 'Identifier' || c.name !== 'Map') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 0) return

        context.report({
          loc: extractLocation(n),
          message:
            'Unnecessary new Map() without initial values. Consider using new Map([...]) with initial entries or a plain object.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Suggest providing initial values to new Map() constructor.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-new-map.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNewMapRule
