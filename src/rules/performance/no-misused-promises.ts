import { Node } from 'ts-morph'
import type { RuleDefinition, RuleOptions } from '../types.js'
import { type RuleViolation, type VisitorContext, getNodeRange } from '../../ast/visitor.js'

interface NoMisusedPromisesOptions extends RuleOptions {}

const CALL_EXPRESSION_KIND = 207
const PROPERTY_ACCESS_EXPRESSION_KIND = 203
const ARROW_FUNCTION_KIND = 211
const FUNCTION_EXPRESSION_KIND = 216

function isCallExpression(node: Node): boolean {
  return node.getKind() === CALL_EXPRESSION_KIND
}

function isPropertyAccessExpression(node: Node): boolean {
  return node.getKind() === PROPERTY_ACCESS_EXPRESSION_KIND
}

function isArrowOrFunctionExpression(node: Node): boolean {
  const kind = node.getKind()
  return kind === ARROW_FUNCTION_KIND || kind === FUNCTION_EXPRESSION_KIND
}

function checkAsyncForEachCallback(node: Node, context: VisitorContext): RuleViolation | null {
  if (!isCallExpression(node)) {
    return null
  }

  const callExpr = node as unknown as {
    getExpression: () => Node
    getArguments: () => Node[]
  }

  const expression = callExpr.getExpression()

  if (!isPropertyAccessExpression(expression)) {
    return null
  }

  const propAccess = expression as unknown as { getName: () => string }
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

  const asyncCallback = callback as unknown as { isAsync: () => boolean }
  if (!asyncCallback.isAsync()) {
    return null
  }

  return {
    ruleId: 'no-misused-promises',
    severity: 'warning',
    message:
      'Promise returned from async forEach callback is ignored. This can lead to unhandled rejections and unexpected behavior.',
    filePath: context.getFilePath(),
    range: getNodeRange(node),
    suggestion:
      'Consider using for-of with await for sequential execution, or map() with Promise.all() for parallel execution.',
  }
}

export const noMisusedPromisesRule: RuleDefinition<NoMisusedPromisesOptions> = {
  meta: {
    name: 'no-misused-promises',
    description: 'Disallow promises in fire-and-forget contexts like forEach with async callbacks',
    category: 'performance',
    recommended: true,
  },
  defaultOptions: {},
  create: (_options: NoMisusedPromisesOptions) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        visitNode: (node: Node, context: VisitorContext) => {
          const violation = checkAsyncForEachCallback(node, context)
          if (violation) {
            violations.push(violation)
          }
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzeMisusedPromises(node: Node, context: VisitorContext): RuleViolation[] {
  const violation = checkAsyncForEachCallback(node, context)
  return violation ? [violation] : []
}
