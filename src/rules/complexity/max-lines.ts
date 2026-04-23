import type { SourceFile } from 'ts-morph'

import type { RuleDefinition, RuleOptions } from '../types.js'

import {
  type FunctionLikeNode,
  getFunctionName,
  getNodeRange,
  type RuleViolation,
  traverseAST,
  type VisitorContext,
} from '../../ast/visitor.js'
import { DEFAULT_MAX_LINES } from '../../utils/constants.js'

interface MaxLinesOptions extends RuleOptions {
  max?: number
  skipBlankLines?: boolean
  skipComments?: boolean
}

interface MaxLinesPerFunctionOptions extends RuleOptions {
  max?: number
  skipBlankLines?: boolean
  skipComments?: boolean
}

function countLines(
  sourceFile: SourceFile,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): number {
  const text = sourceFile.getFullText()
  const lines = text.split('\n')

  if (!options.skipBlankLines && !options.skipComments) {
    return lines.length
  }

  const commentRanges = options.skipComments
    ? sourceFile.getDescendants().flatMap((node) => {
        const leading = node.getLeadingCommentRanges()
        const trailing = node.getTrailingCommentRanges()
        return [...leading, ...trailing]
      })
    : []

  let count = 0
  for (const [i, line] of lines.entries()) {
    if (!line) {
      if (!options.skipBlankLines) {
        count++
      }

      continue
    }

    if (options.skipComments) {
      const lineStart = getTextPosition(text, i)
      const isComment = commentRanges.some(
        (range) => lineStart >= range.getPos() && lineStart < range.getEnd(),
      )
      if (isComment) continue
    }

    count++
  }

  return count
}

function countFunctionLines(
  node: FunctionLikeNode,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): number {
  const startLine = node.getStartLineNumber()
  const endLine = node.getEndLineNumber()

  if (!options.skipBlankLines && !options.skipComments) {
    return endLine - startLine + 1
  }

  const sourceFile = node.getSourceFile()
  const text = sourceFile.getFullText()
  const lines = text.split('\n')

  const commentRanges = options.skipComments
    ? node.getDescendants().flatMap((child) => {
        const leading = child.getLeadingCommentRanges()
        const trailing = child.getTrailingCommentRanges()
        return [...leading, ...trailing]
      })
    : []

  let count = 0
  for (let i = startLine - 1; i < endLine; i++) {
    const line = lines[i]
    if (!line) {
      if (!options.skipBlankLines) {
        count++
      }

      continue
    }

    if (options.skipComments) {
      const lineStart = getTextPosition(text, i)
      const isComment = commentRanges.some(
        (range) => lineStart >= range.getPos() && lineStart < range.getEnd(),
      )
      if (isComment) continue
    }

    count++
  }

  return count
}

function getTextPosition(text: string, lineIndex: number): number {
  const lines = text.split('\n')
  let pos = 0
  for (let i = 0; i < lineIndex; i++) {
    pos += (lines[i]?.length ?? 0) + 1
  }

  return pos
}

export const maxLinesRule: RuleDefinition<MaxLinesOptions> = {
  create(options: MaxLinesOptions) {
    const violations: RuleViolation[] = []
    const maxLines = options.max ?? DEFAULT_MAX_LINES

    return {
      onComplete: () => violations,
      visitor: {
        visitSourceFile(node: SourceFile, _context: VisitorContext) {
          const lineCount = countLines(node, {
            skipBlankLines: options.skipBlankLines,
            skipComments: options.skipComments,
          })

          if (lineCount > maxLines) {
            const range = getNodeRange(node)
            violations.push({
              filePath: node.getFilePath(),
              message: `File has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
              range,
              ruleId: 'max-lines',
              severity: 'warning',
              suggestion: 'Consider splitting this file into smaller, focused modules.',
            })
          }
        },
      },
    }
  },
  defaultOptions: {
    max: DEFAULT_MAX_LINES,
    skipBlankLines: true,
    skipComments: true,
  },
  meta: {
    category: 'complexity',
    description: 'Enforce a maximum number of lines per file',
    fixable: 'code',
    name: 'max-lines',
    recommended: false,
  },
}

export const maxLinesPerFunctionRule: RuleDefinition<MaxLinesPerFunctionOptions> = {
  create(options: MaxLinesPerFunctionOptions) {
    const violations: RuleViolation[] = []
    const maxLines = options.max ?? 50

    return {
      onComplete: () => violations,
      visitor: {
        visitFunction(node: FunctionLikeNode) {
          const lineCount = countFunctionLines(node, {
            skipBlankLines: options.skipBlankLines,
            skipComments: options.skipComments,
          })
          const name = getFunctionName(node)

          if (lineCount > maxLines) {
            const range = getNodeRange(node)
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: `Function '${name}' has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
              range,
              ruleId: 'max-lines-per-function',
              severity: 'warning',
              suggestion:
                'Consider breaking this function into smaller, single-responsibility functions.',
            })
          }
        },
      },
    }
  },
  defaultOptions: {
    max: 50,
    skipBlankLines: true,
    skipComments: true,
  },
  meta: {
    category: 'complexity',
    description: 'Enforce a maximum number of lines per function',
    fixable: 'code',
    name: 'max-lines-per-function',
    recommended: true,
  },
}

export function analyzeMaxLines(
  sourceFile: SourceFile,
  maxLines: number = DEFAULT_MAX_LINES,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lineCount = countLines(sourceFile, options)

  if (lineCount > maxLines) {
    const range = getNodeRange(sourceFile)
    violations.push({
      filePath: sourceFile.getFilePath(),
      message: `File has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
      range,
      ruleId: 'max-lines',
      severity: 'warning',
      suggestion: 'Consider splitting this file into smaller, focused modules.',
    })
  }

  return violations
}

export function analyzeMaxLinesPerFunction(
  sourceFile: SourceFile,
  maxLines: number = 50,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitFunction(node: FunctionLikeNode) {
        const lineCount = countFunctionLines(node, options)
        const name = getFunctionName(node)

        if (lineCount > maxLines) {
          const range = getNodeRange(node)
          violations.push({
            filePath: sourceFile.getFilePath(),
            message: `Function '${name}' has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
            range,
            ruleId: 'max-lines-per-function',
            severity: 'warning',
            suggestion:
              'Consider breaking this function into smaller, single-responsibility functions.',
          })
        }
      },
    },
    violations,
  )

  return violations
}
