import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isLiteral, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function isEmptyString(node: unknown): boolean {
  if (!isLiteral(node)) {
    return false
  }

  const n = toASTNode(node)
  return n?.value === ''
}

function isConcatCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)
  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  const property = toASTNode(callee.property)
  return property?.type === 'Identifier' && property.name === 'concat'
}

function getFirstArgument(node: unknown): null | unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  const args = n?.arguments
  if (!args || args.length === 0) {
    return null
  }

  return args[0]
}

function getCalleeObject(node: unknown): null | unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null

  const callee = toASTNode(n.callee)
  if (!callee || !isMemberExpression(callee)) {
    return null
  }

  return callee.object
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
    fixable: false,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringConcatRule
