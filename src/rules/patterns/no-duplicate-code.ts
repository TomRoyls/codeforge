/**
 * @file Disallow duplicate code blocks
 * @module rules/pokies/no-duplicate-code
 */

import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'
import { append } from '../../utils/map-helpers.js'

interface CodeBlock {
  readonly content: string
  readonly endLine: number
  readonly filePath: string
  readonly hash: string
  readonly startLine: number
}

interface NoDuplicateCodeOptions {
  readonly ignoreComments?: boolean
  readonly ignoreImports?: boolean
  readonly minLines?: number
  readonly minTokens?: number
  readonly threshold?: number
}

function normalizeCode(code: string): string {
  return code.replaceAll(/\s+/g, ' ').trim().toLowerCase()
}

function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.codePointAt(i) ?? 0
    hash = (hash << 5) - hash + char
    hash &= hash
  }

  return hash.toString(16)
}

function getBlockContent(node: unknown, source: string): null | string {
  const n = toASTNode(node)
  if (!n) return null

  const loc = toASTNode(n.loc)
  if (!loc) return null

  const start = toASTNode(loc.start)
  const end = toASTNode(loc.end)

  if (typeof start?.line !== 'number' || typeof end?.line !== 'number') {
    return null
  }

  const lines = source.split('\n')
  const startLine = Math.max(0, start.line - 1)
  const endLine = Math.min(lines.length, end.line)

  return lines.slice(startLine, endLine).join('\n')
}

function isImportOrExport(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  return (
    n.type === 'ImportDeclaration' ||
    n.type === 'ExportNamedDeclaration' ||
    n.type === 'ExportDefaultDeclaration' ||
    n.type === 'ExportAllDeclaration'
  )
}

function isComment(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  return n.type === 'Block' || n.type === 'Line'
}

/**
 * Rule: no-duplicate-code
 * Detects duplicate code blocks within a file or across files
 */
export const noDuplicateCodeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoDuplicateCodeOptions>(context.config.options, {
      ignoreComments: true,
      ignoreImports: true,
      minLines: 5,
      minTokens: 50,
      threshold: 70,
    })

    const minLines = options.minLines ?? 5
    const ignoreComments = options.ignoreComments ?? true
    const ignoreImports = options.ignoreImports ?? true

    const codeBlocks: CodeBlock[] = []
    const filePath = context.getFilePath()
    const source = context.getSource()

    return {
      BlockStatement(node: unknown): void {
        if (ignoreImports && isImportOrExport(node)) {
          return
        }

        if (ignoreComments && isComment(node)) {
          return
        }

        const content = getBlockContent(node, source)
        if (!content) {
          return
        }

        const lines = content.split('\n')
        if (lines.length < minLines) {
          return
        }

        const location = extractLocation(node)
        const normalized = normalizeCode(content)
        const hash = hashContent(normalized)

        codeBlocks.push({
          content: content.slice(0, 100),
          endLine: location.end.line,
          filePath,
          hash,
          startLine: location.start.line,
        })
      },

      ClassDeclaration(node: unknown): void {
        const content = getBlockContent(node, source)
        if (!content) {
          return
        }

        const lines = content.split('\n')
        if (lines.length < minLines) {
          return
        }

        const location = extractLocation(node)
        const normalized = normalizeCode(content)
        const hash = hashContent(normalized)

        codeBlocks.push({
          content: content.slice(0, 100),
          endLine: location.end.line,
          filePath,
          hash,
          startLine: location.start.line,
        })
      },

      FunctionDeclaration(node: unknown): void {
        if (ignoreImports && isImportOrExport(node)) {
          return
        }

        const content = getBlockContent(node, source)
        if (!content) {
          return
        }

        const lines = content.split('\n')
        if (lines.length < minLines) {
          return
        }

        const location = extractLocation(node)
        const normalized = normalizeCode(content)
        const hash = hashContent(normalized)

        codeBlocks.push({
          content: content.slice(0, 100),
          endLine: location.end.line,
          filePath,
          hash,
          startLine: location.start.line,
        })
      },

      'Program:exit'(): void {
        // Group blocks by hash
        const groups = new Map<string, CodeBlock[]>()
        for (const block of codeBlocks) {
          append(groups, block.hash, block)
        }

        // Report duplicates
        for (const [, blocks] of groups) {
          if (blocks.length > 1) {
            const original = blocks[0]!
            for (let i = 1; i < blocks.length; i++) {
              const duplicate = blocks[i]!

              context.report({
                loc: {
                  end: { column: 0, line: duplicate.endLine },
                  start: { column: 0, line: duplicate.startLine },
                },
                message: `Duplicate code block detected (lines ${duplicate.startLine}-${duplicate.endLine}). Original block at lines ${original.startLine}-${original.endLine}. Consider extracting to a shared function.`,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow duplicate code blocks. Duplicated code increases maintenance burden and can indicate missing abstractions.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-duplicate-code',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignoreComments: {
            default: true,
            type: 'boolean',
          },
          ignoreImports: {
            default: true,
            type: 'boolean',
          },
          minLines: {
            default: 5,
            minimum: 2,
            type: 'number',
          },
          minTokens: {
            default: 50,
            minimum: 10,
            type: 'number',
          },
          threshold: {
            default: 70,
            maximum: 100,
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

export default noDuplicateCodeRule
