import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

export const noUnusedLabelsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const labels = new Map<string, { node: unknown; used: boolean; }>()

    return {
      BreakStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'BreakStatement') return
        if (n.label && isIdentifier(n.label)) {
          const label = toASTNode(n.label)
          const name = label?.name as string
          if (labels.has(name)) {
            labels.get(name)!.used = true
          }
        }
      },

      ContinueStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ContinueStatement') return
        if (n.label && isIdentifier(n.label)) {
          const label = toASTNode(n.label)
          const name = label?.name as string
          if (labels.has(name)) {
            labels.get(name)!.used = true
          }
        }
      },

      LabeledStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'LabeledStatement') return
        if (isIdentifier(n.label)) {
          const label = toASTNode(n.label)
          const name = label?.name as string
          labels.set(name, { node, used: false })
        }
      },

      'Program:exit'(): void {
        for (const [name, info] of labels) {
          if (!info.used) {
            context.report({
              loc: extractLocation(info.node),
              message: `Unused label '${name}'.`,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unused labels.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnusedLabelsRule
