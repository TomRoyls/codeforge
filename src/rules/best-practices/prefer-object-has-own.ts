/**
 * @fileoverview Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call()
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferObjectHasOwnOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferObjectHasOwnOptions = {}

function isHasOwnPropertyCall(node: Node): { object: Node; property: Node } | null {
  if (!Node.isCallExpression(node)) return null

  const expression = node.getExpression()
  if (!Node.isPropertyAccessExpression(expression)) return null

  const propertyAccess = expression.getExpression()
  if (!Node.isPropertyAccessExpression(propertyAccess)) return null

  const callExpression = propertyAccess.getExpression()
  if (!Node.isPropertyAccessExpression(callExpression)) return null

  // Check for Object.prototype.hasOwnProperty.call
  const objectExpr = callExpression.getExpression()
  if (!Node.isIdentifier(objectExpr)) return null
  if (objectExpr.getText() !== 'Object') return null

  const prototypeProperty = callExpression.getName()
  if (prototypeProperty !== 'prototype') return null

  const hasOwnPropertyProperty = propertyAccess.getName()
  if (hasOwnPropertyProperty !== 'hasOwnProperty') return null

  const callMethod = expression.getName()
  if (callMethod !== 'call') return null

  const args = node.getArguments()
  if (args.length < 2) return null

  const object = args[0]
  const property = args[1]

  if (!object || !property) return null

  return { object, property }
}

export const preferObjectHasOwnRule: RuleDefinition<PreferObjectHasOwnOptions> = {
  meta: {
    name: 'prefer-object-has-own',
    description: 'Enforce using Object.hasOwn() instead of Object.prototype.hasOwnProperty.call()',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (_options: PreferObjectHasOwnOptions) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isHasOwnPropertyCall(node)
          if (!result) return

          const range = getNodeRange(node)
          const objectText = result.object.getText()
          const propertyText = result.property.getText()

          violations.push({
            ruleId: 'prefer-object-has-own',
            severity: 'info',
            message: "Use Object.hasOwn() instead of Object.prototype.hasOwnProperty.call().",
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Replace with: Object.hasOwn(' + objectText + ', ' + propertyText + ')',
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferObjectHasOwn(
  sourceFile: SourceFile,
  _options: PreferObjectHasOwnOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        const result = isHasOwnPropertyCall(node)
        if (!result) return

        const range = getNodeRange(node)
        const objectText = result.object.getText()
        const propertyText = result.property.getText()

        violations.push({
          ruleId: 'prefer-object-has-own',
          severity: 'info',
          message: "Use Object.hasOwn() instead of Object.prototype.hasOwnProperty.call().",
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: 'Replace with: Object.hasOwn(' + objectText + ', ' + propertyText + ')',
        })
      },
    }
  )

  return violations
}

export default preferObjectHasOwnRule
