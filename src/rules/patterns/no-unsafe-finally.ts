import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
function isTryStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'TryStatement'
}
function isBlockStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BlockStatement'
}
function isControlFlowStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  const type = n.type as string
  return ['ReturnStatement', 'ThrowStatement', 'BreakStatement', 'ContinueStatement'].includes(type)
}
export const noUnsafeFinallyRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow control flow statements in finally blocks.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      TryStatement(node: unknown): void {
        if (!isTryStatement(node)) return
        const n = node as Record<string, unknown>
        const finalizer = n.finalizer as Record<string, unknown> | undefined
        if (!finalizer || !isBlockStatement(finalizer)) return
        const body = finalizer.body as unknown[] | undefined
        if (!body) return
        for (const stmt of body) {
          if (isControlFlowStatement(stmt)) {
            context.report({
              message: "Unsafe use of control flow statement inside 'finally' block.",
              loc: extractLocation(stmt),
            })
          }
        }
      },
    }
  },
}
export default noUnsafeFinallyRule
