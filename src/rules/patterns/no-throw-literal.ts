import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const VALID_THROW_TYPES = new Set([
  'AwaitExpression',
  'BinaryExpression',
  'CallExpression',
  'ConditionalExpression',
  'Identifier',
  'LogicalExpression',
  'MemberExpression',
  'NewExpression',
  'ParenthesizedExpression',
  'SequenceExpression',
  'TSAsExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'UnaryExpression',
])

const INVALID_LITERAL_TYPES = new Set([
  'ArrayExpression',
  'BigIntLiteral',
  'BooleanLiteral',
  'NullLiteral',
  'NumericLiteral',
  'ObjectExpression',
  'RegExpLiteral',
  'StringLiteral',
  'TemplateLiteral',
  'ThisExpression',
])

function getTextFromThrowStatement(text: string): string {
  let thrown = text.replace(/^throw\s+/, '').trim()
  if (thrown.endsWith(';')) thrown = thrown.slice(0, -1).trim()
  return thrown
}

function isInvalidThrowFromText(text: string): boolean {
  const thrown = getTextFromThrowStatement(text)
  if (!thrown) return false

  if (thrown.startsWith('new ')) return false
  if (
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(thrown) &&
    thrown !== 'null' &&
    thrown !== 'undefined' &&
    thrown !== 'true' &&
    thrown !== 'false'
  )
    return false
  if (thrown.startsWith('(')) return false
  if (/^(?:await|void|delete|typeof|!|~|\+\+|--)/.test(thrown)) return false
  if (
    thrown.includes('&&') ||
    thrown.includes('||') ||
    thrown.includes('??') ||
    thrown.includes('?') ||
    thrown.includes('.')
  )
    return false

  return true
}

function isInvalidThrowArgument(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return true

  if (n.argument !== undefined && n.argument !== null) {
    const argument = toASTNode(n.argument)!
    const type = argument.type as string | undefined
    if (!type) return false
    if (VALID_THROW_TYPES.has(type)) return false
    if (INVALID_LITERAL_TYPES.has(type)) return true
    if (argument.value !== undefined && type.includes('Literal')) return true
    return false
  }

  const text = typeof n.text === 'string' ? n.text : ''
  return isInvalidThrowFromText(text)
}

export const noThrowLiteralRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ThrowStatement(node: unknown): void {
        if (typeof node !== 'object' || node === null) {
          return
        }

        if (isInvalidThrowArgument(node)) {
          const location = extractLocation(node)

          context.report({
            loc: location,
            message: 'Expected an error object to be thrown.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow throwing literals or non-Error objects. Only Error objects and subclasses should be thrown for proper stack traces and error handling.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-throw-literal',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noThrowLiteralRule
