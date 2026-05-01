import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noTypeAliasSingleUnionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSTypeAliasDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSTypeAliasDeclaration') return

        const nn = n as Record<string, unknown>
        const typeAnnotation = nn.typeAnnotation
        if (!typeAnnotation || typeof typeAnnotation !== 'object') return
        const ta = typeAnnotation as Record<string, unknown>

        if (ta.type === 'TSUnionType') {
          const types = ta.types
          if (Array.isArray(types) && types.length === 1) {
            context.report({
              loc: extractLocation(n),
              message: 'Type alias for a single-element union is redundant.',
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
      description: 'Disallow type aliases with single-element unions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-type-alias-single-union',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noTypeAliasSingleUnionRule
