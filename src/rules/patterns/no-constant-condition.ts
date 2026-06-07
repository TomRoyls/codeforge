import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isConstantCondition(testNode: unknown): { description: string; isConstant: boolean } {
  const t = toASTNode(testNode)
  if (!t) return { description: '', isConstant: false }

  // Check for boolean literals: true, false
  if (t.type === 'BooleanLiteral') {
    const val = t.value
    return { description: `Unexpected constant condition: always ${val}`, isConstant: true }
  }

  // Check for Literals with boolean values
  if (t.type === 'Literal') {
    const { value } = t
    if (typeof value === 'boolean') {
      return { description: `Unexpected constant condition: always ${value}`, isConstant: true }
    }

    if (value === null) {
      return { description: 'Unexpected constant condition: always falsy (null)', isConstant: true }
    }

    if (typeof value === 'number') {
      const isTruthy = value !== 0
      return {
        description: `Unexpected constant condition: always ${isTruthy ? 'truthy' : 'falsy'} (${value})`,
        isConstant: true,
      }
    }

    if (typeof value === 'string') {
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

  return { description: '', isConstant: false }
}

export const noConstantConditionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const checkNode = (node: unknown): void => {
      const testNode = toASTNode(node)?.test
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
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const test = n.test
        const result = isConstantCondition(test)
        if (result.isConstant) {
          context.report({
            loc: extractLocation(n),
            message: result.description,
          })
        }
      },

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
    fixable: false,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noConstantConditionRule
