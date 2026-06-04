import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  isBinaryExpression,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  toASTNode,
} from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface RestrictTemplateExpressionsOptions {
  readonly allowBoolean?: boolean
  readonly allowNull?: boolean
  readonly allowNumber?: boolean
  readonly allowUndefined?: boolean
}

function isStringLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && typeof n.value === 'string'
}

function isNumberLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && typeof n.value === 'number'
}

function isBooleanLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'BooleanLiteral' || (n.type === 'Literal' && typeof n.value === 'boolean')
}

function isNullLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && n.value === null
}

function isUndefinedIdentifier(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Identifier' && n.name === 'undefined'
}

function isAllowedType(node: unknown, options: RestrictTemplateExpressionsOptions): boolean {
  if (isStringLiteral(node)) {
    return true
  }

  if (options.allowNumber && isNumberLiteral(node)) {
    return true
  }

  if (options.allowBoolean && isBooleanLiteral(node)) {
    return true
  }

  if (options.allowNull && isNullLiteral(node)) {
    return true
  }

  if (options.allowUndefined && isUndefinedIdentifier(node)) {
    return true
  }

  return false
}

function getExpressionDescription(node: unknown): string {
  if (isStringLiteral(node)) {
    return 'string literal'
  }

  if (isNumberLiteral(node)) {
    return 'number literal'
  }

  if (isBooleanLiteral(node)) {
    return 'boolean literal'
  }

  if (isNullLiteral(node)) {
    return 'null'
  }

  if (isUndefinedIdentifier(node)) {
    return 'undefined'
  }

  if (isIdentifier(node)) {
    const n = toASTNode(node)
    return `identifier '${n?.name ?? ''}'`
  }

  if (isBinaryExpression(node)) {
    return 'binary expression'
  }

  if (isCallExpression(node)) {
    return 'function call'
  }

  if (isMemberExpression(node)) {
    return 'property access'
  }

  const n = toASTNode(node)
  if (!n) {
    throw new TypeError('Cannot get expression description for null/undefined node')
  }

  return (n.type as string) || 'expression'
}

export const restrictTemplateExpressionsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<RestrictTemplateExpressionsOptions>(context.config.options, {
      allowBoolean: false,
      allowNull: false,
      allowNumber: false,
      allowUndefined: false,
    })

    return {
      TemplateLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TemplateLiteral') {
          return
        }

        const {expressions} = n

        if (!expressions || expressions.length === 0) {
          return
        }

        for (const expression of expressions) {
          if (isAllowedType(expression, options)) {
            continue
          }

          const location = extractLocation(expression)
          const description = getExpressionDescription(expression)

          context.report({
            loc: location,
            message: `Unexpected ${description} in template literal. Use explicit string conversion (String()) or template with only string values.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Restrict template expressions to specific types. Prevents accidental string coercion of non-string values which can lead to unexpected output.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/restrict-template-expressions',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowBoolean: {
            default: false,
            type: 'boolean',
          },
          allowNull: {
            default: false,
            type: 'boolean',
          },
          allowNumber: {
            default: false,
            type: 'boolean',
          },
          allowUndefined: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default restrictTemplateExpressionsRule
