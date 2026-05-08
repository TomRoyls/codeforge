import type { ComplexityMetrics } from './types.js'

export class ComplexityCalculator {
  calculateForFile(content: string, filePath: string): ComplexityMetrics {
    const { total, effective } = this.countLinesOfCode(content)
    const cyclomaticComplexity = this.countCyclomatic(content)
    const cognitiveComplexity = this.countCognitive(content)
    const functionCount = this.countFunctions(content)
    const maxNestingDepth = this.calculateMaxNesting(content)

    const metrics: ComplexityMetrics = {
      filePath,
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode: total,
      linesOfCodeEffective: effective,
      functionCount,
      maxNestingDepth,
      maintainabilityIndex: 0,
      timestamp: Date.now(),
    }

    metrics.maintainabilityIndex = this.calculateMaintainabilityIndex(metrics)
    return metrics
  }

  calculateForFunction(fnContent: string): { cyclomatic: number; cognitive: number; nesting: number } {
    return {
      cyclomatic: this.countCyclomatic(fnContent),
      cognitive: this.countCognitive(fnContent),
      nesting: this.calculateMaxNesting(fnContent),
    }
  }

  countCyclomatic(content: string): number {
    let count = 1
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\bdo\b/g,
      /&&/g,
      /\|\|/g,
      /\?[^.?]/g,
      /\?\?/g,
    ]

    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches) {
        count += matches.length
      }
    }

    return count
  }

  countCognitive(content: string): number {
    let totalCognitive = 0
    let nestingLevel = 0
    let inString: string | null = null
    let inLineComment = false
    let inBlockComment = false

    let i = 0
    while (i < content.length) {
      const char = content[i]
      const next = content[i + 1]

      if (inLineComment) {
        if (char === '\n') inLineComment = false
        i++
        continue
      }

      if (inBlockComment) {
        if (char === '*' && next === '/') {
          inBlockComment = false
          i += 2
          continue
        }
        i++
        continue
      }

      if (inString) {
        if (char === '\\') {
          i += 2
          continue
        }
        if (char === inString) inString = null
        i++
        continue
      }

      if (char === '/' && next === '/') {
        inLineComment = true
        i += 2
        continue
      }
      if (char === '/' && next === '*') {
        inBlockComment = true
        i += 2
        continue
      }
      if (char === '"' || char === "'" || char === '`') {
        inString = char
        i++
        continue
      }

      if (char === '{') {
        nestingLevel++
        i++
        continue
      }
      if (char === '}') {
        nestingLevel--
        if (nestingLevel < 0) nestingLevel = 0
        i++
        continue
      }

      const remaining = content.slice(i)
      const keywordMatch = remaining.match(/^(\belse\s+if\b|\bif\b|\bfor\b|\bwhile\b|\bcase\b|\bcatch\b|\bdo\b)/)
      if (keywordMatch) {
        totalCognitive += 1 + nestingLevel
        i += keywordMatch[0]!.length
        continue
      }

      const logicalMatch = remaining.match(/^(&&|\|\||\?\?|\?[^.?])/)
      if (logicalMatch) {
        totalCognitive += 1 + nestingLevel
        i += logicalMatch[0]!.length
        continue
      }

      i++
    }

    return totalCognitive
  }

  countLinesOfCode(content: string): { total: number; effective: number } {
    const lines = content.split('\n')
    let effective = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length === 0) continue
      if (trimmed.startsWith('//')) continue
      if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.endsWith('*/')) continue
      effective++
    }

    return { total: lines.length, effective }
  }

  countFunctions(content: string): number {
    let count = 0
    const patterns = [
      /\bfunction\s+\w+/g,
      /\bfunction\s*\(/g,
      /(?:const|let|var)\s+\w+\s*=\s*\(/g,
      /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(/g,
      /\w+\s*:\s*(?:async\s+)?function/g,
      /\w+\s*:\s*(?:async\s+)?\([^)]*\)\s*=>/g,
      /\basync\s+function\b/g,
      /(?:async\s+)?\([^)]*\)\s*=>/g,
      /\*\w+\s*\(/g,
    ]

    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches) {
        count += matches.length
      }
    }

    return count
  }

  calculateMaxNesting(content: string): number {
    let maxDepth = 0
    let currentDepth = 0

    for (const char of content) {
      if (char === '{') {
        currentDepth++
        if (currentDepth > maxDepth) {
          maxDepth = currentDepth
        }
      } else if (char === '}') {
        currentDepth--
      }
    }

    return maxDepth
  }

  calculateMaintainabilityIndex(metrics: ComplexityMetrics): number {
    const avgLoc = metrics.linesOfCodeEffective
    const avgCC = metrics.cyclomaticComplexity

    if (avgLoc <= 0) return 100

    const mi = 171
      - 5.2 * Math.log(avgLoc)
      - 0.23 * avgCC
      - 16.2 * Math.log(avgLoc + 1)

    const normalized = Math.max(0, mi) * 100 / 171
    return Math.round(normalized * 100) / 100
  }
}
