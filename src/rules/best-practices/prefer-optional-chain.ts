/**
 * @fileoverview Prefer optional chaining operator (?.) over explicit null/undefined checks
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferOptionalChainOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferOptionalChainOptions = {}

function isExplicitNullCheck(node: Node): { object: Node; property: Node } | null {
  // Look for: obj && obj.property
  if (!Node.isBinaryExpression(node)) return null

  const operatorToken = node.getOperatorToken()
  if (operatorToken.getKind() !== SyntaxKind.AmpersandAmpersandToken) return null

  const left = node.getLeft()
  const right = node.getRight()

  // Check if right is a property access on the same object
  if (!Node.isPropertyAccessExpression(right)) return null

  const rightObject = right.getExpression()
  
  // Check if left is the same object (or a simple identifier check)
  if (!Node.isIdentifier(left) && !Node.isPropertyAccessExpression(left)) return null

  const leftText = left.getText()
  const rightObjectText = rightObject.getText()

  // Match: obj && obj.prop or obj.prop && obj.prop.nested
  if (leftText !== rightObjectText) return null

  return { object: left, property: right }
}

export const preferOptionalChainRule: RuleDefinition<PreferOptionalChainOptions> = {
  meta: {
    name: 'prefer-optional-chain',
    description: 'Enforce using optional chaining operator (?.) instead of explicit null/undefined checks',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (_options: PreferOptionalChainOptions) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isExplicitNullCheck(node)
          if (!result) return

          const range = getNodeRange(node)
          const propertyText = result.property.getText()

          // Convert obj && obj.prop to obj?.prop
          const optionalChain = propertyText.replace(/\./g, '?.')

          violations.push({
            ruleId: 'prefer-optional-chain',
            severity: 'info',
            message: "Use optional chaining (?.) instead of explicit null check.",
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Replace with: ' + optionalChain,
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferOptionalChain(
  sourceFile: SourceFile,
  _options: PreferOptionalChainOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        const result = isExplicitNullCheck(node)
        if (!result) return

        const range = getNodeRange(node)
        const propertyText = result.property.getText()
        const optionalChain = propertyText.replace(/\./g, '?.')

        violations.push({
          ruleId: 'prefer-optional-chain',
          severity: 'info',
          message: "Use optional chaining (?.) instead of explicit null check.",
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: 'Replace with: ' + optionalChain,
        })
      },
    }
  )

  return violations
}

export default preferOptionalChainRule
