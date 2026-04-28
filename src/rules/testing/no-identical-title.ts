import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoIdenticalTitleOptions {
  readonly ignoreContext?: boolean
}

function getFunctionName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return object.name
    }
  }

  return null
}

function getTitle(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const args = n.arguments
  if (!args || args.length === 0) return null

  const firstArg = toASTNode(args[0])
  if (!firstArg) return null

  if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
    return firstArg.value
  }

  if (firstArg.type === 'TemplateLiteral') {
    const {quasis} = firstArg
    if (Array.isArray(quasis) && quasis.length > 0) {
      const firstQuasi = toASTNode(quasis[0])
      if (firstQuasi && typeof firstQuasi.value === 'object' && firstQuasi.value !== null) {
        const {cooked} = (firstQuasi.value as Record<string, unknown>)
        if (typeof cooked === 'string') {
          return cooked
        }
      }

      if (typeof firstQuasi?.raw === 'string') {
        return firstQuasi.raw
      }
    }
  }

  return null
}

function isDescribeFunction(name: string): boolean {
  return DESCRIBE_FUNCTIONS.has(name)
}

export const noIdenticalTitleRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoIdenticalTitleOptions>(context.config.options, {
      ignoreContext: false,
    })

    const titleStack: Set<string>[] = [new Set()]

    return {
      CallExpression(node: unknown): void {
        const functionName = getFunctionName(node)
        if (functionName === null) return

        if (options.ignoreContext && functionName === 'context') return

        const title = getTitle(node)
        if (title === null) return

        const currentScope = titleStack.at(-1)
        if (currentScope === undefined) return

        if (currentScope.has(title)) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected duplicate test title '${title}'. Duplicate titles make it hard to identify failing tests.`,
            node,
          })
        } else {
          currentScope.add(title)
        }

        if (isDescribeFunction(functionName)) {
          titleStack.push(new Set())
        }
      },

      'CallExpression:exit'(node: unknown): void {
        const functionName = getFunctionName(node)
        if (functionName === null) return
        if (options.ignoreContext && functionName === 'context') return
        if (isDescribeFunction(functionName)) {
          titleStack.pop()
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Detect duplicate test titles within the same scope that make it hard to identify failing tests',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-identical-title',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignoreContext: {
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

export default noIdenticalTitleRule
