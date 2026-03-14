import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  isIdentifier,
} from '../../utils/ast-helpers.js'

function getMemberProperty(node: unknown): string | null {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const property = n.property as Record<string, unknown> | undefined

  if (!property || !isIdentifier(property)) {
    return null
  }

  return (property as Record<string, unknown>).name as string
}

function isMathPowCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!isMemberExpression(callee)) {
    return false
  }

  const calleeObj = callee as Record<string, unknown>
  const object = calleeObj.object as unknown

  if (!isIdentifier(object)) {
    return false
  }

  const objName = (object as Record<string, unknown>).name as string
  if (objName !== 'Math') {
    return false
  }

  const methodName = getMemberProperty(callee)
  return methodName === 'pow'
}

export const preferExponentiationOperatorRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer the exponentiation operator (**) over Math.pow() for better readability. The ** operator is more concise and clearer for exponentiation operations.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-exponentiation-operator',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    function getNodeSource(node: unknown): string {
      if (!node || typeof node !== 'object') {
        return ''
      }
      const n = node as Record<string, unknown>
      const range = n.range as [number, number] | undefined
      if (!range) {
        return ''
      }
      const source = context.getSource()
      return source.slice(range[0], range[1])
    }

    return {
      CallExpression(node: unknown): void {
        if (!isMathPowCall(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const args = n.arguments as unknown[]
        const location = extractLocation(node)

        if (!args || args.length < 2) {
          context.report({
            message: 'Use the ** operator instead of Math.pow() for exponentiation.',
            loc: location,
          })
          return
        }

        const base = getNodeSource(args[0])
        const exponent = getNodeSource(args[1])
        const fixed = `${base} ** ${exponent}`

        context.report({
          message: 'Use the ** operator instead of Math.pow() for exponentiation.',
          loc: location,
          fix: {
            range: n.range as [number, number],
            text: fixed,
          },
        })
      },
    }
  },
}

export default preferExponentiationOperatorRule
