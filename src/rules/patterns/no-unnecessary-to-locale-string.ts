import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryToLocaleStringRule: RuleDefinition = {
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
        if (p.type !== 'Identifier' || p.name !== 'toLocaleString') return

        const obj = c.object
        if (!obj || typeof obj !== 'object') return

        const o = obj as Record<string, unknown>
        if (o.type === 'Literal' && typeof o.value === 'string') {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary .toLocaleString() call on a string literal.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary .toLocaleString() calls on string literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-to-locale-string',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryToLocaleStringRule
