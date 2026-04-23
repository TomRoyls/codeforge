import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface StrictBooleanExpressionsOptions extends RuleOptions {
  allowAny?: boolean
  allowNullable?: boolean
  allowNullableBoolean?: boolean
  allowNullableNumber?: boolean
  allowNullableString?: boolean
  allowNumber?: boolean
  allowString?: boolean
}

const DEFAULT_OPTIONS: StrictBooleanExpressionsOptions = {
  allowAny: false,
  allowNullable: true,
  allowNullableBoolean: true,
  allowNullableNumber: false,
  allowNullableString: false,
  allowNumber: false,
  allowString: false,
}

const COMPARISON_OPERATORS = new Set<SyntaxKind>([
  SyntaxKind.EqualsEqualsEqualsToken,
  SyntaxKind.EqualsEqualsToken,
  SyntaxKind.ExclamationEqualsEqualsToken,
  SyntaxKind.ExclamationEqualsToken,
  SyntaxKind.GreaterThanEqualsToken,
  SyntaxKind.GreaterThanToken,
  SyntaxKind.InKeyword,
  SyntaxKind.InstanceOfKeyword,
  SyntaxKind.LessThanEqualsToken,
  SyntaxKind.LessThanToken,
])

const BOOLEAN_FUNCTION_NAMES = new Set(['Boolean', 'isFinite', 'isNaN'])
function isExplicitBooleanCheck(node: Node): boolean {
  if (Node.isBinaryExpression(node)) {
    const operator = node.getOperatorToken().getKind()
    if (COMPARISON_OPERATORS.has(operator)) {
      return true
    }

    if (operator === SyntaxKind.AmpersandAmpersandToken || operator === SyntaxKind.BarBarToken) {
      const left = node.getLeft()
      const right = node.getRight()
      return isExplicitBooleanCheck(left) && isExplicitBooleanCheck(right)
    }
  }

  if (Node.isCallExpression(node)) {
    const expression = node.getExpression()
    if (Node.isIdentifier(expression) && BOOLEAN_FUNCTION_NAMES.has(expression.getText())) {
      return true
    }
  }

  if (
    Node.isPrefixUnaryExpression(node) &&
    node.getOperatorToken() === SyntaxKind.ExclamationToken
  ) {
    const operand = node.getOperand()
    if (operand) {
      return isExplicitBooleanCheck(operand)
    }
  }

  if (Node.isParenthesizedExpression(node)) {
    const inner = node.getExpression()
    return isExplicitBooleanCheck(inner)
  }

  return false
}

function shouldReport(condition: Node, options: StrictBooleanExpressionsOptions): boolean {
  if (isExplicitBooleanCheck(condition)) return false
  if (Node.isParenthesizedExpression(condition)) {
    return shouldReport(condition.getExpression(), options)
  }

  if (
    Node.isPrefixUnaryExpression(condition) &&
    condition.getOperatorToken() === SyntaxKind.ExclamationToken
  ) {
    const operand = condition.getOperand()
    if (operand) {
      return shouldReport(operand, options)
    }
  }

  return true
}

export const strictBooleanExpressionsRule: RuleDefinition<StrictBooleanExpressionsOptions> = {
  create(options: StrictBooleanExpressionsOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isIfStatement(node)) {
            const condition = node.getExpression()
            if (shouldReport(condition, mergedOptions)) {
              const range = getNodeRange(condition)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: `Unexpected implicit boolean conversion in if statement. Use an explicit boolean comparison.`,
                range,
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                suggestion:
                  'Consider using an explicit comparison like ` === true`, `!== null`, `> 0`, or `Boolean(x)`.',
              })
            }
          }

          if (Node.isWhileStatement(node)) {
            const condition = node.getExpression()
            if (shouldReport(condition, mergedOptions)) {
              const range = getNodeRange(condition)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: `Unexpected implicit boolean conversion in while loop. Use an explicit boolean comparison.`,
                range,
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                suggestion:
                  'Consider using an explicit comparison like `> 0`, `!== null`, or `Boolean(x)`.',
              })
            }
          }

          if (Node.isDoStatement(node)) {
            const condition = node.getExpression()
            if (shouldReport(condition, mergedOptions)) {
              const range = getNodeRange(condition)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: `Unexpected implicit boolean conversion in do-while loop. Use an explicit boolean comparison.`,
                range,
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                suggestion:
                  'Consider using an explicit comparison like `> 0`, `!== null`, or `Boolean(x)`.',
              })
            }
          }

          if (Node.isForStatement(node)) {
            const condition = node.getCondition()
            if (condition && shouldReport(condition, mergedOptions)) {
              const range = getNodeRange(condition)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: `Unexpected implicit boolean conversion in for loop. Use an explicit boolean comparison.`,
                range,
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                suggestion:
                  'Consider using an explicit comparison like `> 0`, `!== null`, or `Boolean(x)`.',
              })
            }
          }

          if (Node.isConditionalExpression(node)) {
            const condition = node.getCondition()
            if (shouldReport(condition, mergedOptions)) {
              const range = getNodeRange(condition)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: `Unexpected implicit boolean conversion in conditional expression. Use an explicit boolean comparison.`,
                range,
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                suggestion:
                  'Consider using an explicit comparison like `=== true`, `> 0`, or `Boolean(x)`.',
              })
            }
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description:
      'Enforce explicit boolean comparisons in conditions to avoid bugs with falsy values',
    fixable: undefined,
    name: 'strict-boolean-expressions',
    recommended: false,
  },
}
export function analyzeStrictBooleanExpressions(
  sourceFile: SourceFile,
  options: StrictBooleanExpressionsOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: StrictBooleanExpressionsOptions = { ...DEFAULT_OPTIONS, ...options }
  traverseAST(
    sourceFile,
    {
      visitNode(node: Node, _context: VisitorContext) {
        if (Node.isIfStatement(node)) {
          const condition = node.getExpression()
          if (shouldReport(condition, mergedOptions)) {
            const range = getNodeRange(condition)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: `Unexpected implicit boolean conversion in if statement. Use an explicit boolean comparison.`,
              range,
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              suggestion:
                'Consider using an explicit comparison like `=== true`, `!== null`, `> 0`, or `Boolean(x)`.',
            })
          }
        }

        if (Node.isWhileStatement(node)) {
          const condition = node.getExpression()
          if (shouldReport(condition, mergedOptions)) {
            const range = getNodeRange(condition)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: `Unexpected implicit boolean conversion in while loop. Use an explicit boolean comparison.`,
              range,
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              suggestion:
                'Consider using an explicit comparison like `> 0`, `!== null`, or `Boolean(x)`.',
            })
          }
        }

        if (Node.isDoStatement(node)) {
          const condition = node.getExpression()
          if (shouldReport(condition, mergedOptions)) {
            const range = getNodeRange(condition)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: `Unexpected implicit boolean conversion in do-while loop. Use an explicit boolean comparison.`,
              range,
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              suggestion:
                'Consider using an explicit comparison like `> 0`, `!== null`, or `Boolean(x)`.',
            })
          }
        }

        if (Node.isForStatement(node)) {
          const condition = node.getCondition()
          if (condition && shouldReport(condition, mergedOptions)) {
            const range = getNodeRange(condition)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: `Unexpected implicit boolean conversion in for loop. Use an explicit boolean comparison.`,
              range,
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              suggestion:
                'Consider using an explicit comparison like `> 0`, `!== null`, or `Boolean(x)`.',
            })
          }
        }

        if (Node.isConditionalExpression(node)) {
          const condition = node.getCondition()
          if (shouldReport(condition, mergedOptions)) {
            const range = getNodeRange(condition)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: `Unexpected implicit boolean conversion in conditional expression. Use an explicit boolean comparison.`,
              range,
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              suggestion:
                'Consider using an explicit comparison like `=== true`, `> 0`, or `Boolean(x)`.',
            })
          }
        }
      },
    },
    violations,
  )
  return violations
}
