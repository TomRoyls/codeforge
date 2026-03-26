import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function isCatchClause(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'CatchClause'
}

export const noExAssignRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow reassigning exceptions in catch clauses.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    const catchParamNames = new Set<string>()

    return {
      CatchClause(node: unknown): void {
        if (!isCatchClause(node)) return
        const n = node as Record<string, unknown>
        if (n.param && isIdentifier(n.param)) {
          const param = n.param as Record<string, unknown>
          catchParamNames.add(param.name as string)
        }
      },
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.left)) {
          const left = n.left as Record<string, unknown>
          const name = left.name as string
          if (catchParamNames.has(name)) {
            context.report({
              message: `Do not reassign the catch parameter '${name}'.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noExAssignRule
