import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringConstructorRule: RuleDefinition = {
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

        const c = calleeNode as Record<string, unknown>
        if (c.type !== 'Identifier' || c.name !== 'String') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg)
        if (!argNode) return

        const a = argNode as Record<string, unknown>
        const t = a.type as string

        if (t === 'Literal' && typeof a.value === 'string') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary String() call on a string literal. The value is already a string.',
            node: n,
          })
        } else if (t === 'TemplateLiteral') {
          const exprs = a.expressions
          if (Array.isArray(exprs) && exprs.length === 0) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary String() call on a template literal without expressions. The value is already a string.',
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
      description:
        'Disallow unnecessary String() constructor calls on string literals.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-constructor.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringConstructorRule
