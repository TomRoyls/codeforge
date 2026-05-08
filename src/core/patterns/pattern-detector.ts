import type {
  CodePattern,
  PatternCategory,
  PatternMatch,
  PatternReport,
  PatternSeverity,
  PatternSuggestion,
  PatternSummary,
} from './types.js'

function getLineAndColumn(source: string, offset: number): { line: number; column: number } {
  let line = 1
  let column = 1
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') {
      line++
      column = 1
    } else {
      column++
    }
  }
  return { line, column }
}

function getContext(source: string, offset: number, radius: number = 2): string {
  const lines = source.substring(0, offset).split('\n')
  const currentLineIndex = lines.length - 1
  const allLines = source.split('\n')
  const start = Math.max(0, currentLineIndex - radius)
  const end = Math.min(allLines.length - 1, currentLineIndex + radius)
  return allLines.slice(start, end + 1).join('\n')
}

function buildDefaultPatterns(): CodePattern[] {
  return [
    {
      id: 'singleton',
      name: 'Singleton',
      category: 'design-pattern',
      severity: 'info',
      description: 'Singleton pattern ensures a class has only one instance',
      detectionRegex: /getInstance\s*\(\s*\)/g,
      indicators: ['getInstance', 'static instance', 'private constructor'],
    },
    {
      id: 'factory',
      name: 'Factory',
      category: 'design-pattern',
      severity: 'info',
      description: 'Factory pattern creates objects without specifying the exact class',
      detectionRegex: /(?:create|build|make)\w*\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{[^}]*return\s+new\s+/g,
      indicators: ['create', 'factory', 'new'],
    },
    {
      id: 'observer',
      name: 'Observer',
      category: 'design-pattern',
      severity: 'info',
      description: 'Observer pattern defines a subscription mechanism',
      detectionRegex: /(?:subscribe|on|addEventListener|addListener|observe)\s*\(/g,
      indicators: ['subscribe', 'on', 'addEventListener', 'notify'],
    },
    {
      id: 'strategy',
      name: 'Strategy',
      category: 'design-pattern',
      severity: 'info',
      description: 'Strategy pattern defines a family of algorithms',
      detectionRegex: /(?:strategy|policy|algorithm)\s*[=:]\s*\{/g,
      indicators: ['strategy', 'execute', 'algorithm'],
    },
    {
      id: 'builder',
      name: 'Builder',
      category: 'design-pattern',
      severity: 'info',
      description: 'Builder pattern provides fluent API for object construction',
      detectionRegex: /(?:set|with|add)\w+\s*\([^)]*\)\s*(?::\s*this\s*)?\s*\{[^}]*return\s+this/g,
      indicators: ['return this', 'fluent', 'builder'],
    },
    {
      id: 'god-object',
      name: 'God Object',
      category: 'anti-pattern',
      severity: 'error',
      description: 'File contains too many lines and functions, indicating a god object',
      detectionRegex: /./g,
      indicators: ['500+ lines', '20+ functions'],
    },
    {
      id: 'callback-hell',
      name: 'Callback Hell',
      category: 'anti-pattern',
      severity: 'error',
      description: 'Deeply nested callbacks indicate callback hell',
      detectionRegex: /\}(?:\s*,\s*)?(?:\s*\/\/[^\n]*)?\s*\)\s*;?\s*$/gm,
      indicators: ['deep nesting', 'callback', 'pyramid'],
    },
    {
      id: 'magic-numbers',
      name: 'Magic Numbers',
      category: 'anti-pattern',
      severity: 'warning',
      description: 'Hard-coded numeric literals that lack context',
      detectionRegex: /(?<![.\w])(?:(?<!\w)\d{2,}(?:\.\d+)?(?!\w*[.:\w]))/g,
      indicators: ['hard-coded number', 'no constant', 'unexplained value'],
    },
    {
      id: 'copy-paste',
      name: 'Copy-Paste Code',
      category: 'anti-pattern',
      severity: 'warning',
      description: 'Duplicate code blocks detected',
      detectionRegex: /(?:(?:function|const|let|var)\s+\w+\s*=\s*\(?(?:[^)]*)\)?\s*(?::\s*\w+(?:<[^>]+>)?)?\s*=>\s*\{[^}]{20,}\})/g,
      indicators: ['duplicate', 'identical block', 'copy'],
    },
    {
      id: 'spaghetti',
      name: 'Spaghetti Code',
      category: 'anti-pattern',
      severity: 'error',
      description: 'Function with too many return statements',
      detectionRegex: /(?:^|\n)\s*return\s+/g,
      indicators: ['10+ returns', 'complex flow', 'hard to follow'],
    },
    {
      id: 'barrel-file',
      name: 'Barrel File',
      category: 'architectural',
      severity: 'info',
      description: 'File only re-exports from other modules',
      detectionRegex: /export\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]/g,
      indicators: ['re-export only', 'index file', 'no logic'],
    },
    {
      id: 'circular-dependency',
      name: 'Circular Dependency',
      category: 'architectural',
      severity: 'warning',
      description: 'Import cycles between modules',
      detectionRegex: /import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]/g,
      indicators: ['cycle', 'mutual import', 'dependency loop'],
    },
    {
      id: 'deep-nesting',
      name: 'Deep Nesting',
      category: 'architectural',
      severity: 'warning',
      description: 'Code with more than 4 levels of indentation',
      detectionRegex: /\n(?: {8,}|\t{4,})\S/g,
      indicators: ['4+ levels', 'nested blocks', 'hard to read'],
    },
    {
      id: 'long-parameter-list',
      name: 'Long Parameter List',
      category: 'architectural',
      severity: 'warning',
      description: 'Function with more than 5 parameters',
      detectionRegex: /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?)\((?:[^,)]+,){5,}[^)]*\)/g,
      indicators: ['5+ params', 'config object', 'many arguments'],
    },
    {
      id: 'feature-envy',
      name: 'Feature Envy',
      category: 'architectural',
      severity: 'warning',
      description: 'Method calls more external than internal methods',
      detectionRegex: /(?:this\.\w+\.\w+)\s*\(/g,
      indicators: ['external calls', 'foreign data', 'envy'],
    },
    {
      id: 'long-method',
      name: 'Long Method',
      category: 'code-smell',
      severity: 'warning',
      description: 'Function with more than 50 lines',
      detectionRegex: /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?)\([^)]*\)\s*(?::\s*\w+(?:<[^>]+>)?)?\s*(?:=>\s*)?\{/g,
      indicators: ['50+ lines', 'complex function', 'hard to test'],
    },
    {
      id: 'large-class',
      name: 'Large Class',
      category: 'code-smell',
      severity: 'warning',
      description: 'Class with more than 15 methods',
      detectionRegex: /class\s+\w+[^{]*\{/g,
      indicators: ['15+ methods', 'too many responsibilities', 'god class'],
    },
    {
      id: 'data-clumps',
      name: 'Data Clumps',
      category: 'code-smell',
      severity: 'warning',
      description: 'Same group of parameters appearing together repeatedly',
      detectionRegex: /(?:function|const|let|method)\s+\w+\s*\(\s*(?:[^)]+,\s*){2,}[^)]+\)/g,
      indicators: ['repeated params', 'same group', 'should be object'],
    },
    {
      id: 'primitive-obsession',
      name: 'Primitive Obsession',
      category: 'code-smell',
      severity: 'warning',
      description: 'Using primitive types instead of domain-specific types',
      detectionRegex: /(?:string|number|boolean)\s*[=:]\s*['"0-9tf]/g,
      indicators: ['raw string', 'raw number', 'no type'],
    },
    {
      id: 'dead-code',
      name: 'Dead Code',
      category: 'code-smell',
      severity: 'warning',
      description: 'Unreachable or commented-out code',
      detectionRegex: /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
      indicators: ['commented out', 'unreachable', 'unused'],
    },
  ]
}

export class PatternDetector {
  private registeredPatterns: CodePattern[]

  constructor() {
    this.registeredPatterns = buildDefaultPatterns()
  }

  detect(source: string, filePath: string): PatternMatch[] {
    const matches: PatternMatch[] = []

    for (const pattern of this.registeredPatterns) {
      const patternMatches = this.detectPattern(pattern, source, filePath)
      matches.push(...patternMatches)
    }

    return matches
  }

  private detectPattern(
    pattern: CodePattern,
    source: string,
    filePath: string,
  ): PatternMatch[] {
    const matches: PatternMatch[] = []

    switch (pattern.id) {
      case 'god-object': {
        const lineCount = source.split('\n').length
        const functionCount = (source.match(/(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\()/g) ?? []).length
        if (lineCount > 500 && functionCount > 20) {
          matches.push({
            pattern,
            filePath,
            line: 1,
            column: 1,
            matchedText: `File has ${lineCount} lines and ${functionCount} functions`,
            confidence: Math.min(1, (lineCount / 500 + functionCount / 20) / 2),
            context: source.split('\n').slice(0, 5).join('\n'),
          })
        }
        break
      }

      case 'callback-hell': {
        const lines = source.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const indent = lines[i]!.match(/^(\s*)/)?.[1] ?? ''
          const tabDepth = indent.length
          if (tabDepth >= 16) {
            const nestingLevel = Math.floor(tabDepth / 4)
            if (nestingLevel > 4) {
              matches.push({
                pattern,
                filePath,
                line: i + 1,
                column: tabDepth + 1,
                matchedText: lines[i]!.trim(),
                confidence: Math.min(1, nestingLevel / 6),
                context: getContext(source, source.split('\n').slice(0, i + 1).join('\n').length),
              })
            }
          }
        }
        break
      }

      case 'magic-numbers': {
        const magicRegex = /(?<![.\w])\b(\d{2,}(?:\.\d+)?)\b(?!\w*[.:])/g
        let magicMatch: RegExpExecArray | null
        while ((magicMatch = magicRegex.exec(source)) !== null) {
          const value = parseFloat(magicMatch[1]!)
          if (!isNaN(value) && value !== 0 && value !== 1 && value !== -1 && value > 1) {
            const pos = getLineAndColumn(source, magicMatch.index)
            matches.push({
              pattern,
              filePath,
              line: pos.line,
              column: pos.column,
              matchedText: magicMatch[0],
              confidence: 0.7,
              context: getContext(source, magicMatch.index),
            })
          }
        }
        break
      }

      case 'spaghetti': {
        const functionRegex = /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?)\([^)]*\)\s*(?::\s*\w+(?:<[^>]+>)?)?\s*(?:=>\s*)?\{/g
        let funcMatch: RegExpExecArray | null
        while ((funcMatch = functionRegex.exec(source)) !== null) {
          const funcStart = funcMatch.index
          const funcBody = this.extractBlock(source, funcStart + funcMatch[0].length - 1)
          const returnCount = (funcBody.match(/\breturn\b/g) ?? []).length
          if (returnCount > 10) {
            const pos = getLineAndColumn(source, funcStart)
            matches.push({
              pattern,
              filePath,
              line: pos.line,
              column: pos.column,
              matchedText: funcMatch[0],
              confidence: Math.min(1, returnCount / 15),
              context: getContext(source, funcStart),
            })
          }
        }
        break
      }

      case 'long-method': {
        const funcRegex = /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?)\([^)]*\)\s*(?::\s*\w+(?:<[^>]+>)?)?\s*(?:=>\s*)?\{/g
        let fm: RegExpExecArray | null
        while ((fm = funcRegex.exec(source)) !== null) {
          const funcStart = fm.index
          const funcBody = this.extractBlock(source, funcStart + fm[0].length - 1)
          const lineCount = funcBody.split('\n').length
          if (lineCount > 50) {
            const pos = getLineAndColumn(source, funcStart)
            matches.push({
              pattern,
              filePath,
              line: pos.line,
              column: pos.column,
              matchedText: `${fm[0]}... (${lineCount} lines)`,
              confidence: Math.min(1, lineCount / 80),
              context: getContext(source, funcStart),
            })
          }
        }
        break
      }

