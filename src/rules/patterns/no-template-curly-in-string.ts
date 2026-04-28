import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const TEMPLATE_CURLY_PATTERN = /\$\{[^}]*\}/

export const noTemplateCurlyInStringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        if (typeof n.value !== 'string') return

        const {raw} = n
        if (!raw || typeof raw !== 'string') return

        if (raw.startsWith('`')) return

        if (TEMPLATE_CURLY_PATTERN.test(n.value)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unexpected template literal expression in a regular string. Use a template literal (backticks) instead.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow template literal expressions (`${...}`) in regular strings. Use template literals (backticks) instead.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-template-curly-in-string',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noTemplateCurlyInStringRule
