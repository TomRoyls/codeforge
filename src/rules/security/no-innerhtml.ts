import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noInnerHTMLRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AssignmentExpression') return

        const op = (n as { operator?: string }).operator
        if (op !== '=') return

        const left = toASTNode((n as { left?: unknown }).left)
        if (!left || left.type !== 'MemberExpression') return

        const computed = (left as { computed?: boolean }).computed
        if (computed) return

        const prop = toASTNode((left as { property?: unknown }).property)
        if (!prop || prop.type !== 'Identifier') return

        const propName = (prop as { name?: string }).name
        if (propName !== 'innerHTML' && propName !== 'outerHTML') return

        context.report({
          loc: extractLocation(n),
          message: `Unexpected use of \`${propName}\`. Assigning to \`${propName}\` can introduce XSS vulnerabilities. Use \`textContent\`, \`createElement()\`, or a sanitization library instead.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow direct assignment to innerHTML or outerHTML',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-innerhtml',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noInnerHTMLRule
