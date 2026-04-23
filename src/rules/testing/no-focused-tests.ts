import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

const TEST_FUNCTIONS = new Set(['describe', 'it', 'test'])
const FOCUSED_ALIAS = 'fit'

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

function isFocusedTest(node: unknown): { isFocused: boolean; reason: string } {
  if (!node || typeof node !== 'object') {
    return { isFocused: false, reason: '' }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isFocused: false, reason: '' }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return { isFocused: false, reason: '' }
  }

  // Check for fit() - direct Identifier call
  if (callee.type === 'Identifier' && typeof callee.name === 'string' && callee.name === FOCUSED_ALIAS) {
      return { isFocused: true, reason: FOCUSED_ALIAS }
    }

  // Check for MemberExpression chain: it.only(), test.only(), describe.only()
  // Also handles chained calls like it.only.each(), it.only.each().withTimeout()
  if (callee.type === 'MemberExpression') {
    // Traverse the member expression chain to check if any part is .only on a test function
    let current: Record<string, unknown> | undefined = callee

    while (current && current.type === 'MemberExpression') {
      const property = current.property as Record<string, unknown> | undefined

      // Check if this level has .only
      if (
        property?.type === 'Identifier' &&
        typeof property.name === 'string' &&
        property.name === 'only'
      ) {
        // Check if the object at this level is a test function identifier
        const object = current.object as Record<string, unknown> | undefined

        if (
          object?.type === 'Identifier' &&
          typeof object.name === 'string' &&
          TEST_FUNCTIONS.has(object.name)
        ) {
          return { isFocused: true, reason: `${object.name}.only` }
        }
      }

      // Move up the chain
      current = current.object as Record<string, unknown> | undefined
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
