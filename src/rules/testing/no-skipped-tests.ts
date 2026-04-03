import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoSkippedTestsOptions {
  readonly allowSkipOnly?: boolean
}

const TEST_FUNCTIONS = new Set(['it', 'test', 'describe'])
const SKIP_ONLY_METHODS = new Set(['skip', 'only'])
const X_PREFIX_FUNCTIONS = new Set(['xit', 'xtest', 'xdescribe'])

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
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
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
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
    const name = callee.name
    if (X_PREFIX_FUNCTIONS.has(name)) {
      return { isSkipped: true, reason: name }
    }
  }

  return { isSkipped: false, reason: '' }
}

export const noSkippedTestsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Detect skipped or focused tests that may hide issues or cause inconsistent test runs',
      category: 'testing',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-skipped-tests',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowSkipOnly: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoSkippedTestsOptions>(context.config.options, {
      allowSkipOnly: false,
    })

    return {
      CallExpression(node: unknown): void {
        const result = isSkippedTest(node, options.allowSkipOnly ?? false)

        if (result.isSkipped) {
          context.report({
            node,
            message: `Unexpected use of '${result.reason}'. Skipped or focused tests can hide issues and cause inconsistent test runs.`,
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noSkippedTestsRule
