/**
 * @fileoverview Warn on unsafe type assertions (casting to/from any, unknown, or unrelated types)
 * @module rules/security/no-unsafe-type-assertion
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUnsafeTypeAssertionOptions {
  readonly allowAnyToUnknown?: boolean
  readonly allowUnknownToAny?: boolean
  readonly reportRedundant?: boolean
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

function getTypeAnnotationName(typeAnnotation: unknown): string | null {
  if (!typeAnnotation || typeof typeAnnotation !== 'object') {
    return null
  }

  const ta = typeAnnotation as Record<string, unknown>

  if (ta.type === 'TSAnyKeyword') {
    return 'any'
  }
  if (ta.type === 'TSUnknownKeyword') {
    return 'unknown'
  }

  if (ta.type === 'TSTypeReference') {
    const typeName = ta.typeName as Record<string, unknown> | undefined
    if (typeName?.type === 'Identifier' && typeof typeName.name === 'string') {
      return typeName.name
    }
  }

  if (ta.type === 'Identifier' && typeof ta.name === 'string') {
    return ta.name
  }

  return null
}

function getTargetType(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type === 'TSAsExpression' && n.typeAnnotation) {
    return getTypeAnnotationName(n.typeAnnotation)
  }

  if (n.type === 'TSTypeAssertion' && n.typeAnnotation) {
    return getTypeAnnotationName(n.typeAnnotation)
  }

  return null
}

function getSourceExpression(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  return n.expression
}

function checkForDoubleAssertion(node: unknown): {
  isDouble: boolean
  intermediateType: string | null
} {
  if (!node || typeof node !== 'object') {
    return { isDouble: false, intermediateType: null }
  }

  const n = node as Record<string, unknown>
  const expression = n.expression

  if (!expression || typeof expression !== 'object') {
    return { isDouble: false, intermediateType: null }
  }

  const expr = expression as Record<string, unknown>

  if (expr.type === 'TSAsExpression' || expr.type === 'TSTypeAssertion') {
    const intermediateType = getTargetType(expr)
    return { isDouble: true, intermediateType }
  }

  return { isDouble: false, intermediateType: null }
}

function getExpressionType(expression: unknown): string | null {
  if (!expression || typeof expression !== 'object') {
    return null
  }

  const expr = expression as Record<string, unknown>

  if (expr.type === 'TSAsExpression' || expr.type === 'TSTypeAssertion') {
    return getTargetType(expr)
  }

  if (expr.typeAnnotation) {
    return getTypeAnnotationName(expr.typeAnnotation)
  }

  if (expr.type === 'TSAsExpression') {
    const ta = expr.typeAnnotation as Record<string, unknown> | undefined
    if (ta?.type === 'TSTypeReference') {
      const typeName = ta.typeName as Record<string, unknown> | undefined
      if (typeName?.type === 'Identifier' && typeName.name === 'const') {
        return 'const'
      }
    }
  }

  return null
}

function isUnsafeAssertion(
  sourceType: string | null,
  targetType: string | null,
  options: NoUnsafeTypeAssertionOptions,
): { unsafe: boolean; reason: string } {
  if (targetType === 'unknown') {
    if (options.allowAnyToUnknown && sourceType === 'any') {
      return { unsafe: false, reason: '' }
    }
    if (sourceType === 'any') {
      return { unsafe: !options.allowAnyToUnknown, reason: 'Casting from any to unknown' }
    }
    return { unsafe: false, reason: '' }
  }

  if (targetType === 'any') {
    if (options.allowUnknownToAny && sourceType === 'unknown') {
      return { unsafe: false, reason: '' }
    }
    return { unsafe: true, reason: 'Casting to any bypasses type safety' }
  }

  if (sourceType === 'any') {
    return { unsafe: true, reason: 'Casting from any to a specific type is unsafe' }
  }

  if (sourceType === 'unknown') {
    return { unsafe: true, reason: 'Casting from unknown without type checking is unsafe' }
  }

  return { unsafe: false, reason: '' }
}

function isRedundantCast(sourceType: string | null, targetType: string | null): boolean {
  if (!sourceType || !targetType) {
    return false
  }

  return sourceType === targetType
}

export const noUnsafeTypeAssertionRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Warn on unsafe type assertions (casting to/from any, unknown, or unrelated types). Type assertions bypass TypeScript safety checks and can hide type errors.',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-type-assertion',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowAnyToUnknown: {
            type: 'boolean',
            default: false,
          },
          allowUnknownToAny: {
            type: 'boolean',
            default: false,
          },
          reportRedundant: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoUnsafeTypeAssertionOptions>(context.config.options, {
      allowAnyToUnknown: false,
      allowUnknownToAny: false,
      reportRedundant: false,
    })

    return {
      TSAsExpression(node: unknown): void {
        checkTypeAssertion(node, 'as', context, options)
      },

      TSTypeAssertion(node: unknown): void {
        checkTypeAssertion(node, 'angle-bracket', context, options)
      },
    }
  },
}

function checkTypeAssertion(
  node: unknown,
  syntax: 'as' | 'angle-bracket',
  context: RuleContext,
  options: NoUnsafeTypeAssertionOptions,
): void {
  if (!node || typeof node !== 'object') {
    return
  }

  const location = extractLocation(node)
  const targetType = getTargetType(node)
  const expression = getSourceExpression(node)

  const doubleCheck = checkForDoubleAssertion(node)
  if (doubleCheck.isDouble && doubleCheck.intermediateType === 'unknown') {
    context.report({
      message: `Unsafe double type assertion via 'unknown'. This bypasses type safety entirely. Use type guards or validation instead.`,
      loc: location,
    })
    return
  }

  const sourceType = getExpressionType(expression)

  const { unsafe, reason } = isUnsafeAssertion(sourceType, targetType, options)
  if (unsafe) {
    const syntaxDesc = syntax === 'as' ? 'as' : '<>'
    context.report({
      message: `Unsafe type assertion (${syntaxDesc} ${targetType ?? 'type'}). ${reason}. Use type guards or validation instead.`,
      loc: location,
    })
    return
  }

  if (options.reportRedundant && isRedundantCast(sourceType, targetType)) {
    context.report({
      message: `Redundant type assertion. Expression is already of type '${targetType}'.`,
      loc: location,
    })
  }
}

export default noUnsafeTypeAssertionRule
