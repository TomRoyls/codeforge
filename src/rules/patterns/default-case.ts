import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isSwitchStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'SwitchStatement'
}

function hasDefaultCase(cases: unknown[] | undefined): boolean {
  if (!cases) return false
  return cases.some((c) => {
    const caseNode = c as Record<string, unknown>
    return caseNode.test === null
  })
}

export const defaultCaseRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Require default case in switch statements.',
      category: 'patterns',
      recommended: false,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchStatement(node: unknown): void {
        if (!isSwitchStatement(node)) return
        const n = node as Record<string, unknown>
        const cases = n.cases as unknown[] | undefined
        if (!hasDefaultCase(cases)) {
          context.report({
            message: 'Expected a default case.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default defaultCaseRule
