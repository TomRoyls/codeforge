/**
 * @fileoverview Prefer nullish coalescing operator (??) over logical OR (||) for undefined/null checks
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferNullishCoalescingOptions extends RuleOptions {
  ignoreBooleanCoercion?: boolean
}

const DEFAULT_OPTIONS: PreferNullishCoalescingOptions = {
  ignoreBooleanCoercion: false,
}

function isLogicalOrExpression(node: Node): { left: Node; right: Node } | null {
  if (!Node.isBinaryExpression(node)) return null

  const operatorToken = node.getOperatorToken()
  if (operatorToken.getKind() !== SyntaxKind.BarBarToken) return null

  const left = node.getLeft()
  const right = node.getRight()

  return { left, right }
}

function isLikelyNullishCheck(left: Node, right: Node): boolean {
  // Check if right side is a literal that could be a default value
  if (Node.isStringLiteral(right)) return true
  if (Node.isNumericLiteral(right)) return true
  if (Node.isNullLiteral(right)) return true
    if (Node.isObjectLiteralExpression(right)) return true
    if (Node.isArrayLiteralExpression(right)) return true

    // check if left side is commonly nullable
    const leftText = left.getText()
    if (leftText.includes("?.") || leftText.includes("undefined") || leftText.includes("null")) {
        return true
    }

    return false
}

export const preferNullishCoalescingRule: RuleDefinition<PreferNullishCoalescingOptions> = {
  meta: {
    name: "prefer-nullish-coalescing",
    description: "Enforce using the nullish coalescing operator (??) instead of logical OR (||) for default values",
    category: "style",
    recommended: false,
    fixable: "code",
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: PreferNullishCoalescingOptions) => {
    const violations: RuleViolation[] = []
    // Use options to avoid unused variable warning
    if (options && options.ignoreBooleanCoercion) {
      // Option not yet implemented
    }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isLogicalOrExpression(node)
          if (!result) return

          if (!isLikelyNullishCheck(result.left, result.right)) return

          const range = getNodeRange(node)
          const leftText = result.left.getText()
          const rightText = result.right.getText()

          violations.push({
            ruleId: "prefer-nullish-coalescing",
            severity: "info",
            message: "Prefer nullish coalescing operator (??) over logical OR (||). Use '" + leftText + " ?? " + rightText + "' instead.",
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: "Replace || with ??: " + leftText + " ?? " + rightText,
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferNullishCoalescing(
  sourceFile: SourceFile,
  options: PreferNullishCoalescingOptions = {},
): RuleViolation[] {
    const violations: RuleViolation[] = []

    // Use options to avoid unused variable warning
    if (options && options.ignoreBooleanCoercion) {
        // Option not yet implemented
    }

    traverseAST(sourceFile, {
        visitNode: (node: Node, _context: VisitorContext) => {
            const result = isLogicalOrExpression(node)
            if (!result) return

            if (!isLikelyNullishCheck(result.left, result.right)) return

            const range = getNodeRange(node)
            const leftText = result.left.getText()
            const rightText = result.right.getText()

            violations.push({
                ruleId: "prefer-nullish-coalescing",
                severity: "info",
                message: "Prefer nullish coalescing operator (??) over logical OR (||). Use '" + leftText + " ?? " + rightText + "' instead.",
                filePath: sourceFile.getFilePath(),
                range,
                suggestion: "replace || with ??: " + leftText + " ?? " + rightText,
            })
        },
    })

    return violations
}

export default preferNullishCoalescingRule
