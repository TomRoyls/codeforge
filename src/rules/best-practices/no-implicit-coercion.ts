import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface NoImplicitCoercionOptions extends RuleOptions {
  allowDoubleBang?: boolean
  allowUnaryPlus?: boolean
  allowStringConcat?: boolean
  allowNumericConcat?: boolean
}

const DEFAULT_OPTIONS: NoImplicitCoercionOptions = {
  allowDoubleBang: false,
  allowUnaryPlus: false,
  allowStringConcat: false,
  allowNumericConcat: false,
}

export const noImplicitCoercionRule: RuleDefinition<NoImplicitCoercionOptions> = {
  meta: {
    name: 'no-implicit-coercion',
    description:
      'Disallow implicit type coercions like !!, +, and string concatenation for type conversion',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: NoImplicitCoercionOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          // Check for double bang: !!value
          if (
            !mergedOptions.allowDoubleBang &&
            Node.isPrefixUnaryExpression(node)
          ) {
            const operator = node.getOperatorToken()
            if (operator === SyntaxKind.ExclamationToken) {
              const operand = node.getOperand()
              if (operand && Node.isPrefixUnaryExpression(operand)) {
                const innerOperator = operand.getOperatorToken()
                if (innerOperator === SyntaxKind.ExclamationToken) {
                  const range = getNodeRange(node)
                  violations.push({
                    ruleId: 'no-implicit-coercion',
                    severity: 'warning',
                    message:
                      'Avoid double bang (!!) for boolean conversion. Use Boolean() instead.',
                    filePath: node.getSourceFile().getFilePath(),
                    range,
                    suggestion: 'Replace with Boolean(value) for explicit conversion',
                  })
                }
              }
            }
          }

          // Check for unary plus: +value
          if (
            !mergedOptions.allowUnaryPlus &&
            Node.isPrefixUnaryExpression(node)
          ) {
            const operator = node.getOperatorToken()
            if (operator === SyntaxKind.PlusToken) {
              const operand = node.getOperand()
              if (operand && !Node.isNumericLiteral(operand)) {
                const range = getNodeRange(node)
                violations.push({
                  ruleId: 'no-implicit-coercion',
                  severity: 'warning',
                  message:
                    'Avoid unary plus (+) for number conversion. Use Number() instead.',
                  filePath: node.getSourceFile().getFilePath(),
                  range,
                  suggestion: 'Replace with Number(value) for explicit conversion',
                })
              }
            }
          }

          // Check for string concatenation: value + ""
          if (
            !mergedOptions.allowStringConcat &&
            Node.isBinaryExpression(node)
          ) {
            const operator = node.getOperatorToken()
            if (operator.getKind() === SyntaxKind.PlusToken) {
              const left = node.getLeft()
              const right = node.getRight()

              // Check if concatenating with empty string
              if (
                (Node.isStringLiteral(left) && left.getLiteralText() === '') ||
                (Node.isStringLiteral(right) && right.getLiteralText() === '')
              ) {
                const range = getNodeRange(node)
                violations.push({
                  ruleId: 'no-implicit-coercion',
                  severity: 'warning',
                  message:
                    'Avoid string concatenation with empty string for type conversion. Use String() instead.',
                  filePath: node.getSourceFile().getFilePath(),
                  range,
                  suggestion: 'Replace with String(value) for explicit conversion',
                })
              }
            }
          }

          // Check for numeric coercion via multiplication: value * 1
          if (
            !mergedOptions.allowNumericConcat &&
            Node.isBinaryExpression(node)
          ) {
            const operator = node.getOperatorToken()
            if (operator.getKind() === SyntaxKind.AsteriskToken) {
              const left = node.getLeft()
              const right = node.getRight()

              // Check if multiplying by 1
              if (
                (Node.isNumericLiteral(left) && left.getLiteralValue() === 1) ||
                (Node.isNumericLiteral(right) && right.getLiteralValue() === 1)
              ) {
                const range = getNodeRange(node)
                violations.push({
                  ruleId: 'no-implicit-coercion',
                  severity: 'warning',
                  message:
                    'Avoid multiplication by 1 for number conversion. Use Number() instead.',
                  filePath: node.getSourceFile().getFilePath(),
                  range,
                  suggestion: 'Replace with Number(value) for explicit conversion',
                })
              }
            }
          }
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzeNoImplicitCoercion(
  sourceFile: SourceFile,
  options: NoImplicitCoercionOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: NoImplicitCoercionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        // Check for double bang: !!value
        if (
          !mergedOptions.allowDoubleBang &&
          Node.isPrefixUnaryExpression(node)
        ) {
          const operator = node.getOperatorToken()
          if (operator === SyntaxKind.ExclamationToken) {
            const operand = node.getOperand()
            if (operand && Node.isPrefixUnaryExpression(operand)) {
              const innerOperator = operand.getOperatorToken()
              if (innerOperator === SyntaxKind.ExclamationToken) {
                const range = getNodeRange(node)
                violations.push({
                  ruleId: 'no-implicit-coercion',
                  severity: 'warning',
                  message:
                    'Avoid double bang (!!) for boolean conversion. Use Boolean() instead.',
                  filePath: sourceFile.getFilePath(),
                  range,
                  suggestion: 'Replace with Boolean(value) for explicit conversion',
                })
              }
            }
          }
        }

        // Check for unary plus: +value
        if (
          !mergedOptions.allowUnaryPlus &&
          Node.isPrefixUnaryExpression(node)
        ) {
          const operator = node.getOperatorToken()
          if (operator === SyntaxKind.PlusToken) {
            const operand = node.getOperand()
            if (operand && !Node.isNumericLiteral(operand)) {
              const range = getNodeRange(node)
              violations.push({
                ruleId: 'no-implicit-coercion',
                severity: 'warning',
                message:
                  'Avoid unary plus (+) for number conversion. Use Number() instead.',
                filePath: sourceFile.getFilePath(),
                range,
                suggestion: 'Replace with Number(value) for explicit conversion',
              })
            }
          }
        }

        // Check for string concatenation: value + ""
        if (
          !mergedOptions.allowStringConcat &&
          Node.isBinaryExpression(node)
        ) {
          const operator = node.getOperatorToken()
          if (operator.getKind() === SyntaxKind.PlusToken) {
            const left = node.getLeft()
            const right = node.getRight()

            if (
              (Node.isStringLiteral(left) && left.getLiteralText() === '') ||
              (Node.isStringLiteral(right) && right.getLiteralText() === '')
            ) {
              const range = getNodeRange(node)
              violations.push({
                ruleId: 'no-implicit-coercion',
                severity: 'warning',
                message:
                  'Avoid string concatenation with empty string for type conversion. Use String() instead.',
                filePath: sourceFile.getFilePath(),
                range,
                suggestion: 'Replace with String(value) for explicit conversion',
              })
            }
          }
        }

        // Check for numeric coercion via multiplication: value * 1
        if (
          !mergedOptions.allowNumericConcat &&
          Node.isBinaryExpression(node)
        ) {
          const operator = node.getOperatorToken()
          if (operator.getKind() === SyntaxKind.AsteriskToken) {
            const left = node.getLeft()
            const right = node.getRight()

            if (
              (Node.isNumericLiteral(left) && left.getLiteralValue() === 1) ||
              (Node.isNumericLiteral(right) && right.getLiteralValue() === 1)
            ) {
              const range = getNodeRange(node)
              violations.push({
                ruleId: 'no-implicit-coercion',
                severity: 'warning',
                message:
                  'Avoid multiplication by 1 for number conversion. Use Number() instead.',
                filePath: sourceFile.getFilePath(),
                range,
                suggestion: 'Replace with Number(value) for explicit conversion',
              })
            }
          }
        }
      },
    },
    violations,
  )

  return violations
}
