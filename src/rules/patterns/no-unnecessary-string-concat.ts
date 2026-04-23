import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isLiteral, isMemberExpression } from '../../utils/ast-helpers.js'

function isEmptyString(node: unknown): boolean {
  if (!isLiteral(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  return n.value === ''
}

function isConcatCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!isMemberExpression(callee)) {
    return false
  }

  const calleeNode = callee as Record<string, unknown>
  const property = calleeNode.property as unknown

  if (!property || typeof property !== 'object') {
    return false
  }

  const propNode = property as Record<string, unknown>
  return propNode.type === 'Identifier' && propNode.name === 'concat'
}

function getFirstArgument(node: unknown): null | unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const args = n.arguments as undefined | unknown[]
  if (!args || args.length === 0) {
    return null
  }

  return args[0]
}

function getCalleeObject(node: unknown): null | unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!isMemberExpression(callee)) {
    return null
  }

  const calleeNode = callee as Record<string, unknown>
  return calleeNode.object as unknown
}

function isUnnecessaryConcat(node: unknown): { isUnnecessary: boolean; replacement: string } {
  if (!isConcatCall(node)) {
    return { isUnnecessary: false, replacement: '' }
  }

  const calleeObj = getCalleeObject(node)
  const firstArg = getFirstArgument(node)

  if (isEmptyString(calleeObj) && firstArg !== null) {
    return { isUnnecessary: true, replacement: 'argument' }
  }

  if (isEmptyString(firstArg) && calleeObj !== null) {
    return { isUnnecessary: true, replacement: 'object' }
  }

  return { isUnnecessary: false, replacement: '' }
}

export const noUnnecessaryStringConcatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = isUnnecessaryConcat(node)
        if (!result.isUnnecessary) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message:
            'Unnecessary string concatenation with empty string. The result is the same as using the string directly.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary string concatenation with empty strings. Using "".concat(str) or str.concat("") is redundant and should be simplified to just str.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-string-concat',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringConcatRule
