/**
 * @fileoverview Prefer spread operator over .concat()
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferSpreadOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferSpreadOptions = {}

function isConcatCall(node: Node): { receiver: Node; args: Node[] } | null {
  if (!Node.isCallExpression(node)) return null
  const concatMethod = node.getExpression()
  if (!Node.isPropertyAccessExpression(concatMethod)) return null
  if (concatMethod.getName() !== 'concat') return null
  const receiver = concatMethod.getExpression()
  const args = node.getArguments()
  if (args.length === 0) return null
  return { receiver, args: [...args] }
}

export const preferSpreadRule: RuleDefinition<PreferSpreadOptions> = {
  meta: {
    name: 'prefer-spread',
    description: 'Enforce using spread operator instead of .concat() for array concatenation',
    category: 'style',
    severity: 'info',
    recommended: true,
    fixable: "code",
  },

  defaultOptions: DEFAULT_OPTIONS,

  create(_options: PreferSpreadOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isConcatCall(node)
          if (!result) return
          const { receiver, args } = result
          const range = getNodeRange(node)
          
          const spreadParts = [receiver.getText()]
          args.forEach(arg => {
            spreadParts.push('...' + arg.getText())
          })
          const fixText = '[' + spreadParts.join(', ') + ']'
          
          violations.push({
            ruleId: 'prefer-spread',
            severity: 'info',
            message: 'Use spread operator instead of .concat()',
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

export function analyzePreferSpread(
  sourceFile: SourceFile,
  _options: PreferSpreadOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        const result = isConcatCall(node)
        if (!result) return
        const { receiver, args } = result
        const range = getNodeRange(node)
        
        const spreadParts = [receiver.getText()]
        args.forEach(arg => {
          spreadParts.push('...' + arg.getText())
        })
        const fixText = '[' + spreadParts.join(', ') + ']'
        
        violations.push({
          ruleId: 'prefer-spread',
          severity: 'info',
          message: 'Use spread operator instead of .concat()',
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: 'Replace with: ' + fixText,
        })
      },
    }
  )

  return violations
}

export default preferSpreadRule