      case 'large-class': {
        const classRegex = /class\s+(\w+)[^{]*\{/g
        let cm: RegExpExecArray | null
        while ((cm = classRegex.exec(source)) !== null) {
          const classBody = this.extractBlock(source, cm.index + cm[0].length - 1)
          const methodCount = (classBody.match(/\b(?:public|private|protected)?\s*(?:async\s+)?(?:get\s+|set\s+)?\w+\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g) ?? []).length
          if (methodCount > 15) {
            const pos = getLineAndColumn(source, cm.index)
            matches.push({
              pattern,
              filePath,
              line: pos.line,
              column: pos.column,
              matchedText: `${cm[1]} (${methodCount} methods)`,
              confidence: Math.min(1, methodCount / 20),
              context: getContext(source, cm.index),
            })
          }
        }
        break
      }

      case 'barrel-file': {
        const lines = source.split('\n')
        const exportOnlyLines = lines.filter(
          (l) =>
            l.trim().startsWith('export') ||
            l.trim() === '' ||
            l.trim().startsWith('//') ||
            l.trim().startsWith('/*') ||
            l.trim().startsWith('*'),
        )
        const exportCount = (source.match(/export\s*\{[^}]*\}\s*from/g) ?? []).length
        if (exportCount >= 2 && exportOnlyLines.length === lines.length) {
          matches.push({
            pattern,
            filePath,
            line: 1,
            column: 1,
            matchedText: `Barrel file with ${exportCount} re-exports`,
            confidence: Math.min(1, exportCount / 5),
            context: lines.slice(0, 5).join('\n'),
          })
        }
        break
      }

      case 'dead-code': {
        const commentRegex = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g
        let dm: RegExpExecArray | null
        while ((dm = commentRegex.exec(source)) !== null) {
          const text = dm[0]
          if (
            text.includes('function') ||
            text.includes('const ') ||
            text.includes('return ') ||
            text.includes('if ') ||
            text.includes('for ') ||
            text.length > 80
          ) {
            const pos = getLineAndColumn(source, dm.index)
            matches.push({
              pattern,
              filePath,
              line: pos.line,
              column: pos.column,
              matchedText: text.substring(0, 100),
              confidence: text.length > 40 ? 0.8 : 0.5,
              context: getContext(source, dm.index),
            })
          }
        }
        break
      }

      default: {
        const regex = new RegExp(pattern.detectionRegex.source, 'gm')
        let m: RegExpExecArray | null
        while ((m = regex.exec(source)) !== null) {
          const pos = getLineAndColumn(source, m.index)
          const matchedIndicators = pattern.indicators.filter((ind) =>
            source.toLowerCase().includes(ind.toLowerCase()),
          )
          const confidence = Math.min(1, matchedIndicators.length / pattern.indicators.length + 0.3)
          matches.push({
            pattern,
            filePath,
            line: pos.line,
            column: pos.column,
            matchedText: m[0],
            confidence: Math.round(confidence * 100) / 100,
            context: getContext(source, m.index),
          })
        }
        break
      }
    }

    return matches
  }

  private extractBlock(source: string, openBraceIndex: number): string {
    let depth = 0
    let start = -1
    for (let i = openBraceIndex; i < source.length; i++) {
      if (source[i] === '{') {
        if (depth === 0) start = i
        depth++
      } else if (source[i] === '}') {
        depth--
        if (depth === 0 && start !== -1) {
          return source.substring(start, i + 1)
        }
      }
    }
    return source.substring(openBraceIndex)
  }

  detectBatch(sources: Map<string, string>): PatternReport {
    const allMatches: PatternMatch[] = []

    for (const [filePath, source] of sources) {
      const matches = this.detect(source, filePath)
      allMatches.push(...matches)
    }

    return this.generateReport(allMatches)
  }

  getPatterns(): CodePattern[] {
    return [...this.registeredPatterns]
  }

  getByCategory(category: PatternCategory): CodePattern[] {
    return this.registeredPatterns.filter((p) => p.category === category)
  }

  getBySeverity(severity: PatternSeverity): CodePattern[] {
    return this.registeredPatterns.filter((p) => p.severity === severity)
  }

  generateReport(matches: PatternMatch[]): PatternReport {
    const summary = this.calculateSummary(matches)
    const suggestions = this.generateSuggestions(matches)
    return { matches, summary, suggestions }
  }

  private calculateSummary(matches: PatternMatch[]): PatternSummary {
    const byCategory: Record<PatternCategory, number> = {
      'design-pattern': 0,
      'anti-pattern': 0,
      architectural: 0,
      idiom: 0,
      'code-smell': 0,
    }
    const bySeverity: Record<PatternSeverity, number> = {
      info: 0,
      warning: 0,
      error: 0,
    }

    const uniqueIds = new Set<string>()

    for (const match of matches) {
      byCategory[match.pattern.category]++
      bySeverity[match.pattern.severity]++
      uniqueIds.add(match.pattern.id)
    }

    return {
      totalMatches: matches.length,
      byCategory,
      bySeverity,
      uniquePatterns: uniqueIds.size,
      healthScore: this.calculateHealthScore(matches),
    }
  }

  generateSuggestions(matches: PatternMatch[]): PatternSuggestion[] {
    const seen = new Map<string, PatternMatch>()

    for (const match of matches) {
      const existing = seen.get(match.pattern.id)
      if (!existing || match.confidence > existing.confidence) {
        seen.set(match.pattern.id, match)
      }
    }

    const suggestions: PatternSuggestion[] = []

    for (const match of seen.values()) {
      const action = this.getActionForPattern(match.pattern)
      const effort = this.getEffortForPattern(match.pattern)
      const reason = this.getReasonForMatch(match)
      suggestions.push({
        pattern: match.pattern,
        action,
        reason,
        effort,
      })
    }

    return suggestions
  }

  private getActionForPattern(pattern: CodePattern): PatternSuggestion['action'] {
    if (pattern.category === 'anti-pattern') return 'refactor'
    if (pattern.category === 'code-smell') return 'review'
    if (pattern.category === 'design-pattern') return 'keep'
    if (pattern.severity === 'warning') return 'consider'
    return 'review'
  }

  private getEffortForPattern(pattern: CodePattern): PatternSuggestion['effort'] {
    if (pattern.id === 'god-object') return 'high'
    if (pattern.id === 'spaghetti') return 'high'
    if (pattern.id === 'callback-hell') return 'high'
    if (pattern.id === 'copy-paste') return 'medium'
    if (pattern.id === 'long-method') return 'medium'
    if (pattern.id === 'large-class') return 'high'
    return 'low'
  }

  private getReasonForMatch(match: PatternMatch): string {
    const reasons: Record<string, string> = {
      singleton: 'Singleton pattern detected - consider dependency injection instead',
      factory: 'Factory pattern identified - ensure consistent usage across codebase',
      observer: 'Observer pattern detected - verify proper cleanup of subscriptions',
      strategy: 'Strategy pattern found - document strategy selection criteria',
      builder: 'Builder pattern detected - ensure immutability of built objects',
      'god-object': 'God object detected - split into smaller, focused modules',
      'callback-hell': 'Callback hell detected - refactor to async/await or Promises',
      'magic-numbers': 'Magic number found - extract to a named constant',
      'copy-paste': 'Duplicate code detected - extract to a shared function',
      spaghetti: 'Too many return paths - simplify control flow',
      'barrel-file': 'Barrel file detected - consider direct imports for tree-shaking',
      'circular-dependency': 'Circular dependency risk - review import structure',
      'deep-nesting': 'Deep nesting detected - use early returns or extract methods',
      'long-parameter-list': 'Long parameter list - consider using an options object',
      'feature-envy': 'Feature envy detected - consider moving method to data owner',
      'long-method': 'Long method detected - break into smaller functions',
      'large-class': 'Large class detected - split responsibilities',
      'data-clumps': 'Parameter clump detected - extract to a value object',
      'primitive-obsession': 'Primitive obsession found - create domain types',
      'dead-code': 'Dead code detected - remove or document intentionally',
    }
    return reasons[match.pattern.id] ?? `${match.pattern.name} detected with ${(match.confidence * 100).toFixed(0)}% confidence`
  }

  calculateHealthScore(matches: PatternMatch[]): number {
    let score = 100

    for (const match of matches) {
      switch (match.pattern.severity) {
        case 'error':
          score -= 5
          break
        case 'warning':
          score -= 2
          break
        case 'info':
          score -= 0.5
          break
      }
    }

    return Math.max(0, Math.round(score))
  }

  addPattern(pattern: CodePattern): void {
    this.registeredPatterns.push(pattern)
  }

  removePattern(id: string): boolean {
    const index = this.registeredPatterns.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.registeredPatterns.splice(index, 1)
      return true
    }
    return false
  }

  formatReport(report: PatternReport): string {
    const lines: string[] = []

    lines.push('=== Pattern Detection Report ===')
    lines.push('')
    lines.push(`Total Matches: ${report.summary.totalMatches}`)
    lines.push(`Unique Patterns: ${report.summary.uniquePatterns}`)
    lines.push(`Health Score: ${report.summary.healthScore}/100`)
    lines.push('')

    lines.push('-- By Category --')
    for (const [category, count] of Object.entries(report.summary.byCategory)) {
      if (count > 0) {
        lines.push(`  ${category}: ${count}`)
      }
    }
    lines.push('')

    lines.push('-- By Severity --')
    for (const [severity, count] of Object.entries(report.summary.bySeverity)) {
      if (count > 0) {
        lines.push(`  ${severity}: ${count}`)
      }
    }
    lines.push('')

    if (report.matches.length > 0) {
      lines.push('-- Matches --')
      for (const match of report.matches) {
        lines.push(
          `  [${match.pattern.severity.toUpperCase()}] ${match.pattern.name} at ${match.filePath}:${match.line}:${match.column}`,
        )
        lines.push(`    Confidence: ${(match.confidence * 100).toFixed(0)}%`)
        lines.push(`    Matched: ${match.matchedText.substring(0, 80)}`)
      }
      lines.push('')
    }

    if (report.suggestions.length > 0) {
      lines.push('-- Suggestions --')
      for (const suggestion of report.suggestions) {
        lines.push(
          `  [${suggestion.action.toUpperCase()}] ${suggestion.pattern.name} (${suggestion.effort} effort)`,
        )
        lines.push(`    ${suggestion.reason}`)
      }
    }

    return lines.join('\n')
  }
}
