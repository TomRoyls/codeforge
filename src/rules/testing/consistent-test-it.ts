import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getCallRootName } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

type TestFunctionPreference = 'it' | 'test'

interface ConsistentTestItOptions {
  readonly fn?: TestFunctionPreference
}

const DEFAULT_FN: TestFunctionPreference = 'it'

export const consistentTestItRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<ConsistentTestItOptions>(
      context.config.options,
      {},
    )

    const preferredFn = options.fn ?? DEFAULT_FN
    const disallowedFn: TestFunctionPreference = preferredFn === 'it' ? 'test' : 'it'

    return {
      CallExpression(node: unknown): void {
        const functionName = getCallRootName(node)
        if (functionName === null) return

        if (functionName === disallowedFn) {
          context.report({
            loc: extractLocation(node),
            message: `Use '${preferredFn}()' instead of '${disallowedFn}()' for consistency.`,
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
        'Enforce consistent usage of either it() or test() for test cases throughout the codebase',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/consistent-test-it',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          fn: {
            enum: ['it', 'test'],
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default consistentTestItRule
