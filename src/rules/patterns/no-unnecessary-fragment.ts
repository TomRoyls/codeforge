import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryFragmentRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      JSXFragment(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'JSXFragment') return

        const nn = n as Record<string, unknown>
        const children = nn.children
        if (!Array.isArray(children)) return

        const nonEmpty = children.filter((child: unknown) => {
          if (!child || typeof child !== 'object') return false
          const c = child as Record<string, unknown>
          if (c.type === 'JSXText') {
            const raw = c.raw ?? c.value
            return typeof raw === 'string' && raw.trim().length > 0
          }
          return c.type !== 'JSXExpressionContainer'
        })

        if (nonEmpty.length === 0) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary fragment. Remove the empty fragment wrapper.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary empty JSX fragments',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-fragment',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryFragmentRule
