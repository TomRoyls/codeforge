import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface StrictBooleanExpressionsOptions extends RuleOptions {
  allowNullable?: boolean
  allowNumber?: boolean
  allowString?: boolean
  allowAny?: boolean
  allowNullableBoolean?: boolean
  allowNullableNumber?: boolean
  allowNullableString?: boolean
}

const DEFAULT_OPTIONS: StrictBooleanExpressionsOptions = {
  allowNullable: true,
  allowNumber: false,
  allowString: false,
  allowAny: false,
  allowNullableBoolean: true,
  allowNullableNumber: false,
  allowNullableString: false,
}

const COMPARISON_OPERATORS: SyntaxKind[] = [
  SyntaxKind.EqualsEqualsEqualsToken,
  SyntaxKind.ExclamationEqualsEqualsToken,
  SyntaxKind.EqualsEqualsToken,
  SyntaxKind.ExclamationEqualsToken,
  SyntaxKind.LessThanToken,
  SyntaxKind.GreaterThanToken,
  SyntaxKind.LessThanEqualsToken,
  SyntaxKind.GreaterThanEqualsToken,
  SyntaxKind.InstanceOfKeyword,
  SyntaxKind.InKeyword,
]

const BOOLEAN_FUNCTION_NAMES = ['Boolean', 'isNaN', 'isFinite']
function isExplicitBooleanCheck(node: Node): boolean {
  if (Node.isBinaryExpression(node)) {
    const operator = node.getOperatorToken().getKind()
    if (COMPARISON_OPERATORS.includes(operator)) {
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
    if (Node.isIdentifier(expression)) {
      if (BOOLEAN_FUNCTION_NAMES.includes(expression.getText())) {
        return true
      }
    }
  }
  if (Node.isPrefixUnaryExpression(node)) {
    if (node.getOperatorToken() === SyntaxKind.ExclamationToken) {
      const operand = node.getOperand()
      if (operand) {
        return isExplicitBooleanCheck(operand)
      }
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
  if (Node.isPrefixUnaryExpression(condition)) {
    if (condition.getOperatorToken() === SyntaxKind.ExclamationToken) {
      const operand = condition.getOperand()
      if (operand) {
        return shouldReport(operand, options)
      }
    }
  }
  return true
}
export const strictBooleanExpressionsRule: RuleDefinition<StrictBooleanExpressionsOptions> = {
  meta: {
    name: 'strict-boolean-expressions',
    description:
      'Enforce explicit boolean comparisons in conditions to avoid bugs with falsy values',
    category: 'style',
    recommended: false,
    fixable: undefined,
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: StrictBooleanExpressionsOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          if (Node.isIfStatement(node)) {
            const condition = node.getExpression()
            if (shouldReport(condition, mergedOptions)) {
              const range = getNodeRange(condition)
              violations.push({
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                message: `Unexpected implicit boolean conversion in if statement. Use an explicit boolean comparison.`,
                filePath: node.getSourceFile().getFilePath(),
                range,
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
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                message: `Unexpected implicit boolean conversion in while loop. Use an explicit boolean comparison.`,
                filePath: node.getSourceFile().getFilePath(),
                range,
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
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                message: `Unexpected implicit boolean conversion in do-while loop. Use an explicit boolean comparison.`,
                filePath: node.getSourceFile().getFilePath(),
                range,
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
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                message: `Unexpected implicit boolean conversion in for loop. Use an explicit boolean comparison.`,
                filePath: node.getSourceFile().getFilePath(),
                range,
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
                ruleId: 'strict-boolean-expressions',
                severity: 'warning',
                message: `Unexpected implicit boolean conversion in conditional expression. Use an explicit boolean comparison.`,
                filePath: node.getSourceFile().getFilePath(),
                range,
                suggestion:
                  'Consider using an explicit comparison like `=== true`, `> 0`, or `Boolean(x)`.',
              })
            }
          }
        },
      },
      onComplete: () => violations,
    }
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
      visitNode: (node: Node, _context: VisitorContext) => {
        if (Node.isIfStatement(node)) {
          const condition = node.getExpression()
          if (shouldReport(condition, mergedOptions)) {
            const range = getNodeRange(condition)
            violations.push({
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              message: `Unexpected implicit boolean conversion in if statement. Use an explicit boolean comparison.`,
              filePath: sourceFile.getFilePath(),
              range,
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
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              message: `Unexpected implicit boolean conversion in while loop. Use an explicit boolean comparison.`,
              filePath: sourceFile.getFilePath(),
              range,
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
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              message: `Unexpected implicit boolean conversion in do-while loop. Use an explicit boolean comparison.`,
              filePath: sourceFile.getFilePath(),
              range,
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
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              message: `Unexpected implicit boolean conversion in for loop. Use an explicit boolean comparison.`,
              filePath: sourceFile.getFilePath(),
              range,
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
              ruleId: 'strict-boolean-expressions',
              severity: 'warning',
              message: `Unexpected implicit boolean conversion in conditional expression. Use an explicit boolean comparison.`,
              filePath: sourceFile.getFilePath(),
              range,
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
