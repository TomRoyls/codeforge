/**
 * @fileoverview Detect useless fallbacks in spread patterns
 * @module rules/patterns/no-useless-fallback-in-spread
 */

import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange, getNodeText } from '../../utils/ast-helpers.js'

/**
 * Check if a node is a LogicalExpression with || operator
 */
function isLogicalOrExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'LogicalExpression' && n.operator === '||'
}

/**
 * Check if a node is an empty object literal: {}
 */
function isEmptyObjectLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ObjectExpression' && Array.isArray(n.properties) && n.properties.length === 0
}

/**
 * Check if a node is an empty array literal: []
 */
function isEmptyArrayLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ArrayExpression' && Array.isArray(n.elements) && n.elements.length === 0
}

/**
 * Check if a node is a SpreadElement in an ObjectExpression
 */
function isSpreadInObjectExpression(node: unknown, parent: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'SpreadElement') {
    return false
  }

  if (!parent || typeof parent !== 'object') {
    return false
  }

  const p = parent as Record<string, unknown>
  return p.type === 'ObjectExpression'
}

/**
 * Check if a node is a SpreadElement in an ArrayExpression
 */
function isSpreadInArrayExpression(node: unknown, parent: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'SpreadElement') {
    return false
  }

  if (!parent || typeof parent !== 'object') {
    return false
  }

  const p = parent as Record<string, unknown>
  return p.type === 'ArrayExpression'
}

/**
 * Get the argument of a SpreadElement
 */
function getSpreadArgument(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  return n.argument
}

/**
 * Get the left operand of a LogicalExpression
 */
function getLogicalLeft(node: unknown): unknown {
  if (!isLogicalOrExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  return n.left
}

/**
 * Get the right operand of a LogicalExpression
 */
function getLogicalRight(node: unknown): unknown {
  if (!isLogicalOrExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  return n.right
}

export const noUselessFallbackInSpreadRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Detect useless fallbacks in spread patterns. Spreading undefined/null is safe and adds no properties, so `{ ...obj || {} }` is redundant and can be simplified to `{ ...obj }`.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-useless-fallback-in-spread',
    },
    schema: [],
    fixable: 'code',
  },

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
        if (isSpreadInObjectExpression(node, parent)) {
          if (isEmptyObjectLiteral(rightOperand)) {
            const location = extractLocation(argument)
            const nodeRange = getRange(argument)

            let fix: { range: readonly [number, number]; text: string } | undefined
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
              message:
                'Useless fallback in spread pattern. Spreading undefined/null is safe, so `...obj || {}` can be simplified to `...obj`.',
              loc: location,
              fix,
            })
          }
        }

        // Check for useless fallback in array spread: [...arr || []]
        if (isSpreadInArrayExpression(node, parent)) {
          if (isEmptyArrayLiteral(rightOperand)) {
            const location = extractLocation(argument)
            const nodeRange = getRange(argument)

            let fix: { range: readonly [number, number]; text: string } | undefined
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
              message:
                'Useless fallback in spread pattern. Spreading undefined/null is safe, so `...arr || []` can be simplified to `...arr`.',
              loc: location,
              fix,
            })
          }
        }
      },
    }
  },
}

export default noUselessFallbackInSpreadRule
