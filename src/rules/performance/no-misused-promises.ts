import {
  type ArrowFunction,
  type CallExpression,
  type FunctionExpression,
  Node,
  type PropertyAccessExpression,
} from 'ts-morph'

import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, type RuleViolation, type VisitorContext } from '../../ast/visitor.js'

interface NoMisusedPromisesOptions extends RuleOptions {}

const CALL_EXPRESSION_KIND = 207
const PROPERTY_ACCESS_EXPRESSION_KIND = 203
const ARROW_FUNCTION_KIND = 211
const FUNCTION_EXPRESSION_KIND = 216

// Use getKind() checks for compatibility with both real ts-morph nodes and test mocks
function isCallExpression(node: Node): node is CallExpression {
  return node.getKind() === CALL_EXPRESSION_KIND
}

function isPropertyAccessExpression(node: Node): node is PropertyAccessExpression {
  return node.getKind() === PROPERTY_ACCESS_EXPRESSION_KIND
}

function isArrowOrFunctionExpression(node: Node): node is ArrowFunction | FunctionExpression {
  const kind = node.getKind()
  return kind === ARROW_FUNCTION_KIND || kind === FUNCTION_EXPRESSION_KIND
}

function checkAsyncForEachCallback(node: Node, context: VisitorContext): null | RuleViolation {
  if (!isCallExpression(node)) {
    return null
  }

  const callExpr = node
  const expression = callExpr.getExpression()

  if (!isPropertyAccessExpression(expression)) {
    return null
  }

  const propAccess = expression
  const methodName = propAccess.getName()
  if (methodName !== 'forEach') {
    return null
  }

  const args = callExpr.getArguments()
  if (args.length === 0) {
    return null
  }

  const callback = args[0]
  if (!callback) {
    return null
  }

  if (!isArrowOrFunctionExpression(callback)) {
    return null
  }

  const asyncCallback = callback
  if (!asyncCallback.isAsync()) {
    return null
  }

  return {
    filePath: context.getFilePath(),
    message:
      'Promise returned from async forEach callback is ignored. This can lead to unhandled rejections and unexpected behavior.',
    range: getNodeRange(node),
    ruleId: 'no-misused-promises',
    severity: 'warning',
    suggestion:
      'Consider using for-of with await for sequential execution, or map() with Promise.all() for parallel execution.',
  }
}

export const noMisusedPromisesRule: RuleDefinition<NoMisusedPromisesOptions> = {
  create(_options: NoMisusedPromisesOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, context: VisitorContext) {
          const violation = checkAsyncForEachCallback(node, context)
          if (violation) {
            violations.push(violation)
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'performance',
    description: 'Disallow promises in fire-and-forget contexts like forEach with async callbacks',
    fixable: 'code',
    name: 'no-misused-promises',
    recommended: true,
  },
}

export function analyzeMisusedPromises(node: Node, context: VisitorContext): RuleViolation[] {
  const violation = checkAsyncForEachCallback(node, context)
  return violation ? [violation] : []
}
