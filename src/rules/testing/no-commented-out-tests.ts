import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { toASTNode } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS, TEST_FUNCTIONS } from '../../utils/constants.js'

const COMMENTED_OUT_TEST_MESSAGE =
  'Unexpected commented-out test. Remove the comment or restore the test.'

const ALL_TEST_NAMES = new Set([...DESCRIBE_FUNCTIONS, ...TEST_FUNCTIONS])

// Matches single-line comments containing test calls: // it(, // test(, // describe(, etc.
const LINE_COMMENT_PATTERN = /\/\/\s*(it|test|describe|context|suite)\s*\(/g

// Matches block comments containing test calls: /* it(, /* test(, /* describe(, etc.
const BLOCK_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g

// Extract individual test-like call from inside a block comment
const BLOCK_INNER_PATTERN = /(it|test|describe|context|suite)\s*\(/

function isTestFunctionName(name: string): boolean {
  return ALL_TEST_NAMES.has(name)
}

/**
 * Scan source for commented-out test calls and report violations.
 */
function scanSourceForCommentedTests(
  source: string,
  context: RuleContext,
): void {
  const reportedLines = new Set<number>()
  const { lines, lineStarts } = buildLineMap(source)

  let match: null | RegExpExecArray
  LINE_COMMENT_PATTERN.lastIndex = 0
  while ((match = LINE_COMMENT_PATTERN.exec(source)) !== null) {
    const functionName = match[1]
    if (!isTestFunctionName(functionName!)) continue

    const offset = match.index
    const line = offsetToLine(lineStarts, offset)
    if (reportedLines.has(line)) continue
    reportedLines.add(line)

    context.report({
      loc: {
        end: { column: Math.min(offsetToColumn(lineStarts, offset + match[0].length, line), lines[line - 1]!.length), line },
        start: { column: offsetToColumn(lineStarts, offset, line), line },
      },
      message: COMMENTED_OUT_TEST_MESSAGE,
    })
  }

  BLOCK_COMMENT_PATTERN.lastIndex = 0
  while ((match = BLOCK_COMMENT_PATTERN.exec(source)) !== null) {
    const blockText = match[0]
    const blockStart = match.index

    const blockLines = blockText.split('\n')
    let currentOffset = blockStart

    for (const lineText of blockLines) {
      const innerMatch = BLOCK_INNER_PATTERN.exec(lineText)
      if (innerMatch && isTestFunctionName(innerMatch[1]!)) {
        const line = offsetToLine(lineStarts, currentOffset)
        if (!reportedLines.has(line)) {
          reportedLines.add(line)
          context.report({
            loc: {
              end: { column: Math.min(offsetToColumn(lineStarts, currentOffset + lineText.length, line), lines[line - 1]!.length), line },
              start: { column: offsetToColumn(lineStarts, currentOffset, line), line },
            },
            message: COMMENTED_OUT_TEST_MESSAGE,
          })
        }
      }

      currentOffset += lineText.length + 1
      BLOCK_INNER_PATTERN.lastIndex = 0
    }
  }
}

/**
 * Pre-compute line start offsets for O(1) line/column lookup.
 */
function buildLineMap(source: string): { lines: string[]; lineStarts: number[]; } {
  const lineStarts = [0]
  const lines: string[] = []

  let lineStart = 0
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') {
      lines.push(source.slice(lineStart, i))
      lineStart = i + 1
      lineStarts.push(lineStart)
    }
  }

  lines.push(source.slice(lineStart))

  return { lines, lineStarts }
}

function offsetToLine(lineStarts: number[], offset: number): number {
  let lo = 0
  let hi = lineStarts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (lineStarts[mid]! <= offset) lo = mid
    else hi = mid - 1
  }

  return lo + 1
}

function offsetToColumn(lineStarts: number[], offset: number, line: number): number {
  return offset - lineStarts[line - 1]!
}

export const noCommentedOutTestsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Program(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const source = context.getSource()
        if (!source) return

        scanSourceForCommentedTests(source, context)
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow commented-out test cases (it, test, describe) which indicate dead test code',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-commented-out-tests.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noCommentedOutTestsRule
