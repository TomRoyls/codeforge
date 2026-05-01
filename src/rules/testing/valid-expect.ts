import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface ValidExpectOptions {
  readonly assertFunctionNames?: readonly string[]
  readonly maxArgs?: number
  readonly minArgs?: number
}

const DEFAULT_ASSERT_FUNCTION_NAMES = ['expect']
const DEFAULT_MIN_ARGS = 1
const DEFAULT_MAX_ARGS = 1

const STATIC_HELPER_METHODS = new Set([
  'any',
  'anything',
  'arrayContaining',
  'closeTo',
  'extend',
  'objectContaining',
  'stringContaining',
  'stringMatching',
])

function isExpectStaticHelper(node: unknown, assertFunctions: ReadonlySet<string>): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return false

  const object = toASTNode(callee.object)
  if (!object || object.type !== 'Identifier') return false

  if (typeof object.name === 'string' && assertFunctions.has(object.name)) {
    const property = toASTNode(callee.property)
    if (property?.type === 'Identifier' && typeof property.name === 'string') {
      return STATIC_HELPER_METHODS.has(property.name)
    }
  }

  return false
}

function getAssertName(node: unknown, assertFunctions: ReadonlySet<string>): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return assertFunctions.has(callee.name) ? callee.name : null
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'CallExpression') {
      const innerCallee = toASTNode(object.callee)
      if (innerCallee?.type === 'Identifier' && typeof innerCallee.name === 'string') {
        return assertFunctions.has(innerCallee.name) ? innerCallee.name : null
      }
    }
  }

  return null
}

function isFollowedByMatcher(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier') {
    return false
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (!object) return false

    if (object.type === 'CallExpression') {
      const innerCallee = toASTNode(object.callee)
      if (innerCallee?.type === 'Identifier') {
        return true
      }

      if (innerCallee?.type === 'MemberExpression') {
        const innerObj = toASTNode(innerCallee.object)
        if (innerObj?.type === 'CallExpression') {
          return true
        }
      }
    }
  }

  return false
}

export const validExpectRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<ValidExpectOptions>(
      context.config.options,
      {},
    )

    const assertFunctions = new Set(options.assertFunctionNames ?? DEFAULT_ASSERT_FUNCTION_NAMES)
    const minArgs = options.minArgs ?? DEFAULT_MIN_ARGS
    const maxArgs = options.maxArgs ?? DEFAULT_MAX_ARGS

    return {
      CallExpression(node: unknown): void {
        if (isExpectStaticHelper(node, assertFunctions)) {
          return
        }

        const assertName = getAssertName(node, assertFunctions)
        if (assertName === null) return

        const n = toASTNode(node) as ASTNode | null
        if (!n) return

        const args = n.arguments as undefined | unknown[]

        if (!Array.isArray(args)) return

        if (args.length < minArgs) {
          context.report({
            loc: extractLocation(node),
            message: `${assertName}() requires at least ${minArgs} argument${minArgs === 1 ? '' : 's'}`,
            node,
          })
          return
        }

        if (args.length > maxArgs) {
          context.report({
            loc: extractLocation(node),
            message: `${assertName}() should be called with exactly ${maxArgs} argument${maxArgs === 1 ? '' : 's'}`,
            node,
          })
          return
        }

        if (!isFollowedByMatcher(node)) {
          context.report({
            loc: extractLocation(node),
            message: `${assertName}() must be followed by a matcher call`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Enforce valid usage of expect() calls with correct arguments and matchers',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/valid-expect',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          assertFunctionNames: {
            items: { type: 'string' },
            type: 'array',
          },
          maxArgs: { type: 'number' },
          minArgs: { type: 'number' },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default validExpectRule
