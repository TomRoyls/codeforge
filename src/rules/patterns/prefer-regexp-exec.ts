import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getArguments,
  isCallExpression,
  isIdentifier,
  isLiteral,
  isMemberExpression,
  toASTNode,
} from '../../utils/ast-helpers.js'

function isRegExpLiteralWithGlobalFlag(node: unknown): boolean {
  if (!isLiteral(node) && toASTNode(node)?.type !== 'RegExpLiteral') return false

  const n = toASTNode(node)
  if (n?.regex && typeof n.regex.flags === 'string') {
    return n.regex.flags.includes('g')
  }

  if (n?.raw && typeof n.raw === 'string') {
    const regexLiteralMatch = n.raw.match(/^\/(.*)\/([gimsuvy]*)$/)
    if (regexLiteralMatch?.[2]) {
      return regexLiteralMatch[2].includes('g')
    }
  }

  return false
}

function isStringMatchCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false

  const callee = toASTNode(toASTNode(node)?.callee)
  if (!callee || !isMemberExpression(callee)) return false

  const property = toASTNode(callee?.property)
  if (!isIdentifier(property, 'match')) return false

  const args = getArguments(node)
  if (args.length === 0) return false

  return isRegExpLiteralWithGlobalFlag(args[0])
}

export const preferRegexpExecRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isStringMatchCall(node)) return

        const location = extractLocation(node)
        context.report({
          loc: location,
          message:
            'Prefer using regex.exec(string) or string.matchAll(regex) instead of string.match() with global flag for more predictable behavior.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer RegExp.exec() or String.matchAll() over String.match() with global flag. Using str.match(/regex/g) can lead to bugs with stateful regex lastIndex, and str.matchAll(regex) or regex.exec(str) in a loop are more explicit.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-regexp-exec',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferRegexpExecRule
