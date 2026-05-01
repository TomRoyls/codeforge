import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  toASTNode,
} from '../../utils/ast-helpers.js'

const REDUNDANT_ASYNC_MESSAGE =
  'Unexpected await on expect chain that already uses .resolves or .rejects. Remove the await keyword.'

function chainHasResolvesOrRejects(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (!callee) return false

    if (callee.type === 'MemberExpression') {
      const propName = getPropertyName(callee.property)
      if (propName === 'resolves' || propName === 'rejects') return true
      return chainHasResolvesOrRejects(callee.object)
    }
  }

  if (n.type === 'MemberExpression') {
    const propName = getPropertyName(n.property)
    if (propName === 'resolves' || propName === 'rejects') return true
    return chainHasResolvesOrRejects(n.object)
  }

  return false
}

function getExpectRoot(node: unknown): unknown | null {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (!callee) return null

    if (callee.type === 'Identifier' && typeof callee.name === 'string' && callee.name === 'expect') {
      return n
    }

    if (callee.type === 'MemberExpression') {
      return getExpectRoot(callee.object)
    }
  }

  if (n.type === 'MemberExpression') {
    return getExpectRoot(n.object)
  }

  return null
}

export const noRedundantActionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AwaitExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AwaitExpression') return

        const argument = toASTNode(n.argument)
        if (!argument) return

        const expectRoot = getExpectRoot(argument)
        if (!expectRoot) return

        if (!chainHasResolvesOrRejects(argument)) return

        context.report({
          loc: extractLocation(node),
          message: REDUNDANT_ASYNC_MESSAGE,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow redundant await on expect chains that already use .resolves or .rejects',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-redundant-action',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRedundantActionRule
