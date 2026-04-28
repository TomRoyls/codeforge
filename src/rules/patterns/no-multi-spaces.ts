import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasMultipleSpaces(value: string): boolean {
  return /[^\s\n] {2,}/.test(value) || / {2,}[^\s\n]/.test(value)
}

export const noMultiSpacesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || typeof n.value !== 'string') return

        if (hasMultipleSpaces(n.value as string)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Multiple spaces found in string literal.',
          })
        }
      },

      TemplateElement(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const value = toASTNode(n.value)
        const raw = value?.raw

        if (raw && hasMultipleSpaces(raw)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Multiple spaces found in template literal.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'style',
      description:
        'Disallow multiple spaces except for indentation. Multiple spaces can be confusing and may indicate errors.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-multi-spaces',
    },
    fixable: 'whitespace',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMultiSpacesRule
