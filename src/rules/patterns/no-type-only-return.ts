import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

interface FunctionNode {
  type: string
  id?: { name: string } | null
  returnType?: { typeAnnotation: unknown } | null
  body?: { body: unknown[] } | null
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

interface ReturnStatement {
  type: 'ReturnStatement'
  argument: unknown | null
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
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
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow functions that have a return type annotation but return nothing or undefined. This often indicates a bug where the return value was forgotten.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-type-only-return',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const functionStack: { hasReturnType: boolean; reported: boolean }[] = []

    return {
      FunctionDeclaration(node: unknown): void {
        if (!isFunctionNode(node)) return
        functionStack.push({
          hasReturnType: hasReturnTypeAnnotation(node),
          reported: false,
        })
      },

      FunctionExpression(node: unknown): void {
        if (!isFunctionNode(node)) return
        functionStack.push({
          hasReturnType: hasReturnTypeAnnotation(node),
          reported: false,
        })
      },

      ArrowFunctionExpression(node: unknown): void {
        if (!isFunctionNode(node)) return
        functionStack.push({
          hasReturnType: hasReturnTypeAnnotation(node),
          reported: false,
        })
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
        if (!isReturnStatement(node)) return

        const currentFunction = functionStack[functionStack.length - 1]
        if (!currentFunction || !currentFunction.hasReturnType || currentFunction.reported) {
          return
        }

        if (isEmptyReturn(node)) {
          const location = extractLocation(node)
          currentFunction.reported = true
          context.report({
            message:
              'Function has a return type annotation but returns nothing. This is likely a bug - you should return a value of the declared type.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noTypeOnlyReturnRule
