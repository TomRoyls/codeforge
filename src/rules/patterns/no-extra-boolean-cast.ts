import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'CallExpression'
}

function isBooleanCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const n = node as Record<string, unknown>
  const callee = n.callee
  if (!callee || typeof callee !== 'object') return false
  const c = callee as Record<string, unknown>
  if (c.type === 'Identifier' && c.name === 'Boolean') return true
  return false
}

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression'
}

function isDoubleBang(node: unknown): boolean {
  if (!isUnaryExpression(node)) return false
  const n = node as Record<string, unknown>
  if (n.operator !== '!') return false
  return isUnaryExpression(n.argument) && (n.argument as Record<string, unknown>).operator === '!'
}

export const noExtraBooleanCastRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow unnecessary boolean casts.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isBooleanCall(node)) return
        const n = node as Record<string, unknown>
        const args = n.arguments
        if (Array.isArray(args) && args.length === 1) {
          const arg = args[0]
          if (isBooleanCall(arg) || isDoubleBang(arg)) {
            context.report({
              message: 'Redundant boolean cast.',
              loc: extractLocation(node),
            })
          }
        }
      },
      UnaryExpression(node: unknown): void {
        if (!isDoubleBang(node)) return
        const n = node as Record<string, unknown>
        const inner = n.argument as Record<string, unknown>
        if (isBooleanCall(inner.argument)) {
          context.report({
            message: 'Redundant boolean cast.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noExtraBooleanCastRule
