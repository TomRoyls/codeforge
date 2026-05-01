import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryFlatRule: RuleDefinition = {
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

        const obj = c.object
        if (!obj || typeof obj !== 'object') return

        const o = obj as Record<string, unknown>
        if (o.type !== 'ArrayExpression') return

        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const p = prop as Record<string, unknown>
        if (p.type !== 'Identifier' || p.name !== 'flat') return

        const elements = o.elements
        if (!Array.isArray(elements)) return

        const hasNestedArray = elements.some((el: unknown) => {
          if (!el || typeof el !== 'object') return false
          return (el as Record<string, unknown>).type === 'ArrayExpression'
        })

        if (!hasNestedArray) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary .flat() call on an array with no nested arrays.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary .flat() calls on arrays without nested arrays',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-flat',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryFlatRule
