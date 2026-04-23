import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeSource } from '../../utils/ast-helpers.js'

interface NodeLike {
  [key: string]: unknown
  type: string
}

function isMemberExpression(node: unknown): node is NodeLike {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as NodeLike).type === 'MemberExpression'
}

function isBinaryExpression(node: unknown): node is NodeLike {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as NodeLike).type === 'BinaryExpression'
}

function isIdentifier(node: unknown): node is NodeLike {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as NodeLike).type === 'Identifier'
}

function isLiteral(node: unknown): node is NodeLike & { value: unknown } {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as NodeLike).type === 'Literal'
}

/**
 * Checks if the node is a `array.length` MemberExpression
 * where the object name matches the expected array name.
 */
function isArrayLengthAccess(node: unknown, expectedArrayName: string): boolean {
  if (!isMemberExpression(node)) {
    return false
  }

  const {property} = node
  if (!isIdentifier(property) || (property as NodeLike).name !== 'length') {
    return false
  }

  const {object} = node
  if (!isIdentifier(object)) {
    return false
  }

  return (object as NodeLike).name === expectedArrayName
}

/**
 * Checks if a computed MemberExpression is of the form `arr[arr.length - n]`
 * where n is a positive number literal.
 * Returns the array name and the negative index if matched, null otherwise.
 */
function getNegativeIndexPattern(
  node: unknown,
): null | { arrayName: string; indexNode: NodeLike; negativeIndex: number; } {
  if (!isMemberExpression(node)) {
    return null
  }

  // Must be computed access: arr[...]
  if (!node.computed) {
    return null
  }

  const {object} = node
  const {property} = node

  if (!isIdentifier(object)) {
    return null
  }

  const arrayName = (object as NodeLike).name as string

  // Property must be a binary expression: array.length - n
  if (!isBinaryExpression(property)) {
    return null
  }

  const operator = (property as NodeLike).operator as string
  if (operator !== '-') {
    return null
  }

  const {left} = (property as NodeLike)
  const {right} = (property as NodeLike)

  // Left side must be array.length
  if (!isArrayLengthAccess(left, arrayName)) {
    return null
  }

  // Right side must be a positive number literal
  if (!isLiteral(right)) {
    return null
  }

  const indexValue = (right as NodeLike & { value: unknown }).value
  if (typeof indexValue !== 'number' || indexValue <= 0 || !Number.isInteger(indexValue)) {
    return null
  }

  return {
    arrayName,
    indexNode: right,
    negativeIndex: -indexValue,
  }
}

export const preferAtMethodRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const match = getNegativeIndexPattern(node)
        if (!match) {
          return
        }

        const location = extractLocation(node)
        const { negativeIndex } = match

        // Get source for the array object and the index for the fix
        const nodeObj = node as NodeLike
        const objectSource = getNodeSource(context, nodeObj.object)
        const indexSource = getNodeSource(context, match.indexNode)

        context.report({
          fix: {
            range: (nodeObj.range as readonly [number, number]) ?? [0, 0],
            text: `${objectSource}.at(${negativeIndex})`,
          },
          loc: location,
          message: `Prefer .at(${negativeIndex}) over ${objectSource}[${objectSource}.length - ${indexSource}] for more readable negative indexing.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer .at() method for negative indexing. Use arr.at(-1) instead of arr[arr.length - 1] for better readability.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-at-method',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferAtMethodRule
