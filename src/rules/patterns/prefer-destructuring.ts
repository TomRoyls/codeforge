/**
 * @module rules/patterns/prefer-destructuring
 * Prefers destructuring assignment for object and array access.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getPropertyName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null
  const prop = (n as { property?: unknown }).property
  if (!prop) return null
  const propNode = toASTNode(prop)
  if (!propNode) return null
  if (propNode.type === 'Identifier') {
    return (propNode as { value?: string }).value ?? (propNode as { name?: unknown }).name as string ?? null
  }
  if (propNode.type === 'StringLiteral' || (propNode.type === 'Literal' && typeof (propNode as { value?: unknown }).value === 'string')) {
    return (propNode as { value?: unknown }).value as string ?? null
  }
  return null
}

export const preferDestructuringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const id = (n as { id?: unknown }).id
        const init = (n as { init?: unknown }).init
        if (!id || !init) return

        const idNode = toASTNode(id)
        const initNode = toASTNode(init)
        if (!idNode || !initNode) return

        if (idNode.type !== 'Identifier') return
        if (initNode.type !== 'MemberExpression') return

        const propName = getPropertyName(init)
        if (propName === null) return

        const idName = (idNode as { value?: string }).value ?? (idNode as { name?: unknown }).name as string ?? null
        if (idName !== propName) return

        context.report({
          loc: extractLocation(n),
          message: 'Use destructuring assignment instead of property access.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Prefer destructuring assignment for object and array access',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-destructuring',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferDestructuringRule
