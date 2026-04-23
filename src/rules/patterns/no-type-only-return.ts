import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

interface FunctionNode {
  body?: null | { body: unknown[] }
  id?: null | { name: string }
  loc?: { end: { column: number; line: number; }; start: { column: number; line: number; }; }
  returnType?: null | { typeAnnotation: unknown }
  type: string
}

interface ReturnStatement {
  argument: null | unknown
  loc?: { end: { column: number; line: number; }; start: { column: number; line: number; }; }
  type: 'ReturnStatement'
}

function isFunctionNode(node: unknown): node is FunctionNode {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return (
    n.type === 'FunctionDeclaration' ||
    n.type === 'FunctionExpression' ||
    n.type === 'ArrowFunctionExpression' ||
    n.type === 'MethodDefinition'
  )
}

function isReturnStatement(node: unknown): node is ReturnStatement {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'ReturnStatement'
}

function hasReturnTypeAnnotation(node: FunctionNode): boolean {
  return node.returnType !== null && node.returnType !== undefined
}

function isEmptyReturn(node: ReturnStatement): boolean {
  return node.argument === null || node.argument === undefined
}

export const noTypeOnlyReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const functionStack: { hasReturnType: boolean; reported: boolean }[] = []

    return {
      ArrowFunctionExpression(node: unknown): void {
        if (!isFunctionNode(node)) return
        functionStack.push({
          hasReturnType: hasReturnTypeAnnotation(node),
          reported: false,
        })
      },

      'ArrowFunctionExpression:exit'(): void {
        functionStack.pop()
      },

      FunctionDeclaration(node: unknown): void {
        if (!isFunctionNode(node)) return
        functionStack.push({
          hasReturnType: hasReturnTypeAnnotation(node),
          reported: false,
        })
      },

      'FunctionDeclaration:exit'(): void {
        functionStack.pop()
      },

      FunctionExpression(node: unknown): void {
        if (!isFunctionNode(node)) return
        functionStack.push({
          hasReturnType: hasReturnTypeAnnotation(node),
          reported: false,
        })
      },

      'FunctionExpression:exit'(): void {
        functionStack.pop()
      },

      ReturnStatement(node: unknown): void {
        if (!isReturnStatement(node)) return

        const currentFunction = functionStack.at(-1)
        if (!currentFunction || !currentFunction.hasReturnType || currentFunction.reported) {
          return
        }

        if (isEmptyReturn(node)) {
          const location = extractLocation(node)
          currentFunction.reported = true
          context.report({
            loc: location,
            message:
              'Function has a return type annotation but returns nothing. This is likely a bug - you should return a value of the declared type.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow functions that have a return type annotation but return nothing or undefined. This often indicates a bug where the return value was forgotten.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-type-only-return',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noTypeOnlyReturnRule
