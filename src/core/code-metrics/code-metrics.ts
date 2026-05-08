import type {
  CodeFile,
  LineMetrics,
  LineRatio,
  DuplicationMetrics,
  MetricResult,
  AggregateMetrics,
  MetricTotals,
  MetricAverages,
} from './types.js'

export class CodeMetrics {
  analyzeFile(file: CodeFile): MetricResult {
    const lines = this.countLines(file.content)
    const cyclomatic = this.estimateComplexity(file.content)
    const cognitive = this.estimateCognitiveComplexity(file.content)
    const nesting = this.maxNestingLevel(file.content)
    const branches = this.countBranches(file.content)
    const functions = this.countFunctions(file.content)
    const commentRatio = lines.total > 0 ? lines.comment / lines.total : 0
    const mi = this.calculateMaintainabilityIndex(lines.code, cyclomatic, commentRatio)
    const grade = this.getMaintainabilityGrade(mi)
    const halstead = this.estimateHalstead(file.content)
    const duplication = this.detectDuplication(file.content, 3)

    return {
      path: file.path,
      lines,
      complexity: { cyclomatic, cognitive, nesting, branches, functions },
      maintainability: { mi, grade, halsteadVolume: halstead.volume, halsteadDifficulty: halstead.difficulty },
      duplication,
    }
  }

  analyzeFiles(files: CodeFile[]): AggregateMetrics {
    const results = files.map((f) => this.analyzeFile(f))
    return this.getStatistics(results)
  }

  countLines(content: string): LineMetrics {
    if (content.length === 0) {
      return {
        total: 0,
        code: 0,
        comment: 0,
        blank: 0,
        mixed: 0,
        ratio: { codeToComment: 0, codeToTotal: 0, commentToTotal: 0 },
      }
    }

    const normalized = content.endsWith('\n') ? content.slice(0, -1) : content
    const lines = normalized.split('\n')
    let code = 0
    let comment = 0
    let blank = 0
    let mixed = 0

    let inBlockComment = false

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (line.length === 0) {
        blank++
        continue
      }

      if (inBlockComment) {
        comment++
        if (line.includes('*/')) {
          inBlockComment = false
        }
        continue
      }

      if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) {
        if (line.startsWith('/*') && !line.includes('*/')) {
          inBlockComment = true
        }
        comment++
        continue
      }

