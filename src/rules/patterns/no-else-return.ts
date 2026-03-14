import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

function isIfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'IfStatement'
}

function hasReturnStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type === 'ReturnStatement') {
    return true
  }

  if (n.type === 'BlockStatement') {
    const body = n.body as unknown[] | undefined
    if (body && Array.isArray(body)) {
      return body.some((statement) => hasReturnStatement(statement))
    }
  }

  if (n.type === 'IfStatement') {
    const consequent = n.consequent as unknown
    const alternate = n.alternate as unknown | undefined

    if (hasReturnStatement(consequent)) {
      return true
    }

    if (alternate && hasReturnStatement(alternate)) {
      return true
    }

    return false
  }

  return false
}

function hasAlternate(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  const alternate = n.alternate as unknown | undefined
  return alternate !== undefined && alternate !== null
}

function extractAlternateLocation(node: unknown): SourceLocation {
  if (!node || typeof node !== 'object') {
    return { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } }
  }

  const n = node as Record<string, unknown>
  const alternate = n.alternate as Record<string, unknown> | undefined

  if (!alternate || typeof alternate !== 'object') {
    return extractLocation(node)
  }

  return extractLocation(alternate)
}

export const noElseReturnRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow unnecessary else blocks after return statements. If a block contains a return, the else block can be removed and its body unindented.',
      category: 'style',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-else-return',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    function dedentCode(text: string): string {
      const lines = text.split('\n')
      const dedentedLines = lines.map((line) => {
        const match = line.match(/^( {1,2}|\t)(.*)$/)
        return match ? match[2] : line
      })
      return dedentedLines.join('\n')
    }

    function extractBlockContent(source: string): string | null {
      const match = source.match(/^\s*\{([\s\S]*)\}\s*$/)
      return match?.[1] ?? null
    }

    function findElseKeywordStart(source: string, alternateStart: number, ifStart: number): number {
      for (let i = alternateStart - 1; i >= ifStart; i--) {
        if (source.slice(i, i + 4) === 'else') {
          return i
        }
      }
      return alternateStart
    }

    return {
      IfStatement(node: unknown): void {
        if (!isIfStatement(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const consequent = n.consequent as unknown

        if (!hasReturnStatement(consequent)) {
          return
        }

        if (!hasAlternate(node)) {
          return
        }

        const location = extractAlternateLocation(node)
        const alternate = n.alternate as Record<string, unknown>

        let fix: { range: [number, number]; text: string } | undefined

        const ifRange = getRange(node)
        const alternateRange = getRange(alternate)

        if (ifRange && alternateRange) {
          const source = context.getSource()
          const alternateSource = source.slice(alternateRange[0], alternateRange[1])
          let fixedText: string

          if (alternate.type === 'BlockStatement') {
            const body = alternate.body as unknown[] | undefined
            if (body && body.length > 0) {
              const blockContent = extractBlockContent(alternateSource)
              fixedText = blockContent ? '\n' + dedentCode(blockContent) : ''
            } else {
              fixedText = ''
            }
          } else {
            fixedText = ' ' + alternateSource
          }

          const elseStart = findElseKeywordStart(source, alternateRange[0], ifRange[0])
          fix = { range: [elseStart, alternateRange[1]], text: fixedText }
        }

        context.report({
          message: 'Unnecessary else block after return statement.',
          loc: location,
          fix,
        })
      },
    }
  },
}

export default noElseReturnRule
