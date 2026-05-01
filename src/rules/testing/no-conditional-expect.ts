import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getCallRootName,
  toASTNode,
} from '../../utils/ast-helpers.js'

const DEFAULT_ASSERT_FUNCTION_NAMES = ['expect']

function getAssertFunctionNames(context: RuleContext): string[] {
  const options = context.config?.options
  if (Array.isArray(options) && options.length > 0) {
    const first = options[0] as Record<string, unknown> | undefined
    if (first && Array.isArray(first.assertFunctionNames)) {
      return first.assertFunctionNames as string[]
    }
  }
  return DEFAULT_ASSERT_FUNCTION_NAMES
}

function getAssertionName(
  node: unknown,
  assertFunctionNames: string[],
): string | null {
  const rootName = getCallRootName(node)
  if (rootName !== null && assertFunctionNames.includes(rootName)) {
    return rootName
  }
  return null
}

export const noConditionalExpectRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const assertFunctionNames = getAssertFunctionNames(context)
    let conditionalDepth = 0

    const enterConditional = (): void => {
      conditionalDepth++
    }

    const exitConditional = (): void => {
      conditionalDepth--
    }

    return {
      CallExpression(node: unknown): void {
        if (conditionalDepth === 0) return

        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const assertName = getAssertionName(node, assertFunctionNames)
        if (assertName === null) return

        context.report({
          loc: extractLocation(node),
          message: `Unexpected '${assertName}' call in conditional statement. This assertion could silently pass.`,
          node,
        })
      },

      IfStatement(_node: unknown): void {
        enterConditional()
      },

      'IfStatement:exit'(_node: unknown): void {
        exitConditional()
      },

      ConditionalExpression(_node: unknown): void {
        enterConditional()
      },

      'ConditionalExpression:exit'(_node: unknown): void {
        exitConditional()
      },

      CatchClause(_node: unknown): void {
        enterConditional()
      },

      'CatchClause:exit'(_node: unknown): void {
        exitConditional()
      },

      SwitchStatement(_node: unknown): void {
        enterConditional()
      },

      'SwitchStatement:exit'(_node: unknown): void {
        exitConditional()
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Disallow conditional assertions that could silently pass',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-conditional-expect',
    },
    schema: [
      {
        type: 'object',
        properties: {
          assertFunctionNames: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        additionalProperties: false,
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noConditionalExpectRule