      const codeOnly = line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '')
      const hasInlineComment = codeOnly.includes('/*') || codeOnly.includes('//')
      if (hasInlineComment && line.length > 0) {
        const strippedOfComments = codeOnly
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/g, '')
          .trim()
        if (strippedOfComments.length > 0) {
          mixed++
        } else {
          comment++
        }
        continue
      }

      code++
    }

    const total = lines.length
    const metrics = { total, code, comment, blank, mixed }
    return { ...metrics, ratio: this.calculateLineRatios(metrics) }
  }

  calculateLineRatios(metrics: { code: number; comment: number; total: number }): LineRatio {
    const codeToComment = metrics.comment > 0 ? metrics.code / metrics.comment : 0
    const codeToTotal = metrics.total > 0 ? metrics.code / metrics.total : 0
    const commentToTotal = metrics.total > 0 ? metrics.comment / metrics.total : 0
    return { codeToComment, codeToTotal, commentToTotal }
  }

  estimateComplexity(content: string): number {
    let complexity = 1
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /&&/g,
      /\|\|/g,
      /\?[^?.]/g,
      /\bcatch\b/g,
    ]
    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    }
    return complexity
  }

  estimateCognitiveComplexity(content: string): number {
    let complexity = 0
    let nestingLevel = 0
    const lines = content.split('\n')

    for (const rawLine of lines) {
      const line = rawLine.trim()
      const opens = (line.match(/\{/g) ?? []).length
      const closes = (line.match(/\}/g) ?? []).length

      const isControlFlow =
        /\bif\b/.test(line) ||
        /\belse\s+if\b/.test(line) ||
        /\belse\b/.test(line) ||
        /\bfor\b/.test(line) ||
        /\bwhile\b/.test(line) ||
        /\bswitch\b/.test(line) ||
        /\bcase\b/.test(line) ||
        /\bcatch\b/.test(line) ||
        /\?.*:/.test(line)

      if (isControlFlow) {
        complexity += 1 + nestingLevel
      }

      const logicalOps = (line.match(/&&|\|\|/g) ?? []).length
      complexity += logicalOps

      nestingLevel += opens - closes
      if (nestingLevel < 0) nestingLevel = 0
    }

    return complexity
  }

  maxNestingLevel(content: string): number {
    let current = 0
    let max = 0
    for (const char of content) {
      if (char === '{') {
        current++
        if (current > max) max = current
      } else if (char === '}') {
        current--
        if (current < 0) current = 0
      }
    }
    return max
  }

  countFunctions(content: string): number {
    let count = 0
    const functionDecl = content.match(/\bfunction\s+\w+/g)
    if (functionDecl) count += functionDecl.length
    const arrowFn = content.match(/=>\s*[{(]/g)
    if (arrowFn) count += arrowFn.length
    const asyncFn = content.match(/\basync\s+function\s+\w+/g)
    if (asyncFn) count -= asyncFn.length
    const methodFn = content.match(/\b\w+\s*\([^)]*\)\s*\{/g)
    if (methodFn) count += methodFn.length
    return count
  }

  countBranches(content: string): number {
    let count = 0
    const elseIfMatch = content.match(/\belse\s+if\b/g)
    if (elseIfMatch) count += elseIfMatch.length
    const ifMatch = content.match(/\bif\b/g)
    if (ifMatch) count += ifMatch.length - (elseIfMatch?.length ?? 0)
    const ternaryMatch = content.match(/\?[^?.].*:/g)
    if (ternaryMatch) count += ternaryMatch.length
    const switchMatch = content.match(/\bswitch\b/g)
    if (switchMatch) count += switchMatch.length
    return count
  }

  calculateMaintainabilityIndex(lines: number, complexity: number, commentRatio: number): number {
    if (lines === 0) return 100
    const volume = lines * Math.log2(Math.max(lines, 2))
    const mi = 171 - 5.2 * Math.log(Math.max(volume, 1)) - 0.23 * complexity - 16.2 * Math.log(Math.max(lines, 1)) + 50 * Math.sin(Math.sqrt(2.4 * commentRatio))
    return Math.max(0, Math.min(100, mi))
  }

  getMaintainabilityGrade(mi: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (mi >= 80) return 'A'
    if (mi >= 60) return 'B'
    if (mi >= 40) return 'C'
    if (mi >= 20) return 'D'
    return 'F'
  }

  estimateHalstead(content: string): { volume: number; difficulty: number } {
    const operators = new Set<string>()
    const operands = new Set<string>()
    const operatorPattern = /[+\-*/%=<>!&|^~?:]+|[{}()\[\];,.]/g
    const operandPattern = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|\b\d+(?:\.\d+)?\b/g

    const opMatches = content.match(operatorPattern)
    if (opMatches) {
      for (const op of opMatches) {
        operators.add(op)
      }
    }

    const operandMatches = content.match(operandPattern)
    if (operandMatches) {
      for (const operand of operandMatches) {
        operands.add(operand)
      }
    }

    const uniqueOperators = operators.size
    const uniqueOperands = operands.size
    const totalOperators = opMatches?.length ?? 0
    const totalOperands = operandMatches?.length ?? 0

    const vocabulary = uniqueOperators + uniqueOperands
    const length = totalOperators + totalOperands
    const volume = vocabulary > 0 ? length * Math.log2(Math.max(vocabulary, 2)) : 0
    const difficulty = uniqueOperands > 0 ? (uniqueOperators / 2) * (totalOperands / uniqueOperands) : 0

    return { volume, difficulty }
  }

  detectDuplication(content: string, minLines: number): DuplicationMetrics {
    if (content.length === 0 || minLines <= 0) {
      return { duplicatedLines: 0, duplicatedBlocks: 0, duplicationPercentage: 0 }
    }

    const lines = content.split('\n')
    const lineHashes = lines.map((l) => l.trim())

    let duplicatedBlocks = 0
    let duplicatedLines = 0
    const seen = new Map<string, number>()

    let i = 0
    while (i <= lines.length - minLines) {
      const block = lineHashes.slice(i, i + minLines).join('\n')
      if (seen.has(block)) {
        duplicatedBlocks++
        duplicatedLines += minLines
        i += minLines
      } else {
        seen.set(block, i)
        i++
      }
    }

    const totalLines = lines.length
    const duplicationPercentage = totalLines > 0 ? (duplicatedLines / totalLines) * 100 : 0

    return { duplicatedLines, duplicatedBlocks, duplicationPercentage }
  }

  getStatistics(results: MetricResult[]): AggregateMetrics {
    if (results.length === 0) {
      return {
        files: 0,
        totals: { lines: 0, codeLines: 0, commentLines: 0, blankLines: 0, functions: 0, complexity: 0, duplicatedLines: 0 },
        averages: { avgComplexity: 0, avgLinesPerFile: 0, avgMaintainability: 0, avgDuplication: 0 },
        byLanguage: {},
      }
    }

    const totals: MetricTotals = {
      lines: 0,
      codeLines: 0,
      commentLines: 0,
      blankLines: 0,
      functions: 0,
      complexity: 0,
      duplicatedLines: 0,
    }

    const languageGroups = new Map<string, MetricResult[]>()

    for (const r of results) {
      totals.lines += r.lines.total
      totals.codeLines += r.lines.code
      totals.commentLines += r.lines.comment
      totals.blankLines += r.lines.blank
      totals.functions += r.complexity.functions
      totals.complexity += r.complexity.cyclomatic
      totals.duplicatedLines += r.duplication.duplicatedLines

      const lang = r.path.split('.').pop() ?? 'unknown'
      const group = languageGroups.get(lang) ?? []
      group.push(r)
      languageGroups.set(lang, group)
    }

    const n = results.length
    const averages: MetricAverages = {
      avgComplexity: totals.complexity / n,
      avgLinesPerFile: totals.lines / n,
      avgMaintainability: results.reduce((sum, r) => sum + r.maintainability.mi, 0) / n,
      avgDuplication: results.reduce((sum, r) => sum + r.duplication.duplicationPercentage, 0) / n,
    }

    const byLanguage: Record<string, MetricAverages> = {}
    for (const [lang, group] of languageGroups) {
      const gn = group.length
      byLanguage[lang] = {
        avgComplexity: group.reduce((s, r) => s + r.complexity.cyclomatic, 0) / gn,
        avgLinesPerFile: group.reduce((s, r) => s + r.lines.total, 0) / gn,
        avgMaintainability: group.reduce((s, r) => s + r.maintainability.mi, 0) / gn,
        avgDuplication: group.reduce((s, r) => s + r.duplication.duplicationPercentage, 0) / gn,
      }
    }

    return { files: n, totals, averages, byLanguage }
  }
}
