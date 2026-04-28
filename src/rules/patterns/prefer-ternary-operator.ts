import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, getRange, toASTNode } from '../../utils/ast-helpers.js'

interface AssignmentInfo {
  left: { name?: string; type: string }
  node: unknown
  right: unknown
}

function isBlockStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'BlockStatement'
}

function getSingleAssignment(node: unknown): AssignmentInfo | null {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'ExpressionStatement' && n.expression) {
    const expr = toASTNode(n.expression)
    if (expr?.type === 'AssignmentExpression' && expr.operator === '=') {
      const left = toASTNode(expr.left)
      if (left?.type === 'Identifier' && typeof left.name === 'string') {
        return {
          left: { name: left.name, type: 'Identifier' },
          node: expr,
          right: expr.right,
        }
      }
    }
  }

  if (isBlockStatement(node)) {
    const body = (n as ASTNode).body as undefined | unknown[]
    if (body && body.length === 1) {
      return getSingleAssignment(body[0])
    }
  }

  return null
}

function getAssignmentFromBranch(node: unknown): AssignmentInfo | null {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'ExpressionStatement') {
    return getSingleAssignment(node)
  }

  if (isBlockStatement(node)) {
    const body = n.body as undefined | unknown[]
    if (body && body.length === 1) {
      return getSingleAssignment(body[0])
    }
  }

  return null
}

export const preferTernaryOperatorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'IfStatement') return

        const {test} = n
        const {consequent} = n
        const {alternate} = n

        if (!consequent || !alternate) {
          return
        }

        const consequentAssignment = getAssignmentFromBranch(consequent)
        const alternateAssignment = getAssignmentFromBranch(alternate)

        if (!consequentAssignment || !alternateAssignment) {
          return
        }

        if (
          consequentAssignment.left.type !== 'Identifier' ||
          alternateAssignment.left.type !== 'Identifier' ||
          consequentAssignment.left.name !== alternateAssignment.left.name
        ) {
          return
        }

        const variableName = consequentAssignment.left.name
        const location = extractLocation(node)

        let fix: undefined | { range: [number, number]; text: string }

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
          fix,
          loc: location,
          message: `Use ternary operator instead of if-else for simple assignment to '${variableName}'.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'style',
      description:
        'Suggest using ternary operator instead of verbose if-else for simple assignments. Using ternary operator makes the code more concise and readable for simple conditional assignments.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-ternary-operator',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferTernaryOperatorRule
