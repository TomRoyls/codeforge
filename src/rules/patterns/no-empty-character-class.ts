import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function hasEmptyCharacterClass(pattern: string): boolean {
  return /\[\]/.test(pattern)
}

export const noEmptyCharacterClassRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow empty character classes in regular expressions.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      RegExpLiteral(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.type !== 'RegExpLiteral') {
          return
        }

        const raw = n.raw as string | undefined
        if (!raw) {
          return
        }

        if (hasEmptyCharacterClass(raw)) {
          context.report({
            message: 'Empty character class in regular expression.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noEmptyCharacterClassRule
