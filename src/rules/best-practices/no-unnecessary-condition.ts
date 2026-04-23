/**
 * @file Detects unnecessary conditions that are always true or always false
 */

import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface NoUnnecessaryConditionOptions extends RuleOptions {
  checkConstantConditions?: boolean
}

const DEFAULT_OPTIONS: NoUnnecessaryConditionOptions = {
  checkConstantConditions: true,
}

function isLiteral(node: Node): boolean {
  return (
    Node.isStringLiteral(node) ||
    Node.isNumericLiteral(node) ||
    node.getKind() === SyntaxKind.TrueKeyword ||
    node.getKind() === SyntaxKind.FalseKeyword ||
    node.getKind() === SyntaxKind.NullKeyword ||
    Node.isBigIntLiteral(node)
  )
}

function getLiteralValue(node: Node): boolean | null | number | string | undefined {
  if (node.getKind() === SyntaxKind.TrueKeyword) {
    return true
  }

  if (node.getKind() === SyntaxKind.FalseKeyword) {
    return false
  }

  if (Node.isNumericLiteral(node)) {
    return node.getLiteralValue()
  }

  if (Node.isStringLiteral(node)) {
    return node.getLiteralText()
  }

  if (node.getKind() === SyntaxKind.NullKeyword) {
    return null
  }

  return undefined
}

function isAlwaysTrue(left: Node, operator: SyntaxKind, right: Node): boolean | undefined {
  if (!isLiteral(left) || !isLiteral(right)) return undefined

  const leftVal = getLiteralValue(left)
  const rightVal = getLiteralValue(right)

  if (leftVal === undefined || rightVal === undefined) return undefined

  switch (operator) {
    case SyntaxKind.EqualsEqualsEqualsToken: {
      // ===
      return leftVal === rightVal
    }

    case SyntaxKind.EqualsEqualsToken: {
      // ==
      // eslint-disable-next-line eqeqeq
      return leftVal == rightVal
    }

    case SyntaxKind.ExclamationEqualsEqualsToken: {
      // !==
      return leftVal !== rightVal
    }

    case SyntaxKind.ExclamationEqualsToken: {
      // !=
      // eslint-disable-next-line eqeqeq
      return leftVal != rightVal
    }

    case SyntaxKind.GreaterThanEqualsToken: {
      // >=
      if (typeof leftVal === 'number' && typeof rightVal === 'number') {
        return leftVal >= rightVal
      }

      return undefined
    }

    case SyntaxKind.GreaterThanToken: {
      // >
      if (typeof leftVal === 'number' && typeof rightVal === 'number') {
        return leftVal > rightVal
      }

      return undefined
    }

    case SyntaxKind.LessThanEqualsToken: {
      // <=
      if (typeof leftVal === 'number' && typeof rightVal === 'number') {
        return leftVal <= rightVal
      }

      return undefined
    }

    case SyntaxKind.LessThanToken: {
      // <
      if (typeof leftVal === 'number' && typeof rightVal === 'number') {
        return leftVal < rightVal
      }

      return undefined
    }

    default: {
      return undefined
    }
  }
}

function checkCondition(node: Node, _options: NoUnnecessaryConditionOptions): RuleViolation[] {
  const violations: RuleViolation[] = []

  if (!Node.isBinaryExpression(node)) return violations

  const operator = node.getOperatorToken().getKind()
  const comparisonOperators = [
    SyntaxKind.EqualsEqualsToken,
    SyntaxKind.ExclamationEqualsToken,
    SyntaxKind.EqualsEqualsEqualsToken,
    SyntaxKind.ExclamationEqualsEqualsToken,
    SyntaxKind.GreaterThanToken,
    SyntaxKind.GreaterThanEqualsToken,
    SyntaxKind.LessThanToken,
    SyntaxKind.LessThanEqualsToken,
  ]

  if (!comparisonOperators.includes(operator)) return violations

  const left = node.getLeft()
  const right = node.getRight()

  const result = isAlwaysTrue(left, operator, right)

  if (result === undefined) return violations

  const range = getNodeRange(node)
  const operatorText = node.getOperatorToken().getText()

  if (result === true) {
    violations.push({
      filePath: node.getSourceFile().getFilePath(),
      message: `This condition is always true (${left.getText()} ${operatorText} ${right.getText()}). Consider removing it.`,
      range,
      ruleId: 'no-unnecessary-condition',
      severity: 'warning',
      suggestion: 'Remove the unnecessary condition or refactor the logic.',
    })
  } else {
    violations.push({
      filePath: node.getSourceFile().getFilePath(),
      message: `This condition is always false (${left.getText()} ${operatorText} ${right.getText()}). The code inside will never execute.`,
      range,
      ruleId: 'no-unnecessary-condition',
      severity: 'warning',
      suggestion: 'Remove the dead code or fix the condition.',
    })
  }

  return violations
}

export const noUnnecessaryConditionRule: RuleDefinition<NoUnnecessaryConditionOptions> = {
  create(options: NoUnnecessaryConditionOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (mergedOptions.checkConstantConditions) {
            violations.push(...checkCondition(node, mergedOptions))
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Detects unnecessary conditions that are always true or always false',
    fixable: undefined,
    name: 'no-unnecessary-condition',
    recommended: false,
  },
}

export function analyzeNoUnnecessaryCondition(
  sourceFile: SourceFile,
  options: NoUnnecessaryConditionOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(sourceFile, {
    visitNode(node: Node, _context: VisitorContext) {
      if (mergedOptions.checkConstantConditions) {
        violations.push(...checkCondition(node, mergedOptions))
      }
    },
  })

  return violations
}

export default noUnnecessaryConditionRule
