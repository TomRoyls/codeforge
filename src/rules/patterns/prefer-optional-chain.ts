import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression, isIdentifier, isLogicalExpression, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function isComputedMemberExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return false
  return n.computed === true
}

function getMemberExpressionObject(node: unknown): unknown {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return null
  return n.object
}

function getMemberExpressionProperty(node: unknown): unknown {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return null
  return n.property
}

function isOptionalChain(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'ChainExpression' || n.optional === true
}

function getIdentifierName(node: unknown): null | string {
  const n = toASTNode(node)
  if (n?.type !== 'Identifier') return null
  return typeof n.name === 'string' ? n.name : null
}

function isNullCheck(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'BinaryExpression') {
    if (n.operator !== '!=' && n.operator !== '!==') {
      return false
    }

    const right = toASTNode(n.right)
    return (
      right?.type === 'Literal' &&
      (right.value === null || right.raw === 'null' || right.raw === 'undefined')
    )
  }

  return false
}

function getNullCheckIdentifier(node: unknown): null | string {
  const n = toASTNode(node)
  const left = toASTNode(n?.left)
  if (isIdentifier(left)) {
    return getIdentifierName(left)
  }

  return null
}

function nodesMatchIdentifier(left: unknown, rightObject: unknown): boolean {
  if (!left || !rightObject) {
    return false
  }

  if (isIdentifier(left) && isIdentifier(rightObject)) {
    return getIdentifierName(left) === getIdentifierName(rightObject)
  }

  return false
}

export const preferOptionalChainRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = toASTNode(node)
        if (!n) return

        if (n.operator !== '&&') return

        const {left} = n
        const {right} = n

        if (!left || !right) {
          return
        }

        if (!isMemberExpression(right)) {
          return
        }

        if (isComputedMemberExpression(right)) {
          return
        }

        const rightObject = getMemberExpressionObject(right)

        if (!rightObject) {
          return
        }

        if (isOptionalChain(rightObject)) {
          return
        }

        if (isIdentifier(left) && nodesMatchIdentifier(left, rightObject)) {
          const location = extractLocation(node)
          const identifier = getIdentifierName(left)
          const property = getMemberExpressionProperty(right)
          const propertyName = isIdentifier(property) ? getIdentifierName(property) : null

          if (identifier && propertyName) {
            context.report({
              loc: location,
              message: 'Prefer optional chaining (?.) instead of chained && checks.',
            })
          }
        }

        if (isNullCheck(left)) {
          const leftIdentifier = getNullCheckIdentifier(left)
          if (leftIdentifier && isIdentifier(rightObject)) {
            const rightIdentifier = getIdentifierName(rightObject)
            if (leftIdentifier === rightIdentifier) {
              const location = extractLocation(node)
              context.report({
                loc: location,
                message: 'Prefer optional chaining (?.) instead of chained && checks.',
              })
            }
          }
        }
      },

      LogicalExpression(node: unknown): void {
        if (!isLogicalExpression(node)) {
          return
        }

        const n = toASTNode(node)
        if (!n) return

        if (n.operator !== '&&') return

        const {left} = n
        const {right} = n

        if (!left || !right) {
          return
        }

        if (!isMemberExpression(right)) {
          return
        }

        if (isComputedMemberExpression(right)) {
          return
        }

        const rightObject = getMemberExpressionObject(right)

        if (!rightObject) {
          return
        }

        if (isOptionalChain(rightObject)) {
          return
        }

        if (isIdentifier(left) && nodesMatchIdentifier(left, rightObject)) {
          const location = extractLocation(node)
          const identifier = getIdentifierName(left)
          const property = getMemberExpressionProperty(right)
          const propertyName = isIdentifier(property) ? getIdentifierName(property) : null

          if (identifier && propertyName) {
            context.report({
              loc: location,
              message: 'Prefer optional chaining (?.) instead of chained && checks.',
            })
          }
        }

        if (isNullCheck(left)) {
          const leftIdentifier = getNullCheckIdentifier(left)
          if (leftIdentifier && isIdentifier(rightObject)) {
            const rightIdentifier = getIdentifierName(rightObject)
            if (leftIdentifier === rightIdentifier) {
              const location = extractLocation(node)
              context.report({
                loc: location,
                message: 'Prefer optional chaining (?.) instead of chained && checks.',
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer optional chaining (?.) instead of chained && checks for safer and more concise property access.',
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
