/**
 * @fileoverview Prefer .flat() over .reduce((acc, val) => acc.concat(val), [])
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferFlatMapOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferFlatMapOptions = {}

function isReduceConcatPattern(node: Node): { array: Node } | null {
  if (!Node.isCallExpression(node)) return null

  const expression = node.getExpression()
  if (!Node.isPropertyAccessExpression(expression)) return null

  const methodName = expression.getName()
  if (methodName !== 'reduce') return null

  const args = node.getArguments()
  if (args.length < 1) return null

  const callback = args[0]
  if (!Node.isArrowFunction(callback) && !Node.isFunctionExpression(callback)) return null

  // Check callback body for concat pattern
  const body = Node.isArrowFunction(callback) ? callback.getBody() : callback.getBody()
  if (!body) return null

  // Look for acc.concat(val) or [...acc, val] pattern in return statement
  const bodyText = body.getText()
  
  // Check for common concat patterns
  const concatPatterns = [
    /accs*.s*concats*(s*vals*)/,
    /[s*...s*accs*,s*vals*]/,
    /[s*...s*accs*]s*.s*concats*(s*vals*)/,
  ]

  const hasConcatPattern = concatPatterns.some(pattern => pattern.test(bodyText))
  if (!hasConcatPattern) return null

  const array = expression.getExpression()
  return { array }
}

export const preferFlatMapRule: RuleDefinition<PreferFlatMapOptions> = {
  meta: {
    name: 'prefer-flat-map',
    description: 'Enforce using .flat() instead of .reduce((acc, val) => acc.concat(val), []) for flattening arrays',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (_options: PreferFlatMapOptions) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isReduceConcatPattern(node)
          if (!result) return

          const range = getNodeRange(node)
          const arrayText = result.array.getText()

          violations.push({
            ruleId: 'prefer-flat-map',
            severity: 'info',
            message: "Use .flat() instead of .reduce() for flattening arrays.",
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Replace with: ' + arrayText + '.flat()',
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferFlatMap(
  sourceFile: SourceFile,
  _options: PreferFlatMapOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        const result = isReduceConcatPattern(node)
        if (!result) return

        const range = getNodeRange(node)
        const arrayText = result.array.getText()

        violations.push({
          ruleId: 'prefer-flat-map',
          severity: 'info',
          message: "Use .flat() instead of .reduce() for flattening arrays.",
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: 'Replace with: ' + arrayText + '.flat()',
        })
      },
    }
  )

  return violations
}

export default preferFlatMapRule
