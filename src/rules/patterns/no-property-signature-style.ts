import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noPropertySignatureStyleRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSPropertySignature(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSPropertySignature') return

        const nn = n as Record<string, unknown>
        const key = nn.key
        if (!key || typeof key !== 'object') return
        const k = key as Record<string, unknown>

        if (k.type === 'Identifier' && typeof k.name === 'string' && k.name.startsWith('_')) {
          context.report({
            loc: extractLocation(n),
            message: 'Property names should not start with underscore.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Enforce consistent property signature naming conventions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-property-signature-style',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noPropertySignatureStyleRule
