import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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

function isInvalidThrowArgument(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return true
  }

  const n = node as Record<string, unknown>
  const type = n.type as string | undefined

  if (!type) {
    return false
  }

  if (VALID_THROW_TYPES.has(type)) {
    return false
  }

  if (INVALID_LITERAL_TYPES.has(type)) {
    return true
  }

  if (typeof n.value !== 'undefined' && type.includes('Literal')) {
    return true
  }

  return false
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

        const n = node as Record<string, unknown>
        const argument = n.argument as unknown

        if (argument && isInvalidThrowArgument(argument)) {
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
