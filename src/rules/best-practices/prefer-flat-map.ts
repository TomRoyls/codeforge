/**
 * @file Prefer .flat() over .reduce((acc, val) => acc.concat(val), [])
 */

import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferFlatMapOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferFlatMapOptions = {}

function isReduceConcatPattern(node: Node): null | { array: Node } {
  if (!Node.isCallExpression(node)) return null

  const expression = node.getExpression()
  if (!Node.isPropertyAccessExpression(expression)) return null

  const methodName = expression.getName()
  if (methodName !== 'reduce') return null

  const args = node.getArguments()
  if (args.length === 0) return null

  const callback = args[0]
  if (!Node.isArrowFunction(callback) && !Node.isFunctionExpression(callback)) return null

  // Check callback body for concat pattern
  const body = Node.isArrowFunction(callback) ? callback.getBody() : callback.getBody()
  if (!body) return null

  // Look for acc.concat(val) or [...acc, val] pattern in return statement
  const bodyText = body.getText()

  // Check for common concat patterns
  const concatPatterns = [
    /\w+\s*\.\s*concat\s*\(/,
    /\[\s*\.\.\.\s*\w+\s*,/,
    /\[\s*\.\.\.\s*\w+\s*\]\s*\.\s*concat\s*\(/,
  ]

  const hasConcatPattern = concatPatterns.some((pattern) => pattern.test(bodyText))
  if (!hasConcatPattern) return null

  const array = expression.getExpression()
  return { array }
}

export const preferFlatMapRule: RuleDefinition<PreferFlatMapOptions> = {
  create(_options: PreferFlatMapOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isReduceConcatPattern(node)
          if (!result) return

          const range = getNodeRange(node)
          const arrayText = result.array.getText()

          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Use .flat() instead of .reduce() for flattening arrays.',
            range,
            ruleId: 'prefer-flat-map',
            severity: 'info',
            suggestion: 'Replace with: ' + arrayText + '.flat()',
          })
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description:
      'Enforce using .flat() instead of .reduce((acc, val) => acc.concat(val), []) for flattening arrays',
    fixable: 'code',
    name: 'prefer-flat-map',
    recommended: false,
  },
}

export function analyzePreferFlatMap(
  sourceFile: SourceFile,
  _options: PreferFlatMapOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(sourceFile, {
    visitNode(node: Node, _context: VisitorContext) {
      const result = isReduceConcatPattern(node)
      if (!result) return

      const range = getNodeRange(node)
      const arrayText = result.array.getText()

      violations.push({
        filePath: sourceFile.getFilePath(),
        message: 'Use .flat() instead of .reduce() for flattening arrays.',
        range,
        ruleId: 'prefer-flat-map',
        severity: 'info',
        suggestion: 'Replace with: ' + arrayText + '.flat()',
      })
    },
  })

  return violations
}

export default preferFlatMapRule
