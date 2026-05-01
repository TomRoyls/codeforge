import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryJoinRule: RuleDefinition = {
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

        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const p = prop as Record<string, unknown>
        if (p.type !== 'Identifier' || p.name !== 'join') return

        const obj = c.object
        if (!obj || typeof obj !== 'object') return

        const o = obj as Record<string, unknown>
        if (o.type === 'ArrayExpression') {
          const elements = o.elements
          if (Array.isArray(elements) && elements.length <= 1) {
            context.report({
              loc: extractLocation(n),
              message: 'Unnecessary .join() call on an array with 0 or 1 elements.',
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
      description: 'Disallow unnecessary .join() calls on empty or single-element arrays',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-join',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryJoinRule
