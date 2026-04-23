import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

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
): { isConsole: boolean; method: null | string } {
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
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoConsoleLogOptions>(context.config.options, { allow: [] })

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
          fix: range ? { range, text: '' } : undefined,
          loc: location,
          message: `Unexpected console.${method} statement. ${RULE_SUGGESTIONS.noConsoleLog}`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow console.log and similar console methods in production code. Use a proper logging library instead.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-console-log',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            items: {
              enum: CONSOLE_METHODS,
              type: 'string',
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noConsoleLogRule
