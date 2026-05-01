import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryRegexRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'MemberExpression') return

        const property = c.property
        if (!property || typeof property !== 'object') return

        const p = property as Record<string, unknown>
        if (p.type !== 'Identifier') return

        const methodName = p.name
        if (methodName !== 'test' && methodName !== 'match' && methodName !== 'replace' && methodName !== 'search') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length === 0) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const arg = firstArg as Record<string, unknown>
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          const val = arg.value as string
          if (!/[.*+?^${}()|[\]\\]/.test(val)) {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary regex escape in '${val}'. Use a string method instead.`,
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary regex methods on simple string literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-regex',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryRegexRule
