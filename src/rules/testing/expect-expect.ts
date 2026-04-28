import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface ExpectExpectOptions {
  readonly assertFunctionNames?: readonly string[]
}

const DEFAULT_ASSERT_FUNCTION_NAMES = ['expect']

function getFunctionName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return object.name
    }
  }

  return null
}

function isTestFunction(name: string): boolean {
  return name === 'it' || name === 'test'
}

function getAssertionNames(context: RuleContext): ReadonlySet<string> {
  const options = extractRuleOptions<ExpectExpectOptions>(context.config.options, {})
  const names = options.assertFunctionNames ?? DEFAULT_ASSERT_FUNCTION_NAMES

  return new Set(names)
}

function isAssertionCall(node: unknown, assertionNames: ReadonlySet<string>): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return assertionNames.has(callee.name)
  }

  if (callee.type === 'MemberExpression') {
    let current: ASTNode | null = callee

    while (current !== null && current.type === 'MemberExpression') {
      const obj = toASTNode(current.object)
      if (obj?.type === 'Identifier' && typeof obj.name === 'string') {
        return assertionNames.has(obj.name)
      }

      current = obj
    }
  }

  return false
}

function hasAssertionInTree(
  node: unknown,
  assertionNames: ReadonlySet<string>,
  visited?: Set<unknown>,
): boolean {
  if (!node || typeof node !== 'object') return false

  const visitedSet = visited ?? new Set<unknown>()
  if (visitedSet.has(node)) return false
  visitedSet.add(node)

  if (isAssertionCall(node, assertionNames)) return true

  const n = toASTNode(node)
  if (!n) return false

  for (const value of Object.values(n)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (hasAssertionInTree(item, assertionNames, visitedSet)) return true
        }
      } else if (hasAssertionInTree(value, assertionNames, visitedSet)) {
        return true
      }
    }
  }

  return false
}

export const expectExpectRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const assertionNames = getAssertionNames(context)

    return {
      CallExpression(node: unknown): void {
        const functionName = getFunctionName(node)
        if (functionName === null) return

        if (!isTestFunction(functionName)) return

        if (!hasAssertionInTree(node, assertionNames)) {
          context.report({
            loc: extractLocation(node),
            message: `Test '${functionName}' has no assertions. Every test should contain at least one assertion call.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce that every test contains at least one assertion to ensure tests actually verify behavior',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/expect-expect',
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
    severity: 'warn',
    type: 'problem',
  },
}

export default expectExpectRule
