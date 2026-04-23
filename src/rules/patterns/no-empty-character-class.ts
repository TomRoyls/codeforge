import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const EMPTY_CHAR_CLASS_PATTERN = /\[\]/

function hasEmptyCharacterClass(pattern: string): boolean {
  return EMPTY_CHAR_CLASS_PATTERN.test(pattern)
}

export const noEmptyCharacterClassRule: RuleDefinition = {
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
            loc: extractLocation(node),
            message: 'Empty character class in regular expression.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow empty character classes in regular expressions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noEmptyCharacterClassRule
