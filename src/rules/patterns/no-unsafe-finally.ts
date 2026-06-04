import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isControlFlowStatement(node: unknown): boolean {
  const type = toASTNode(node)?.type
  return type === 'BreakStatement' || type === 'ContinueStatement' || type === 'ReturnStatement' || type === 'ThrowStatement'
}

function isFunctionNode(node: unknown): boolean {
  const type = toASTNode(node)?.type
  return type === 'FunctionExpression' || type === 'ArrowFunctionExpression' || type === 'FunctionDeclaration'
}

function checkUnsafeFlow(stmts: unknown[], context: RuleContext): void {
  for (const stmt of stmts) {
    checkStatement(stmt, context)
  }
}

function checkStatement(node: unknown, context: RuleContext): void {
  const n = toASTNode(node)
  if (!n) return

  if (isControlFlowStatement(node)) {
    context.report({
      loc: extractLocation(node),
      message: "Unsafe use of control flow statement inside 'finally' block.",
    })
    return
  }

  if (isFunctionNode(node)) return

  const body = n.body
  if (Array.isArray(body)) {
    checkUnsafeFlow(body, context)
    return
  }

  if (n.consequent) {
    checkStatement(n.consequent, context)
  }

  if (n.alternate) {
    checkStatement(n.alternate, context)
  }
}

export const noUnsafeFinallyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TryStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'TryStatement') return
        const finalizer = toASTNode(n.finalizer)
        if (!finalizer || finalizer.type !== 'BlockStatement') return
        const {body} = finalizer
        if (!Array.isArray(body)) return
        checkUnsafeFlow(body, context)
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow control flow statements in finally blocks.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnsafeFinallyRule
