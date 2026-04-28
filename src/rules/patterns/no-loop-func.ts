import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const FUNCTION_TYPES = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
])

function containsFunctionDeclaration(body: unknown): boolean {
  const node = toASTNode(body)
  if (!node) return false

  const { type } = node

  if (FUNCTION_TYPES.has(type as string)) {
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

function checkLoopBody(node: unknown, context: RuleContext, loopType: string): void {
  const n = toASTNode(node)
  if (!n?.body) return

  if (!containsFunctionDeclaration(n.body)) return

  const location = extractLocation(node)
  const messages: Record<string, string> = {
    for: 'Unexpected function declaration inside for loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
    forIn: 'Unexpected function declaration inside for-in loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
    forOf: 'Unexpected function declaration inside for-of loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
    while: 'Unexpected function declaration inside while loop. Move the function outside the loop or ensure it captures the correct loop variable values.',
  }

  context.report({ loc: location, message: messages[loopType] ?? messages.for! })
}

export const noLoopFuncRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ForInStatement(node: unknown): void {
        checkLoopBody(node, context, 'forIn')
      },
      ForOfStatement(node: unknown): void {
        checkLoopBody(node, context, 'forOf')
      },
      ForStatement(node: unknown): void {
        checkLoopBody(node, context, 'for')
      },
      WhileStatement(node: unknown): void {
        checkLoopBody(node, context, 'while')
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow function declarations inside loops. Functions created inside loops capture loop variables and can lead to unexpected behavior. Move the function outside the loop or use let/const for the loop variable.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-loop-func',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noLoopFuncRule
