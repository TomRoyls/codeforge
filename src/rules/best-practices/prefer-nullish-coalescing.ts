import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferNullishCoalescingOptions extends RuleOptions {
  ignoreConditionalTests?: boolean
}

const DEFAULT_OPTIONS: PreferNullishCoalescingOptions = {
  ignoreConditionalTests: true,
}

function isInConditionalTest(node: Node): boolean {
  let parent: Node | undefined = node.getParent()
  
  while (parent) {
    if (
      Node.isIfStatement(parent) ||
      Node.isWhileStatement(parent) ||
      Node.isDoStatement(parent) ||
      Node.isConditionalExpression(parent)
    ) {
      return true
    }
    parent = parent.getParent()
  }
  
  return false
}

export const preferNullishCoalescingRule: RuleDefinition<PreferNullishCoalescingOptions> = {
  meta: {
    name: 'prefer-nullish-coalescing',
    description: 'Enforce using ?? instead of || for default values',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: PreferNullishCoalescingOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          if (!Node.isBinaryExpression(node)) return
          if (node.getOperatorToken().getKind() !== SyntaxKind.BarBarToken) return
          
          // Skip if in conditional test and option is enabled
          if (mergedOptions.ignoreConditionalTests && isInConditionalTest(node)) {
            return
          }
          
          const range = getNodeRange(node)
          violations.push({
            ruleId: 'prefer-nullish-coalescing',
            severity: 'info',
            message: 'Prefer using ?? instead of || for default values.',
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Use ?? instead of ||.',
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
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        if (!Node.isBinaryExpression(node)) return
        if (node.getOperatorToken().getKind() !== SyntaxKind.BarBarToken) return
        
        // Skip if in conditional test and option is enabled
        if (mergedOptions.ignoreConditionalTests && isInConditionalTest(node)) {
          return
        }
        
        const range = getNodeRange(node)
        violations.push({
          ruleId: 'prefer-nullish-coalescing',
          severity: 'info',
          message: 'Prefer using ?? instead of || for default values.',
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: 'Use ?? instead of ||.',
        })
      },
    },
    violations,
  )

  return violations
}
