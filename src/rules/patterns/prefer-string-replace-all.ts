/**
 * @file Prefer String.prototype.replaceAll() over regex with global flag
 * @module rules/patterns/prefer-string-replace-all
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isStringReplaceCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') {
    return false
  }

  const property = toASTNode(callee.property)
  if (!property || property.type !== 'Identifier' || property.name !== 'replace') {
    return false
  }

  return true
}

function isGlobalRegex(argument: unknown): boolean {
  const arg = toASTNode(argument)
  if (!arg) return false

  if (arg.type !== 'Literal' && arg.type !== 'RegExpLiteral') {
    return false
  }

  const {regex} = arg

  if (regex) {
    const {flags} = regex
    return flags?.includes('g') === true && !flags?.includes('i')
  }

  if (typeof arg.value === 'string' && arg.raw) {
    const {raw} = arg
    if (raw.startsWith('/') && raw.endsWith('/g')) {
      return true
    }
  }

  return false
}

function getRegexPattern(argument: unknown): null | string {
  const arg = toASTNode(argument)
  if (!arg) return null

  const {regex} = arg

  if (regex) {
    return regex.pattern || null
  }

  if (typeof arg.value === 'string' && arg.raw) {
    const {raw} = arg
    if (raw.startsWith('/') && raw.endsWith('/g')) {
      return raw.slice(1, -2)
    }
  }

  return null
}

export const preferStringReplaceAllRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isStringReplaceCall(node)) {
          return
        }

        const n = toASTNode(node)
        if (!n) return

        const args = n.arguments

        if (!args || args.length === 0) {
          return
        }

        const firstArg = args[0]

        if (!isGlobalRegex(firstArg)) {
          return
        }

        const pattern = getRegexPattern(firstArg)

        const suggestion: string = pattern
          ? `Use str.replaceAll('${pattern}', ...) instead of str.replace(/${pattern}/g, ...)`
          : 'Use str.replaceAll() instead of str.replace() with global regex'

        context.report({
          loc: extractLocation(node),
          message: `Prefer replaceAll() over replace() with global regex. ${suggestion}`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer String.prototype.replaceAll() over .replace() with a global regex. replaceAll() is more readable and explicit about replacing all occurrences.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-string-replace-all',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferStringReplaceAllRule
