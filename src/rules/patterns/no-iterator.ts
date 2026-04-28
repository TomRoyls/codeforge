import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const ITERATOR_PATTERNS = new Set(['__defineIterator__', '__defineSetter__', '__iterator__'])

function isIteratorProperty(propertyName: string): boolean {
  if (ITERATOR_PATTERNS.has(propertyName)) return true
  if (propertyName.startsWith('__') && propertyName.toLowerCase().includes('iterator')) return true
  return false
}

function getPropertyName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'Identifier' && typeof n.name === 'string') return n.name
  if (n.type === 'Literal' && typeof n.value === 'string') return n.value

  return null
}

function checkProperty(node: unknown, context: RuleContext, reportNode: unknown, message: (prop: string) => string): void {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return

  const propertyName = getPropertyName(n.property)
  if (propertyName && isIteratorProperty(propertyName)) {
    context.report({ loc: extractLocation(reportNode), message: message(propertyName) })
  }
}

export const noIteratorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'AssignmentExpression') return
        checkProperty(n.left, context, node, (prop) =>
          `Unexpected assignment to '${prop}'. Non-standard iterator properties should be avoided.`
        )
      },

      MemberExpression(node: unknown): void {
        checkProperty(node, context, node, (prop) =>
          `Unexpected use of '${prop}'. Non-standard iterator properties should be avoided.`
        )
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow use of __iterator__, __defineIterator__, __defineSetter__, and custom iterator symbol patterns. These are non-standard or deprecated features.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-iterator',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noIteratorRule
