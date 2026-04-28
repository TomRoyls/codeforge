import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isLogicalExpression, isUnaryExpression, toASTNode } from '../../utils/ast-helpers.js'

function isIfStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'IfStatement'
}

function isConditionalExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'ConditionalExpression'
}

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  const n = toASTNode(node)
  return n?.type === 'BooleanLiteral' && n.value === value
}

function isLiteral(node: unknown, value: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && n.value === value
}

function getTestNode(node: unknown): unknown {
  return toASTNode(node)?.test
}

function checkUnnecessaryCondition(testNode: unknown): { isUnnecessary: boolean; reason: string } {
  const t = toASTNode(testNode)
  if (!t) return { isUnnecessary: false, reason: '' }

  if (isBooleanLiteral(testNode, true) || isLiteral(testNode, true)) {
    return { isUnnecessary: true, reason: 'Unnecessary condition: always truthy' }
  }

  if (isBooleanLiteral(testNode, false) || isLiteral(testNode, false)) {
    return { isUnnecessary: true, reason: 'Unnecessary condition: always falsy' }
  }

  if (isLiteral(testNode, null)) {
    return { isUnnecessary: true, reason: 'Unnecessary condition: always falsy (null)' }
  }

  if (t.type === 'RegExpLiteral') {
    return { isUnnecessary: true, reason: 'Unnecessary condition: always truthy (regexp)' }
  }

  if (isUnaryExpression(testNode)) {
    const {operator} = t
    const { argument } = t

    if (operator === '!') {
      if (isBooleanLiteral(argument, true) || isLiteral(argument, true)) {
        return { isUnnecessary: true, reason: 'Unnecessary condition: !true is always false' }
      }

      if (isBooleanLiteral(argument, false) || isLiteral(argument, false)) {
        return { isUnnecessary: true, reason: 'Unnecessary condition: !false is always true' }
      }

      if (isLiteral(argument, null)) {
        return { isUnnecessary: true, reason: 'Unnecessary condition: !null is always true' }
      }
    }
  }

  if (isLogicalExpression(testNode)) {
    const { left, operator, right } = t

    const leftResult = checkUnnecessaryCondition(left)
    const rightResult = checkUnnecessaryCondition(right)

    if (leftResult.isUnnecessary || rightResult.isUnnecessary) {
      if (operator === '&&') {
        if (isBooleanLiteral(left, false) || isLiteral(left, false)) {
          return { isUnnecessary: true, reason: 'Unnecessary condition: false && x is always false' }
        }

        if (isBooleanLiteral(left, true) || isLiteral(left, true)) {
          return { isUnnecessary: true, reason: 'Unnecessary condition: true && x is always x' }
        }
      }

      if (operator === '||') {
        if (isBooleanLiteral(left, true) || isLiteral(left, true)) {
          return { isUnnecessary: true, reason: 'Unnecessary condition: true || x is always true' }
        }

        if (isBooleanLiteral(left, false) || isLiteral(left, false)) {
          return { isUnnecessary: true, reason: 'Unnecessary condition: false || x is always x' }
        }
      }
    }
  }

  return { isUnnecessary: false, reason: '' }
}

export const noUnnecessaryConditionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        if (!isConditionalExpression(node)) {
          return
        }

        const testNode = getTestNode(node)
        const result = checkUnnecessaryCondition(testNode)

        if (result.isUnnecessary) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: result.reason,
          })
        }
      },

      IfStatement(node: unknown): void {
        if (!isIfStatement(node)) {
          return
        }

        const testNode = getTestNode(node)
        const result = checkUnnecessaryCondition(testNode)

        if (result.isUnnecessary) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: result.reason,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow conditions that are always truthy or always falsy. These conditions are unnecessary and likely indicate a mistake.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-condition',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryConditionRule
