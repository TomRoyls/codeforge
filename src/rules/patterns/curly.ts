import type { RuleDefinition, RuleContext, RuleVisitor, Range } from '../../plugins/types.js'
import { extractLocation, getNodeSource, getRange } from '../../utils/ast-helpers.js'

function hasBlockStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  // For IfStatement, the body is in 'consequent'
  // For ForStatement, WhileStatement, DoWhileStatement, WithStatement, the body is in 'body'
  const body = (n.consequent || n.body) as unknown

  if (!body || typeof body !== 'object') {
    return false
  }

  const bodyNode = body as Record<string, unknown>
  return bodyNode.type === 'BlockStatement'
}

function getBodyNode(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  // For IfStatement, the body is in 'consequent'
  // For ForStatement, WhileStatement, DoWhileStatement, WithStatement, the body is in 'body'
  return n.consequent || n.body
}

function createFix(
  context: RuleContext,
  bodyNode: unknown,
): { range: Range; text: string } | undefined {
  const bodyRange = getRange(bodyNode)
  if (!bodyRange) {
    return undefined
  }

  const bodySource = getNodeSource(context, bodyNode)
  if (!bodySource) {
    return undefined
  }

  return {
    range: bodyRange as Range,
    text: `{ ${bodySource} }`,
  }
}

function checkControlStatement(node: unknown, keyword: string, context: RuleContext): void {
  if (!node || typeof node !== 'object') {
    return
  }

  if (hasBlockStatement(node)) {
    return
  }

  const location = extractLocation(node)
  const bodyNode = getBodyNode(node)
  const fix = bodyNode ? createFix(context, bodyNode) : undefined

  context.report({
    message: `Expected { after '${keyword}' statement.`,
    loc: location,
    fix,
  })
}

export const curlyRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require curly braces for all control statements (if, for, while, do, with) for better code readability and maintainability.',
      category: 'style',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/curly',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        checkControlStatement(node, 'if', context)
      },

      ForStatement(node: unknown): void {
        checkControlStatement(node, 'for', context)
      },

      WhileStatement(node: unknown): void {
        checkControlStatement(node, 'while', context)
      },

      DoWhileStatement(node: unknown): void {
        checkControlStatement(node, 'do', context)
      },

      WithStatement(node: unknown): void {
        checkControlStatement(node, 'with', context)
      },
    }
  },
}

export default curlyRule
