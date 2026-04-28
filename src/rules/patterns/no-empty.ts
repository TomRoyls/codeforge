import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, toASTNode } from '../../utils/ast-helpers.js'

function isBlockStatement(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'BlockStatement'
}

function isEmptyBlock(node: unknown): boolean {
  if (!isBlockStatement(node)) {
    return false
  }

  const n = toASTNode(node)
  const body = n?.body
  if (!body) return true
  if (!Array.isArray(body)) return false
  return body.length === 0
}

function hasCommentsInRange(
  startLine: number,
  startColumn: number,
  endLine: number,
  endColumn: number,
  comments: readonly unknown[],
): boolean {
  if (!Array.isArray(comments)) {
    return false
  }

  for (const comment of comments) {
    const c = toASTNode(comment)
    if (!c) continue

    const cLoc = toASTNode(c.loc)
    if (!cLoc) continue

    const cStart = toASTNode(cLoc.start)
    const cEnd = toASTNode(cLoc.end)
    if (!cStart || !cEnd) continue

    if (
      (cStart.line ?? 0) >= startLine &&
      (cEnd.line ?? 0) <= endLine &&
      (cStart.column ?? 0) >= startColumn &&
      (cEnd.column ?? 0) <= endColumn
    ) {
      return true
    }
  }

  return false
}

export const noEmptyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BlockStatement(node: unknown): void {
        if (!isBlockStatement(node) || !isEmptyBlock(node)) {
          return
        }

        const n = toASTNode(node)
        if (!n) return

        const loc = toASTNode(n.loc)
        const range = getRange(node)

        if (!loc) {
          context.report({
            message: 'Unexpected empty block.',
          })
          return
        }

        const start = toASTNode(loc.start)
        const end = toASTNode(loc.end)

        if (!start || !end) {
          context.report({
            loc: extractLocation(node),
            message: 'Unexpected empty block.',
          })
          return
        }

        const startLine = start.line ?? 0
        const startColumn = start.column ?? 0
        const endLine = end.line ?? 0
        const endColumn = end.column ?? 0
        const comments = context.getComments()

        if (hasCommentsInRange(startLine, startColumn, endLine, endColumn, comments)) {
          return
        }

        const location = extractLocation(node)
        const fix = range
          ? { range: [range[0] + 1, range[0] + 1] as [number, number], text: '// empty ' }
          : undefined

        context.report({
          fix,
          loc: location,
          message: 'Unexpected empty block.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow empty block statements. Empty blocks can be confusing and along indicate incomplete code.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-empty',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noEmptyRule
