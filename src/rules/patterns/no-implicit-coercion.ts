import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isBinaryExpression, getNodeSource } from '../../utils/ast-helpers.js'

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  return (node as Record<string, unknown>).type === 'UnaryExpression'
}

function isLiteral(node: unknown, value?: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  if (n.type !== 'Literal') {
    return false
  }
  return value === undefined || n.value === value
}

function isStringConcatCoercion(node: unknown): { operand: unknown } | null {
  if (!isBinaryExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const operator = n.operator as string | undefined

  if (operator !== '+') {
    return null
  }

  const left = n.left as unknown
  const right = n.right as unknown

  if (isLiteral(left, '')) {
    return { operand: right }
  }

  if (isLiteral(right, '')) {
    return { operand: left }
  }

  return null
}

function isNumberCoercion(node: unknown): { operand: unknown } | null {
  if (!isUnaryExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const operator = n.operator as string | undefined

  if (operator !== '+') {
    return null
  }

  const argument = n.argument as unknown

  if (isLiteral(argument, 0) || isLiteral(argument, 1)) {
    return null
  }

  return { operand: argument }
}

function isBooleanCoercion(node: unknown): { operand: unknown; isDouble: boolean } | null {
  if (!isUnaryExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const operator = n.operator as string | undefined

  if (operator !== '!') {
    return null
  }

  const argument = n.argument as unknown

  if (!isUnaryExpression(argument)) {
    return { operand: argument, isDouble: false }
  }

  const innerArg = argument as Record<string, unknown>
  const innerOp = innerArg.operator as string | undefined

  if (innerOp !== '!') {
    return { operand: argument, isDouble: false }
  }

  return { operand: innerArg.argument, isDouble: true }
}

export const noImplicitCoercionRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow implicit type coercion. Use explicit conversion functions like Number(), String(), and Boolean() instead of shorthand patterns like +x, x + "", and !!x for better readability.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-implicit-coercion',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const range = n.range as [number, number] | undefined
        const location = extractLocation(node)

        const numberCoercion = isNumberCoercion(node)
        if (numberCoercion) {
          const operandSource = getNodeSource(context, numberCoercion.operand)
          context.report({
            message:
              'Avoid implicit number coercion with +x. Use Number(x) for explicit and readable conversion.',
            loc: location,
            fix: range ? { range, text: `Number(${operandSource})` } : undefined,
          })
          return
        }

        const booleanCoercion = isBooleanCoercion(node)
        if (booleanCoercion) {
          const operandSource = getNodeSource(context, booleanCoercion.operand)
          if (booleanCoercion.isDouble) {
            context.report({
              message:
                'Avoid implicit boolean coercion with !!x. Use Boolean(x) for explicit and readable conversion.',
              loc: location,
              fix: range ? { range, text: `Boolean(${operandSource})` } : undefined,
            })
          }
        }
      },

      BinaryExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const range = n.range as [number, number] | undefined
        const location = extractLocation(node)

        const stringCoercion = isStringConcatCoercion(node)
        if (stringCoercion) {
          const operandSource = getNodeSource(context, stringCoercion.operand)
          context.report({
            message:
              'Avoid implicit string coercion with x + "". Use String(x) for explicit and readable conversion.',
            loc: location,
            fix: range ? { range, text: `String(${operandSource})` } : undefined,
          })
        }
      },
    }
  },
}

export default noImplicitCoercionRule
