/**
 * @file Prefer for-of loop over for loop with index
 */

import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange } from '../../ast/visitor.js'

interface PreferForOfOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferForOfOptions = {}

function isSimpleIndexedForLoop(node: Node): null | { array: Node; indexVar: string } {
  if (!Node.isForStatement(node)) return null
  
  const initializer = node.getInitializer()
  const condition = node.getCondition()
  const incrementor = node.getIncrementor()
  
  if (!initializer || !condition || !incrementor) return null
  
  // Check initializer: let i = 0
  if (!Node.isVariableDeclarationList(initializer)) return null
  const declarations = initializer.getDeclarations()
  if (declarations.length !== 1) return null
  
  const decl = declarations[0]
  if (!decl) return null
  const indexVar = decl.getName()
  
  const initValue = decl.getInitializer()
  if (!initValue || !Node.isNumericLiteral(initValue)) return null
  if (initValue.getLiteralValue() !== 0) return null
  
  // Check condition: i < arr.length
  if (!Node.isBinaryExpression(condition)) return null
  const opToken = condition.getOperatorToken()
  if (opToken.getKind() !== SyntaxKind.LessThanToken) return null
  
  const left = condition.getLeft()
  if (!Node.isIdentifier(left) || left.getText() !== indexVar) return null
  
  const right = condition.getRight()
  if (!Node.isPropertyAccessExpression(right)) return null
  if (right.getName() !== 'length') return null
  const array = right.getExpression()
  
  // Check incrementor: i++ or ++i or i += 1
  let isValidIncrement = false
  
  if (Node.isPostfixUnaryExpression(incrementor)) {
    const token = incrementor.getOperatorToken()
    if (token === SyntaxKind.PlusPlusToken) {
      const operand = incrementor.getOperand()
      if (Node.isIdentifier(operand) && operand.getText() === indexVar) {
        isValidIncrement = true
      }
    }
  } else if (Node.isPrefixUnaryExpression(incrementor)) {
    const token = incrementor.getOperatorToken()
    if (token === SyntaxKind.PlusPlusToken) {
      const operand = incrementor.getOperand()
      if (Node.isIdentifier(operand) && operand.getText() === indexVar) {
        isValidIncrement = true
      }
    }
  } else if (Node.isBinaryExpression(incrementor)) {
    const incOp = incrementor.getOperatorToken()
    if (incOp.getKind() === SyntaxKind.PlusEqualsToken) {
      const incLeft = incrementor.getLeft()
      const incRight = incrementor.getRight()
      if (Node.isIdentifier(incLeft) && incLeft.getText() === indexVar && Node.isNumericLiteral(incRight) && incRight.getLiteralValue() === 1) {
          isValidIncrement = true
        }
    }
  }
  
  if (!isValidIncrement) return null
  
  // Check if body only uses arr[i] pattern (not writing to arr or using i for other purposes)
  const body = node.getStatement()
  if (!Node.isBlock(body)) return null // Only flag block bodies
  
  // Simple heuristic: if the index is only used for array access, suggest for-of
  let usesIndexForOtherPurpose = false
  body.forEachDescendant((descendant) => {
    if (Node.isIdentifier(descendant) && descendant.getText() === indexVar) {
      // Check if it's part of an element access expression arr[i]
      const parent = descendant.getParent()
      if (parent && Node.isElementAccessExpression(parent)) {
        const arr = parent.getExpression()
        if (arr && arr.getText() === array.getText()) {
          return // This is the expected pattern
        }
      }

      usesIndexForOtherPurpose = true
    }
  })
  
  if (usesIndexForOtherPurpose) return null
  
  return { array, indexVar }
}

export const preferForOfRule: RuleDefinition<PreferForOfOptions> = {
  create(_options: PreferForOfOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isSimpleIndexedForLoop(node)
          if (!result) return

          const range = getNodeRange(node)
          const arrayText = result.array.getText()

          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Use for-of loop instead of indexed for loop when only iterating values.',
            range,
            ruleId: 'prefer-for-of',
            severity: 'info',
            suggestion: 'Replace with: for (const item of ' + arrayText + ') { ... }',
          })
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Prefer for-of loop over for loop with index when only iterating values',
    fixable: 'code',
    name: 'prefer-for-of',
    recommended: false,
  },
}

export function analyzePreferForOf(
  sourceFile: SourceFile,
  _options: PreferForOfOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  function visit(node: Node) {
    const result = isSimpleIndexedForLoop(node)
    if (result) {
      const range = getNodeRange(node)
      const arrayText = result.array.getText()

      violations.push({
        filePath: sourceFile.getFilePath(),
        message: 'Use for-of loop instead of indexed for loop when only iterating values.',
        range,
        ruleId: 'prefer-for-of',
        severity: 'info',
        suggestion: 'Replace with: for (const item of ' + arrayText + ') { ... }',
      })
    }

    node.forEachChild(visit)
  }

  visit(sourceFile)
  return violations
}
