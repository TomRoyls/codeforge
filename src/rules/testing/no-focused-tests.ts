import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

const TEST_FUNCTIONS = new Set(['it', 'test', 'describe'])
const FOCUSED_ALIAS = 'fit'

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
  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    if (callee.name === FOCUSED_ALIAS) {
      return { isFocused: true, reason: FOCUSED_ALIAS }
    }
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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Detect focused tests (.only() calls) that can mask failures in CI by running only a subset of tests',
      category: 'testing',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-focused-tests',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = isFocusedTest(node)

        if (result.isFocused) {
          context.report({
            node,
            message: `Unexpected focused test '${result.reason}'. Focused tests can mask failures in CI by running only a subset of tests.`,
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noFocusedTestsRule
