import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTemplateLiteralSingleRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TemplateLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TemplateLiteral') return

        const nn = n as Record<string, unknown>
        const expressions = nn.expressions
        if (!Array.isArray(expressions) || expressions.length !== 0) return

        const quasis = nn.quasis
        if (!Array.isArray(quasis) || quasis.length !== 1) return

        const quasi = quasis[0] as Record<string, unknown>
        const raw = quasi.raw
        if (typeof raw !== 'string') return

        if (!raw.includes('"') && !raw.includes("'") && !raw.includes('\\')) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary template literal without expressions and without characters that need escaping. Use a regular string instead.',
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
        'Disallow template literals without expressions when a regular string would suffice.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-template-literal-single.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTemplateLiteralSingleRule
