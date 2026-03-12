import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface NoExplicitAnyOptions {
  readonly allowInGenericArrays?: boolean
  readonly allowAsTypeAssertion?: boolean
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

function isAnyKeyword(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'TSAnyKeyword'
}

function isArrayOfAny(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return (n.type === 'TSArrayType' || n.type === 'ArrayType') && isAnyKeyword(n.elementType)
}

function isTypeAssertionToAny(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type === 'TSAsExpression' || n.type === 'TSTypeAssertion') {
    return isAnyKeyword(n.typeAnnotation)
  }
  return false
}

export const noExplicitAnyRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow usage of the any type in TypeScript. Use more specific types for better type safety.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-explicit-any',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowInGenericArrays: {
            type: 'boolean',
            default: false,
          },
          allowAsTypeAssertion: {
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
    const options: NoExplicitAnyOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as NoExplicitAnyOptions

    return {
      TSAnyKeyword(node: unknown): void {
        if (!isAnyKeyword(node)) {
          return
        }
        const location = extractLocation(node)
        context.report({
          message:
            "Unexpected use of the 'any' type. Use a more specific type for better type safety.",
          loc: location,
        })
      },

      TSArrayType(node: unknown): void {
        if (options.allowInGenericArrays) {
          return
        }

        if (isArrayOfAny(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              "Unexpected array with 'any' element type. Use a more specific type like string[], number[], or a custom interface.",
            loc: location,
          })
        }
      },

      TSAsExpression(node: unknown): void {
        if (options.allowAsTypeAssertion) {
          return
        }

        if (isTypeAssertionToAny(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              "Unexpected type assertion to 'any'. This bypasses type safety. Use a more specific type or type guards.",
            loc: location,
          })
        }
      },

      TSTypeAssertion(node: unknown): void {
        if (options.allowAsTypeAssertion) {
          return
        }

        if (isTypeAssertionToAny(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              "Unexpected type assertion to 'any'. This bypasses type safety. Use a more specific type or type guards.",
            loc: location,
          })
        }
      },
    }
  },
}

export default noExplicitAnyRule
