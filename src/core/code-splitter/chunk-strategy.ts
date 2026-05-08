import type { SplitGranularity, SplitOptions } from './types.js'

export class ChunkStrategy {
  selectStrategy(code: string, language: string): SplitGranularity {
    const lines = code.split('\n')
    const lineCount = lines.length

    const hasFunctions = this.hasPattern(code, language, 'function')
    const hasClasses = this.hasPattern(code, language, 'class')

    if (hasClasses && lineCount > 50) {
      return 'class'
    }

    if (hasFunctions && lineCount > 20) {
      return 'function'
    }

    if (lineCount > 10) {
      return 'statement'
    }

    return 'line'
  }

  estimateChunkCount(code: string, options: SplitOptions): number {
    const lines = code.split('\n')
    const lineCount = lines.length

    if (options.granularity === 'line') {
      return Math.ceil(lineCount / options.maxChunkSize)
    }

    if (options.granularity === 'function') {
      const funcCount = this.countPattern(code, options.language, 'function')
      return funcCount > 0 ? funcCount : Math.ceil(lineCount / options.maxChunkSize)
    }

    if (options.granularity === 'class') {
      const classCount = this.countPattern(code, options.language, 'class')
      return classCount > 0 ? classCount : Math.ceil(lineCount / options.maxChunkSize)
    }

    if (options.granularity === 'statement') {
      const statementCount = this.countStatements(code)
      return statementCount > 0 ? statementCount : Math.ceil(lineCount / options.maxChunkSize)
    }

    if (options.granularity === 'module') {
      return 1
    }

    if (options.granularity === 'paragraph') {
      return this.countParagraphs(code)
    }

    return Math.ceil(lineCount / options.maxChunkSize)
  }

  shouldSplit(code: string, maxChunkSize: number): boolean {
    const lines = code.split('\n')
    return lines.length > maxChunkSize
  }

  getOptimalChunkSize(code: string, targetChunks: number): number {
    const lines = code.split('\n')
    if (targetChunks <= 0) {
      return lines.length
    }
    return Math.ceil(lines.length / targetChunks)
  }

  calculateHash(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash + char) | 0
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  private hasPattern(code: string, language: string, pattern: string): boolean {
    if (pattern === 'function') {
      if (language === 'python') {
        return /^\s*def\s+\w+/m.test(code)
      }
      return /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/m.test(code)
    }

    if (pattern === 'class') {
      if (language === 'python') {
        return /^\s*class\s+\w+/m.test(code)
      }
      return /\bclass\s+\w+/m.test(code)
    }

    return false
  }

  private countPattern(code: string, language: string, pattern: string): number {
    if (pattern === 'function') {
      if (language === 'python') {
        const matches = code.match(/^\s*def\s+\w+/gm)
        return matches ? matches.length : 0
      }
      const namedFunc = code.match(/\bfunction\s+\w+/g)
      const arrowFunc = code.match(/(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(/g)
      return (namedFunc ? namedFunc.length : 0) + (arrowFunc ? arrowFunc.length : 0)
    }

    if (pattern === 'class') {
      const matches = code.match(/\bclass\s+\w+/g)
      return matches ? matches.length : 0
    }

    return 0
  }

  private countStatements(code: string): number {
    const lines = code.split('\n')
    let count = 0
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length === 0) continue
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
      if (trimmed.endsWith(';') || trimmed.endsWith('{') || trimmed.endsWith('}')) {
        count++
      } else if (trimmed.length > 0) {
        count++
      }
    }
    return count
  }

  private countParagraphs(code: string): number {
    const blocks = code.split(/\n\s*\n/)
    return blocks.filter((b) => b.trim().length > 0).length
  }
}
