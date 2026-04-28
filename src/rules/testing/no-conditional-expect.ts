import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, toASTNode } from '../../utils/ast-helpers.js'
import { TEST_FUNCTIONS } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoConditionalExpectOptions {
  readonly assertFunctionNames?: readonly string[]
}

const DEFAULT_ASSERT_FUNCTION_NAMES = ['expect']

function getRootCalleeName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  if (n.type === 'MemberExpression') {
    return getRootCalleeName(n.object)
  }

  return null
}

function isTestFunctionCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return TEST_FUNCTIONS.has(callee.name)
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return TEST_FUNCTIONS.has(object.name)
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
    const rootName = getRootCalleeName(callee)
    if (rootName !== null && assertFunctions.has(rootName)) {
      const obj = toASTNode(callee.object) as ASTNode | null
      if (obj?.type === 'CallExpression') {
        return null
      }

      return rootName
    }
  }

  return null
}

export const noConditionalExpectRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoConditionalExpectOptions>(
      context.config.options,
      {},
    )

    const assertFunctions = new Set(options.assertFunctionNames ?? DEFAULT_ASSERT_FUNCTION_NAMES)
    let conditionalDepth = 0

    return {
      CallExpression(node: unknown): void {
        if (conditionalDepth > 0 && !isTestFunctionCall(node)) {
          const assertName = getAssertName(node, assertFunctions)
          if (assertName !== null) {
            context.report({
              loc: extractLocation(node),
              message: `Unexpected '${assertName}' call inside conditional statement. Assertions inside conditionals can lead to tests that silently pass when they should fail.`,
              node,
            })
          }
        }
      },

      CatchClause(): void {
        conditionalDepth++
      },

      'CatchClause:exit'(): void {
        conditionalDepth--
      },

      ConditionalExpression(): void {
        conditionalDepth++
      },

      'ConditionalExpression:exit'(): void {
        conditionalDepth--
      },

      IfStatement(): void {
        conditionalDepth++
      },

      'IfStatement:exit'(): void {
        conditionalDepth--
      },

      SwitchStatement(): void {
        conditionalDepth++
      },

      'SwitchStatement:exit'(): void {
        conditionalDepth--
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow calling assertion functions inside conditional statements where tests may silently pass',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-conditional-expect',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          assertFunctionNames: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noConditionalExpectRule
