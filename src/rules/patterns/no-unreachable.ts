import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
  return (
    isReturnStatement(node) ||
    isThrowStatement(node) ||
    isBreakStatement(node) ||
    isContinueStatement(node)
  )
}

export const noUnreachableRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BlockStatement(node: unknown): void {
        if (!isBlockStatement(node)) return
        const n = node as Record<string, unknown>
        const {body} = n
        if (!Array.isArray(body)) return

        let foundTerminator = false
        for (const stmt of body) {
          if (foundTerminator) {
            context.report({
              loc: extractLocation(stmt),
              message: 'Unreachable code detected.',
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
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unreachable code.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnreachableRule
