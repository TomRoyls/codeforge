import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function hasMultipleSpaces(value: string): boolean {
  return /[^\s\n] {2,}/.test(value) || / {2,}[^\s\n]/.test(value)
}

export const noMultiSpacesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (typeof n.value !== 'string') {
          return
        }

        if (hasMultipleSpaces(n.value)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Multiple spaces found in string literal.',
          })
        }
      },

      TemplateElement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const value = n.value as Record<string, unknown> | undefined
        const raw = value?.raw as string | undefined

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
