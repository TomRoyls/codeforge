import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringRepeatZeroRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const c = calleeNode as Record<string, unknown>
        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!propNode || propNode.type !== 'Identifier' || propNode.name !== 'repeat') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const arg = args[0]
        if (!arg || typeof arg !== 'object') return

        const argNode = toASTNode(arg) as Record<string, unknown>
        if (!argNode) return

        if ((argNode.type === 'NumericLiteral' || (argNode.type === 'Literal' && typeof (argNode as Record<string, unknown>).value === 'number')) && (argNode as Record<string, unknown>).value === 0) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary .repeat(0). This always returns an empty string. Remove the call or use "" directly.',
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
        'Disallow .repeat(0) which always returns an empty string.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-repeat-zero.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringRepeatZeroRule
