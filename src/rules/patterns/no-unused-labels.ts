import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isLabeledStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'LabeledStatement'
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

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noUnusedLabelsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const labels = new Map<string, { node: unknown; used: boolean; }>()

    return {
      BreakStatement(node: unknown): void {
        if (!isBreakStatement(node)) return
        const n = node as Record<string, unknown>
        if (n.label && isIdentifier(n.label)) {
          const label = n.label as Record<string, unknown>
          const name = label.name as string
          if (labels.has(name)) {
            labels.get(name)!.used = true
          }
        }
      },
      ContinueStatement(node: unknown): void {
        if (!isContinueStatement(node)) return
        const n = node as Record<string, unknown>
        if (n.label && isIdentifier(n.label)) {
          const label = n.label as Record<string, unknown>
          const name = label.name as string
          if (labels.has(name)) {
            labels.get(name)!.used = true
          }
        }
      },
      LabeledStatement(node: unknown): void {
        if (!isLabeledStatement(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.label)) {
          const label = n.label as Record<string, unknown>
          const name = label.name as string
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
