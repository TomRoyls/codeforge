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

export const preferNullishCoalescingRule: RuleDefinition<PreferNullishCoalescingOptions> = {
  meta: {
    name: 'prefer-nullish-coalescing',
    description: 'Enforce using ?? instead of || for default values',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (_options: PreferNullishCoalescingOptions) => {
    const violations: RuleViolation[] = []
    

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          if (!Node.isBinaryExpression(node)) return
          if (node.getOperatorToken().getKind() !== SyntaxKind.BarBarToken) return
          
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
  _options: PreferNullishCoalescingOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        if (!Node.isBinaryExpression(node)) return
        if (node.getOperatorToken().getKind() !== SyntaxKind.BarBarToken) return
        
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
