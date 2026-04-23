/**
 * @file Suggests using Array.prototype.some() instead of indexOf checks
 */

import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferArraySomeOptions extends RuleOptions {
  checkIndexOf?: boolean
}

const DEFAULT_OPTIONS: PreferArraySomeOptions = {
  checkIndexOf: true,
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

function isIndexOfCheck(node: Node): null | { comparisonType: 'exists' | 'not-exists'; indexOfCall: Node; } {
  if (!Node.isBinaryExpression(node)) return null
  
  const operator = node.getOperatorToken().getKind()
  const left = node.getLeft()
  const right = node.getRight()
  
  // Check for arr.indexOf(x) !== -1 or arr.indexOf(x) != -1
  if ((operator === SyntaxKind.ExclamationEqualsEqualsToken || operator === SyntaxKind.ExclamationEqualsToken) && Node.isCallExpression(left) && isNegativeOne(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { comparisonType: 'exists', indexOfCall: left }
      }
    }
  
  // Check for arr.indexOf(x) >= 0
  if (operator === SyntaxKind.GreaterThanEqualsToken && Node.isCallExpression(left) && isZero(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { comparisonType: 'exists', indexOfCall: left }
      }
    }
  
  // Check for arr.indexOf(x) > -1
  if (operator === SyntaxKind.GreaterThanToken && Node.isCallExpression(left) && isNegativeOne(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { comparisonType: 'exists', indexOfCall: left }
      }
    }
  
  // Check for arr.indexOf(x) === -1 or arr.indexOf(x) == -1
  if ((operator === SyntaxKind.EqualsEqualsEqualsToken || operator === SyntaxKind.EqualsEqualsToken) && Node.isCallExpression(left) && isNegativeOne(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { comparisonType: 'not-exists', indexOfCall: left }
      }
    }
  
  // Check for arr.indexOf(x) < 0
  if (operator === SyntaxKind.LessThanToken && Node.isCallExpression(left) && isZero(right)) {
      const callee = left.getExpression()
      if (Node.isPropertyAccessExpression(callee) && callee.getName() === 'indexOf') {
        return { comparisonType: 'not-exists', indexOfCall: left }
      }
    }
  
  return null
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
      filePath: node.getSourceFile().getFilePath(),
      message: 'Use Array.prototype.some() instead of indexOf() for checking element existence.',
      range,
      ruleId: 'prefer-array-some',
      severity: 'info',
      suggestion: 'Replace with arr.some(x => x === searchValue) for better readability.',
    })
  } else {
    violations.push({
      filePath: node.getSourceFile().getFilePath(),
      message: 'Use Array.prototype.every() or !arr.some() instead of indexOf() for checking element absence.',
      range,
      ruleId: 'prefer-array-some',
      severity: 'info',
      suggestion: 'Replace with !arr.some(x => x === searchValue) or arr.every(x => x !== searchValue).',
    })
  }
  
  return violations
}

export const preferArraySomeRule: RuleDefinition<PreferArraySomeOptions> = {
  create(options: PreferArraySomeOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          violations.push(...checkNode(node, mergedOptions))
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Suggests using Array.prototype.some() instead of indexOf checks',
    fixable: undefined,
    name: 'prefer-array-some',
    recommended: false,
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
      visitNode(node: Node, _context: VisitorContext) {
        violations.push(...checkNode(node, mergedOptions))
      },
    },
    violations,
  )

  return violations
}

export default preferArraySomeRule
