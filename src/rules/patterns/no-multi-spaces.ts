import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function hasMultipleSpaces(value: string): boolean {
  return /[^\s\n] {2,}/.test(value) || / {2,}[^\s\n]/.test(value)
}

export const noMultiSpacesRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow multiple spaces except for indentation. Multiple spaces can be confusing and may indicate errors.',
      category: 'style',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-multi-spaces',
    },
    schema: [],
    fixable: 'whitespace',
  },

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
            message: 'Multiple spaces found in string literal.',
            loc: location,
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
            message: 'Multiple spaces found in template literal.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noMultiSpacesRule
