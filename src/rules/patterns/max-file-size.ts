/**
 * @fileoverview Enforce a maximum file size
 * @module rules/patterns/max-file-size
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface FileInfo {
  readonly lineCount: number
  readonly characterCount: number
  readonly filePath: string
}

interface MaxFileSizeOptions {
  readonly maxLines?: number
  readonly maxCharacters?: number
  readonly ignoreComments?: boolean
  readonly ignoreBlankLines?: boolean
  readonly exclude?: readonly string[]
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
  let result = source.replace(/\/\/.*$/gm, '')
  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '')
  return result
}

function extractLocation(_source: string, line: number): SourceLocation {
  return {
    start: { line, column: 0 },
    end: { line, column: 1 },
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

function matchGlob(filePath: string, pattern: string): boolean {
  // Simple glob matching
  const regex = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.')
  return new RegExp(regex).test(filePath)
}

/**
 * Rule: max-file-size
 * Enforces a maximum file size to keep files maintainable
 */
export const maxFileSizeRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Enforce a maximum file size. Large files are harder to understand and maintain. Consider splitting large files into smaller, focused modules.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/max-file-size',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxLines: {
            type: 'number',
            minimum: 1,
            default: 500,
          },
          maxCharacters: {
            type: 'number',
            minimum: 100,
            default: 50000,
          },
          ignoreComments: {
            type: 'boolean',
            default: false,
          },
          ignoreBlankLines: {
            type: 'boolean',
            default: false,
          },
          exclude: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: MaxFileSizeOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as MaxFileSizeOptions

    const maxLines = options.maxLines ?? 500
    const maxCharacters = options.maxCharacters ?? 50000
    const ignoreComments = options.ignoreComments ?? false
    const ignoreBlankLines = options.ignoreBlankLines ?? false
    const exclude = options.exclude ?? []

    const filePath = context.getFilePath()

    // Check exclusion early
    if (shouldExclude(filePath, exclude)) {
      return {}
    }

    let source = context.getSource()
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
          lineCount,
          characterCount,
          filePath,
        }

        // Check line limit
        if (lineCount > maxLines) {
          context.report({
            message: `File has ${lineCount} lines, which exceeds the maximum of ${maxLines} lines. Consider splitting this file into smaller modules.`,
            loc: extractLocation(source, 1),
          })
        }

        // Check character limit
        if (characterCount > maxCharacters) {
          context.report({
            message: `File has ${characterCount} characters, which exceeds the maximum of ${maxCharacters} characters. Consider splitting this file into smaller modules.`,
            loc: extractLocation(source, 1),
          })
        }
      },

      'Program:exit'(): void {
        // Additional check for very large files
        if (fileInfo && fileInfo.lineCount > maxLines * 2) {
          context.report({
            message: `File is critically large (${fileInfo.lineCount} lines). This significantly impacts maintainability and should be refactored immediately.`,
            loc: extractLocation(source, 1),
          })
        }
      },
    }
  },
}

export default maxFileSizeRule
