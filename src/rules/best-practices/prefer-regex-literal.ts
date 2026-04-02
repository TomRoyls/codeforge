/**
 * @fileoverview Prefer regex literal over RegExp constructor
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferRegexLiteralOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferRegexLiteralOptions = {}

function isNewRegExpCall(node: Node): { pattern: Node; flags: Node | null } | null {
  if (!Node.isNewExpression(node)) return null

  const expression = node.getExpression()
  if (!Node.isIdentifier(expression)) return null

  if (expression.getText() !== 'RegExp') return null

  const args = node.getArguments()
  if (args.length === 0) return null

  const pattern = args[0]
  if (!pattern) return null

  const flags = args.length > 1 ? (args[1] ?? null) : null

  return { pattern, flags }
}

function isStaticPattern(node: Node): boolean {
  // Allow both string literals and regex literals
  if (!Node.isStringLiteral(node) && !Node.isRegularExpressionLiteral(node)) return false

  // For string literals, check for template interpolation
  if (Node.isStringLiteral(node)) {
    const text = node.getText()
    if (text.includes('${')) return false

    // Check for complex regex patterns with special characters that might need escaping
    const patternText = text.slice(1, -1)
    const complexPatternRegex = /[\\\[\]{}()|^$.*+?|]/
    if (complexPatternRegex.test(patternText)) return false
  }

  return true
}

export const preferRegexLiteralRule: RuleDefinition<PreferRegexLiteralOptions> = {
  meta: {
    name: 'prefer-regex-literal',
    description: 'Enforce using regex literals instead of RegExp constructor',
    category: 'style',
    severity: 'info',
    recommended: true,
  },

  defaultOptions: DEFAULT_OPTIONS,

  create(_options: PreferRegexLiteralOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isNewRegExpCall(node)
          if (!result) return

          const { pattern, flags } = result

          if (!isStaticPattern(pattern)) return

          const range = getNodeRange(node)
          // Extract pattern text: for regex literals use directly, for strings remove quotes and wrap
          let fixText: string
          if (Node.isRegularExpressionLiteral(pattern)) {
            fixText = pattern.getText() + (flags ? flags.getText().slice(1, -1) : '')
          } else {
            const patternText = pattern.getText().slice(1, -1)
            const flagsText = flags ? flags.getText().slice(1, -1) : ''
            fixText = '/' + patternText + '/' + flagsText
          }

          violations.push({
            ruleId: 'prefer-regex-literal',
            severity: 'info',
            message: 'Use regex literal instead of RegExp constructor',
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Replace with: ' + fixText,
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferRegexLiteral(
  sourceFile: SourceFile,
  _options: PreferRegexLiteralOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(sourceFile, {
    visitNode: (node: Node, _context: VisitorContext) => {
      const result = isNewRegExpCall(node)
      if (!result) return

      const { pattern, flags } = result

      if (!isStaticPattern(pattern)) return

      const range = getNodeRange(node)
      // Extract pattern text: for regex literals use directly, for strings remove quotes and wrap
      let fixText: string
      if (Node.isRegularExpressionLiteral(pattern)) {
        fixText = pattern.getText() + (flags ? flags.getText().slice(1, -1) : '')
      } else {
        const patternText = pattern.getText().slice(1, -1)
        const flagsText = flags ? flags.getText().slice(1, -1) : ''
        fixText = '/' + patternText + '/' + flagsText
      }

      violations.push({
        ruleId: 'prefer-regex-literal',
        severity: 'info',
        message: 'Use regex literal instead of RegExp constructor',
        filePath: sourceFile.getFilePath(),
        range,
        suggestion: 'Replace with: ' + fixText,
      })
    },
  })

  return violations
}

export default preferRegexLiteralRule
