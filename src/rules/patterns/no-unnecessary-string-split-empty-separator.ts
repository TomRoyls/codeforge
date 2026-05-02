import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringSplitEmptySeparatorRule: RuleDefinition = {
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
        if (!propNode || propNode.type !== 'Identifier' || propNode.name !== 'split') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length < 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg) as Record<string, unknown>
        if (!argNode) return

        if (argNode.type === 'StringLiteral' && (argNode as Record<string, unknown>).value === '') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary .split("") to split by character. This is valid but consider if [...str] is more readable.',
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
        'Flag .split("") which splits a string into individual characters.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-split-empty-separator.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringSplitEmptySeparatorRule
