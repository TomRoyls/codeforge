import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  type ASTNode,
  toASTNode,
} from '../../utils/ast-helpers.js'
import { EQUALITY_MATCHERS } from '../../utils/constants.js'

const PRIMITIVE_TYPES = new Set(['boolean', 'number', 'string'])

function getArgumentType(arg: unknown): string | null {
  const n = toASTNode(arg)
  if (!n) return null

  if (n.type === 'Literal') {
    const value = (n as { value: unknown }).value
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'bigint') return 'bigint'
  }

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    if (n.name === 'undefined') return 'undefined'
    if (n.name === 'NaN') return 'number'
    if (n.name === 'Infinity') return 'number'
  }

  if (n.type === 'TemplateLiteral') return 'string'

  if (n.type === 'UnaryExpression') {
    const operator = (n as { operator: unknown }).operator
    if (operator === 'void') return 'undefined'
    if (operator === '-' || operator === '+' || operator === '~') return 'number'
  }

  return null
}

function buildNotPrefix(callee: unknown): string {
  const n = toASTNode(callee)
  if (!n || n.type !== 'MemberExpression') return ''

  const obj = toASTNode(n.object)
  if (obj?.type === 'MemberExpression') {
    const innerProp = getPropertyName(obj)
    if (innerProp === 'not') {
      return 'not.'
    }
  }

  return ''
}

export const preferToBeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node) as ASTNode | null
        if (!n) return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const matcherName = getPropertyName(callee)
        if (!matcherName || !EQUALITY_MATCHERS.has(matcherName)) return

        const args = n.arguments as unknown[] | undefined
        if (!Array.isArray(args) || args.length === 0) return

        const firstArg = args[0]
        const argType = getArgumentType(firstArg)

        if (argType === null) return

        const notPrefix = buildNotPrefix(callee)

        if (matcherName === 'toEqual' && PRIMITIVE_TYPES.has(argType)) {
          const argText = getArgumentText(firstArg)
          context.report({
            loc: extractLocation(node),
            message: `Use \`toBe(${argText})\` instead of \`toEqual(${argText})\``,
            node,
          })
          return
        }

        if (argType === 'null') {
          const suggestion = `${notPrefix}toBeNull()`
          const current = `${notPrefix}${matcherName}(null)`
          context.report({
            loc: extractLocation(node),
            message: `Use \`${suggestion}\` instead of \`${current}\``,
            node,
          })
          return
        }

        if (argType === 'undefined') {
          const suggestion = `${notPrefix}toBeUndefined()`
          const argText = getArgumentText(firstArg)
          const current = `${notPrefix}${matcherName}(${argText})`
          context.report({
            loc: extractLocation(node),
            message: `Use \`${suggestion}\` instead of \`${current}\``,
            node,
          })
          return
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce using toBe() for primitives and toBeNull()/toBeUndefined() for null/undefined',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-to-be',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

function getArgumentText(arg: unknown): string {
  const n = toASTNode(arg)
  if (!n) return 'value'

  if (n.type === 'Literal') {
    const value = (n as { value: unknown }).value
    if (value === null) return 'null'
    if (typeof value === 'string') return `'${value}'`
    return String(value)
  }

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  if (n.type === 'TemplateLiteral') return '`${...}`'
  if (n.type === 'UnaryExpression') {
    const operator = (n as { operator: unknown }).operator
    const argument = (n as { argument: unknown }).argument
    if (operator === 'void') return 'void 0'
    return `${operator}${getArgumentText(argument)}`
  }

  return 'value'
}

export default preferToBeRule
