import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferObjectSpreadOptions extends RuleOptions {}

export const preferObjectSpreadRule: RuleDefinition<PreferObjectSpreadOptions> = {
  meta: {
    name: 'prefer-object-spread',
    description: 'Prefer object spread over Object.assign()',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: {},
  create: (_options: PreferObjectSpreadOptions) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
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
            ruleId: 'prefer-object-spread',
            severity: 'info',
            message: 'Use object spread syntax instead of Object.assign().',
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Replace Object.assign(a, b) with { ...a, ...b }',
          })
        },
      },
      onComplete: () => violations,
    }
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
      visitNode: (node: Node, _context: VisitorContext) => {
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
          ruleId: 'prefer-object-spread',
          severity: 'info',
          message: 'Use object spread syntax instead of Object.assign().',
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: 'Replace Object.assign(a, b) with { ...a, ...b }',
        })
      },
    },
    violations,
  )

  return violations
}
