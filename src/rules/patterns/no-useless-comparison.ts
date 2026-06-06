/**
 * @file Disallow useless comparisons that are always true or false
 */

import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface NoUselessComparisonOptions extends RuleOptions {
  ignoreComparisonsToNaN?: boolean
}

const DEFAULT_OPTIONS: NoUselessComparisonOptions = {
  ignoreComparisonsToNaN: false,
}

function isSameNode(nodeA: Node, nodeB: Node): boolean {
  if (nodeA === nodeB) return true

  // Compare literal values
  if (Node.isNumericLiteral(nodeA) && Node.isNumericLiteral(nodeB)) {
    return nodeA.getLiteralValue() === nodeB.getLiteralValue()
  }

  if (Node.isStringLiteral(nodeA) && Node.isStringLiteral(nodeB)) {
    return nodeA.getLiteralText() === nodeB.getLiteralText()
  }

  if (Node.isTrueLiteral(nodeA) && Node.isTrueLiteral(nodeB)) return true

  if (Node.isFalseLiteral(nodeA) && Node.isFalseLiteral(nodeB)) return true

  if (Node.isNullLiteral(nodeA) && Node.isNullLiteral(nodeB)) return true

  // Compare identifiers by name
  if (Node.isIdentifier(nodeA) && Node.isIdentifier(nodeB)) {
    return nodeA.getText() === nodeB.getText()
  }

  return false
}

function getComparisonMessage(alwaysTrue: boolean, reason: string): string {
  const result = alwaysTrue ? 'always true' : 'always false'
  return `This comparison is ${result} (${reason}). This code will never change behavior and can be simplified.`
}

export const noUselessComparisonRule: RuleDefinition<NoUselessComparisonOptions> = {
  create(options: NoUselessComparisonOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, context: VisitorContext) {
          if (!Node.isBinaryExpression(node)) return

          const operatorToken = node.getOperatorToken()
          const operatorKind = operatorToken.getKind()

          // Only check comparison operators
          const comparisonOperators = [
            SyntaxKind.EqualsEqualsToken,
            SyntaxKind.EqualsEqualsEqualsToken,
            SyntaxKind.ExclamationEqualsToken,
            SyntaxKind.ExclamationEqualsEqualsToken,
            SyntaxKind.LessThanToken,
            SyntaxKind.LessThanEqualsToken,
            SyntaxKind.GreaterThanToken,
            SyntaxKind.GreaterThanEqualsToken,
          ]

          if (!comparisonOperators.includes(operatorKind)) return

          const left = node.getLeft()
          const right = node.getRight()

          // Check for x === x (or similar)
          if (
            (operatorKind === SyntaxKind.EqualsEqualsToken ||
              operatorKind === SyntaxKind.EqualsEqualsEqualsToken) &&
            isSameNode(left, right)
          ) {
            // Special case: NaN !== NaN is true, so NaN === NaN is false
            const isNaNCheck =
              (Node.isIdentifier(left) && left.getText() === 'NaN') ||
              (Node.isIdentifier(right) && right.getText() === 'NaN')

            if (options.ignoreComparisonsToNaN && isNaNCheck) {
              return
            }

            const range = getNodeRange(node)
            violations.push({
              filePath: context.getFilePath(),
              message: getComparisonMessage(
                !isNaNCheck,
                isNaNCheck ? 'NaN !== NaN' : 'comparing a value to itself',
              ),
              range,
              ruleId: 'no-useless-comparison',
              severity: 'warning',
              suggestion: isNaNCheck
                ? 'Use Number.isNaN() to check for NaN'
                : 'Remove this comparison, it can never be false',
            })
            return
          }

          // Check for x !== x (or similar)
          if (
            (operatorKind === SyntaxKind.ExclamationEqualsToken ||
              operatorKind === SyntaxKind.ExclamationEqualsEqualsToken) &&
            isSameNode(left, right)
          ) {
            // Special case: NaN !== NaN is true, which is useful for checking NaN
            const isNaNCheck =
              (Node.isIdentifier(left) && left.getText() === 'NaN') ||
              (Node.isIdentifier(right) && right.getText() === 'NaN')

            if (options.ignoreComparisonsToNaN && isNaNCheck) {
              return
            }

            const range = getNodeRange(node)
            violations.push({
              filePath: context.getFilePath(),
              message: getComparisonMessage(
                isNaNCheck,
                isNaNCheck ? 'NaN !== NaN is true' : 'comparing a value to itself',
              ),
              range,
              ruleId: 'no-useless-comparison',
              severity: 'warning',
              suggestion: isNaNCheck
                ? 'Use Number.isNaN() to check for NaN'
                : 'Remove this comparison, it can never be true',
            })
            return
          }

          // Check for comparing literal values with <, >, <=, >=
          if (
            [
              SyntaxKind.GreaterThanEqualsToken,
              SyntaxKind.GreaterThanToken,
              SyntaxKind.LessThanEqualsToken,
              SyntaxKind.LessThanToken,
            ].includes(operatorKind)
          ) {
            if (Node.isNumericLiteral(left) && Node.isNumericLiteral(right)) {
              const leftValue = left.getLiteralValue()
              const rightValue = right.getLiteralValue()
              let alwaysTrue = false
              let alwaysFalse = false

              switch (operatorKind) {
                case SyntaxKind.GreaterThanEqualsToken: {
                  alwaysTrue = leftValue >= rightValue
                  alwaysFalse = leftValue < rightValue
                  break
                }

                case SyntaxKind.GreaterThanToken: {
                  alwaysTrue = leftValue > rightValue
                  alwaysFalse = leftValue <= rightValue
                  break
                }

                case SyntaxKind.LessThanEqualsToken: {
                  alwaysTrue = leftValue <= rightValue
                  alwaysFalse = leftValue > rightValue
                  break
                }

                case SyntaxKind.LessThanToken: {
                  alwaysTrue = leftValue < rightValue
                  alwaysFalse = leftValue >= rightValue
                  break
                }
              }

              if (alwaysTrue || alwaysFalse) {
                const range = getNodeRange(node)
                violations.push({
                  filePath: context.getFilePath(),
                  message: getComparisonMessage(
                    alwaysTrue,
                    `comparing constant numbers ${leftValue} and ${rightValue}`,
                  ),
                  range,
                  ruleId: 'no-useless-comparison',
                  severity: 'warning',
                  suggestion: alwaysTrue
                    ? 'Replace with true, or remove if used in condition'
                    : 'Replace with false, or remove if used in condition',
                })
              }
            }

            // Same for string literals
            if (Node.isStringLiteral(left) && Node.isStringLiteral(right)) {
              const leftText = left.getLiteralText()
              const rightText = right.getLiteralText()
              let alwaysTrue = false
              let alwaysFalse = false

              switch (operatorKind) {
                case SyntaxKind.GreaterThanEqualsToken: {
                  alwaysTrue = leftText >= rightText
                  alwaysFalse = leftText < rightText
                  break
                }

                case SyntaxKind.GreaterThanToken: {
                  alwaysTrue = leftText > rightText
                  alwaysFalse = leftText <= rightText
                  break
                }

                case SyntaxKind.LessThanEqualsToken: {
                  alwaysTrue = leftText <= rightText
                  alwaysFalse = leftText > rightText
                  break
                }

                case SyntaxKind.LessThanToken: {
                  alwaysTrue = leftText < rightText
                  alwaysFalse = leftText >= rightText
                  break
                }
              }

              if (alwaysTrue || alwaysFalse) {
                const range = getNodeRange(node)
                violations.push({
                  filePath: context.getFilePath(),
                  message: getComparisonMessage(alwaysTrue, 'comparing constant strings'),
                  range,
                  ruleId: 'no-useless-comparison',
                  severity: 'warning',
                  suggestion: alwaysTrue
                    ? 'Replace with true, or remove if used in condition'
                    : 'Replace with false, or remove if used in condition',
                })
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Disallow useless comparisons that are always true or false',
    docs: { url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-useless-comparison.ts' },
    fixable: undefined,
    name: 'no-useless-comparison',
    recommended: true,
  },
}

export function analyzeNoUselessComparison(
  sourceFile: SourceFile,
  options: NoUselessComparisonOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: NoUselessComparisonOptions = {
    ignoreComparisonsToNaN: false,
    ...options,
  }

  traverseAST(sourceFile, {
    visitNode(node: Node, _context: VisitorContext) {
      if (!Node.isBinaryExpression(node)) return

      const operatorToken = node.getOperatorToken()
      const operatorKind = operatorToken.getKind()

      const comparisonOperators = [
        SyntaxKind.EqualsEqualsToken,
        SyntaxKind.EqualsEqualsEqualsToken,
        SyntaxKind.ExclamationEqualsToken,
        SyntaxKind.ExclamationEqualsEqualsToken,
        SyntaxKind.LessThanToken,
        SyntaxKind.LessThanEqualsToken,
        SyntaxKind.GreaterThanToken,
        SyntaxKind.GreaterThanEqualsToken,
      ]

      if (!comparisonOperators.includes(operatorKind)) return

      const left = node.getLeft()
      const right = node.getRight()

      // Check for x === x (or similar)
      if (
        (operatorKind === SyntaxKind.EqualsEqualsToken ||
          operatorKind === SyntaxKind.EqualsEqualsEqualsToken) &&
        isSameNode(left, right)
      ) {
        const isNaNCheck =
          (Node.isIdentifier(left) && left.getText() === 'NaN') ||
          (Node.isIdentifier(right) && right.getText() === 'NaN')

        if (mergedOptions.ignoreComparisonsToNaN && isNaNCheck) {
          return
        }

        const range = getNodeRange(node)
        violations.push({
          filePath: sourceFile.getFilePath(),
          message: getComparisonMessage(
            !isNaNCheck,
            isNaNCheck ? 'NaN !== NaN' : 'comparing a value to itself',
          ),
          range,
          ruleId: 'no-useless-comparison',
          severity: 'warning',
          suggestion: isNaNCheck
            ? 'Use Number.isNaN() to check for NaN'
            : 'Remove this comparison, it can never be false',
        })
        return
      }

      // Check for x !== x (or similar)
      if (
        (operatorKind === SyntaxKind.ExclamationEqualsToken ||
          operatorKind === SyntaxKind.ExclamationEqualsEqualsToken) &&
        isSameNode(left, right)
      ) {
        const isNaNCheck =
          (Node.isIdentifier(left) && left.getText() === 'NaN') ||
          (Node.isIdentifier(right) && right.getText() === 'NaN')

        if (mergedOptions.ignoreComparisonsToNaN && isNaNCheck) {
          return
        }

        const range = getNodeRange(node)
        violations.push({
          filePath: sourceFile.getFilePath(),
          message: getComparisonMessage(
            isNaNCheck,
            isNaNCheck ? 'NaN !== NaN is true' : 'comparing a value to itself',
          ),
          range,
          ruleId: 'no-useless-comparison',
          severity: 'warning',
          suggestion: isNaNCheck
            ? 'Use Number.isNaN() to check for NaN'
            : 'Remove this comparison, it can never be true',
        })
        return
      }

      // Check for comparing literal values with <, >, <=, >=
      if (
        [
          SyntaxKind.GreaterThanEqualsToken,
          SyntaxKind.GreaterThanToken,
          SyntaxKind.LessThanEqualsToken,
          SyntaxKind.LessThanToken,
        ].includes(operatorKind)
      ) {
        if (Node.isNumericLiteral(left) && Node.isNumericLiteral(right)) {
          const leftValue = left.getLiteralValue()
          const rightValue = right.getLiteralValue()
          let alwaysTrue = false
          let alwaysFalse = false

          switch (operatorKind) {
            case SyntaxKind.GreaterThanEqualsToken: {
              alwaysTrue = leftValue >= rightValue
              alwaysFalse = leftValue < rightValue
              break
            }

            case SyntaxKind.GreaterThanToken: {
              alwaysTrue = leftValue > rightValue
              alwaysFalse = leftValue <= rightValue
              break
            }

            case SyntaxKind.LessThanEqualsToken: {
              alwaysTrue = leftValue <= rightValue
              alwaysFalse = leftValue > rightValue
              break
            }

            case SyntaxKind.LessThanToken: {
              alwaysTrue = leftValue < rightValue
              alwaysFalse = leftValue >= rightValue
              break
            }
          }

          if (alwaysTrue || alwaysFalse) {
            const range = getNodeRange(node)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: getComparisonMessage(
                alwaysTrue,
                `comparing constant numbers ${leftValue} and ${rightValue}`,
              ),
              range,
              ruleId: 'no-useless-comparison',
              severity: 'warning',
              suggestion: alwaysTrue
                ? 'Replace with true, or remove if used in condition'
                : 'Replace with false, or remove if used in condition',
            })
          }
        }

        if (Node.isStringLiteral(left) && Node.isStringLiteral(right)) {
          const leftText = left.getLiteralText()
          const rightText = right.getLiteralText()
          let alwaysTrue = false
          let alwaysFalse = false

          switch (operatorKind) {
            case SyntaxKind.GreaterThanEqualsToken: {
              alwaysTrue = leftText >= rightText
              alwaysFalse = leftText < rightText
              break
            }

            case SyntaxKind.GreaterThanToken: {
              alwaysTrue = leftText > rightText
              alwaysFalse = leftText <= rightText
              break
            }

            case SyntaxKind.LessThanEqualsToken: {
              alwaysTrue = leftText <= rightText
              alwaysFalse = leftText > rightText
              break
            }

            case SyntaxKind.LessThanToken: {
              alwaysTrue = leftText < rightText
              alwaysFalse = leftText >= rightText
              break
            }
          }

          if (alwaysTrue || alwaysFalse) {
            const range = getNodeRange(node)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: getComparisonMessage(alwaysTrue, 'comparing constant strings'),
              range,
              ruleId: 'no-useless-comparison',
              severity: 'warning',
              suggestion: alwaysTrue
                ? 'Replace with true, or remove if used in condition'
                : 'Replace with false, or remove if used in condition',
            })
          }
        }
      }
    },
  })

  return violations
}

export default noUselessComparisonRule
