import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoConsoleOptions {
  readonly allow?: readonly string[]
}

const CONSOLE_METHODS = new Set(['debug', 'error', 'info', 'log', 'trace', 'warn'])

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

function isConsoleCall(
  node: unknown,
  allowedMethods: Set<string>,
): { isConsole: boolean; method: string } {
  if (!node || typeof node !== 'object') {
    return { isConsole: false, method: '' }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isConsole: false, method: '' }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return { isConsole: false, method: '' }
  }

  if (callee.type === 'MemberExpression') {
    const object = callee.object as Record<string, unknown> | undefined
    const property = callee.property as Record<string, unknown> | undefined

    if (
      object?.type === 'Identifier' &&
      object.name === 'console' &&
      property?.type === 'Identifier' &&
      typeof property.name === 'string' &&
      CONSOLE_METHODS.has(property.name)
    ) {
      if (allowedMethods.has(property.name)) {
        return { isConsole: false, method: '' }
      }

      return { isConsole: true, method: property.name }
    }
  }

  return { isConsole: false, method: '' }
}

export const noConsoleRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoConsoleOptions>(context.config.options, {
      allow: [] as const,
    })

    const allowedMethods = new Set(options.allow ?? [])

    return {
      CallExpression(node: unknown): void {
        const result = isConsoleCall(node, allowedMethods)

        if (result.isConsole) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected use of 'console.${result.method}'. Use a proper logging library instead.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'best-practices',
      description: 'Detect console usage in production code that should use proper logging',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-console',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            items: {
              enum: ['log', 'warn', 'error', 'info', 'debug', 'trace'],
              type: 'string',
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConsoleRule
