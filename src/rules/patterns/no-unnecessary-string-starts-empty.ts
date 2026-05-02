import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringStartsEmptyRule: RuleDefinition = {
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
        if (propNode.name !== 'startsWith' && propNode.name !== 'endsWith') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length < 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg) as Record<string, unknown>
        if (!argNode) return

        if (argNode.type === 'StringLiteral' && (argNode as Record<string, unknown>).value === '') {
          const methodName = propNode.name as string
          context.report({
            loc: extractLocation(n),
            message:
              `Unnecessary .${methodName}("") check. Every string starts and ends with an empty string.`,
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
        'Disallow .startsWith("") and .endsWith("") checks, which always return true.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-starts-empty.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringStartsEmptyRule
