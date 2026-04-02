/**
 * @fileoverview Prefer exponent operator (**) over Math.pow()
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferExponentOperatorOptions extends RuleOptions {
  ignoreNonIntegerExponent?: boolean
}

const DEFAULT_OPTIONS: PreferExponentOperatorOptions = {
  ignoreNonIntegerExponent: false,
}

function isMathPowCall(node: Node): { base: Node; exponent: Node } | null {
  if (!Node.isCallExpression(node)) return null

  const expression = node.getExpression()
  if (!Node.isPropertyAccessExpression(expression)) return null

  const object = expression.getExpression()
  const methodName = expression.getName()

  if (!Node.isIdentifier(object) || object.getText() !== 'Math') return null
  if (methodName !== 'pow') return null

  const args = node.getArguments()
  if (args.length !== 2) return null

  const base = args[0]
  const exponent = args[1]
  
  if (!base || !exponent) return null

  return { base, exponent }
}

function isIntegerLiteral(node: Node): boolean {
  if (Node.isNumericLiteral(node)) {
    const text = node.getText()
    return !text.includes('.') && !text.includes('e') && !text.includes('E')
  }
  if (Node.isPrefixUnaryExpression(node)) {
    const operatorToken = node.getOperatorToken()
    if (operatorToken === SyntaxKind.MinusToken) {
      const operand = node.getOperand()
      return isIntegerLiteral(operand)
    }
  }
  return false
}

export const preferExponentOperatorRule: RuleDefinition<PreferExponentOperatorOptions> = {
  meta: {
    name: 'prefer-exponent-operator',
    description: 'Enforce using the exponent operator (**) instead of Math.pow()',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: PreferExponentOperatorOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isMathPowCall(node)
          if (!result) return

          if (mergedOptions.ignoreNonIntegerExponent && !isIntegerLiteral(result.exponent)) {
            return
          }

          const range = getNodeRange(node)
          const baseText = result.base.getText()
          const exponentText = result.exponent.getText()

          violations.push({
            ruleId: 'prefer-exponent-operator',
            severity: 'info',
            message: `Use the exponent operator (**) instead of 'Math.pow(${baseText}, ${exponentText})'.`,
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: `Replace with: ${baseText} ** ${exponentText}`,
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferExponentOperator(
  sourceFile: SourceFile,
  options: PreferExponentOperatorOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        const result = isMathPowCall(node)
        if (!result) return

        if (mergedOptions.ignoreNonIntegerExponent && !isIntegerLiteral(result.exponent)) {
          return
        }

        const range = getNodeRange(node)
        const baseText = result.base.getText()
        const exponentText = result.exponent.getText()

        violations.push({
          ruleId: 'prefer-exponent-operator',
          severity: 'info',
          message: `Use the exponent operator (**) instead of 'Math.pow(${baseText}, ${exponentText})'.`,
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: `Replace with: ${baseText} ** ${exponentText}`,
        })
      },
    }
  )

  return violations
}

export default preferExponentOperatorRule
