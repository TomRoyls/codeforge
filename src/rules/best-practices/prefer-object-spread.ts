/**
 * @fileoverview Prefer object spread over Object.assign
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange } from '../../ast/visitor.js'

interface PreferObjectSpreadOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferObjectSpreadOptions = {}

function isObjectAssignCall(node: Node): { target: Node; sources: Node[] } | null {
  if (!Node.isCallExpression(node)) return null
  
  const expression = node.getExpression()
  if (!Node.isPropertyAccessExpression(expression)) return null
  
  const obj = expression.getExpression()
  if (!Node.isIdentifier(obj) || obj.getText() !== 'Object') return null
  
  if (expression.getName() !== 'assign') return null
  
  const args = node.getArguments()
  if (args.length < 2) return null
  
  const target = args[0]
  if (!target) return null
  
  const sources = args.slice(1)
  
  return { target, sources }
}

export const preferObjectSpreadRule: RuleDefinition<PreferObjectSpreadOptions> = {
  meta: {
    name: 'prefer-object-spread',
    description: 'Prefer object spread over Object.assign for immutable object merging',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (_options: PreferObjectSpreadOptions) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          const result = isObjectAssignCall(node)
          if (!result) return

          // Only flag when first argument is an empty object literal
          if (!Node.isObjectLiteralExpression(result.target)) return
          
          const properties = result.target.getProperties()
          if (properties.length !== 0) return

          const range = getNodeRange(node)
          const sourceText = result.sources.map(s => s.getText()).join(', ')
          const spreadText = result.sources.map(s => '...' + s.getText()).join(', ')

          violations.push({
            ruleId: 'prefer-object-spread',
            severity: 'info',
            message: 'Use object spread `{ ...' + sourceText + ' }` instead of Object.assign({}, ' + sourceText + ')',
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Replace with: { ' + spreadText + ' }',
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

  function visit(node: Node) {
    const result = isObjectAssignCall(node)
    if (result) {
      if (Node.isObjectLiteralExpression(result.target)) {
        const properties = result.target.getProperties()
        if (properties.length === 0) {
          const range = getNodeRange(node)
          const sourceText = result.sources.map(s => s.getText()).join(', ')
          const spreadText = result.sources.map(s => '...' + s.getText()).join(', ')

          violations.push({
            ruleId: 'prefer-object-spread',
            severity: 'info',
            message: 'Use object spread instead of Object.assign({}, ' + sourceText + ')',
            filePath: sourceFile.getFilePath(),
            range,
            suggestion: 'Replace with: { ' + spreadText + ' }',
          })
        }
      }
    }
    node.forEachChild(visit)
  }

  visit(sourceFile)
  return violations
}
