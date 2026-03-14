import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isLiteral } from '../../utils/ast-helpers.js'

const REGEX_SPECIAL_CHARS = new Set([
  '\\',
  '^',
  '$',
  '.',
  '|',
  '?',
  '*',
  '+',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '/',
])

const SPECIAL_REGEX_ESCAPES = new Set([
  'n',
  'r',
  't',
  'f',
  'v',
  '0',
  'd',
  'D',
  's',
  'S',
  'w',
  'W',
  'b',
  'B',
  'p',
  'P',
  'x',
  'u',
  'k',
  'N',
  'R',
  'X',
])

function getRawStringValue(node: unknown): string | null {
  if (!isLiteral(node)) {
    return null
  }
  const n = node as Record<string, unknown>
  return typeof n.raw === 'string' ? n.raw : null
}

function getQuoteChar(raw: string): string | null {
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        "Disallow unnecessary escape characters in regular expressions. Escaping characters that don't need to be escaped makes the pattern harder to read.",
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-escape-in-regexp',
    },
    schema: [],
    fixable: 'code',
  },

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

          if (escapedChar === "'" || escapedChar === '"') {
            if (isQuoteEscapeUnnecessary(escapedChar, quoteChar)) {
              context.report({
                message: `Unnecessary escape character. '${escapedChar}' does not need to be escaped in ${quoteChar === '"' ? 'double' : 'single'}-quoted strings.`,
                loc: {
                  start: {
                    line: location.start.line,
                    column: location.start.column + escapeIndex,
                  },
                  end: {
                    line: location.start.line,
                    column: location.start.column + escapeIndex + 2,
                  },
                },
              })
            }
          }

          escapeIndex = raw.indexOf('\\', escapeIndex + 2)
        }
      },

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

        let i = 1
        let column = location.start.column + 1

        while (i < raw.length - 1) {
          if (raw[i] === '\\' && i + 1 < raw.length - 1) {
            const nextChar = raw[i + 1]

            if (nextChar !== undefined && !REGEX_SPECIAL_CHARS.has(nextChar)) {
              const isBackreference = nextChar >= '1' && nextChar <= '7'

              if (!SPECIAL_REGEX_ESCAPES.has(nextChar) && !isBackreference) {
                context.report({
                  message: `Unnecessary escape character '\\${nextChar}' in regex. This character does not need to be escaped.`,
                  loc: {
                    start: {
                      line: location.start.line,
                      column,
                    },
                    end: {
                      line: location.start.line,
                      column: column + 2,
                    },
                  },
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
}

export default noUnnecessaryEscapeInRegexpRule
