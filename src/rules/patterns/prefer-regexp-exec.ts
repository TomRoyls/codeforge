import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

interface LiteralNode {
  type: 'Literal'
  value: string | null
  raw?: string
  regex?: {
    pattern: string
    flags: string
  }
  loc?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
}

interface CallExpressionNode {
  type: 'CallExpression'
  callee: {
    type: 'MemberExpression'
    object: unknown
    property: {
      type: 'Identifier'
      name: string
    }
    computed: boolean
  }
  arguments: unknown[]
  loc?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
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
  return n.type === 'Literal'
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

  const callee = node.callee

  if (!isMemberExpression(callee)) {
    return false
  }

  const property = callee.property
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer RegExp.exec() or String.matchAll() over String.match() with global flag. Using str.match(/regex/g) can lead to bugs with stateful regex lastIndex, and str.matchAll(regex) or regex.exec(str) in a loop are more explicit.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-regexp-exec',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isStringMatchCall(node)) {
          return
        }

        const location = extractLocation(node)
        context.report({
          message:
            'Prefer using regex.exec(string) or string.matchAll(regex) instead of string.match() with global flag for more predictable behavior.',
          loc: location,
        })
      },
    }
  },
}

export default preferRegexpExecRule
