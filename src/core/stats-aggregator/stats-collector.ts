import type { FileStats, ProjectStats, StatsSnapshot } from './types.js'
import { sortedByDesc } from '../../utils/array-helpers.js'

const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  typescript: /\.(ts|tsx|mts|cts)$/,
  javascript: /\.(js|jsx|mjs|cjs)$/,
  python: /\.py$/,
  java: /\.java$/,
  go: /\.go$/,
  rust: /\.rs$/,
  ruby: /\.rb$/,
  php: /\.php$/,
  csharp: /\.cs$/,
  cpp: /\.(cpp|cc|cxx|c|hpp|h)$/,
  kotlin: /\.(kt|kts)$/,
  swift: /\.swift$/,
  dart: /\.dart$/,
  html: /\.(html|htm)$/,
  css: /\.(css|scss|sass|less)$/,
  vue: /\.vue$/,
  svelte: /\.svelte$/,
}

function detectLanguage(filePath: string): string {
  const normalized = filePath.toLowerCase()
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(normalized)) {
      return lang
    }
  }
  return 'unknown'
}

function countLines(source: string): { linesOfCode: number; commentLines: number; blankLines: number } {
  if (source.length === 0) {
    return { linesOfCode: 0, commentLines: 0, blankLines: 0 }
  }

  const lines = source.split('\n')
  let linesOfCode = 0
  let commentLines = 0
  let blankLines = 0
  let inBlockComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      blankLines++
      continue
    }

    if (inBlockComment) {
      commentLines++
      if (trimmed.includes('*/')) {
        inBlockComment = false
      }
      continue
    }

    if (trimmed.startsWith('/*')) {
      commentLines++
      if (!trimmed.includes('*/') || trimmed.endsWith('/*')) {
        inBlockComment = true
      }
      continue
    }

    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('--') || trimmed.startsWith(';;;')) {
      commentLines++
      continue
    }

    linesOfCode++
  }

  return { linesOfCode, commentLines, blankLines }
}

function countPatterns(source: string): { functions: number; classes: number; imports: number; exports: number } {
  const functionPattern = /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*=>)|export\s+(?:async\s+)?function|private\s+(?:async\s+)?function|public\s+(?:async\s+)?function|protected\s+(?:async\s+)?function|static\s+(?:async\s+)?function|def\s+\w+|fn\s+\w+|func\s+\w+|fun\s+\w+|sub\s+\w+|def\s+self\.\w+)/g
  const classPattern = /(?:class\s+\w+|struct\s+\w+|interface\s+\w+|type\s+\w+\s*=|enum\s+\w+|trait\s+\w+|module\s+\w+|impl\s+\w+)/g
  const importPattern = /(?:import\s+.*?(?:from\s+)?['"]|require\s*\(\s*['"]|use\s+['"]|use\s+\w+|include\s+['"]|#include\s*[<"]|#import\s*[<"])/g
  const exportPattern = /(?:export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum|async)|module\.exports\s*=|exports\.\w+\s*=)/g

  return {
    functions: (source.match(functionPattern) ?? []).length,
    classes: (source.match(classPattern) ?? []).length,
    imports: (source.match(importPattern) ?? []).length,
    exports: (source.match(exportPattern) ?? []).length,
  }
}

function calculateComplexity(source: string): number {
  const complexityPattern = /(?:if\s*\(|else\s*{|else\s+if|for\s*\(|while\s*\(|do\s*{|switch\s*\(|case\s+|catch\s*\(|&&|\|\||try\s*{|=>|\?\s*[^?])/g
  const matches = source.match(complexityPattern)
  return (matches ? matches.length : 0) + 1
}

export class StatsCollector {
  collectFileStats(filePath: string, source: string): FileStats {
    const lines = countLines(source)
    const patterns = countPatterns(source)
    const complexity = calculateComplexity(source)

    return {
      filePath,
      linesOfCode: lines.linesOfCode,
      commentLines: lines.commentLines,
      blankLines: lines.blankLines,
      totalLines: lines.linesOfCode + lines.commentLines + lines.blankLines,
      functions: patterns.functions,
      classes: patterns.classes,
      imports: patterns.imports,
      exports: patterns.exports,
      complexity,
      language: detectLanguage(filePath),
      timestamp: Date.now(),
    }
  }

  collectProjectStats(files: FileStats[]): ProjectStats {
    if (files.length === 0) {
      return {
        totalFiles: 0,
        totalLinesOfCode: 0,
        totalCommentLines: 0,
        totalBlankLines: 0,
        averageComplexity: 0,
        averageFileLength: 0,
        languages: new Map(),
        topComplexFiles: [],
        timestamp: Date.now(),
      }
    }

    const totalLinesOfCode = files.reduce((sum, f) => sum + f.linesOfCode, 0)
    const totalCommentLines = files.reduce((sum, f) => sum + f.commentLines, 0)
    const totalBlankLines = files.reduce((sum, f) => sum + f.blankLines, 0)
    const totalComplexity = files.reduce((sum, f) => sum + f.complexity, 0)
    const totalLines = files.reduce((sum, f) => sum + f.totalLines, 0)

    const languages = new Map<string, number>()
    for (const file of files) {
      const count = languages.get(file.language) ?? 0
      languages.set(file.language, count + 1)
    }

    const sorted = sortedByDesc(files, f => f.complexity)
    const topComplexFiles = sorted.slice(0, Math.min(10, sorted.length))

    return {
      totalFiles: files.length,
      totalLinesOfCode,
      totalCommentLines,
      totalBlankLines,
      averageComplexity: totalComplexity / files.length,
      averageFileLength: totalLines / files.length,
      languages,
      topComplexFiles,
      timestamp: Date.now(),
    }
  }

  createSnapshot(projectStats: ProjectStats, fileStats: FileStats[]): StatsSnapshot {
    return {
      id: this.generateSnapshotId(),
      timestamp: Date.now(),
      projectStats,
      fileStats: [...fileStats],
    }
  }

  private generateSnapshotId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `snap_${timestamp}_${random}`
  }
}
