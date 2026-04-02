/**
 * @fileoverview Suggests using template literals instead of string concatenation
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferStringTemplateOptions extends RuleOptions {
  checkConcat?: boolean
}

const DEFAULT_OPTIONS: PreferStringTemplateOptions = {
  checkConcat: true,
}

function isStringConcatenation(node: Node): boolean {
  if (!Node.isBinaryExpression(node)) return false
  
  const operator = node.getOperatorToken().getKind()
  if (operator !== SyntaxKind.PlusToken) return false
  
  const left = node.getLeft()
  const right = node.getRight()
  
  // Check if at least one side is a string literal
  const leftIsString = Node.isStringLiteral(left)
  const rightIsString = Node.isStringLiteral(right)
  
  return leftIsString || rightIsString
}

export const preferStringTemplateRule: RuleDefinition<PreferStringTemplateOptions> = {
  meta: {
    name: 'prefer-string-template',
    description: 'Suggests using template literals instead of string concatenation',
    category: 'style',
    recommended: false,
    fixable: undefined,
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: PreferStringTemplateOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          if (mergedOptions.checkConcat && isStringConcatenation(node)) {
            const range = getNodeRange(node)
            violations.push({
              ruleId: 'prefer-string-template',
              severity: 'info',
              message: 'Use template literals instead of string concatenation for better readability.',
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion: 'Convert to template literal: \`string \${variable}\`',
            })
          }
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferStringTemplate(
  sourceFile: SourceFile,
  options: PreferStringTemplateOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        if (mergedOptions.checkConcat && isStringConcatenation(node)) {
          const range = getNodeRange(node)
          violations.push({
            ruleId: 'prefer-string-template',
            severity: 'info',
            message: 'Use template literals instead of string concatenation for better readability.',
            filePath: sourceFile.getFilePath(),
            range,
            suggestion: 'Convert to template literal: \`string \${variable}\`',
          })
        }
      },
    },
    violations,
  )

  return violations
}

export default preferStringTemplateRule
