import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringCharAtZeroRule: RuleDefinition = {
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
        if (!propNode || propNode.type !== 'Identifier') return
        if (propNode.name !== 'charAt') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const arg = args[0]
        if (!arg || typeof arg !== 'object') return

        const argNode = toASTNode(arg) as Record<string, unknown>
        if (!argNode) return
        if (argNode.type !== 'NumericLiteral' || (argNode as Record<string, unknown>).value !== 0) return

        context.report({
          loc: extractLocation(n),
          message:
            'Unnecessary .charAt(0). Use bracket notation [0] instead for consistency and brevity.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow .charAt(0) which can be replaced with bracket notation [0].',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-char-at-zero.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringCharAtZeroRule
