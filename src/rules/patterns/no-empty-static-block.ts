import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isStaticBlock(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'StaticBlock'
}

function isEmpty(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (b.type !== 'BlockStatement') return false
  const stmts = b.body
  return Array.isArray(stmts) && stmts.length === 0
}

export const noEmptyStaticBlockRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow empty static blocks.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      StaticBlock(node: unknown): void {
        if (!isStaticBlock(node)) return
        const n = node as Record<string, unknown>
        if (isEmpty(n.body)) {
          context.report({
            message: 'Unexpected empty static block.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noEmptyStaticBlockRule
