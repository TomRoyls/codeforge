import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
])

function isFunctionType(type: string): boolean {
  return FUNCTION_TYPES.has(type)
}

function containsFunctionDeclaration(body: unknown): boolean {
  if (!body || typeof body !== 'object') {
    return false
  }

  const node = body as Record<string, unknown>
  const type = node.type as string

  if (isFunctionType(type)) {
    return true
  }

  if (type === 'BlockStatement' && Array.isArray(node.body)) {
    return (node.body as unknown[]).some((child) => containsFunctionDeclaration(child))
  }

  if (node.body) {
    return containsFunctionDeclaration(node.body)
  }

  if (type === 'IfStatement') {
    const hasConsequent = containsFunctionDeclaration(node.consequent)
    const hasAlternate = node.alternate ? containsFunctionDeclaration(node.alternate) : false
    return hasConsequent || hasAlternate
  }

  return false
}

export const noLoopFuncRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow function declarations inside loops. Functions created inside loops capture loop variables and can lead to unexpected behavior. Move the function outside the loop or use let/const for the loop variable.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-loop-func',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      ForStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.body && containsFunctionDeclaration(n.body)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Unexpected function declaration inside for loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
            loc: location,
          })
        }
      },

      ForInStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.body && containsFunctionDeclaration(n.body)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Unexpected function declaration inside for-in loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
            loc: location,
          })
        }
      },

      ForOfStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.body && containsFunctionDeclaration(n.body)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Unexpected function declaration inside for-of loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
            loc: location,
          })
        }
      },

      WhileStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.body && containsFunctionDeclaration(n.body)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Unexpected function declaration inside while loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noLoopFuncRule
