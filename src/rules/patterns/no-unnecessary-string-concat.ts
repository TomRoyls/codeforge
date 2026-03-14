import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  isLiteral,
} from '../../utils/ast-helpers.js'

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

function getFirstArgument(node: unknown): unknown | null {
  if (!isCallExpression(node)) {
    return null
  }
  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined
  if (!args || args.length === 0) {
    return null
  }
  return args[0]
}

function getCalleeObject(node: unknown): unknown | null {
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow unnecessary string concatenation with empty strings. Using "".concat(str) or str.concat("") is redundant and should be simplified to just str.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-string-concat',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = isUnnecessaryConcat(node)
        if (!result.isUnnecessary) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message:
            'Unnecessary string concatenation with empty string. The result is the same as using the string directly.',
          loc: location,
        })
      },
    }
  },
}

export default noUnnecessaryStringConcatRule
