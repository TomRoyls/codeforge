/**
 * @fileoverview Prefer String.startsWith() over String(start,) + String(end)
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferStringStartEndOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferStringStartEndOptions = {}

function isStringConcatenation(node: Node): boolean {
  if (!Node.isBinaryExpression(node)) return false

  const operatorToken = node.getOperatorToken()
  if (operatorToken.getText() !== '+') return false

  const left = node.getLeft()
  const right = node.getRight()

  return Node.isStringLiteral(left) || Node.isStringLiteral(right)
}

export const preferStringStartEndRule: RuleDefinition<PreferStringStartEndOptions> = {
  meta: {
    name: 'prefer-string-start-end',
    description: 'Prefer template literals over string concatenation',
    category: 'style',
    severity: 'warning',
    recommended: false,
  },

  defaultOptions: DEFAULT_OPTIONS,

  create(_options: PreferStringStartEndOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          if (!isStringConcatenation(node)) return

          const range = getNodeRange(node)

          violations.push({
            ruleId: 'prefer-string-start-end',
            severity: 'warning',
            message: 'Prefer template literals over string concatenation',
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Consider using a template literal instead',
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferStringStartEnd(
  sourceFile: SourceFile,
  _options: PreferStringStartEndOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(sourceFile, {
    visitNode: (node: Node, _context: VisitorContext) => {
      if (!isStringConcatenation(node)) return

      const range = getNodeRange(node)

      violations.push({
        ruleId: 'prefer-string-start-end',
        severity: 'warning',
        message: 'Prefer template literals over string concatenation',
        filePath: sourceFile.getFilePath(),
        range,
        suggestion: 'Consider using a template literal instead',
      })
    },
  })

  return violations
}

export default preferStringStartEndRule
