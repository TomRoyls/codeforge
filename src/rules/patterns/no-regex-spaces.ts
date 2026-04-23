import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

export const noRegexSpacesRule: RuleDefinition = {
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
            loc: {
              end: {
                column: column + spaceCount,
                line: location.start.line,
              },
              start: {
                column,
                line: location.start.line,
              },
            },
            message: `Multiple consecutive spaces (${spaceCount}) in regex literal. Use '\\s+' or '{${spaceCount}}' instead.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        String.raw`Disallow multiple consecutive spaces in regular expressions. Use \s+ or {N} quantifier instead for clarity.`,
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-regex-spaces',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRegexSpacesRule
