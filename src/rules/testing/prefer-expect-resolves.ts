import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  isExpectCallee,
  toASTNode,
} from '../../utils/ast-helpers.js'


function getExpectCall(node: unknown): unknown | null {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (!callee) return null

    if (callee.type === 'Identifier' && typeof callee.name === 'string' && callee.name === 'expect') {
      return n
    }

    if (callee.type === 'MemberExpression') {
      return getExpectCall(callee.object)
    }
  }

  if (n.type === 'MemberExpression') {
    return getExpectCall(n.object)
  }

  return null
}

function chainContainsResolves(matcherCallNode: unknown): boolean {
  const n = toASTNode(matcherCallNode)
  if (!n) return false

  if (n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (!callee) return false

    if (callee.type === 'MemberExpression') {
      const propName = getPropertyName(callee.property)
      if (propName === 'resolves') return true
      return chainContainsResolves(callee.object)
    }
  }

  if (n.type === 'MemberExpression') {
    const propName = getPropertyName(n.property)
    if (propName === 'resolves') return true
    return chainContainsResolves(n.object)
  }

  return false
}

function expectArgIsAwait(expectCallNode: unknown): boolean {
  const n = toASTNode(expectCallNode)
  if (!n || n.type !== 'CallExpression') return false

  const args = n.arguments
  if (!Array.isArray(args) || args.length === 0) return false

  const firstArg = toASTNode(args[0])
  if (!firstArg) return false

  return firstArg.type === 'AwaitExpression'
}

export const preferExpectResolvesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const expectCall = getExpectCall(callee.object)
        if (!expectCall) return

        const expectCallNode = toASTNode(expectCall)
        if (!expectCallNode || expectCallNode.type !== 'CallExpression') return

        if (!isExpectCallee(expectCallNode.callee)) return

        if (!expectArgIsAwait(expectCall)) return

        if (chainContainsResolves(node)) return

        context.report({
          loc: extractLocation(node),
          message: 'Use expect().resolves instead of awaiting the value in expect()',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Prefer expect().resolves over awaiting the value in expect()',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-expect-resolves',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferExpectResolvesRule
