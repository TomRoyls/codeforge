/**
 * @file Prefer object spread over Object.assign
 */

import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange } from '../../ast/visitor.js'

interface PreferObjectSpreadOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferObjectSpreadOptions = {}

function isObjectAssignCall(node: Node): null | { sources: Node[]; target: Node; } {
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
  
  return { sources, target }
}

export const preferObjectSpreadRule: RuleDefinition<PreferObjectSpreadOptions> = {
  create(_options: PreferObjectSpreadOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const result = isObjectAssignCall(node)
          if (!result) return

          // Only flag when first argument is an empty object literal
          if (!Node.isObjectLiteralExpression(result.target)) return
          
          const properties = result.target.getProperties()
          if (properties.length > 0) return

          const range = getNodeRange(node)
          const sourceText = result.sources.map(s => s.getText()).join(', ')
          const spreadText = result.sources.map(s => '...' + s.getText()).join(', ')

          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Use object spread `{ ...' + sourceText + ' }` instead of Object.assign({}, ' + sourceText + ')',
            range,
            ruleId: 'prefer-object-spread',
            severity: 'info',
            suggestion: 'Replace with: { ' + spreadText + ' }',
          })
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Prefer object spread over Object.assign for immutable object merging',
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

  function visit(node: Node) {
    const result = isObjectAssignCall(node)
    if (result && Node.isObjectLiteralExpression(result.target)) {
        const properties = result.target.getProperties()
        if (properties.length === 0) {
          const range = getNodeRange(node)
          const sourceText = result.sources.map(s => s.getText()).join(', ')
          const spreadText = result.sources.map(s => '...' + s.getText()).join(', ')

          violations.push({
            filePath: sourceFile.getFilePath(),
            message: 'Use object spread instead of Object.assign({}, ' + sourceText + ')',
            range,
            ruleId: 'prefer-object-spread',
            severity: 'info',
            suggestion: 'Replace with: { ' + spreadText + ' }',
          })
        }
      }

    node.forEachChild(visit)
  }

  visit(sourceFile)
  return violations
}
