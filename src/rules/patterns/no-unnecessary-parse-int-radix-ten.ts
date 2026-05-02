import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryParseIntRadixTenRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        if (calleeNode.type === 'Identifier') {
          const id = calleeNode as Record<string, unknown>
          if (id.name !== 'parseInt') return
        } else {
          return
        }

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 2) return

        const secondArg = args[1]
        if (!secondArg || typeof secondArg !== 'object') return

        const argNode = toASTNode(secondArg) as Record<string, unknown>
        if (!argNode) return

        if (argNode.type === 'NumericLiteral' && (argNode as Record<string, unknown>).value === 10) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary radix parameter 10 in parseInt(). The default radix is 10 for decimal strings.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary radix parameter 10 in parseInt() calls.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-parse-int-radix-ten.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryParseIntRadixTenRule
