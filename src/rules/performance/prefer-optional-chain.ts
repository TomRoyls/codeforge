/**
 * @file Enforce using optional chain operator instead of chained && checks
 * @module rules/performance/prefer-optional-chain
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeText, isCallExpression, toASTNode } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

interface OptionalChainMatch {
  readonly leftText: string
  readonly location: SourceLocation
  readonly rightText: string
  readonly suggestion: string
}

function isPropertyAccessExpression(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'MemberExpression' && n.computed !== true
}

function getCallExpressionCallee(node: unknown): unknown {
  return toASTNode(node)?.callee ?? null
}

function getPropertyAccessObject(node: unknown): unknown {
  return toASTNode(node)?.object ?? null
}

function getPropertyName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  const prop = toASTNode(n.property)
  if (prop?.type === 'Identifier' && typeof prop.name === 'string') {
    return prop.name
  }

  return null
}

function nodesMatch(node1: unknown, node2: unknown, source: string): boolean {
  if (!node1 || !node2) {
    return false
  }

  const text1 = getNodeText(node1, source)
  const text2 = getNodeText(node2, source)

  if (text1 && text2) {
    return text1 === text2
  }

  const n1 = toASTNode(node1)
  const n2 = toASTNode(node2)

  if (!n1 || !n2 || n1.type !== n2.type) {
    return false
  }

  if (n1.type === 'Identifier') {
    return n1.name === n2.name
  }

  if (n1.type === 'MemberExpression') {
    return nodesMatch(n1.object, n2.object, source) && nodesMatch(n1.property, n2.property, source)
  }

  return false
}

function checkOptionalChainPattern(node: unknown, source: string): null | OptionalChainMatch {
  const n = toASTNode(node)
  if (!n || (n.type !== 'LogicalExpression' && n.type !== 'BinaryExpression')) {
    return null
  }

  if (n.operator !== '&&') {
    return null
  }

  const {left} = n
  const {right} = n

  if (!left || !right) {
    return null
  }

  const leftText = getNodeText(left, source)
  const rightText = getNodeText(right, source)

  if (!leftText || !rightText) {
    return null
  }

  if (isPropertyAccessExpression(right)) {
    const rightObject = getPropertyAccessObject(right)

    if (rightObject && nodesMatch(left, rightObject, source)) {
      const propertyName = getPropertyName(right)
      if (propertyName) {
        return {
          leftText,
          location: extractLocation(node),
          rightText,
          suggestion: `${leftText}?.${propertyName}`,
        }
      }
    }
  }

  if (isCallExpression(right)) {
    const callee = getCallExpressionCallee(right)

    if (callee && isPropertyAccessExpression(callee)) {
      const calleeObject = getPropertyAccessObject(callee)

      if (calleeObject && nodesMatch(left, calleeObject, source)) {
        const methodName = getPropertyName(callee)
        if (methodName) {
          const argsMatch = rightText.match(/\(.*\)$/)
          const args = argsMatch ? argsMatch[0] : '()'
          return {
            leftText,
            location: extractLocation(node),
            rightText,
            suggestion: `${leftText}?.${methodName}${args}`,
          }
        }
      }
    }
  }

  return null
}

export const preferOptionalChainRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const source = context.getSource()
        const match = checkOptionalChainPattern(node, source)

        if (match) {
          context.report({
            loc: match.location,
            message: `Prefer optional chaining (${match.suggestion}) instead of ${match.leftText} && ${match.rightText}. ${RULE_SUGGESTIONS.preferOptionalChain}`,
            node,
            suggest: [
              {
                desc: `Use optional chaining: ${match.suggestion}`,
                fix: {
                  range: [0, source.length] as const,
                  text: match.suggestion,
                },
                message: 'Use optional chaining operator',
              },
            ],
          })
        }
      },

      LogicalExpression(node: unknown): void {
        const source = context.getSource()
        const match = checkOptionalChainPattern(node, source)

        if (match) {
          context.report({
            loc: match.location,
            message: `Prefer optional chaining (${match.suggestion}) instead of ${match.leftText} && ${match.rightText}. ${RULE_SUGGESTIONS.preferOptionalChain}`,
            node,
            suggest: [
              {
                desc: `Use optional chaining: ${match.suggestion}`,
                fix: {
                  range: [0, source.length] as const,
                  text: match.suggestion,
                },
                message: 'Use optional chaining operator',
              },
            ],
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Enforce using optional chain operator (?.) instead of chained && checks for property access and method calls. Optional chaining is more concise and readable.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-optional-chain',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferOptionalChainRule
