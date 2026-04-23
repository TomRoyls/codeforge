/**
 * @file Disallow delete operator on variables
 */

import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange } from '../../ast/visitor.js'

interface NoDynamicDeleteOptions extends RuleOptions {}

const DEFAULT_OPTIONS: NoDynamicDeleteOptions = {}

function isDynamicDelete(node: Node): Node | null {
  if (!Node.isDeleteExpression(node)) return null
  
  const expression = node.getExpression()
  if (!expression) return null
  
  // Flag delete on identifiers (variables) - this is bad practice
  // Also flag delete on computed property access
  if (Node.isIdentifier(expression)) {
    return expression
  }
  
  // Check for computed property access: obj[expr]
  if (Node.isElementAccessExpression(expression)) {
    const argument = expression.getArgumentExpression()
    if (argument && !Node.isStringLiteral(argument) && !Node.isNumericLiteral(argument)) {
      return expression
    }
  }
  
  return null
}

export const noDynamicDeleteRule: RuleDefinition<NoDynamicDeleteOptions> = {
  create(_options: NoDynamicDeleteOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isDynamicDelete(node)
          if (!result) return

          const range = getNodeRange(node)
          const exprText = result.getText()

          if (Node.isIdentifier(result)) {
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: 'Deleting local variables is not allowed. Use undefined assignment or refactor instead.',
              range,
              ruleId: 'no-dynamic-delete',
              severity: 'warning',
              suggestion: 'Set to undefined or refactor: ' + exprText + ' = undefined',
            })
          } else {
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: 'Deleting computed properties can be slow. Consider using a Map or Set.',
              range,
              ruleId: 'no-dynamic-delete',
              severity: 'warning',
              suggestion: 'Consider using Map.delete() or Set.delete() for dynamic key removal',
            })
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'correctness',
    description: 'Disallow delete operator on variables and computed property access',
    fixable: 'code',
    name: 'no-dynamic-delete',
    recommended: false,
  },
}

export function analyzeNoDynamicDelete(
  sourceFile: SourceFile,
  _options: NoDynamicDeleteOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  function visit(node: Node) {
    const result = isDynamicDelete(node)
    if (result) {
      const range = getNodeRange(node)
      const exprText = result.getText()

      if (Node.isIdentifier(result)) {
        violations.push({
          filePath: sourceFile.getFilePath(),
          message: 'Deleting local variables is not allowed. Use undefined assignment or refactor instead.',
          range,
          ruleId: 'no-dynamic-delete',
          severity: 'warning',
          suggestion: 'Set to undefined or refactor: ' + exprText + ' = undefined',
        })
      } else {
        violations.push({
          filePath: sourceFile.getFilePath(),
          message: 'Deleting computed properties can be slow. Consider using a Map or Set.',
          range,
          ruleId: 'no-dynamic-delete',
          severity: 'warning',
          suggestion: 'Consider using Map.delete() or Set.delete() for dynamic key removal',
        })
      }
    }

    node.forEachChild(visit)
  }

  visit(sourceFile)
  return violations
}
