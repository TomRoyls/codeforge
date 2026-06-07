import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getNodeKey(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

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

  // Handle NumericLiteral (SWC-specific / adapter-converted)
  if (n.type === 'Literal' && typeof n.value === 'number') {
    return `NumericLiteral:${n.value}`
  }

  // Handle StringLiteral (SWC-specific / adapter-converted)
  if (n.type === 'Literal' && typeof n.value === 'string') {
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

function isLogicalExpression(node: unknown): node is Record<string, unknown> {
  const n = toASTNode(node)
  return n?.type === 'LogicalExpression' && (n.operator === '&&' || n.operator === '||')
}

export const noSameSideConditionsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const checkLogicalExpression = (node: unknown): void => {
      if (!isLogicalExpression(node)) {
        return
      }

      const n = toASTNode(node)!
      const {left} = n
      const {right} = n
      const operator = n.operator as string

      const leftKey = getNodeKey(left)
      const rightKey = getNodeKey(right)
      if (leftKey !== null && leftKey === rightKey) {
        const location = extractLocation(node)
        const operatorName = operator === '&&' ? 'AND' : 'OR'

        context.report({
          loc: location,
          message: `Both sides of the ${operatorName} operator are identical. This expression is redundant.`,
        })
      }
    }

    return {
      LogicalExpression: checkLogicalExpression,
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow conditions where both sides of a logical operator are the same. Expressions like `a && a` or `a || a` are redundant.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-same-side-conditions',
    },
    fixable: false,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noSameSideConditionsRule
