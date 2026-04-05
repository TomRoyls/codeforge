import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'

const VALID_THROW_TYPES = new Set([
  'NewExpression',
  'Identifier',
  'CallExpression',
  'MemberExpression',
  'ConditionalExpression',
  'LogicalExpression',
  'BinaryExpression',
  'UnaryExpression',
  'AwaitExpression',
  'SequenceExpression',
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
])

const INVALID_LITERAL_TYPES = new Set([
  'StringLiteral',
  'NumericLiteral',
  'BooleanLiteral',
  'NullLiteral',
  'BigIntLiteral',
  'RegExpLiteral',
  'TemplateLiteral',
  'ObjectExpression',
  'ArrayExpression',
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
  if (typeof node !== 'object' || node === null) {
    return true
  }

  const n = node as Record<string, unknown>

  if (n.argument !== undefined && n.argument !== null) {
    const argument = n.argument as Record<string, unknown>
    const type = argument.type as string | undefined
    if (!type) return false
    if (VALID_THROW_TYPES.has(type)) return false
    if (INVALID_LITERAL_TYPES.has(type)) return true
    if (typeof argument.value !== 'undefined' && type.includes('Literal')) return true
    return false
  }

  const text = typeof n.text === 'string' ? n.text : ''
  return isInvalidThrowFromText(text)
}

export const noThrowLiteralRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow throwing literals or non-Error objects. Only Error objects and subclasses should be thrown for proper stack traces and error handling.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-throw-literal',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      ThrowStatement(node: unknown): void {
        if (typeof node !== 'object' || node === null) {
          return
        }

        if (isInvalidThrowArgument(node)) {
          const location = extractLocation(node)

          context.report({
            message: 'Expected an error object to be thrown.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noThrowLiteralRule
