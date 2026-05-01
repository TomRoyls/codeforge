import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

type PromiseMethod = 'resolve' | 'reject'
type MockMethod = 'mockImplementation' | 'mockImplementationOnce'

interface DetectionResult {
  mockMethod: MockMethod
  promiseMethod: PromiseMethod
}

function getPromiseCallInfo(node: unknown): PromiseMethod | null {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return null

  const object = toASTNode(callee.object)
  if (!object || object.type !== 'Identifier' || object.name !== 'Promise') return null

  const property = toASTNode(callee.property)
  if (!property || property.type !== 'Identifier') return null

  if (property.name === 'resolve') return 'resolve'
  if (property.name === 'reject') return 'reject'

  return null
}

function getReturnValueFromBody(functionBody: unknown): unknown {
  const body = toASTNode(functionBody)
  if (!body) return null

  if (body.type === 'CallExpression') return body

  if (body.type === 'BlockStatement') {
    const statements = body.body
    if (!Array.isArray(statements) || statements.length !== 1) return null

    const stmt = toASTNode(statements[0])
    if (!stmt || stmt.type !== 'ReturnStatement') return null

    return stmt.argument ?? null
  }

  return null
}

function detectMockPromisePattern(node: unknown): DetectionResult | null {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return null

  const property = toASTNode(callee.property)
  if (!property || property.type !== 'Identifier') return null

  const mockMethod = property.name
  if (mockMethod !== 'mockImplementation' && mockMethod !== 'mockImplementationOnce') return null

  const args = n.arguments
  if (!Array.isArray(args) || args.length === 0) return null

  const firstArg = toASTNode(args[0])
  if (!firstArg) return null

  if (firstArg.type !== 'ArrowFunctionExpression' && firstArg.type !== 'FunctionExpression') {
    return null
  }

  const functionBody = firstArg.body
  const returnValue = getReturnValueFromBody(functionBody)
  if (returnValue === null) return null

  const promiseMethod = getPromiseCallInfo(returnValue)
  if (promiseMethod === null) return null

  return { mockMethod: mockMethod as MockMethod, promiseMethod }
}

function getSuggestedMethod(mockMethod: MockMethod, promiseMethod: PromiseMethod): string {
  if (mockMethod === 'mockImplementation') {
    return promiseMethod === 'resolve' ? 'mockResolvedValue' : 'mockRejectedValue'
  }
  return promiseMethod === 'resolve' ? 'mockResolvedValueOnce' : 'mockRejectedValueOnce'
}

export const preferMockPromiseShorthandRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = detectMockPromisePattern(node)
        if (!result) return

        const suggested = getSuggestedMethod(result.mockMethod, result.promiseMethod)

        context.report({
          loc: extractLocation(node),
          message: `Use \`${suggested}()\` instead of \`${result.mockMethod}(() => Promise.${result.promiseMethod}(...))\``,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Prefer mock resolved/rejected value shorthands over mockImplementation with Promise.resolve/reject',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-mock-promise-shorthand',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferMockPromiseShorthandRule
