/**
 * @fileoverview Prefer String.prototype.replaceAll() over regex with global flag
 * @module rules/patterns/prefer-string-replace-all
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
}

function isStringReplaceCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || callee.type !== 'MemberExpression') {
    return false
  }

  const property = callee.property as Record<string, unknown> | undefined

  if (!property || property.type !== 'Identifier' || property.name !== 'replace') {
    return false
  }

  return true
}

function isGlobalRegex(argument: unknown): boolean {
  if (!argument || typeof argument !== 'object') {
    return false
  }

  const arg = argument as Record<string, unknown>

  if (arg.type !== 'Literal' && arg.type !== 'RegExpLiteral') {
    return false
  }

  const regex = arg.regex as Record<string, unknown> | undefined

  if (regex) {
    const flags = regex.flags as string | undefined
    return flags?.includes('g') === true && !flags?.includes('i')
  }

  if (typeof arg.value === 'string' && arg.raw) {
    const raw = arg.raw as string
    if (raw.startsWith('/') && raw.endsWith('/g')) {
      return true
    }
  }

  return false
}

function getRegexPattern(argument: unknown): string | null {
  if (!argument || typeof argument !== 'object') {
    return null
  }

  const arg = argument as Record<string, unknown>

  const regex = arg.regex as Record<string, unknown> | undefined

  if (regex) {
    return (regex.pattern as string) || null
  }

  if (typeof arg.value === 'string' && arg.raw) {
    const raw = arg.raw as string
    if (raw.startsWith('/') && raw.endsWith('/g')) {
      return raw.slice(1, -2)
    }
  }

  return null
}

export const preferStringReplaceAllRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer String.prototype.replaceAll() over .replace() with a global regex. replaceAll() is more readable and explicit about replacing all occurrences.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-string-replace-all',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isStringReplaceCall(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const args = n.arguments as unknown[] | undefined

        if (!args || args.length === 0) {
          return
        }

        const firstArg = args[0]

        if (!isGlobalRegex(firstArg)) {
          return
        }

        const pattern = getRegexPattern(firstArg)

        let suggestion: string
        if (pattern) {
          suggestion = `Use str.replaceAll('${pattern}', ...) instead of str.replace(/${pattern}/g, ...)`
        } else {
          suggestion = 'Use str.replaceAll() instead of str.replace() with global regex'
        }

        context.report({
          node,
          message: `Prefer replaceAll() over replace() with global regex. ${suggestion}`,
          loc: extractLocation(node),
        })
      },
    }
  },
}

export default preferStringReplaceAllRule
