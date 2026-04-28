/**
 * @file Disallow unsafe return of values that bypass type safety
 * @module rules/security/no-unsafe-return
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUnsafeReturnOptions {
  readonly allowAny?: boolean
  readonly allowUnknown?: boolean
}

interface FunctionInfo {
  readonly hasExplicitReturnType: boolean
  readonly returnTypeName: null | string
}

function getTypeAnnotationName(typeAnnotation: unknown): null | string {
  const ta = toASTNode(typeAnnotation)
  if (!ta) {
    return null
  }

  if (ta.type === 'TSAnyKeyword') {
    return 'any'
  }

  if (ta.type === 'TSUnknownKeyword') {
    return 'unknown'
  }

  if (ta.type === 'TSTypeReference') {
    const typeName = toASTNode(ta.typeName)
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

  const n = toASTNode(node)
  if (!n) {
    return defaultInfo
  }

  const returnType = toASTNode(n.returnType)

  if (!returnType) {
    return defaultInfo
  }

  const typeAnnotation = toASTNode(returnType.typeAnnotation)
  if (!typeAnnotation) {
    return defaultInfo
  }

  const typeName = getTypeAnnotationName(typeAnnotation)
  return {
    hasExplicitReturnType: true,
    returnTypeName: typeName,
  }
}

function getArgumentType(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) {
    return null
  }

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
  const expr = toASTNode(expression)
  if (!expr) {
    return false
  }

  if (expr.type === 'CallExpression') {
    const callee = toASTNode(expr.callee)
    if (callee?.type === 'Identifier') {
      const {name} = callee
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
): { reason: string; unsafe: boolean; } {
  if (!returnValue) {
    return { reason: '', unsafe: false }
  }

  const valueType = getArgumentType(returnValue)

  if (valueType === 'any' && 
      !options.allowAny &&
      functionInfo.hasExplicitReturnType &&
      functionInfo.returnTypeName !== 'any'
    ) {
      return { reason: 'Returning a value of type any bypasses type safety', unsafe: true }
    }

  if (valueType === 'unknown' && 
      !options.allowUnknown &&
      functionInfo.hasExplicitReturnType &&
      functionInfo.returnTypeName !== 'unknown'
     && !isTypeNarrowed(returnValue)) {
        return {
          reason: 'Returning a value of type unknown without type narrowing is unsafe',
          unsafe: true,
        }
      }

  return { reason: '', unsafe: false }
}

export const noUnsafeReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoUnsafeReturnOptions>(context.config.options, {
      allowAny: false,
      allowUnknown: false,
    })

    const functionStack: FunctionInfo[] = []

    return {
      ArrowFunctionExpression(node: unknown): void {
        const info = getReturnType(node)
        functionStack.push(info)
      },

      'ArrowFunctionExpression:exit'(): void {
        functionStack.pop()
      },

      FunctionDeclaration(node: unknown): void {
        const info = getReturnType(node)
        functionStack.push(info)
      },

      'FunctionDeclaration:exit'(): void {
        functionStack.pop()
      },

      FunctionExpression(node: unknown): void {
        const info = getReturnType(node)
        functionStack.push(info)
      },

      'FunctionExpression:exit'(): void {
        functionStack.pop()
      },

      ReturnStatement(node: unknown): void {
        if (functionStack.length === 0) {
          return
        }

        const currentFunction = functionStack.at(-1) as FunctionInfo

        const n = toASTNode(node)
        if (!n) {
          return
        }

        const {argument} = n

        if (!argument) {
          return
        }

        const { reason, unsafe } = checkUnsafeReturn(argument, currentFunction, options)

        if (unsafe) {
          context.report({
            loc: extractLocation(node),
            message: `Unsafe return. ${reason}. Use type guards or validation before returning.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Disallow unsafe return of values that bypass type safety. Returning any or unknown typed values without proper type narrowing can introduce runtime errors.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-return',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowAny: {
            default: false,
            type: 'boolean',
          },
          allowUnknown: {
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

export default noUnsafeReturnRule
