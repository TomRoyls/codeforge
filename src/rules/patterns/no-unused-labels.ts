import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow unused labels.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    const labels = new Map<string, { used: boolean; node: unknown }>()

    return {
      LabeledStatement(node: unknown): void {
        if (!isLabeledStatement(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.label)) {
          const label = n.label as Record<string, unknown>
          const name = label.name as string
          labels.set(name, { used: false, node })
        }
      },
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
      'Program:exit'(): void {
        for (const [name, info] of labels) {
          if (!info.used) {
            context.report({
              message: `Unused label '${name}'.`,
              loc: extractLocation(info.node),
            })
          }
        }
      },
    }
  },
}
export default noUnusedLabelsRule
