import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function isLabeledStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'LabeledStatement'
}

function isVariableDeclarator(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclarator'
}

function isFunctionDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'FunctionDeclaration'
}

function isClassDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ClassDeclaration'
}

function getIdentifierName(node: unknown): null | string {
  if (!isIdentifier(node)) return null
  const n = node as Record<string, unknown>
  const {name} = (n as Record<string, unknown>)
  return typeof name === 'string' ? name : null
}

export const noLabelVarRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const variableNames = new Set<string>()

    return {
      ClassDeclaration(node: unknown): void {
        if (!isClassDeclaration(node)) return
        const n = node as Record<string, unknown>
        const name = getIdentifierName(n.id)
        if (name) {
          variableNames.add(name)
        }
      },
      FunctionDeclaration(node: unknown): void {
        if (!isFunctionDeclaration(node)) return
        const n = node as Record<string, unknown>
        const name = getIdentifierName(n.id)
        if (name) {
          variableNames.add(name)
        }
      },
      LabeledStatement(node: unknown): void {
        if (!isLabeledStatement(node)) return
        const n = node as Record<string, unknown>
        const labelName = getIdentifierName(n.label)
        if (labelName && variableNames.has(labelName)) {
          context.report({
            loc: extractLocation(n.label),
            message: `Unexpected label '${labelName}'.`,
          })
        }
      },
      VariableDeclarator(node: unknown): void {
        if (!isVariableDeclarator(node)) return
        const n = node as Record<string, unknown>
        const name = getIdentifierName(n.id)
        if (name) {
          variableNames.add(name)
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow labels that share a name with a variable.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noLabelVarRule
