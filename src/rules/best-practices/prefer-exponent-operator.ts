/**
 * @file Prefer exponent operator (**) over Math.pow()
 */

import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferExponentOperatorOptions extends RuleOptions {
  ignoreNonIntegerExponent?: boolean
}

const DEFAULT_OPTIONS: PreferExponentOperatorOptions = {
  ignoreNonIntegerExponent: false,
}

function isMathPowCall(node: Node): null | { base: Node; exponent: Node } {
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
  create(options: PreferExponentOperatorOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isMathPowCall(node)
          if (!result) return

          if (mergedOptions.ignoreNonIntegerExponent && !isIntegerLiteral(result.exponent)) {
            return
          }

          const range = getNodeRange(node)
          const baseText = result.base.getText()
          const exponentText = result.exponent.getText()

          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: `Use the exponent operator (**) instead of 'Math.pow(${baseText}, ${exponentText})'.`,
            range,
            ruleId: 'prefer-exponent-operator',
            severity: 'info',
            suggestion: `Replace with: ${baseText} ** ${exponentText}`,
          })
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Enforce using the exponent operator (**) instead of Math.pow()',
    fixable: 'code',
    name: 'prefer-exponent-operator',
    recommended: false,
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
      visitNode(node: Node, _context: VisitorContext) {
        const result = isMathPowCall(node)
        if (!result) return

        if (mergedOptions.ignoreNonIntegerExponent && !isIntegerLiteral(result.exponent)) {
          return
        }

        const range = getNodeRange(node)
        const baseText = result.base.getText()
        const exponentText = result.exponent.getText()

        violations.push({
          filePath: sourceFile.getFilePath(),
          message: `Use the exponent operator (**) instead of 'Math.pow(${baseText}, ${exponentText})'.`,
          range,
          ruleId: 'prefer-exponent-operator',
          severity: 'info',
          suggestion: `Replace with: ${baseText} ** ${exponentText}`,
        })
      },
    }
  )

  return violations
}

export default preferExponentOperatorRule
