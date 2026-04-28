/**
 * @file Enforce a maximum file size
 * @module rules/patterns/max-file-size
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { DEFAULT_MAX_FILE_SIZE_LINES } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface FileInfo {
  readonly characterCount: number
  readonly filePath: string
  readonly lineCount: number
}

interface MaxFileSizeOptions {
  readonly exclude?: readonly string[]
  readonly ignoreBlankLines?: boolean
  readonly ignoreComments?: boolean
  readonly maxCharacters?: number
  readonly maxLines?: number
}

function countLines(source: string, ignoreBlankLines: boolean): number {
  const lines = source.split('\n')
  if (ignoreBlankLines) {
    return lines.filter((line) => line.trim().length > 0).length
  }

  return lines.length
}

function removeComments(source: string): string {
  // Remove single-line comments
  let result = source.replaceAll(/\/\/.*$/gm, '')
  // Remove multi-line comments
  result = result.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  return result
}

function lineLocation(line: number): SourceLocation {
  return {
    end: { column: 1, line },
    start: { column: 0, line },
  }
}

function shouldExclude(filePath: string, excludePatterns: readonly string[]): boolean {
  for (const pattern of excludePatterns) {
    if (filePath.includes(pattern) || matchGlob(filePath, pattern)) {
      return true
    }
  }

  return false
}

const globPatternCache = new Map<string, RegExp>()

function matchGlob(filePath: string, pattern: string): boolean {
  const cached = globPatternCache.get(pattern)
  if (cached) return cached.test(filePath)

  const regex = pattern.replaceAll('**', '.*').replaceAll('*', '[^/]*').replaceAll('?', '.')
  const compiled = new RegExp(regex)
  globPatternCache.set(pattern, compiled)
  return compiled.test(filePath)
}

/**
 * Rule: max-file-size
 * Enforces a maximum file size to keep files maintainable
 */
export const maxFileSizeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<MaxFileSizeOptions>(context.config.options, {
      exclude: [],
      ignoreBlankLines: false,
      ignoreComments: false,
      maxCharacters: 50_000,
      maxLines: DEFAULT_MAX_FILE_SIZE_LINES,
    })

    const maxLines = options.maxLines ?? DEFAULT_MAX_FILE_SIZE_LINES
    const maxCharacters = options.maxCharacters ?? 50_000
    const ignoreComments = options.ignoreComments ?? false
    const ignoreBlankLines = options.ignoreBlankLines ?? false
    const exclude = options.exclude ?? []

    const filePath = context.getFilePath()

    // Check exclusion early
    if (shouldExclude(filePath, exclude)) {
      return {}
    }

    const source = context.getSource()
    let fileInfo: FileInfo | null = null

    return {
      Program(_node: unknown): void {
        // Process source
        let processedSource = source

        if (ignoreComments) {
          processedSource = removeComments(source)
        }

        const lineCount = countLines(processedSource, ignoreBlankLines)
        const characterCount = processedSource.length

        fileInfo = {
          characterCount,
          filePath,
          lineCount,
        }

        // Check line limit
        if (lineCount > maxLines) {
          context.report({
            loc: lineLocation(1),
            message: `File has ${lineCount} lines, which exceeds the maximum of ${maxLines} lines. Consider splitting this file into smaller modules.`,
          })
        }

        // Check character limit
        if (characterCount > maxCharacters) {
          context.report({
            loc: lineLocation(1),
            message: `File has ${characterCount} characters, which exceeds the maximum of ${maxCharacters} characters. Consider splitting this file into smaller modules.`,
          })
        }
      },

      'Program:exit'(): void {
        // Additional check for very large files
        if (fileInfo && fileInfo.lineCount > maxLines * 2) {
          context.report({
            loc: lineLocation(1),
            message: `File is critically large (${fileInfo.lineCount} lines). This significantly impacts maintainability and should be refactored immediately.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Enforce a maximum file size. Large files are harder to understand and maintain. Consider splitting large files into smaller, focused modules.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/max-file-size',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          exclude: {
            items: { type: 'string' },
            type: 'array',
          },
          ignoreBlankLines: {
            default: false,
            type: 'boolean',
          },
          ignoreComments: {
            default: false,
            type: 'boolean',
          },
          maxCharacters: {
            default: 50_000,
            minimum: 100,
            type: 'number',
          },
          maxLines: {
            default: DEFAULT_MAX_FILE_SIZE_LINES,
            minimum: 1,
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default maxFileSizeRule
