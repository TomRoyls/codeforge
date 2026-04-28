import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, toASTNode } from '../../utils/ast-helpers.js'

function getCaseValue(caseNode: unknown, context: RuleContext): null | string {
  const c = toASTNode(caseNode)
  if (!c?.test) return null
  const range = getRange(c.test)
  if (!range) return null
  return context.getSource().slice(range[0], range[1])
}

export const noDuplicateCaseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'SwitchStatement') return

        const cases = n.cases as undefined | unknown[]
        if (!cases) return

        const seenValues = new Map<string, unknown>()
        for (const caseNode of cases) {
          const value = getCaseValue(caseNode, context)
          if (value === null) continue
          if (seenValues.has(value)) {
            context.report({ loc: extractLocation(caseNode), message: 'Duplicate case label.' })
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
