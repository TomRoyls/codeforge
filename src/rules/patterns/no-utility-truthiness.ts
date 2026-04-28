import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const TRUTHY_PROPERTIES: ReadonlySet<string> = new Set([
  'count',
  'length',
  'size',
])

function isMemberExpression(n: ReturnType<typeof toASTNode>): n is ReturnType<typeof toASTNode> & { object: unknown; property: unknown; } {
  return n !== null && (n.type === 'MemberExpression')
}

function getPropertyName(n: ReturnType<typeof toASTNode>): null | string {
  if (!isMemberExpression(n)) return null

  if (!n.computed) {
    const prop = toASTNode(n.property)
    if (prop?.type === 'Identifier') return prop.name ?? null
  }

  return null
}

function isInBooleanContext(parent: ReturnType<typeof toASTNode>): boolean {
  if (!parent) return false

  switch (parent.type) {
    case 'ConditionalExpression': {
      return true
    }

    case 'DoWhileStatement': {
      return true
    }

    case 'ForStatement': {
      return true
    }

    case 'IfStatement': {
      return true
    }

    case 'LogicalExpression': {
      return true
    }

    case 'UnaryExpression': {
      if (parent.operator === '!') return true
      return false
    }

    case 'WhileStatement': {
      return true
    }

    default: {
      return false
    }
  }
}

function isNegationOnly(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'UnaryExpression' && n.operator === '!') {
    const arg = toASTNode(n.argument)
    if (arg?.type === 'UnaryExpression' && arg.operator === '!') {
      return true
    }
  }

  return false
}

export const noUtilityTruthinessRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MemberExpression') return

        const propName = getPropertyName(n)
        if (propName === null || !TRUTHY_PROPERTIES.has(propName)) return

        const parent = toASTNode(n.parent)
        if (!parent || !isInBooleanContext(parent)) return

        if (isNegationOnly(parent)) return

        context.report({
          loc: extractLocation(node),
          message: `Unexpected use of '.${propName}' as a boolean. Use explicit comparisons like '.${propName} > 0' or '.${propName} !== 0' for clarity and to avoid truthiness bugs.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow using utility properties (.length, .size, .count) as boolean values. Use explicit comparisons to avoid truthiness bugs.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-utility-truthiness',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUtilityTruthinessRule
