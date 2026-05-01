import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getCallRootName, isDescribeCall } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS, TEST_AND_HOOK_FUNCTIONS } from '../../utils/constants.js'

interface DescribeEntry {
  hasContent: boolean
  node: unknown
}

export const noEmptyDescribeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const describeStack: DescribeEntry[] = []

    return {
      CallExpression(node: unknown): void {
        if (isDescribeCall(node) !== null) {
          describeStack.push({ hasContent: false, node })
          return
        }

        if (describeStack.length > 0) {
          const rootName = getCallRootName(node)
          if (rootName !== null && TEST_AND_HOOK_FUNCTIONS.has(rootName)) {
            for (const entry of describeStack) {
              entry.hasContent = true
            }
          } else if (rootName !== null && !DESCRIBE_FUNCTIONS.has(rootName)) {
            for (const entry of describeStack) {
              entry.hasContent = true
            }
          }
        }
      },

      'CallExpression:exit'(node: unknown): void {
        if (isDescribeCall(node) !== null) {
          const entry = describeStack.pop()
          if (entry && !entry.hasContent) {
            context.report({
              loc: extractLocation(node),
              message: 'Empty describe block. Remove it or add tests.',
              node,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow empty describe blocks that contain no test cases or hooks',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-empty-describe.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noEmptyDescribeRule
