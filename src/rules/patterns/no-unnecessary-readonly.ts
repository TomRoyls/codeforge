import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryReadonlyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSPropertySignature(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSPropertySignature') return

        const nn = n as Record<string, unknown>
        const readonly = nn.readonly
        if (readonly !== true) return

        const optional = nn.optional
        if (optional === true) return

        const typeAnnotation = nn.typeAnnotation
        if (!typeAnnotation || typeof typeAnnotation !== 'object') return

        const ta = typeAnnotation as Record<string, unknown>
        const typeAnnotationInner = ta.typeAnnotation
        if (!typeAnnotationInner || typeof typeAnnotationInner !== 'object') return

        const inner = typeAnnotationInner as Record<string, unknown>
        if (inner.type === 'TSNeverKeyword') {
          const key = nn.key
          let keyName = 'property'
          if (key && typeof key === 'object') {
            const k = key as Record<string, unknown>
            if (k.type === 'Identifier' && typeof k.name === 'string') {
              keyName = k.name
            }
          }

          context.report({
            loc: extractLocation(n),
            message: `Unnecessary readonly on '${keyName}' with never type.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary readonly modifier on never-typed properties',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-readonly',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryReadonlyRule
