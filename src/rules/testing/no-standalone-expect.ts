import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isExpectCall, toASTNode } from '../../utils/ast-helpers.js'
import { TEST_AND_HOOK_FUNCTIONS } from '../../utils/constants.js'

const TEST_MODIFIER_METHODS: ReadonlySet<string> = new Set([
  'each',
  'only',
  'skip',
])

function isValidContextCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  // Direct call: it(...), test(...), beforeEach(...)
  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return TEST_AND_HOOK_FUNCTIONS.has(callee.name)
  }

  // it.only(...), test.skip(...)
  if (callee.type === 'MemberExpression') {
    const obj = toASTNode(callee.object)
    if (
      obj?.type === 'Identifier' &&
      typeof obj.name === 'string'
    ) {
      const property = toASTNode(callee.property)
      if (
        property?.type === 'Identifier' &&
        typeof property.name === 'string'
      ) {
        return (
          TEST_AND_HOOK_FUNCTIONS.has(obj.name) &&
          TEST_MODIFIER_METHODS.has(property.name)
        )
      }
    }
  }

  // it.each(...)() — callee is a CallExpression whose callee is a MemberExpression
  if (callee.type === 'CallExpression') {
    const innerCallee = toASTNode(callee.callee)
    if (innerCallee?.type === 'MemberExpression') {
      const innerObject = toASTNode(innerCallee.object)
      const innerProperty = toASTNode(innerCallee.property)
      if (
        innerObject?.type === 'Identifier' &&
        typeof innerObject.name === 'string' &&
        innerProperty?.type === 'Identifier' &&
        typeof innerProperty.name === 'string'
      ) {
        return (
          TEST_AND_HOOK_FUNCTIONS.has(innerObject.name) &&
          TEST_MODIFIER_METHODS.has(innerProperty.name)
        )
      }
    }
  }

  return false
}

export const noStandaloneExpectRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    let validContextDepth = 0

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)

        if (n && isValidContextCall(node)) {
          validContextDepth++
          return
        }

        if (validContextDepth === 0 && isExpectCall(node)) {
          context.report({
            loc: extractLocation(node),
            message: 'Expect should be inside a test or hook function',
            node,
          })
        }
      },

      'CallExpression:exit'(node: unknown): void {
        if (isValidContextCall(node)) {
          validContextDepth--
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow expect() calls outside of test or hook functions to ensure assertions are properly scoped',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-standalone-expect',
    },
    severity: 'error',
    type: 'problem',
  },
}

export default noStandaloneExpectRule
