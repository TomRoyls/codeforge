import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
  return (n.type === 'Literal' || n.type === 'NumericLiteral') && typeof n.value === 'number'
}

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function isConstantCondition(testNode: unknown): { description: string; isConstant: boolean; } {
  if (!testNode || typeof testNode !== 'object') {
    return { description: '', isConstant: false }
  }

  const t = testNode as Record<string, unknown>

  // Check for boolean literals: true, false
  if (isBooleanLiteral(testNode)) {
    const val = t.value as boolean
    return { description: `Unexpected constant condition: always ${val}`, isConstant: true }
  }

  // Check for Literals with boolean values
  if (isLiteral(testNode)) {
    const {value} = t
    if (typeof value === 'boolean') {
      return { description: `Unexpected constant condition: always ${value}`, isConstant: true }
    }

    if (value === null) {
      return { description: 'Unexpected constant condition: always falsy (null)', isConstant: true }
    }

    if (typeof value === 'number') {
      // Numbers 0 is falsy, non-zero numbers are truthy
      const isTruthy = value !== 0
      return {
        description: `Unexpected constant condition: always ${isTruthy ? 'truthy' : 'falsy'} (${value})`,
        isConstant: true,
      }
    }

    if (typeof value === 'string') {
      // Empty strings are falsy, non-empty are truthy
      const isTruthy = value !== ''
      return {
        description: `Unexpected constant condition: always ${isTruthy ? 'truthy' : 'falsy'} (string)`,
        isConstant: true,
      }
    }
  }

  if (t.type === 'RegExpLiteral') {
    return {
      description: 'Unexpected constant condition: always truthy (regexp)',
      isConstant: true,
    }
  }

  // Check for NumericLiteral (SWC-specific)
  if (isNumericLiteral(testNode)) {
    const value = t.value as number
    const isTruthy = value !== 0
    return {
      description: `Unexpected constant condition: always ${isTruthy ? 'truthy' : 'falsy'} (${value})`,
      isConstant: true,
    }
  }

  return { description: '', isConstant: false }
}

function getTestNode(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  return n.test
}

export const noConstantConditionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const checkNode = (node: unknown): void => {
      const testNode = getTestNode(node)
      const result = isConstantCondition(testNode)

      if (result.isConstant) {
        const location = extractLocation(node)
        context.report({
          loc: location,
          message: result.description,
        })
      }
    }

    return {
      DoWhileStatement(node: unknown): void {
        checkNode(node)
      },

      ForStatement(node: unknown): void {
        checkNode(node)
      },

      IfStatement(node: unknown): void {
        checkNode(node)
      },

      WhileStatement(node: unknown): void {
        checkNode(node)
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow constant conditions in control flow statements. Conditions that always evaluate to the same value are likely mistakes.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-constant-condition',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noConstantConditionRule
