import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoConsoleOptions {
  readonly allow?: readonly string[]
}

const CONSOLE_METHODS = new Set(['debug', 'error', 'info', 'log', 'trace', 'warn'])

function isConsoleCall(
  node: unknown,
  allowedMethods: Set<string>,
): { isConsole: boolean; method: string } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return { isConsole: false, method: '' }
  }

  const callee = toASTNode(n.callee)
  if (!callee) {
    return { isConsole: false, method: '' }
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    const property = toASTNode(callee.property)

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
