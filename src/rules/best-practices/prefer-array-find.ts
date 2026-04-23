/**
 * @file Prefer .find() over .filter()[0] or .filter().shift()
 */

import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferArrayFindOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferArrayFindOptions = {}

/**
 * Check if node is .filter()[0] pattern
 */
function isFilterWithZeroIndex(node: Node): null | { callback: Node | null; receiver: Node; } {
  if (!Node.isElementAccessExpression(node)) return null
  
  const indexExpr = node.getArgumentExpression()
  if (!indexExpr) return null
  if (!Node.isNumericLiteral(indexExpr)) return null
  if (indexExpr.getLiteralValue() !== 0) return null
  
  const filterExpr = node.getExpression()
  if (!Node.isCallExpression(filterExpr)) return null
  
  const filterMethod = filterExpr.getExpression()
  if (!Node.isPropertyAccessExpression(filterMethod)) return null
  
  if (filterMethod.getName() !== 'filter') return null
  
  const receiver = filterMethod.getExpression()
  const args = filterExpr.getArguments()
  const callback = args.length > 0 ? args[0] ?? null : null
  
  return { callback, receiver }
}

/**
 * Check if node is .filter().shift() pattern
 */
function isFilterWithShift(node: Node): null | { callback: Node | null; receiver: Node; } {
  if (!Node.isCallExpression(node)) return null
  
  const shiftMethod = node.getExpression()
  if (!Node.isPropertyAccessExpression(shiftMethod)) return null
  
  if (shiftMethod.getName() !== 'shift') return null
  
  const filterExpr = shiftMethod.getExpression()
  if (!Node.isCallExpression(filterExpr)) return null
  
  const filterMethod = filterExpr.getExpression()
  if (!Node.isPropertyAccessExpression(filterMethod)) return null
  
  if (filterMethod.getName() !== 'filter') return null
  
  const receiver = filterMethod.getExpression()
  const args = filterExpr.getArguments()
  const callback = args.length > 0 ? args[0] ?? null : null
  
  return { callback, receiver }
}

export const preferArrayFindRule: RuleDefinition<PreferArrayFindOptions> = {
  create(_options: PreferArrayFindOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          // Check for .filter()[0]
          const indexResult = isFilterWithZeroIndex(node)
          if (indexResult) {
            const { callback, receiver } = indexResult
            const range = getNodeRange(node)
            const callbackText = callback ? callback.getText() : 'x => x'
            const fixText = `${receiver.getText()}.find(${callbackText})`
            
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: 'Use .find() instead of .filter()[0]',
              range,
              ruleId: 'prefer-array-find',
              severity: 'warning',
              suggestion: 'Replace with: ' + fixText,
            })
            return
          }
          
          // Check for .filter().shift()
          const shiftResult = isFilterWithShift(node)
          if (shiftResult) {
            const { callback, receiver } = shiftResult
            const range = getNodeRange(node)
            const callbackText = callback ? callback.getText() : 'x => x'
            const fixText = `${receiver.getText()}.find(${callbackText})`
            
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: 'Use .find() instead of .filter().shift()',
              range,
              ruleId: 'prefer-array-find',
              severity: 'warning',
              suggestion: 'Replace with: ' + fixText,
            })
          }
        },
      },
    }
  },

  defaultOptions: DEFAULT_OPTIONS,

  meta: {
    category: 'performance',
    description: 'Enforce using find() method instead of filter()[0] or filter().shift() for finding a single element',
    name: 'prefer-array-find',
    recommended: true,
    severity: 'warning',
  },
}

export function analyzePreferArrayFind(
  sourceFile: SourceFile,
  _options: PreferArrayFindOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitNode(node: Node, _context: VisitorContext) {
        // Check for .filter()[0]
        const indexResult = isFilterWithZeroIndex(node)
        if (indexResult) {
          const { callback, receiver } = indexResult
          const range = getNodeRange(node)
          const callbackText = callback ? callback.getText() : 'x => x'
          const fixText = `${receiver.getText()}.find(${callbackText})`
          
          violations.push({
            filePath: sourceFile.getFilePath(),
            message: 'Use .find() instead of .filter()[0]',
            range,
            ruleId: 'prefer-array-find',
            severity: 'warning',
            suggestion: 'Replace with: ' + fixText,
          })
          return
        }
        
        // Check for .filter().shift()
        const shiftResult = isFilterWithShift(node)
        if (shiftResult) {
          const { callback, receiver } = shiftResult
          const range = getNodeRange(node)
          const callbackText = callback ? callback.getText() : 'x => x'
          const fixText = `${receiver.getText()}.find(${callbackText})`
          
          violations.push({
            filePath: sourceFile.getFilePath(),
            message: 'Use .find() instead of .filter().shift()',
            range,
            ruleId: 'prefer-array-find',
            severity: 'warning',
            suggestion: 'Replace with: ' + fixText,
          })
        }
      },
    }
  )

  return violations
}

export default preferArrayFindRule
