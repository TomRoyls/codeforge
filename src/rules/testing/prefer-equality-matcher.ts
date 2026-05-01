import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  type ASTNode,
  toASTNode,
} from '../../utils/ast-helpers.js'
import { EQUALITY_MATCHERS } from '../../utils/constants.js'

const EQUALITY_OPERATORS = new Set(['==', '===', '!=', '!=='])

function getBooleanValue(arg: unknown): boolean | null {
  const n = toASTNode(arg)
  if (!n) return null

  if (n.type === 'Literal') {
    const value = (n as { value: unknown }).value
    if (value === true) return true
    if (value === false) return false
  }

  return null
}

function isNegatedOperator(operator: string): boolean {
  return operator === '!=' || operator === '!=='
}

function buildSuggestion(
  left: string,
  right: string,
  operator: string,
  booleanValue: boolean,
  hasNot: boolean,
): string {
  const shouldNegate = isNegatedOperator(operator) === booleanValue
  const finalNegate = hasNot ? !shouldNegate : shouldNegate

  if (finalNegate) {
    return `expect(${left}).not.toBe(${right})`
  }

  return `expect(${left}).toBe(${right})`
}

export const preferEqualityMatcherRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node) as ASTNode | null
        if (!n) return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const matcherName = getPropertyName(callee)
        if (!matcherName || !EQUALITY_MATCHERS.has(matcherName)) return

        const args = n.arguments as unknown[] | undefined
        if (!Array.isArray(args) || args.length !== 1) return

        const booleanValue = getBooleanValue(args[0])
        if (booleanValue === null) return

        let hasNot = false
        let expectCallNode: ASTNode | null = null

        const matcherObject = toASTNode(callee.object)
        if (!matcherObject) return

        if (matcherObject.type === 'MemberExpression') {
          const innerProp = getPropertyName(matcherObject)
          if (innerProp === 'not') {
            hasNot = true
            const innerObj = toASTNode(matcherObject.object)
            if (!innerObj || innerObj.type !== 'CallExpression') return
            expectCallNode = innerObj
          }
        } else if (matcherObject.type === 'CallExpression') {
          expectCallNode = matcherObject
        }

        if (!expectCallNode) return

        const expectArgs = expectCallNode.arguments as unknown[] | undefined
        if (!Array.isArray(expectArgs) || expectArgs.length !== 1) return

        const expectArg = toASTNode(expectArgs[0])
        if (!expectArg || expectArg.type !== 'BinaryExpression') return

        const operator = (expectArg as { operator: unknown }).operator
        if (typeof operator !== 'string' || !EQUALITY_OPERATORS.has(operator)) {
          return
        }

        const leftNode = toASTNode(expectArg.left)
        const rightNode = toASTNode(expectArg.right)
        if (!leftNode || !rightNode) return

        const leftText = getNodeText(leftNode)
        const rightText = getNodeText(rightNode)

        const suggestion = buildSuggestion(
          leftText,
          rightText,
          operator,
          booleanValue,
          hasNot,
        )

        context.report({
          loc: extractLocation(node),
          message: `Use \`${suggestion}\` instead`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce using equality matchers instead of comparing boolean expressions',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-equality-matcher',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

function getNodeText(node: unknown): string {
  const n = toASTNode(node)
  if (!n) return 'value'

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  if (n.type === 'Literal') {
    const value = (n as { value: unknown }).value
    if (typeof value === 'string') return `'${value}'`
    return String(value)
  }

  if (n.type === 'MemberExpression') {
    const obj = getNodeText(n.object)
    const prop = getPropertyName(n)
    return prop ? `${obj}.${prop}` : `${obj}.member`
  }

  if (n.type === 'CallExpression') {
    return 'fn()'
  }

  if (n.type === 'BinaryExpression') {
    const left = getNodeText(n.left)
    const right = getNodeText(n.right)
    const op = (n as { operator: unknown }).operator
    return `${left} ${op} ${right}`
  }

  return 'value'
}

export default preferEqualityMatcherRule
