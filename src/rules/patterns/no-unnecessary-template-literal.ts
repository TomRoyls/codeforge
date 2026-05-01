import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTemplateLiteralRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TemplateLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TemplateLiteral') return

        const nn = n as Record<string, unknown>
        const expressions = nn.expressions
        const quasis = nn.quasis

        if (!Array.isArray(expressions) || expressions.length !== 0) return
        if (!Array.isArray(quasis) || quasis.length !== 1) return

        const quasi = quasis[0]
        if (!quasi || typeof quasi !== 'object') return

        const q = quasi as Record<string, unknown>
        if (q.type === 'TemplateElement' && q.value === '') {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary empty template literal.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary empty template literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-template-literal',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTemplateLiteralRule
