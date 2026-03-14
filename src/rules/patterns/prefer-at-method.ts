import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getNodeSource } from '../../utils/ast-helpers.js'

interface NodeLike {
  type: string
  [key: string]: unknown
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

  const property = node.property
  if (!isIdentifier(property) || (property as NodeLike).name !== 'length') {
    return false
  }

  const object = node.object
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
): { arrayName: string; negativeIndex: number; indexNode: NodeLike } | null {
  if (!isMemberExpression(node)) {
    return null
  }

  // Must be computed access: arr[...]
  if (!node.computed) {
    return null
  }

  const object = node.object
  const property = node.property

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

  const left = (property as NodeLike).left
  const right = (property as NodeLike).right

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
    negativeIndex: -indexValue,
    indexNode: right,
  }
}

export const preferAtMethodRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer .at() method for negative indexing. Use arr.at(-1) instead of arr[arr.length - 1] for better readability.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-at-method',
    },
    schema: [],
    fixable: 'code',
  },

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
          message: `Prefer .at(${negativeIndex}) over ${objectSource}[${objectSource}.length - ${indexSource}] for more readable negative indexing.`,
          loc: location,
          fix: {
            range: (nodeObj.range as readonly [number, number]) ?? [0, 0],
            text: `${objectSource}.at(${negativeIndex})`,
          },
        })
      },
    }
  },
}

export default preferAtMethodRule
