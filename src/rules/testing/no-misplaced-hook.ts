import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getCallRootName, toASTNode } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS, HOOK_FUNCTIONS } from '../../utils/constants.js'

export const noMisplacedHookRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    let describeDepth = 0

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const rootName = getCallRootName(node)

        if (rootName !== null && DESCRIBE_FUNCTIONS.has(rootName)) {
          describeDepth++
          return
        }

        if (rootName !== null && HOOK_FUNCTIONS.has(rootName) && describeDepth === 0) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected '${rootName}' hook outside of a describe block. Move it inside a describe() to keep tests organized.`,
            node,
          })
        }
      },

      'CallExpression:exit'(node: unknown): void {
        const rootName = getCallRootName(node)
        if (rootName !== null && DESCRIBE_FUNCTIONS.has(rootName)) {
          describeDepth--
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow hook functions (beforeEach, afterEach, beforeAll, afterAll) placed outside describe blocks',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-misplaced-hook',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMisplacedHookRule
