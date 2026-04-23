/**
 * @file Prefer String.startsWith() over String(start,) + String(end)
 */

import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

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
  create(_options: PreferStringStartEndOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!isStringConcatenation(node)) return

          const range = getNodeRange(node)

          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Prefer template literals over string concatenation',
            range,
            ruleId: 'prefer-string-start-end',
            severity: 'warning',
            suggestion: 'Consider using a template literal instead',
          })
        },
      },
    }
  },

  defaultOptions: DEFAULT_OPTIONS,

  meta: {
    category: 'style',
    description: 'Prefer template literals over string concatenation',
    name: 'prefer-string-start-end',
    recommended: false,
    severity: 'warning',
  },
}

export function analyzePreferStringStartEnd(
  sourceFile: SourceFile,
  _options: PreferStringStartEndOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(sourceFile, {
    visitNode(node: Node, _context: VisitorContext) {
      if (!isStringConcatenation(node)) return

      const range = getNodeRange(node)

      violations.push({
        filePath: sourceFile.getFilePath(),
        message: 'Prefer template literals over string concatenation',
        range,
        ruleId: 'prefer-string-start-end',
        severity: 'warning',
        suggestion: 'Consider using a template literal instead',
      })
    },
  })

  return violations
}

export default preferStringStartEndRule
