import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isBlockStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BlockStatement'
}

function isReturnStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ReturnStatement'
}

function isThrowStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ThrowStatement'
}

function isBreakStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BreakStatement'
}

function isContinueStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ContinueStatement'
}

function terminatesFlow(node: unknown): boolean {
  return isReturnStatement(node) || isThrowStatement(node) || isBreakStatement(node) || isContinueStatement(node)
}

export const noUnreachableRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow unreachable code.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      BlockStatement(node: unknown): void {
        if (!isBlockStatement(node)) return
        const n = node as Record<string, unknown>
        const body = n.body
        if (!Array.isArray(body)) return
        
        let foundTerminator = false
        for (const stmt of body) {
          if (foundTerminator) {
            context.report({
              message: 'Unreachable code detected.',
              loc: extractLocation(stmt),
            })
            break
          }
          if (terminatesFlow(stmt)) {
            foundTerminator = true
          }
        }
      },
    }
  },
}
export default noUnreachableRule
