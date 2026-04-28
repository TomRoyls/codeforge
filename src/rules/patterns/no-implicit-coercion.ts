import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeSource, isBinaryExpression, isUnaryExpression, toASTNode } from '../../utils/ast-helpers.js'

function isLiteral(node: unknown, value?: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'Literal') return false
  return value === undefined || n.value === value
}

function isStringConcatCoercion(node: unknown): null | { operand: unknown } {
  if (!isBinaryExpression(node)) return null
  const n = toASTNode(node)
  if (!n || n.operator !== '+') return null
  const { left, right } = n
  if (isLiteral(left, '')) return { operand: right }
  if (isLiteral(right, '')) return { operand: left }
  return null
}

function isNumberCoercion(node: unknown): null | { operand: unknown } {
  if (!isUnaryExpression(node)) return null
  const n = toASTNode(node)
  if (!n || n.operator !== '+') return null
  const { argument } = n
  if (isLiteral(argument, 0) || isLiteral(argument, 1)) return null
  return { operand: argument }
}

function isBooleanCoercion(node: unknown): null | { isDouble: boolean; operand: unknown } {
  if (!isUnaryExpression(node)) return null
  const n = toASTNode(node)
  if (!n || n.operator !== '!') return null
  const { argument } = n
  if (!isUnaryExpression(argument)) return { isDouble: false, operand: argument }
  const inner = toASTNode(argument)
  if (inner?.operator !== '!') return { isDouble: false, operand: argument }
  return { isDouble: true, operand: inner.argument }
}

export const noImplicitCoercionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const {range} = n
        const location = extractLocation(node)

        const stringCoercion = isStringConcatCoercion(node)
        if (stringCoercion) {
          const operandSource = getNodeSource(context, stringCoercion.operand)
          context.report({
            fix: range ? { range, text: `String(${operandSource})` } : undefined,
            loc: location,
            message:
              'Avoid implicit string coercion with x + "". Use String(x) for explicit and readable conversion.',
          })
        }
      },

      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const {range} = n
        const location = extractLocation(node)

        const numberCoercion = isNumberCoercion(node)
        if (numberCoercion) {
          const operandSource = getNodeSource(context, numberCoercion.operand)
          context.report({
            fix: range ? { range, text: `Number(${operandSource})` } : undefined,
            loc: location,
            message:
              'Avoid implicit number coercion with +x. Use Number(x) for explicit and readable conversion.',
          })
          return
        }

        const booleanCoercion = isBooleanCoercion(node)
        if (booleanCoercion) {
          const operandSource = getNodeSource(context, booleanCoercion.operand)
          if (booleanCoercion.isDouble) {
            context.report({
              fix: range ? { range, text: `Boolean(${operandSource})` } : undefined,
              loc: location,
              message:
                'Avoid implicit boolean coercion with !!x. Use Boolean(x) for explicit and readable conversion.',
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow implicit type coercion. Use explicit conversion functions like Number(), String(), and Boolean() instead of shorthand patterns like +x, x + "", and !!x for better readability.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-implicit-coercion',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noImplicitCoercionRule
