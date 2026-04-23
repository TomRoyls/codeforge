/**
 * @file Prefer spread operator over .concat()
 */

import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferSpreadOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferSpreadOptions = {}

function isConcatCall(node: Node): null | { args: Node[]; receiver: Node; } {
  if (!Node.isCallExpression(node)) return null
  const concatMethod = node.getExpression()
  if (!Node.isPropertyAccessExpression(concatMethod)) return null
  if (concatMethod.getName() !== 'concat') return null
  const receiver = concatMethod.getExpression()
  const args = node.getArguments()
  if (args.length === 0) return null
  return { args: [...args], receiver }
}

export const preferSpreadRule: RuleDefinition<PreferSpreadOptions> = {
  create(_options: PreferSpreadOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isConcatCall(node)
          if (!result) return
          const { args, receiver } = result
          const range = getNodeRange(node)
          
          const spreadParts = [receiver.getText()]
          for (const arg of args) {
            spreadParts.push('...' + arg.getText())
          }

          const fixText = '[' + spreadParts.join(', ') + ']'
          
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Use spread operator instead of .concat()',
            range,
            ruleId: 'prefer-spread',
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
    description: 'Enforce using spread operator instead of .concat() for array concatenation',
    fixable: "code",
    name: 'prefer-spread',
    recommended: true,
    severity: 'info',
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
      visitNode(node: Node, _context: VisitorContext) {
        const result = isConcatCall(node)
        if (!result) return
        const { args, receiver } = result
        const range = getNodeRange(node)
        
        const spreadParts = [receiver.getText()]
        for (const arg of args) {
          spreadParts.push('...' + arg.getText())
        }

        const fixText = '[' + spreadParts.join(', ') + ']'
        
        violations.push({
          filePath: sourceFile.getFilePath(),
          message: 'Use spread operator instead of .concat()',
          range,
          ruleId: 'prefer-spread',
          severity: 'info',
          suggestion: 'Replace with: ' + fixText,
        })
      },
    }
  )

  return violations
}

export default preferSpreadRule
