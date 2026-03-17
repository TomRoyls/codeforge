import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isForStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ForStatement'
}

function isUpdateExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'UpdateExpression'
}

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function getIdentifierName(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null
  const n = node as Record<string, unknown>
  if (n.type === 'Identifier' && typeof n.name === 'string') return n.name
  return null
}

export const forDirectionRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Enforce for loop update clause to move the counter in the right direction.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      ForStatement(node: unknown): void {
        if (!isForStatement(node)) return
        const n = node as Record<string, unknown>
        
        const test = n.test
        const update = n.update
        
        if (!test || !update) return
        if (!isBinaryExpression(test)) return
        if (!isUpdateExpression(update)) return
        
        const testExpr = test as Record<string, unknown>
        const updateExpr = update as Record<string, unknown>
        
        const counterName = getIdentifierName(updateExpr.argument)
        if (!counterName) return
        
        const leftName = getIdentifierName(testExpr.left)
        const rightName = getIdentifierName(testExpr.right)
        
        if (leftName !== counterName && rightName !== counterName) return
        
        const operator = testExpr.operator as string
        const isIncrement = updateExpr.operator === '++'
        const isDecrement = updateExpr.operator === '--'
        
        let isValid = true
        if (rightName === counterName) {
          if (isIncrement && (operator === '<' || operator === '<=')) isValid = false
          if (isDecrement && (operator === '>' || operator === '>=')) isValid = false
        } else {
          if (isIncrement && (operator === '>' || operator === '>=')) isValid = false
          if (isDecrement && (operator === '<' || operator === '<=')) isValid = false
        }
        
        if (!isValid) {
          context.report({
            message: 'The update clause in this loop moves the variable in the wrong direction.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default forDirectionRule
