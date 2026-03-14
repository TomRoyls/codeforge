import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isBinaryExpression,
  isCallExpression,
  isMemberExpression,
  isIdentifier,
} from '../../utils/ast-helpers.js'

interface RestrictTemplateExpressionsOptions {
  readonly allowNumber?: boolean
  readonly allowBoolean?: boolean
  readonly allowNull?: boolean
  readonly allowUndefined?: boolean
}

function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'TemplateLiteral'
}

function isStringLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && typeof n.value === 'string'
}

function isNumberLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && typeof n.value === 'number'
}

function isBooleanLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && typeof n.value === 'boolean'
}

function isNullLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === null
}

function isUndefinedIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Identifier' && n.name === 'undefined'
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
    const n = node as Record<string, unknown>
    return `identifier '${n.name as string}'`
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

  const n = node as Record<string, unknown>
  return (n.type as string) || 'expression'
}

export const restrictTemplateExpressionsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Restrict template expressions to specific types. Prevents accidental string coercion of non-string values which can lead to unexpected output.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/restrict-template-expressions',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowNumber: {
            type: 'boolean',
            default: false,
          },
          allowBoolean: {
            type: 'boolean',
            default: false,
          },
          allowNull: {
            type: 'boolean',
            default: false,
          },
          allowUndefined: {
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
    const options: RestrictTemplateExpressionsOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as RestrictTemplateExpressionsOptions

    return {
      TemplateLiteral(node: unknown): void {
        if (!isTemplateLiteral(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const expressions = n.expressions as unknown[] | undefined

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
            message: `Unexpected ${description} in template literal. Use explicit string conversion (String()) or template with only string values.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default restrictTemplateExpressionsRule
