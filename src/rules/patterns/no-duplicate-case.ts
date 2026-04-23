import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
function isSwitchStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'SwitchStatement'
}

function getCaseValue(caseNode: unknown, context: RuleContext): null | string {
  if (!caseNode || typeof caseNode !== 'object') return null
  const c = caseNode as Record<string, unknown>
  const {test} = c
  if (!test) return null
  const range = (test as Record<string, unknown>).range as [number, number] | undefined
  if (!range) return null
  return context.getSource().slice(range[0], range[1])
}

export const noDuplicateCaseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchStatement(node: unknown): void {
        if (!isSwitchStatement(node)) return
        const n = node as Record<string, unknown>
        const cases = n.cases as undefined | unknown[]
        if (!cases) return
        const seenValues = new Map<string, unknown>()
        for (const caseNode of cases) {
          const value = getCaseValue(caseNode, context)
          if (value === null) continue
          if (seenValues.has(value)) {
            context.report({
              loc: extractLocation(caseNode),
              message: 'Duplicate case label.',
            })
          } else {
            seenValues.set(value, caseNode)
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow duplicate case labels in switch statements.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDuplicateCaseRule
