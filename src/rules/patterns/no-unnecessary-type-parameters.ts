import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTypeParametersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSTypeReference(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSTypeReference') return

        const nn = n as Record<string, unknown>
        const typeArguments = nn.typeArguments
        if (!typeArguments || typeof typeArguments !== 'object') return

        const ta = typeArguments as Record<string, unknown>
        const params = ta.params
        if (!Array.isArray(params) || params.length === 0) return

        if (params.length === 1) {
          const first = params[0]
          if (!first || typeof first !== 'object') return

          const f = first as Record<string, unknown>
          if (f.type === 'TSUnknownKeyword') {
            const typeName = nn.typeName
            let name = 'type'
            if (typeName && typeof typeName === 'object') {
              const tn = typeName as Record<string, unknown>
              if (tn.type === 'Identifier' && typeof tn.name === 'string') {
                name = tn.name
              }
            }

            context.report({
              loc: extractLocation(n),
              message: `Unnecessary type parameter 'unknown' on '${name}'.`,
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
      description: 'Disallow unnecessary type parameters like unknown on type references',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-type-parameters',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTypeParametersRule
