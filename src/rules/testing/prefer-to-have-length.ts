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
import { EQUALITY_MATCHERS } from '../../utils/constants.js'

function isLengthMemberExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'MemberExpression') return false

  const property = getPropertyName(n.property)
  return property === 'length'
}

function getLengthValueFromArguments(args: unknown[]): string | null {
  if (!args || args.length === 0) return null

  const arg = toASTNode(args[0])
  if (!arg) return null

  if (arg.type === 'Literal' && typeof arg.value === 'number') {
    return String(arg.value)
  }

  if (arg.type === 'Identifier' && typeof arg.name === 'string') {
    return arg.name
  }

  return null
}

function getExpectArg(node: unknown): { expectArg: unknown; isExpectCall: boolean } {
  const n = toASTNode(node)
  if (!n) return { expectArg: null, isExpectCall: false }

  if (n.type === 'CallExpression') {
    if (isExpectCallee(n.callee)) {
      if (n.arguments && n.arguments.length > 0) {
        return { expectArg: n.arguments[0], isExpectCall: true }
      }
    }

    const callee = toASTNode(n.callee)
    if (callee && callee.type === 'MemberExpression') {
      const object = toASTNode(callee.object)
      if (object && object.type === 'CallExpression') {
        const inner = getExpectArg(object)
        if (inner.isExpectCall) return inner
      }
    }
  }

  return { expectArg: null, isExpectCall: false }
}

export const preferToHaveLengthRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const matcherName = getPropertyName(callee.property)
        if (matcherName === null || !EQUALITY_MATCHERS.has(matcherName)) return

        const matcherObject = toASTNode(callee.object)
        if (!matcherObject) return

        const { expectArg, isExpectCall } = getExpectArg(matcherObject)

        if (!isExpectCall || expectArg === null) return

        if (!isLengthMemberExpression(expectArg)) return

        const lengthValue = getLengthValueFromArguments(n.arguments ?? [])

        context.report({
          loc: extractLocation(node),
          message: lengthValue !== null
            ? `Use \`toHaveLength(${lengthValue})\` instead of checking \`.length\` directly`
            : 'Use `toHaveLength()` instead of checking `.length` directly',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Suggest using toHaveLength() instead of checking .length directly',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-to-have-length',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferToHaveLengthRule
