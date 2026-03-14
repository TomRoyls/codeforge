import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

interface NoConsoleLogOptions {
  readonly allow?: readonly string[]
}

const CONSOLE_METHODS = [
  'log',
  'warn',
  'error',
  'info',
  'debug',
  'trace',
  'table',
  'dir',
  'time',
  'timeEnd',
  'group',
  'groupEnd',
  'clear',
  'count',
  'countReset',
  'assert',
  'profile',
  'profileEnd',
  'timestamp',
]

function isConsoleCall(
  node: unknown,
  allowedMethods: readonly string[],
): { isConsole: boolean; method: string | null } {
  if (!node || typeof node !== 'object') {
    return { isConsole: false, method: null }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isConsole: false, method: null }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || callee.type !== 'MemberExpression') {
    return { isConsole: false, method: null }
  }

  const object = callee.object as Record<string, unknown> | undefined
  const property = callee.property as Record<string, unknown> | undefined

  if (!object || object.type !== 'Identifier' || object.name !== 'console') {
    return { isConsole: false, method: null }
  }

  if (!property || property.type !== 'Identifier') {
    return { isConsole: false, method: null }
  }

  const method = property.name as string

  if (allowedMethods.includes(method)) {
    return { isConsole: false, method: null }
  }

  if (!CONSOLE_METHODS.includes(method)) {
    return { isConsole: false, method: null }
  }

  return { isConsole: true, method }
}

export const noConsoleLogRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow console.log and similar console methods in production code. Use a proper logging library instead.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-console-log',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: {
              type: 'string',
              enum: CONSOLE_METHODS,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: NoConsoleLogOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as NoConsoleLogOptions

    const allowedMethods = options.allow ?? []

    return {
      CallExpression(node: unknown): void {
        const { isConsole, method } = isConsoleCall(node, allowedMethods)

        if (!isConsole || !method) {
          return
        }

        const location = extractLocation(node)
        const range = getRange(node)

        context.report({
          message: `Unexpected console.${method} statement. Use a proper logging library for production code.`,
          loc: location,
          fix: range ? { range, text: '' } : undefined,
        })
      },
    }
  },
}

export default noConsoleLogRule
