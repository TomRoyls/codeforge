import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isIdentifier, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function getMemberProperty(node: unknown): null | string {
  if (!isMemberExpression(node)) return null
  const n = toASTNode(node)
  const property = toASTNode(n?.property)
  if (!property || !isIdentifier(n?.property)) return null
  return property.name ?? null
}

function isMathPowCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const n = toASTNode(node)
  if (!n) return false
  const {callee} = n
  if (!isMemberExpression(callee)) return false
  const calleeNode = toASTNode(callee)
  const obj = calleeNode?.object
  if (!isIdentifier(obj)) return false
  if (toASTNode(obj)?.name !== 'Math') return false
  return getMemberProperty(callee) === 'pow'
}

export const preferExponentiationOperatorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    function getNodeSource(node: unknown): string {
      const n = toASTNode(node)
      if (!n?.range) return ''
      return context.getSource().slice(n.range[0], n.range[1])
    }

    return {
      CallExpression(node: unknown): void {
        if (!isMathPowCall(node)) return

        const n = toASTNode(node)
        if (!n) return
        const args = n.arguments
        const location = extractLocation(node)

        if (!Array.isArray(args) || args.length < 2) {
          context.report({
            loc: location,
            message: 'Use the ** operator instead of Math.pow() for exponentiation.',
          })
          return
        }

        const base = getNodeSource(args[0])
        const exponent = getNodeSource(args[1])
        const fixed = `${base} ** ${exponent}`

        context.report({
          fix: {
            range: n.range!,
            text: fixed,
          },
          loc: location,
          message: 'Use the ** operator instead of Math.pow() for exponentiation.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer the exponentiation operator (**) over Math.pow() for better readability. The ** operator is more concise and clearer for exponentiation operations.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-exponentiation-operator',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferExponentiationOperatorRule
