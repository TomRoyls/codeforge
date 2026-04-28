import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getIdentifierName(node: unknown): null | string {
  const n = toASTNode(node)
  if (n?.type !== 'Identifier') return null
  return n.name ?? null
}

export const noLabelVarRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const variableNames = new Set<string>()

    return {
      ClassDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ClassDeclaration') return
        const id = toASTNode(n.id)
        const name = id?.name
        if (name) {
          variableNames.add(name)
        }
      },
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'FunctionDeclaration') return
        const id = toASTNode(n.id)
        const name = id?.name
        if (name) {
          variableNames.add(name)
        }
      },
      LabeledStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const labelName = getIdentifierName(n.label)
        if (labelName && variableNames.has(labelName)) {
          context.report({
            loc: extractLocation(n.label),
            message: `Unexpected label '${labelName}'.`,
          })
        }
      },
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        const id = toASTNode(n?.id)
        const name = id?.name
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
