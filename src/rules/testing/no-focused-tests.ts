import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, toASTNode } from '../../utils/ast-helpers.js'
import { TEST_FUNCTIONS } from '../../utils/constants.js'

const FOCUSED_ALIAS = 'fit'

function isFocusedTest(node: unknown): { isFocused: boolean; reason: string } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return { isFocused: false, reason: '' }
  }

  const callee = toASTNode(n.callee)
  if (!callee) {
    return { isFocused: false, reason: '' }
  }

  if (callee.type === 'Identifier' && typeof callee.name === 'string' && callee.name === FOCUSED_ALIAS) {
      return { isFocused: true, reason: FOCUSED_ALIAS }
    }

  if (callee.type === 'MemberExpression') {
    let current: ASTNode | null = callee

    while (current && current.type === 'MemberExpression') {
      const property = toASTNode(current.property)

      if (
        property?.type === 'Identifier' &&
        typeof property.name === 'string' &&
        property.name === 'only'
      ) {
        const object = toASTNode(current.object)

        if (
          object?.type === 'Identifier' &&
          typeof object.name === 'string' &&
          TEST_FUNCTIONS.has(object.name)
        ) {
          return { isFocused: true, reason: `${object.name}.only` }
        }
      }

      current = toASTNode(current.object)
    }
  }

  return { isFocused: false, reason: '' }
}

export const noFocusedTestsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = isFocusedTest(node)

        if (result.isFocused) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected focused test '${result.reason}'. Focused tests can mask failures in CI by running only a subset of tests.`,
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
        'Detect focused tests (.only() calls) that can mask failures in CI by running only a subset of tests',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-focused-tests',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noFocusedTestsRule
