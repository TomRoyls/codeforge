/**
 * @file Warn on unsafe type assertions (casting to/from any, unknown, or unrelated types)
 * @module rules/security/no-unsafe-type-assertion
 */

import type {
  RuleContext,
  RuleDefinition,
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

function getTypeAnnotationName(typeAnnotation: unknown): null | string {
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

function getTargetType(node: unknown): null | string {
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
  intermediateType: null | string
  isDouble: boolean
} {
  if (!node || typeof node !== 'object') {
    return { intermediateType: null, isDouble: false }
  }

  const n = node as Record<string, unknown>
  const {expression} = n

  if (!expression || typeof expression !== 'object') {
    return { intermediateType: null, isDouble: false }
  }

  const expr = expression as Record<string, unknown>

  if (expr.type === 'TSAsExpression' || expr.type === 'TSTypeAssertion') {
    const intermediateType = getTargetType(expr)
    return { intermediateType, isDouble: true }
  }

  return { intermediateType: null, isDouble: false }
}

function getExpressionType(expression: unknown): null | string {
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
  sourceType: null | string,
  targetType: null | string,
  options: NoUnsafeTypeAssertionOptions,
): { reason: string; unsafe: boolean; } {
  if (targetType === 'unknown') {
    if (options.allowAnyToUnknown && sourceType === 'any') {
      return { reason: '', unsafe: false }
    }

    if (sourceType === 'any') {
      return { reason: 'Casting from any to unknown', unsafe: !options.allowAnyToUnknown }
    }

    return { reason: '', unsafe: false }
  }

  if (targetType === 'any') {
    if (options.allowUnknownToAny && sourceType === 'unknown') {
      return { reason: '', unsafe: false }
    }

    return { reason: 'Casting to any bypasses type safety', unsafe: true }
  }

  if (sourceType === 'any') {
    return { reason: 'Casting from any to a specific type is unsafe', unsafe: true }
  }

  if (sourceType === 'unknown') {
    return { reason: 'Casting from unknown without type checking is unsafe', unsafe: true }
  }

  return { reason: '', unsafe: false }
}

function isRedundantCast(sourceType: null | string, targetType: null | string): boolean {
  if (!sourceType || !targetType) {
    return false
  }

  return sourceType === targetType
}

export const noUnsafeTypeAssertionRule: RuleDefinition = {
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

  meta: {
    docs: {
      category: 'security',
      description:
        'Warn on unsafe type assertions (casting to/from any, unknown, or unrelated types). Type assertions bypass TypeScript safety checks and can hide type errors.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-type-assertion',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowAnyToUnknown: {
            default: false,
            type: 'boolean',
          },
          allowUnknownToAny: {
            default: false,
            type: 'boolean',
          },
          reportRedundant: {
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

function checkTypeAssertion(
  node: unknown,
  syntax: 'angle-bracket' | 'as',
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
      loc: location,
      message: `Unsafe double type assertion via 'unknown'. This bypasses type safety entirely. Use type guards or validation instead.`,
    })
    return
  }

  const sourceType = getExpressionType(expression)

  const { reason, unsafe } = isUnsafeAssertion(sourceType, targetType, options)
  if (unsafe) {
    const syntaxDesc = syntax === 'as' ? 'as' : '<>'
    context.report({
      loc: location,
      message: `Unsafe type assertion (${syntaxDesc} ${targetType ?? 'type'}). ${reason}. Use type guards or validation instead.`,
    })
    return
  }

  if (options.reportRedundant && isRedundantCast(sourceType, targetType)) {
    context.report({
      loc: location,
      message: `Redundant type assertion. Expression is already of type '${targetType}'.`,
    })
  }
}

export default noUnsafeTypeAssertionRule
