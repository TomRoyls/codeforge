/**
 * @file Detect useless fallbacks in spread patterns
 * @module rules/patterns/no-useless-fallback-in-spread
 */

import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeText, getRange, toASTNode } from '../../utils/ast-helpers.js'

function isLogicalOrExpression(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'LogicalExpression' && n.operator === '||'
}

function isEmptyObjectLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'ObjectExpression' && Array.isArray(n.properties) && n.properties.length === 0
}

function isEmptyArrayLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'ArrayExpression' && Array.isArray(n.elements) && n.elements.length === 0
}

function isSpreadInObjectExpression(node: unknown, parent: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'SpreadElement') return false
  return toASTNode(parent)?.type === 'ObjectExpression'
}

function isSpreadInArrayExpression(node: unknown, parent: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'SpreadElement') return false
  return toASTNode(parent)?.type === 'ArrayExpression'
}

function getSpreadArgument(node: unknown): unknown {
  return toASTNode(node)?.argument
}

function getLogicalLeft(node: unknown): unknown {
  if (!isLogicalOrExpression(node)) return null
  return toASTNode(node)?.left
}

function getLogicalRight(node: unknown): unknown {
  if (!isLogicalOrExpression(node)) return null
  return toASTNode(node)?.right
}

export const noUselessFallbackInSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SpreadElement(node: unknown, parent?: unknown): void {
        const argument = getSpreadArgument(node)
        if (!argument) {
          return
        }

        // Check if the spread argument is a || expression
        if (!isLogicalOrExpression(argument)) {
          return
        }

        const rightOperand = getLogicalRight(argument)
        const leftOperand = getLogicalLeft(argument)

        if (!leftOperand) {
          return
        }

        // Check for useless fallback in object spread: { ...obj || {} }
        if (isSpreadInObjectExpression(node, parent) && isEmptyObjectLiteral(rightOperand)) {
            const location = extractLocation(argument)
            const nodeRange = getRange(argument)

            let fix: undefined | { range: readonly [number, number]; text: string }
            if (nodeRange) {
              const source = context.getSource()
              const leftText = getNodeText(leftOperand, source)
              if (leftText) {
                fix = {
                  range: nodeRange,
                  text: leftText,
                }
              }
            }

            context.report({
              fix,
              loc: location,
              message:
                'Useless fallback in spread pattern. Spreading undefined/null is safe, so `...obj || {}` can be simplified to `...obj`.',
            })
          }

        // Check for useless fallback in array spread: [...arr || []]
        if (isSpreadInArrayExpression(node, parent) && isEmptyArrayLiteral(rightOperand)) {
            const location = extractLocation(argument)
            const nodeRange = getRange(argument)

            let fix: undefined | { range: readonly [number, number]; text: string }
            if (nodeRange) {
              const source = context.getSource()
              const leftText = getNodeText(leftOperand, source)
              if (leftText) {
                fix = {
                  range: nodeRange,
                  text: leftText,
                }
              }
            }

            context.report({
              fix,
              loc: location,
              message:
                'Useless fallback in spread pattern. Spreading undefined/null is safe, so `...arr || []` can be simplified to `...arr`.',
            })
          }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Detect useless fallbacks in spread patterns. Spreading undefined/null is safe and adds no properties, so `{ ...obj || {} }` is redundant and can be simplified to `{ ...obj }`.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-useless-fallback-in-spread',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessFallbackInSpreadRule
