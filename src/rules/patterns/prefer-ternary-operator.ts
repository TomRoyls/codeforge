/**
 * @fileoverview Suggest using ternary operator instead of verbose if-else for simple assignments
 * @module rules/patterns/prefer-ternary-operator
 */

import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

interface AssignmentInfo {
  left: { type: string; name?: string }
  right: unknown
  node: unknown
}

function isIfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'IfStatement'
}

function isBlockStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'BlockStatement'
}

function getSingleAssignment(node: unknown): AssignmentInfo | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  // Check for expression statement containing assignment
  if (n.type === 'ExpressionStatement' && n.expression) {
    const expr = n.expression as Record<string, unknown>
    if (expr.type === 'AssignmentExpression' && expr.operator === '=') {
      const left = expr.left as Record<string, unknown> | undefined
      if (left?.type === 'Identifier' && typeof left.name === 'string') {
        return {
          left: { type: 'Identifier', name: left.name },
          right: expr.right,
          node: expr,
        }
      }
    }
  }

  // Check for block statement with single assignment
  if (isBlockStatement(node)) {
    const body = n.body as unknown[] | undefined
    if (body && body.length === 1) {
      return getSingleAssignment(body[0])
    }
  }

  return null
}

function getAssignmentFromBranch(node: unknown): AssignmentInfo | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  // Direct expression statement
  if (n.type === 'ExpressionStatement') {
    return getSingleAssignment(node)
  }

  // Block statement
  if (isBlockStatement(node)) {
    const body = n.body as unknown[] | undefined
    if (body && body.length === 1) {
      return getSingleAssignment(body[0])
    }
  }

  return null
}

export const preferTernaryOperatorRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Suggest using ternary operator instead of verbose if-else for simple assignments. Using ternary operator makes the code more concise and readable for simple conditional assignments.',
      category: 'style',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-ternary-operator',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        if (!isIfStatement(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const test = n.test
        const consequent = n.consequent
        const alternate = n.alternate

        // Must have both branches
        if (!consequent || !alternate) {
          return
        }

        // Get assignments from both branches
        const consequentAssignment = getAssignmentFromBranch(consequent)
        const alternateAssignment = getAssignmentFromBranch(alternate)

        // Both branches must have single assignments
        if (!consequentAssignment || !alternateAssignment) {
          return
        }

        // Both assignments must be to the same variable
        if (
          consequentAssignment.left.type !== 'Identifier' ||
          alternateAssignment.left.type !== 'Identifier' ||
          consequentAssignment.left.name !== alternateAssignment.left.name
        ) {
          return
        }

        const variableName = consequentAssignment.left.name
        const location = extractLocation(node)

        // Build fix
        let fix: { range: [number, number]; text: string } | undefined

        const ifRange = getRange(node)
        const testRange = getRange(test)
        const consequentRightRange = getRange(consequentAssignment.right)
        const alternateRightRange = getRange(alternateAssignment.right)

        if (ifRange && testRange && consequentRightRange && alternateRightRange) {
          const source = context.getSource()
          const testSource = source.slice(testRange[0], testRange[1])
          const consequentRightSource = source.slice(
            consequentRightRange[0],
            consequentRightRange[1],
          )
          const alternateRightSource = source.slice(alternateRightRange[0], alternateRightRange[1])

          fix = {
            range: ifRange,
            text: `${variableName} = ${testSource} ? ${consequentRightSource} : ${alternateRightSource}`,
          }
        }

        context.report({
          message: `Use ternary operator instead of if-else for simple assignment to '${variableName}'.`,
          loc: location,
          fix,
        })
      },
    }
  },
}

export default preferTernaryOperatorRule
