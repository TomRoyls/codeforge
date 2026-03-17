import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
function isSwitchStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'SwitchStatement'
}
function getCaseValue(caseNode: unknown, context: RuleContext): string | null {
  if (!caseNode || typeof caseNode !== 'object') return null
  const c = caseNode as Record<string, unknown>
  const test = c.test
  if (!test) return null
  const range = (test as Record<string, unknown>).range as [number, number] | undefined
  if (!range) return null
  return context.getSource().slice(range[0], range[1])
}
export const noDuplicateCaseRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow duplicate case labels in switch statements.',
      category: 'patterns',
      recommended: true,
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
        if (!cases) return
        const seenValues = new Map<string, unknown>()
        for (const caseNode of cases) {
          const value = getCaseValue(caseNode, context)
          if (value === null) continue
          if (seenValues.has(value)) {
            context.report({
              message: 'Duplicate case label.',
              loc: extractLocation(caseNode),
            })
          } else {
            seenValues.set(value, caseNode)
          }
        }
      },
    }
  },
}
export default noDuplicateCaseRule
