import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isBooleanLiteral(node: unknown, value?: boolean): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  if (n.type === 'BooleanLiteral') {
    return value === undefined || n.value === value
  }
  return false
}

function isNumericLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'NumericLiteral'
}

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function isConstantCondition(testNode: unknown): { isConstant: boolean; description: string } {
  if (!testNode || typeof testNode !== 'object') {
    return { isConstant: false, description: '' }
  }

  const t = testNode as Record<string, unknown>

  // Check for boolean literals: true, false
  if (isBooleanLiteral(testNode)) {
    const val = t.value as boolean
    return { isConstant: true, description: `Unexpected constant condition: always ${val}` }
  }

  // Check for Literals with boolean values
  if (isLiteral(testNode)) {
    const value = t.value
    if (typeof value === 'boolean') {
      return { isConstant: true, description: `Unexpected constant condition: always ${value}` }
    }
    if (value === null) {
      return { isConstant: true, description: 'Unexpected constant condition: always falsy (null)' }
    }
    if (typeof value === 'number') {
      // Numbers 0 is falsy, non-zero numbers are truthy
      const isTruthy = value !== 0
      return {
        isConstant: true,
        description: `Unexpected constant condition: always ${isTruthy ? 'truthy' : 'falsy'} (${value})`,
      }
    }
    if (typeof value === 'string') {
      // Empty strings are falsy, non-empty are truthy
      const isTruthy = value !== ''
      return {
        isConstant: true,
        description: `Unexpected constant condition: always ${isTruthy ? 'truthy' : 'falsy'} (string)`,
      }
    }
  }

  // Check for NumericLiteral (SWC-specific)
  if (isNumericLiteral(testNode)) {
    const value = t.value as number
    const isTruthy = value !== 0
    return {
      isConstant: true,
      description: `Unexpected constant condition: always ${isTruthy ? 'truthy' : 'falsy'} (${value})`,
    }
  }

  return { isConstant: false, description: '' }
}

function getTestNode(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  return n.test
}

export const noConstantConditionRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow constant conditions in control flow statements. Conditions that always evaluate to the same value are likely mistakes.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-constant-condition',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    const checkNode = (node: unknown): void => {
      const testNode = getTestNode(node)
      const result = isConstantCondition(testNode)

      if (result.isConstant) {
        const location = extractLocation(node)
        context.report({
          message: result.description,
          loc: location,
        })
      }
    }

    return {
      IfStatement(node: unknown): void {
        checkNode(node)
      },

      WhileStatement(node: unknown): void {
        checkNode(node)
      },

      ForStatement(node: unknown): void {
        checkNode(node)
      },

      DoWhileStatement(node: unknown): void {
        checkNode(node)
      },
    }
  },
}

export default noConstantConditionRule
