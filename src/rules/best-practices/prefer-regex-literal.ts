/**
 * @file Prefer regex literal over RegExp constructor
 */

import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferRegexLiteralOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferRegexLiteralOptions = {}

function isNewRegExpCall(node: Node): null | { flags: Node | null; pattern: Node } {
  if (!Node.isNewExpression(node)) return null

  const expression = node.getExpression()
  if (!Node.isIdentifier(expression)) return null

  if (expression.getText() !== 'RegExp') return null

  const args = node.getArguments()
  if (args.length === 0) return null

  const pattern = args[0]
  if (!pattern) return null

  const flags = args.length > 1 ? (args[1] ?? null) : null

  return { flags, pattern }
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
    const complexPatternRegex = /[\\[\]{}()|^$.*+?|]/
    if (complexPatternRegex.test(patternText)) return false
  }

  return true
}

export const preferRegexLiteralRule: RuleDefinition<PreferRegexLiteralOptions> = {
  create(_options: PreferRegexLiteralOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isNewRegExpCall(node)
          if (!result) return

          const { flags, pattern } = result

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
            filePath: node.getSourceFile().getFilePath(),
            message: 'Use regex literal instead of RegExp constructor',
            range,
            ruleId: 'prefer-regex-literal',
            severity: 'info',
            suggestion: 'Replace with: ' + fixText,
          })
        },
      },
    }
  },

  defaultOptions: DEFAULT_OPTIONS,

  meta: {
    category: 'style',
    description: 'Enforce using regex literals instead of RegExp constructor',
    name: 'prefer-regex-literal',
    recommended: true,
    severity: 'info',
  },
}

export function analyzePreferRegexLiteral(
  sourceFile: SourceFile,
  _options: PreferRegexLiteralOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(sourceFile, {
    visitNode(node: Node, _context: VisitorContext) {
      const result = isNewRegExpCall(node)
      if (!result) return

      const { flags, pattern } = result

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
        filePath: sourceFile.getFilePath(),
        message: 'Use regex literal instead of RegExp constructor',
        range,
        ruleId: 'prefer-regex-literal',
        severity: 'info',
        suggestion: 'Replace with: ' + fixText,
      })
    },
  })

  return violations
}

export default preferRegexLiteralRule
