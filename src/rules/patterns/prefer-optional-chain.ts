import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isLogicalExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'LogicalExpression'
}

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function isMemberExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'MemberExpression'
}

function isComputedMemberExpression(node: unknown): boolean {
  if (!isMemberExpression(node)) {
    return false
  }
  const n = node as Record<string, unknown>
  return n.computed === true
}

function getMemberExpressionObject(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  return n.object
}

function getMemberExpressionProperty(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  return n.property
}

function isOptionalChain(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'ChainExpression' || n.optional === true
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function getIdentifierName(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  return typeof n.name === 'string' ? n.name : null
}

function isNullCheck(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type === 'BinaryExpression') {
    const operator = n.operator as string
    if (operator !== '!=' && operator !== '!==') {
      return false
    }

    const right = n.right

    if (!right || typeof right !== 'object') {
      return false
    }

    const rightNode = right as Record<string, unknown>
    return (
      rightNode.type === 'Literal' &&
      (rightNode.value === null || rightNode.raw === 'null' || rightNode.raw === 'undefined')
    )
  }

  return false
}

function getNullCheckIdentifier(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  const left = n.left

  if (!left || typeof left !== 'object') {
    return null
  }

  const leftNode = left as Record<string, unknown>
  if (isIdentifier(leftNode)) {
    return getIdentifierName(leftNode)
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer optional chaining (?.) instead of chained && checks for safer and more concise property access.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-optional-chain',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      LogicalExpression(node: unknown): void {
        if (!isLogicalExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (operator !== '&&') {
          return
        }

        const left = n.left
        const right = n.right

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
              message: 'Prefer optional chaining (?.) instead of chained && checks.',
              loc: location,
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
                message: 'Prefer optional chaining (?.) instead of chained && checks.',
                loc: location,
              })
            }
          }
        }
      },

      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (operator !== '&&') {
          return
        }

        const left = n.left
        const right = n.right

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
              message: 'Prefer optional chaining (?.) instead of chained && checks.',
              loc: location,
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
                message: 'Prefer optional chaining (?.) instead of chained && checks.',
                loc: location,
              })
            }
          }
        }
      },
    }
  },
}

export default preferOptionalChainRule
