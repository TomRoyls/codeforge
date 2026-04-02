/**
 * @fileoverview Suggests using Array.prototype.some() instead of indexOf checks
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferArraySomeOptions extends RuleOptions {
  checkIndexOf?: boolean
}

const DEFAULT_OPTIONS: PreferArraySomeOptions = {
  checkIndexOf: true,
}

function isIndexOfCheck(node: Node): { indexOfCall: Node; comparisonType: 'exists' | 'not-exists' } | null {
  if (!Node.isBinaryExpression(node)) return null
  
  const operator = node.getOperatorToken().getKind()
  const left = node.getLeft()
  const right = node.getRight()
  
  // Check for arr.indexOf(x) !== -1 or arr.indexOf(x) != -1
  if (operator === SyntaxKind.ExclamationEqualsEqualsToken || operator === SyntaxKind.ExclamationEqualsToken) {
    if (Node.isCallExpression(left) && isNegativeOne(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { indexOfCall: left, comparisonType: 'exists' }
      }
    }
  }
  
  // Check for arr.indexOf(x) >= 0 or arr.indexOf(x) > -1
  if (operator === SyntaxKind.GreaterThanEqualsToken) {
    if (Node.isCallExpression(left) && isZero(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { indexOfCall: left, comparisonType: 'exists' }
      }
    }
  }
  
  if (operator === SyntaxKind.GreaterThanToken) {
    if (Node.isCallExpression(left) && isNegativeOne(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { indexOfCall: left, comparisonType: 'exists' }
      }
    }
  }
  
  // Check for arr.indexOf(x) === -1 or arr.indexOf(x) == -1 (element does not exist)
  if (operator === SyntaxKind.EqualsEqualsEqualsToken || operator === SyntaxKind.EqualsEqualsToken) {
    if (Node.isCallExpression(left) && isNegativeOne(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { indexOfCall: left, comparisonType: 'not-exists' }
      }
    }
  }
  
  // Check for arr.indexOf(x) < 0 (element does not exist)
  if (operator === SyntaxKind.LessThanToken) {
    if (Node.isCallExpression(left) && isZero(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { indexOfCall: left, comparisonType: 'not-exists' }
      }
    }
  }
  
  return null
}

function isNegativeOne(node: Node): boolean {
  if (!Node.isPrefixUnaryExpression(node)) return false
  const operatorToken = node.getOperatorToken()
  if (operatorToken !== SyntaxKind.MinusToken) return false
  const operand = node.getOperand()
  if (!Node.isNumericLiteral(operand)) return false
  return operand.getLiteralValue() === 1
}

function isZero(node: Node): boolean {
  if (!Node.isNumericLiteral(node)) return false
  return node.getLiteralValue() === 0
}

function checkNode(node: Node, options: PreferArraySomeOptions): RuleViolation[] {
  const violations: RuleViolation[] = []
  
  if (!options.checkIndexOf) return violations
  
  const result = isIndexOfCheck(node)
  if (!result) return violations
  
  const { comparisonType } = result
  const range = getNodeRange(node)
  
  if (comparisonType === 'exists') {
    violations.push({
      ruleId: 'prefer-array-some',
      severity: 'suggestion',
      message: 'Use Array.prototype.some() instead of indexOf() for checking element existence.',
      filePath: node.getSourceFile().getFilePath(),
      range,
      suggestion: 'Replace with arr.some(x => x === searchValue) for better readability.',
    })
  } else {
    violations.push({
      ruleId: 'prefer-array-some',
      severity: 'suggestion',
      message: 'Use Array.prototype.every() or !arr.some() instead of indexOf() for checking element absence.',
      filePath: node.getSourceFile().getFilePath(),
      range,
      suggestion: 'Replace with !arr.some(x => x === searchValue) or arr.every(x => x !== searchValue).',
    })
  }
  
  return violations
}

export const preferArraySomeRule: RuleDefinition<PreferArraySomeOptions> = {
  meta: {
    name: 'prefer-array-some',
    description: 'Suggests using Array.prototype.some() instead of indexOf checks',
    category: 'best-practices',
    recommended: false,
    fixable: undefined,
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: PreferArraySomeOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          violations.push(...checkNode(node, mergedOptions))
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferArraySome(
  sourceFile: SourceFile,
  options: PreferArraySomeOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        violations.push(...checkNode(node, mergedOptions))
      },
    },
    { filePath: sourceFile.getFilePath() }
  )

  return violations
}

export default preferArraySomeRule
