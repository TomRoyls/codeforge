import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isLiteral, toASTNode } from '../../utils/ast-helpers.js'
import { REGEX_SPECIAL_CHARS } from '../../utils/constants.js'

const SPECIAL_REGEX_ESCAPES = new Set([
  '0',
  'b',
  'B',
  'd',
  'D',
  'f',
  'k',
  'n',
  'N',
  'p',
  'P',
  'r',
  'R',
  's',
  'S',
  't',
  'u',
  'v',
  'w',
  'W',
  'x',
  'X',
])

function getRawStringValue(node: unknown): null | string {
  if (!isLiteral(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n || n.type !== 'Literal') return null
  return typeof n.raw === 'string' ? n.raw : null
}

function getQuoteChar(raw: string): null | string {
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return '"'
  }

  if (raw.startsWith("'") && raw.endsWith("'")) {
    return "'"
  }

  return null
}

function isQuoteEscapeUnnecessary(escapedQuote: string, stringQuote: string): boolean {
  return (
    (escapedQuote === "'" && stringQuote === '"') || (escapedQuote === '"' && stringQuote === "'")
  )
}

export const noUnnecessaryEscapeInRegexpRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) {
          return
        }

        const raw = getRawStringValue(node)
        if (!raw) {
          return
        }

        const location = extractLocation(node)
        const quoteChar = getQuoteChar(raw)
        if (!quoteChar) {
          return
        }

        let escapeIndex = raw.indexOf('\\', 1)
        while (escapeIndex !== -1 && escapeIndex < raw.length - 1) {
          const escapedChar = raw[escapeIndex + 1]

          if ((escapedChar === "'" || escapedChar === '"') && isQuoteEscapeUnnecessary(escapedChar, quoteChar)) {
              context.report({
                loc: {
                  end: {
                    column: location.start.column + escapeIndex + 2,
                    line: location.start.line,
                  },
                  start: {
                    column: location.start.column + escapeIndex,
                    line: location.start.line,
                  },
                },
                message: `Unnecessary escape character. '${escapedChar}' does not need to be escaped in ${quoteChar === '"' ? 'double' : 'single'}-quoted strings.`,
              })
            }

          escapeIndex = raw.indexOf('\\', escapeIndex + 2)
        }
      },

      RegExpLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'RegExpLiteral') return

        const raw = n.raw as string | undefined
        if (!raw) {
          return
        }

        const location = extractLocation(node)

        let i = 1
        let column = location.start.column + 1

        while (i < raw.length - 1) {
          if (raw[i] === '\\' && i + 1 < raw.length - 1) {
            const nextChar = raw[i + 1]

            if (nextChar !== undefined && !REGEX_SPECIAL_CHARS.has(nextChar)) {
              const isBackreference = nextChar >= '1' && nextChar <= '7'

              if (!SPECIAL_REGEX_ESCAPES.has(nextChar) && !isBackreference) {
                context.report({
                  loc: {
                    end: {
                      column: column + 2,
                      line: location.start.line,
                    },
                    start: {
                      column,
                      line: location.start.line,
                    },
                  },
                  message: `Unnecessary escape character '\\${nextChar}' in regex. This character does not need to be escaped.`,
                })
              }
            }

            i += 2
            column += 2
          } else {
            i++
            column++
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        "Disallow unnecessary escape characters in regular expressions. Escaping characters that don't need to be escaped makes the pattern harder to read.",
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-escape-in-regexp',
    },
    fixable: false,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryEscapeInRegexpRule
