import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

interface LiteralNode {
  loc?: {
    end: { column: number; line: number; }
    start: { column: number; line: number; }
  }
  raw?: string
  regex?: {
    flags: string
    pattern: string
  }
  type: 'Literal'
  value: null | string
}

interface CallExpressionNode {
  arguments: unknown[]
  callee: {
    computed: boolean
    object: unknown
    property: {
      name: string
      type: 'Identifier'
    }
    type: 'MemberExpression'
  }
  loc?: {
    end: { column: number; line: number; }
    start: { column: number; line: number; }
  }
  type: 'CallExpression'
}

function isCallExpression(node: unknown): node is CallExpressionNode {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'CallExpression'
}

function isMemberExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'MemberExpression'
}

function isIdentifier(node: unknown, name?: string): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'Identifier') {
    return false
  }

  return name === undefined || n.name === name
}

function isLiteral(node: unknown): node is LiteralNode {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' || n.type === 'RegExpLiteral'
}

function isRegExpLiteralWithGlobalFlag(node: unknown): boolean {
  if (!isLiteral(node)) {
    return false
  }

  if (node.regex && typeof node.regex.flags === 'string') {
    return node.regex.flags.includes('g')
  }

  if (node.raw && typeof node.raw === 'string') {
    const regexLiteralMatch = node.raw.match(/^\/(.*)\/([gimsuvy]*)$/)
    if (regexLiteralMatch && regexLiteralMatch[2]) {
      return regexLiteralMatch[2].includes('g')
    }
  }

  return false
}

function isStringMatchCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const {callee} = node

  if (!isMemberExpression(callee)) {
    return false
  }

  const {property} = callee
  if (!isIdentifier(property, 'match')) {
    return false
  }

  // Check if there's at least one argument that is a regex with global flag
  if (!node.arguments || node.arguments.length === 0) {
    return false
  }

  const firstArg = node.arguments[0]
  return isRegExpLiteralWithGlobalFlag(firstArg)
}

export const preferRegexpExecRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isStringMatchCall(node)) {
          return
        }

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
