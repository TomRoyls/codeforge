import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isSwitchStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'SwitchStatement'
}

function hasDefaultCase(cases: undefined | unknown[]): boolean {
  if (!cases) return false
  return cases.some((c) => {
    const caseNode = c as Record<string, unknown>
    return caseNode.test === null
  })
}

export const defaultCaseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchStatement(node: unknown): void {
        if (!isSwitchStatement(node)) return
        const n = node as Record<string, unknown>
        const cases = n.cases as undefined | unknown[]
        if (!hasDefaultCase(cases)) {
          context.report({
            loc: extractLocation(node),
            message: 'Expected a default case.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Require default case in switch statements.',
      recommended: false,
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default defaultCaseRule
