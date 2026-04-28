import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, getRange, toASTNode } from '../../utils/ast-helpers.js'

const DEDENT_PATTERN = /^( {1,2}|\t)(.*)$/
const BLOCK_CONTENT_PATTERN = /^\s*\{([\s\S]*)\}\s*$/

function dedentCode(text: string): string {
  const lines = text.split('\n')
  const dedentedLines = lines.map((line) => {
    const match = DEDENT_PATTERN.exec(line)
    return match?.[2] ?? line
  })
  return dedentedLines.join('\n')
}

function extractBlockContent(source: string): null | string {
  const match = BLOCK_CONTENT_PATTERN.exec(source)
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

function isIfStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'IfStatement'
}

function hasReturnStatement(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'ReturnStatement') {
    return true
  }

  if (n.type === 'BlockStatement') {
    const body = n.body as undefined | unknown[]
    if (body && Array.isArray(body)) {
      return body.some((statement) => hasReturnStatement(statement))
    }
  }

  if (n.type === 'IfStatement') {
    const {consequent} = n
    const {alternate} = n

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
  const n = toASTNode(node)
  if (!n) return false
  const {alternate} = n
  return alternate !== undefined && alternate !== null
}

function extractAlternateLocation(node: unknown): SourceLocation {
  const n = toASTNode(node)
  if (!n) return { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }

  const alternate = toASTNode(n.alternate)
  if (!alternate) return extractLocation(node)

  return extractLocation(alternate)
}

export const noElseReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        if (!isIfStatement(node)) {
          return
        }

        const n = toASTNode(node) as ASTNode

        if (!hasReturnStatement(n.consequent)) {
          return
        }

        if (!hasAlternate(node)) {
          return
        }

        const location = extractAlternateLocation(node)
        const alternate = toASTNode(n.alternate)

        let fix: undefined | { range: [number, number]; text: string }

        const ifRange = getRange(node)
        const alternateRange = getRange(alternate)

        if (ifRange && alternateRange) {
          const source = context.getSource()
          const alternateSource = source.slice(alternateRange[0], alternateRange[1])
          let fixedText: string

          if (alternate?.type === 'BlockStatement') {
            const body = alternate.body as undefined | unknown[]
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
          fix,
          loc: location,
          message: 'Unnecessary else block after return statement.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'style',
      description:
        'Disallow unnecessary else blocks after return statements. If a block contains a return, the else block can be removed and its body unindented.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-else-return',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noElseReturnRule
