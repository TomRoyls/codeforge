/**
 * @file Prefer .includes() over .indexOf() for array membership checks
 */

import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferIncludesOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferIncludesOptions = {}

function isIndexOfComparison(node: Node): null | { array: Node; searchElement: Node } {
  if (!Node.isBinaryExpression(node)) return null

  const operatorToken = node.getOperatorToken()
  const operatorKind = operatorToken.getKind()
  
  // Check for !== -1 or != -1
  if (operatorKind !== SyntaxKind.ExclamationEqualsEqualsToken && 
      operatorKind !== SyntaxKind.EqualsEqualsToken) {
    return null
  }

  const left = node.getLeft()
  const right = node.getRight()

  // Check if right side is -1
  if (!Node.isPrefixUnaryExpression(right)) return null
  const rightOperator = right.getOperatorToken()
  if (rightOperator !== SyntaxKind.MinusToken) return null
  
  const rightOperand = right.getOperand()
  if (!Node.isNumericLiteral(rightOperand)) return null
  if (rightOperand.getLiteralValue() !== 1) return null

  // Check if left side is array.indexOf(element)
  if (!Node.isCallExpression(left)) return null
  
  const expression = left.getExpression()
  if (!Node.isPropertyAccessExpression(expression)) return null
  
  const methodName = expression.getName()
  if (methodName !== 'indexOf') return null

  const args = left.getArguments()
  if (args.length === 0) return null

  const searchElement = args[0]
  if (!searchElement) return null

  return { array: expression.getExpression(), searchElement }
}

export const preferIncludesRule: RuleDefinition<PreferIncludesOptions> = {
  create(_options: PreferIncludesOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isIndexOfComparison(node)
          if (!result) return

          const range = getNodeRange(node)
          const arrayText = result.array.getText()
          const elementText = result.searchElement.getText()

          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: "Use .includes() instead of .indexOf() for array membership check.",
            range,
            ruleId: 'prefer-includes',
            severity: 'info',
            suggestion: 'Replace with: ' + arrayText + '.includes(' + elementText + ')',
          })
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Enforce using includes() method instead of indexOf() for array membership checks',
    fixable: 'code',
    name: 'prefer-includes',
    recommended: false,
  },
}

export function analyzePreferIncludes(
  sourceFile: SourceFile,
  _options: PreferIncludesOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitNode(node: Node, _context: VisitorContext) {
        const result = isIndexOfComparison(node)
        if (!result) return

        const range = getNodeRange(node)
        const arrayText = result.array.getText()
        const elementText = result.searchElement.getText()

        violations.push({
          filePath: sourceFile.getFilePath(),
          message: "Use .includes() instead of .indexOf() for array membership check.",
          range,
          ruleId: 'prefer-includes',
          severity: 'info',
          suggestion: 'Replace with: ' + arrayText + '.includes(' + elementText + ')',
        })
      },
    }
  )

  return violations
}

export default preferIncludesRule
