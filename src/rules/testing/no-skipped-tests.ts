import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { TEST_FUNCTIONS, TEST_SKIP_METHODS, X_PREFIX_SKIP_FUNCTIONS } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoSkippedTestsOptions {
  readonly allowSkipOnly?: boolean
}

function isSkippedTest(
  node: unknown,
  allowSkipOnly: boolean,
): { isSkipped: boolean; reason: string } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return { isSkipped: false, reason: '' }
  }

  const callee = toASTNode(n.callee)
  if (!callee) {
    return { isSkipped: false, reason: '' }
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    const property = toASTNode(callee.property)

    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      TEST_FUNCTIONS.has(object.name) &&
      property?.type === 'Identifier' &&
      typeof property.name === 'string' &&
      TEST_SKIP_METHODS.has(property.name)
    ) {
      if (allowSkipOnly) {
        return { isSkipped: false, reason: '' }
      }

      return { isSkipped: true, reason: `${object.name}.${property.name}` }
    }
  }

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    const {name} = callee
    if (X_PREFIX_SKIP_FUNCTIONS.has(name)) {
      return { isSkipped: true, reason: name }
    }
  }

  return { isSkipped: false, reason: '' }
}

export const noSkippedTestsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoSkippedTestsOptions>(context.config.options, {
      allowSkipOnly: false,
    })

    return {
      CallExpression(node: unknown): void {
        const result = isSkippedTest(node, options.allowSkipOnly ?? false)

        if (result.isSkipped) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected use of '${result.reason}'. Skipped or focused tests can hide issues and cause inconsistent test runs.`,
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
        'Detect skipped or focused tests that may hide issues or cause inconsistent test runs',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-skipped-tests',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowSkipOnly: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noSkippedTestsRule
