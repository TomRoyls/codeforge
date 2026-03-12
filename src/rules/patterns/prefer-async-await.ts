import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface PreferAsyncAwaitOptions {
  readonly allowPromiseMethods?: boolean
}

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

function isPromiseMethod(name: string): boolean {
  return name === 'then' || name === 'catch' || name === 'finally'
}

function isPromiseMethodCall(node: unknown): { isCall: boolean; method: string } {
  if (!node || typeof node !== 'object') {
    return { isCall: false, method: '' }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isCall: false, method: '' }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || callee.type !== 'MemberExpression') {
    return { isCall: false, method: '' }
  }

  const property = callee.property as Record<string, unknown> | undefined

  if (!property || property.type !== 'Identifier') {
    return { isCall: false, method: '' }
  }

  const methodName = property.name as string

  if (isPromiseMethod(methodName)) {
    return { isCall: true, method: methodName }
  }

  return { isCall: false, method: '' }
}

export const preferAsyncAwaitRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer async/await syntax over Promise .then()/.catch() chains for better readability and error handling.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-async-await',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowPromiseMethods: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: PreferAsyncAwaitOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as PreferAsyncAwaitOptions

    return {
      CallExpression(node: unknown): void {
        if (options.allowPromiseMethods) {
          return
        }

        const { isCall, method } = isPromiseMethodCall(node)

        if (isCall) {
          const location = extractLocation(node)
          context.report({
            message: `Prefer async/await over .${method}() for better readability. Convert this Promise chain to use async/await syntax.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default preferAsyncAwaitRule
