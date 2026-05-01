import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface MaxExpectsOptions {
  readonly assertFunctionNames?: readonly string[]
  readonly max?: number
}

const DEFAULT_ASSERT_FUNCTION_NAMES = ['expect']
const DEFAULT_MAX = 5

function isTestCase(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name === 'it' || callee.name === 'test'
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return object.name === 'it' || object.name === 'test'
    }
  }

  return false
}

function isBareExpectCall(node: unknown, assertFunctions: ReadonlySet<string>): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return assertFunctions.has(callee.name)
  }

  return false
}

export const maxExpectsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<MaxExpectsOptions>(
      context.config.options,
      {},
    )

    const assertFunctions = new Set(options.assertFunctionNames ?? DEFAULT_ASSERT_FUNCTION_NAMES)
    const max = options.max ?? DEFAULT_MAX

    let inTestCase = 0
    let expectCount = 0

    return {
      CallExpression(node: unknown): void {
        if (isTestCase(node)) {
          inTestCase++
          expectCount = 0
          return
        }

        if (inTestCase > 0 && isBareExpectCall(node, assertFunctions)) {
            expectCount++
            if (expectCount > max) {
              context.report({
                loc: extractLocation(node),
                message: `Too many assertion calls (${expectCount}). Maximum allowed is ${max}.`,
                node,
              })
            }
          }
      },

      'CallExpression:exit'(node: unknown): void {
        if (isTestCase(node)) {
          inTestCase--
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Enforce a maximum number of assertion calls per test case',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/max-expects',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          assertFunctionNames: {
            items: { type: 'string' },
            type: 'array',
          },
          max: {
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default maxExpectsRule
