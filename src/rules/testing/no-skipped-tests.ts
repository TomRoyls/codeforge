import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoSkippedTestsOptions {
  readonly allowSkipOnly?: boolean
}

const TEST_FUNCTIONS = new Set(['describe', 'it', 'test'])
const SKIP_ONLY_METHODS = new Set(['only', 'skip'])
const X_PREFIX_FUNCTIONS = new Set(['xdescribe', 'xit', 'xtest'])

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }
}

function isSkippedTest(
  node: unknown,
  allowSkipOnly: boolean,
): { isSkipped: boolean; reason: string } {
  if (!node || typeof node !== 'object') {
    return { isSkipped: false, reason: '' }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isSkipped: false, reason: '' }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return { isSkipped: false, reason: '' }
  }

  // Check for MemberExpression: it.skip(), test.only(), describe.skip()
  if (callee.type === 'MemberExpression') {
    const object = callee.object as Record<string, unknown> | undefined
    const property = callee.property as Record<string, unknown> | undefined

    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      TEST_FUNCTIONS.has(object.name) &&
      property?.type === 'Identifier' &&
      typeof property.name === 'string' &&
      SKIP_ONLY_METHODS.has(property.name)
    ) {
      if (allowSkipOnly) {
        return { isSkipped: false, reason: '' }
      }

      return { isSkipped: true, reason: `${object.name}.${property.name}` }
    }
  }

  // Check for Identifier with x-prefix: xit(), xtest(), xdescribe()
  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    const {name} = callee
    if (X_PREFIX_FUNCTIONS.has(name)) {
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
