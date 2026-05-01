import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryParameterPropertyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSParameterProperty(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSParameterProperty') return

        const nn = n as Record<string, unknown>
        const accessibility = nn.accessibility
        if (accessibility === 'public' || accessibility === 'protected' || accessibility === 'private') {
          const readonly = nn.readonly
          if (readonly === true) {
            const parameter = nn.parameter
            if (parameter && typeof parameter === 'object') {
              const param = parameter as Record<string, unknown>
              if (param.type === 'Identifier' && param.name && typeof param.name === 'string') {
                context.report({
                  loc: extractLocation(n),
                  message: `Unnecessary parameter property modifier on '${param.name}'.`,
                  node: n,
                })
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Flag unnecessary TypeScript parameter property declarations',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-parameter-property',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryParameterPropertyRule
