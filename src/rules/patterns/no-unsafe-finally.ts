import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
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
  return ['BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement'].includes(type)
}

export const noUnsafeFinallyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TryStatement(node: unknown): void {
        if (!isTryStatement(node)) return
        const n = node as Record<string, unknown>
        const finalizer = n.finalizer as Record<string, unknown> | undefined
        if (!finalizer || !isBlockStatement(finalizer)) return
        const body = finalizer.body as undefined | unknown[]
        if (!body) return
        for (const stmt of body) {
          if (isControlFlowStatement(stmt)) {
            context.report({
              loc: extractLocation(stmt),
              message: "Unsafe use of control flow statement inside 'finally' block.",
            })
          }
        }
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
