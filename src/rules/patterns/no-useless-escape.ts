import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

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

const STRING_ESCAPABLE = new Set([
  'n',
  'r',
  't',
  'b',
  'f',
  'v',
  '0',
  '\\',
  "'",
  '"',
  '`',
  '$',
  '\n',
  '\r',
])

function hasUselessEscape(raw: unknown, isRegex: boolean): boolean {
  if (typeof raw !== 'string') return false
  const escapeRegex = /\\(.)/g
  let match
  while ((match = escapeRegex.exec(raw)) !== null) {
    const char = match[1]
    if (!char) continue
    if (isRegex) {
      if (!REGEX_SPECIAL_CHARS.has(char) && !/[0-9a-zA-Z]/.test(char)) {
        continue
      }
      if (/[a-zA-Z0-9]/.test(char) && !['d', 'D', 'w', 'W', 's', 'S', 'b', 'B'].includes(char)) {
        return true
      }
    } else {
      if (!STRING_ESCAPABLE.has(char)) {
        return true
      }
    }
  }
  return false
}

export const noUselessEscapeRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow unnecessary escape characters.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
        if (typeof n.raw === 'string') {
          const isRegex = !!n.regex
          if (hasUselessEscape(n.raw, isRegex)) {
            context.report({
              message: 'Unnecessary escape character.',
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noUselessEscapeRule
