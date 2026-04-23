import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferObjectSpreadOptions extends RuleOptions {}

export const preferObjectSpreadRule: RuleDefinition<PreferObjectSpreadOptions> = {
  create(_options: PreferObjectSpreadOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!Node.isCallExpression(node)) return

          const expression = node.getExpression()
          if (!Node.isPropertyAccessExpression(expression)) return

          const target = expression.getExpression()
          if (!Node.isIdentifier(target) || target.getText() !== 'Object') return

          const method = expression.getName()
          if (method !== 'assign') return

          const args = node.getArguments()
          if (args.length === 0) return

          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Use object spread syntax instead of Object.assign().',
            range,
            ruleId: 'prefer-object-spread',
            severity: 'info',
            suggestion: 'Replace Object.assign(a, b) with { ...a, ...b }',
          })
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'style',
    description: 'Prefer object spread over Object.assign()',
    fixable: 'code',
    name: 'prefer-object-spread',
    recommended: false,
  },
}

export function analyzePreferObjectSpread(
  sourceFile: SourceFile,
  _options: PreferObjectSpreadOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitNode(node: Node, _context: VisitorContext) {
        if (!Node.isCallExpression(node)) return

        const expression = node.getExpression()
        if (!Node.isPropertyAccessExpression(expression)) return

        const target = expression.getExpression()
        if (!Node.isIdentifier(target) || target.getText() !== 'Object') return

        const method = expression.getName()
        if (method !== 'assign') return

        const args = node.getArguments()
        if (args.length === 0) return

        const range = getNodeRange(node)
        violations.push({
          filePath: sourceFile.getFilePath(),
          message: 'Use object spread syntax instead of Object.assign().',
          range,
          ruleId: 'prefer-object-spread',
          severity: 'info',
          suggestion: 'Replace Object.assign(a, b) with { ...a, ...b }',
        })
      },
    },
    violations,
  )

  return violations
}
