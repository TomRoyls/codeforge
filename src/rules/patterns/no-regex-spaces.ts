import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

export const noRegexSpacesRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow multiple consecutive spaces in regular expressions. Use \\s+ or {N} quantifier instead for clarity.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-regex-spaces',
    },
    schema: [],
    fixable: 'code',
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

        const location = extractLocation(node)

        const pattern = raw.slice(1, -1)
        const spaceMatches = pattern.matchAll(/ {2,}/g)

        for (const match of spaceMatches) {
          if (!match.index) continue

          const spaces = match[0]
          const spaceCount = spaces.length
          const column = location.start.column + 1 + match.index

          context.report({
            message: `Multiple consecutive spaces (${spaceCount}) in regex literal. Use '\\s+' or '{${spaceCount}}' instead.`,
            loc: {
              start: {
                line: location.start.line,
                column,
              },
              end: {
                line: location.start.line,
                column: column + spaceCount,
              },
            },
          })
        }
      },
    }
  },
}

export default noRegexSpacesRule
