import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

/**
 * Get a string representation of a node for comparison purposes.
 * This handles identifiers, literals, and simple expressions.
 */
function getNodeKey(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  // Handle identifiers by name
  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return `Identifier:${n.name}`
  }

  // Handle literals by value
  if (n.type === 'Literal') {
    return `Literal:${String(n.value)}`
  }

  // Handle BooleanLiteral (SWC-specific)
  if (n.type === 'BooleanLiteral') {
    return `BooleanLiteral:${n.value}`
  }

  // Handle NumericLiteral (SWC-specific)
  if (n.type === 'NumericLiteral') {
    return `NumericLiteral:${n.value}`
  }

  // Handle StringLiteral (SWC-specific)
  if (n.type === 'StringLiteral' && typeof n.value === 'string') {
    return `StringLiteral:${n.value}`
  }

  // Handle member expressions: obj.prop
  if (n.type === 'MemberExpression') {
    const objectKey = getNodeKey(n.object)
    const propertyKey = getNodeKey(n.property)
    if (objectKey && propertyKey) {
      return `MemberExpression:${objectKey}.${propertyKey}`
    }
  }

  // Handle call expressions: func()
  if (n.type === 'CallExpression') {
    const calleeKey = getNodeKey(n.callee)
    if (calleeKey) {
      return `CallExpression:${calleeKey}()`
    }
  }

  // For complex expressions, we could recursively serialize,
  // but for simplicity we return null to indicate non-comparable
  return null
}

/**
 * Check if two AST nodes represent the same expression.
 */
function areNodesEqual(left: unknown, right: unknown): boolean {
  const leftKey = getNodeKey(left)
  const rightKey = getNodeKey(right)
  return leftKey !== null && leftKey === rightKey
}

/**
 * Check if a node is a LogicalExpression with && or || operator.
 */
function isLogicalExpression(node: unknown): node is Record<string, unknown> {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'LogicalExpression' && (n.operator === '&&' || n.operator === '||')
}

export const noSameSideConditionsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow conditions where both sides of a logical operator are the same. Expressions like `a && a` or `a || a` are redundant.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-same-side-conditions',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    const checkLogicalExpression = (node: unknown): void => {
      if (!isLogicalExpression(node)) {
        return
      }

      const n = node as Record<string, unknown>
      const left = n.left
      const right = n.right
      const operator = n.operator as string

      if (areNodesEqual(left, right)) {
        const location = extractLocation(node)
        const operatorName = operator === '&&' ? 'AND' : 'OR'

        context.report({
          message: `Both sides of the ${operatorName} operator are identical. This expression is redundant.`,
          loc: location,
        })
      }
    }

    return {
      LogicalExpression: checkLogicalExpression,
    }
  },
}

export default noSameSideConditionsRule
