import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

function isBlockStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'BlockStatement'
}

function isEmptyBlock(node: unknown): boolean {
  if (!isBlockStatement(node)) {
    return false
  }
  const n = node as Record<string, unknown>
  const body = n.body as unknown[] | undefined
  return !body || body.length === 0
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
    const c = comment as Record<string, unknown>
    const cLoc = c.loc as Record<string, unknown> | undefined
    if (!cLoc) {
      continue
    }
    const cStart = cLoc.start as Record<string, unknown> | undefined
    const cEnd = cLoc.end as Record<string, unknown> | undefined
    if (!cStart || !cEnd) {
      continue
    }
    const cStartLine = cStart.line as number
    const cEndLine = cEnd.line as number
    const cStartColumn = cStart.column as number
    const cEndColumn = cEnd.column as number
    if (
      cStartLine >= startLine &&
      cEndLine <= endLine &&
      cStartColumn >= startColumn &&
      cEndColumn <= endColumn
    ) {
      return true
    }
  }
  return false
}

export const noEmptyRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow empty block statements. Empty blocks can be confusing and along indicate incomplete code.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-empty',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BlockStatement(node: unknown): void {
        if (!isBlockStatement(node) || !isEmptyBlock(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const loc = n.loc as Record<string, unknown> | undefined
        const range = getRange(node)

        if (!loc) {
          context.report({
            message: 'Unexpected empty block.',
          })
          return
        }

        const start = loc.start as Record<string, unknown> | undefined
        const end = loc.end as Record<string, unknown> | undefined

        if (!start || !end) {
          context.report({
            message: 'Unexpected empty block.',
            loc: extractLocation(node),
          })
          return
        }

        const startLine = start.line as number
        const startColumn = start.column as number
        const endLine = end.line as number
        const endColumn = end.column as number
        const comments = context.getComments()

        if (hasCommentsInRange(startLine, startColumn, endLine, endColumn, comments)) {
          return
        }

        const location = extractLocation(node)
        const fix = range
          ? { range: [range[0] + 1, range[0] + 1] as [number, number], text: '// empty ' }
          : undefined

        context.report({
          message: 'Unexpected empty block.',
          loc: location,
          fix,
        })
      },
    }
  },
}

export default noEmptyRule
