/**
 * @fileoverview Disallow unsafe return of values that bypass type safety
 * @module rules/security/no-unsafe-return
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface NoUnsafeReturnOptions {
  readonly allowAny?: boolean
  readonly allowUnknown?: boolean
}

interface FunctionInfo {
  readonly hasExplicitReturnType: boolean
  readonly returnTypeName: string | null
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

function getReturnType(node: unknown): FunctionInfo {
  const defaultInfo: FunctionInfo = {
    hasExplicitReturnType: false,
    returnTypeName: null,
  }

  if (!node || typeof node !== 'object') {
    return defaultInfo
  }

  const n = node as Record<string, unknown>
  const returnType = n.returnType as Record<string, unknown> | undefined

  if (!returnType) {
    return defaultInfo
  }

  const typeAnnotation = returnType.typeAnnotation as Record<string, unknown> | undefined
  if (!typeAnnotation) {
    return defaultInfo
  }

  const typeName = getTypeAnnotationName(typeAnnotation)
  return {
    hasExplicitReturnType: true,
    returnTypeName: typeName,
  }
}

function getArgumentType(node: unknown): string | null {
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

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return null
  }

  if (n.typeAnnotation) {
    return getTypeAnnotationName(n.typeAnnotation)
  }

  return null
}

function isTypeNarrowed(expression: unknown): boolean {
  if (!expression || typeof expression !== 'object') {
    return false
  }

  const expr = expression as Record<string, unknown>

  if (expr.type === 'CallExpression') {
    const callee = expr.callee as Record<string, unknown> | undefined
    if (callee?.type === 'Identifier') {
      const name = callee.name
      if (
        name === 'String' ||
        name === 'Number' ||
        name === 'Boolean' ||
        name === 'Array.isArray' ||
        name === 'Object.keys' ||
        name === 'Object.values'
      ) {
        return true
      }
    }
  }

  if (expr.type === 'TSAsExpression' || expr.type === 'TSTypeAssertion') {
    const targetType = getTypeAnnotationName(expr.typeAnnotation)
    if (targetType && targetType !== 'any' && targetType !== 'unknown') {
      return true
    }
  }

  return false
}

function checkUnsafeReturn(
  returnValue: unknown,
  functionInfo: FunctionInfo,
  options: NoUnsafeReturnOptions,
): { unsafe: boolean; reason: string } {
  if (!returnValue) {
    return { unsafe: false, reason: '' }
  }

  const valueType = getArgumentType(returnValue)

  if (valueType === 'any') {
    if (
      !options.allowAny &&
      functionInfo.hasExplicitReturnType &&
      functionInfo.returnTypeName !== 'any'
    ) {
      return { unsafe: true, reason: 'Returning a value of type any bypasses type safety' }
    }
  }

  if (valueType === 'unknown') {
    if (
      !options.allowUnknown &&
      functionInfo.hasExplicitReturnType &&
      functionInfo.returnTypeName !== 'unknown'
    ) {
      if (!isTypeNarrowed(returnValue)) {
        return {
          unsafe: true,
          reason: 'Returning a value of type unknown without type narrowing is unsafe',
        }
      }
    }
  }

  return { unsafe: false, reason: '' }
}

export const noUnsafeReturnRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow unsafe return of values that bypass type safety. Returning any or unknown typed values without proper type narrowing can introduce runtime errors.',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-return',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowAny: {
            type: 'boolean',
            default: false,
          },
          allowUnknown: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: NoUnsafeReturnOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as NoUnsafeReturnOptions

    const functionStack: FunctionInfo[] = []

    return {
      FunctionDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const info = getReturnType(node)
        functionStack.push(info)
      },

      FunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const info = getReturnType(node)
        functionStack.push(info)
      },

      ArrowFunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const info = getReturnType(node)
        functionStack.push(info)
      },

      'FunctionDeclaration:exit'(): void {
        functionStack.pop()
      },

      'FunctionExpression:exit'(): void {
        functionStack.pop()
      },

      'ArrowFunctionExpression:exit'(): void {
        functionStack.pop()
      },

      ReturnStatement(node: unknown): void {
        if (functionStack.length === 0) {
          return
        }

        const currentFunction = functionStack[functionStack.length - 1] as FunctionInfo

        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const argument = n.argument

        if (!argument) {
          return
        }

        const { unsafe, reason } = checkUnsafeReturn(argument, currentFunction, options)

        if (unsafe) {
          context.report({
            node,
            message: `Unsafe return. ${reason}. Use type guards or validation before returning.`,
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noUnsafeReturnRule
