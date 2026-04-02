/**
 * @fileoverview Prefer .find() over .filter()[0] or .filter().shift()
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferArrayFindOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferArrayFindOptions = {}

/**
 * Check if node is .filter()[0] pattern
 */
function isFilterWithZeroIndex(node: Node): { receiver: Node; callback: Node | null } | null {
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
  
  return { receiver, callback }
}

/**
 * Check if node is .filter().shift() pattern
 */
function isFilterWithShift(node: Node): { receiver: Node; callback: Node | null } | null {
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
  
  return { receiver, callback }
}

export const preferArrayFindRule: RuleDefinition<PreferArrayFindOptions> = {
  meta: {
    name: 'prefer-array-find',
    description: 'Enforce using find() method instead of filter()[0] or filter().shift() for finding a single element',
    category: 'performance',
    severity: 'warning',
    recommended: true,
  },

  defaultOptions: DEFAULT_OPTIONS,

  create(_options: PreferArrayFindOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          // Check for .filter()[0]
          const indexResult = isFilterWithZeroIndex(node)
          if (indexResult) {
            const { receiver, callback } = indexResult
            const range = getNodeRange(node)
            const callbackText = callback ? callback.getText() : 'x => x'
            const fixText = `${receiver.getText()}.find(${callbackText})`
            
            violations.push({
              ruleId: 'prefer-array-find',
              severity: 'warning',
              message: 'Use .find() instead of .filter()[0]',
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion: 'Replace with: ' + fixText,
            })
            return
          }
          
          // Check for .filter().shift()
          const shiftResult = isFilterWithShift(node)
          if (shiftResult) {
            const { receiver, callback } = shiftResult
            const range = getNodeRange(node)
            const callbackText = callback ? callback.getText() : 'x => x'
            const fixText = `${receiver.getText()}.find(${callbackText})`
            
            violations.push({
              ruleId: 'prefer-array-find',
              severity: 'warning',
              message: 'Use .find() instead of .filter().shift()',
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion: 'Replace with: ' + fixText,
            })
          }
        },
      },
      onComplete: () => violations,
    }
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
      visitNode: (node: Node, _context: VisitorContext) => {
        // Check for .filter()[0]
        const indexResult = isFilterWithZeroIndex(node)
        if (indexResult) {
          const { receiver, callback } = indexResult
          const range = getNodeRange(node)
          const callbackText = callback ? callback.getText() : 'x => x'
          const fixText = `${receiver.getText()}.find(${callbackText})`
          
          violations.push({
            ruleId: 'prefer-array-find',
            severity: 'warning',
            message: 'Use .find() instead of .filter()[0]',
            filePath: sourceFile.getFilePath(),
            range,
            suggestion: 'Replace with: ' + fixText,
          })
          return
        }
        
        // Check for .filter().shift()
        const shiftResult = isFilterWithShift(node)
        if (shiftResult) {
          const { receiver, callback } = shiftResult
          const range = getNodeRange(node)
          const callbackText = callback ? callback.getText() : 'x => x'
          const fixText = `${receiver.getText()}.find(${callbackText})`
          
          violations.push({
            ruleId: 'prefer-array-find',
            severity: 'warning',
            message: 'Use .find() instead of .filter().shift()',
            filePath: sourceFile.getFilePath(),
            range,
            suggestion: 'Replace with: ' + fixText,
          })
        }
      },
    }
  )

  return violations
}

export default preferArrayFindRule
