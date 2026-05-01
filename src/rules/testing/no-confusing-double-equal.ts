import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  type ASTNode,
  isExpectCall,
  toASTNode,
} from '../../utils/ast-helpers.js'

const LOOSE_EQUALITY_OPERATORS = new Set(['==', '!='])

/**
 * Recursively walk an AST node and collect all loose equality operators
 * (== or !=) within BinaryExpressions.
 */
function collectLooseEqualityOperators(node: unknown, results: ASTNode[]): void {
  const n = toASTNode(node)
  if (!n) return

  if (n.type === 'BinaryExpression') {
    const operator = n.operator
    if (typeof operator === 'string' && LOOSE_EQUALITY_OPERATORS.has(operator)) {
      results.push(n)
    }
    // Walk left and right operands for nested BinaryExpressions
    collectLooseEqualityOperators(n.left, results)
    collectLooseEqualityOperators(n.right, results)
  }

  if (n.type === 'LogicalExpression') {
    // Walk through &&, || etc. to find nested BinaryExpressions
    collectLooseEqualityOperators(n.left, results)
    collectLooseEqualityOperators(n.right, results)
  }
}

/**
 * Given an expect chain node, find the innermost expect() CallExpression
 * and return its arguments.
 */
function getExpectArguments(node: ASTNode): unknown[] | null {
  if (node.type === 'CallExpression') {
    const callee = toASTNode(node.callee)
    if (!callee) return null

    if (callee.type === 'Identifier' && callee.name === 'expect') {
      const args = node.arguments
      if (Array.isArray(args)) return args
    }

    if (callee.type === 'MemberExpression') {
      const object = toASTNode(callee.object)
      if (object) return getExpectArguments(object)
    }
  }

  if (node.type === 'MemberExpression') {
    const object = toASTNode(node.object)
    if (object) return getExpectArguments(object)
  }

  return null
}

export const noConfusingDoubleEqualRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        if (!isExpectCall(node)) return

        const args = getExpectArguments(n)
        if (!args) return

        for (const arg of args) {
          const violations: ASTNode[] = []
          collectLooseEqualityOperators(arg, violations)

          for (const violation of violations) {
            const operator = violation.operator ?? '=='
            const strictAlternative = operator === '==' ? '===' : '!=='

            context.report({
              loc: extractLocation(violation),
              message: `Use strict equality ('${strictAlternative}') instead of loose equality ('${operator}').`,
              node: violation,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow loose equality (== and !=) in expect() arguments',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-confusing-double-equal',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConfusingDoubleEqualRule
