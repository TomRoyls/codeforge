import type {
  AnalysisResult,
  FileAnalysisResult,
  Reporter,
  ReporterOptions,
  Severity,
  Violation,
} from './types.js'

const ANSI_CODES = {
  blue: '\u001B[34m',
  bold: '\u001B[1m',
  cyan: '\u001B[36m',
  dim: '\u001B[2m',
  gray: '\u001B[90m',
  green: '\u001B[32m',
  red: '\u001B[31m',
  reset: '\u001B[0m',
  yellow: '\u001B[33m',
} as const satisfies Record<string, string>

const SEVERITY_ICONS: Record<Severity, string> = {
  error: '✖',
  info: 'ℹ',
  warning: '⚠',
}

const SEVERITY_COLORS: Record<Severity, string> = {
  error: ANSI_CODES.red,
  info: ANSI_CODES.blue,
  warning: ANSI_CODES.yellow,
}

export class ConsoleReporter implements Reporter {
  readonly name = 'console'
  private readonly color: boolean
  private readonly includeSource: boolean
  private readonly quiet: boolean
  private readonly verbose: boolean

  constructor(options: ReporterOptions = {}) {
    this.color = options.color ?? this.supportsColor()
    this.quiet = options.quiet ?? false
    this.verbose = options.verbose ?? false
    this.includeSource = options.includeSource ?? true
  }

  format(violation: Violation): string {
    const icon = SEVERITY_ICONS[violation.severity]
    const location = `${violation.filePath}:${violation.line}:${violation.column}`
    const severity = violation.severity.toUpperCase()

    if (this.color) {
      const color = SEVERITY_COLORS[violation.severity] ?? ANSI_CODES.reset
      return `${color}${icon}${ANSI_CODES.reset} ${this.colorize(ANSI_CODES.bold, location)} ${this.colorize(color, severity)} ${violation.message} [${violation.ruleId}]`
    }

    return `${icon} ${location} ${severity} ${violation.message} [${violation.ruleId}]`
  }

  report(results: AnalysisResult): void {
    if (results.files.length === 0) {
      this.printLine('No files analyzed.')
      return
    }

    if (this.quiet) {
      this.reportQuiet(results)
    } else {
      this.reportFull(results)
    }
  }

  private colorize(code: string, text: string): string {
    return this.color ? `${code}${text}${ANSI_CODES.reset}` : text
  }

  private formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  private printFileHeader(filePath: string): void {
    if (this.color) {
      this.printLine(`${ANSI_CODES.cyan}${ANSI_CODES.bold}${filePath}${ANSI_CODES.reset}`)
    } else {
      this.printLine(filePath)
    }
  }

  private printLine(text: string): void {
    console.log(text)
  }

  private printSourceSnippet(violation: Violation): void {
    const lines = violation.source?.split('\n') ?? []
    const lineNum = String(violation.line).padStart(4, ' ')
    const prefix = this.color
      ? `${ANSI_CODES.gray}${lineNum} | ${ANSI_CODES.reset}`
      : `${lineNum} | `

    for (const line of lines.slice(0, 3)) {
      this.printLine(`  ${prefix}${line}`)
    }

    const pointer = ' '.repeat(violation.column - 1) + '^'
    const pointerPrefix = this.color ? `${ANSI_CODES.gray}     | ${ANSI_CODES.reset}` : '     | '
    this.printLine(
      `  ${pointerPrefix}${this.color ? ANSI_CODES.red : ''}${pointer}${this.color ? ANSI_CODES.reset : ''}`,
    )
  }

  private printSuggestion(suggestion: string): void {
    if (this.color) {
      this.printLine(`  ${ANSI_CODES.dim}Suggestion: ${suggestion}${ANSI_CODES.reset}`)
    } else {
      this.printLine(`  Suggestion: ${suggestion}`)
    }
  }

  private printSummary(summary: AnalysisResult['summary']): void {
    const parts: string[] = []

    if (summary.errorCount > 0) {
      parts.push(
        this.color
          ? `${ANSI_CODES.red}✖ ${summary.errorCount} error${summary.errorCount === 1 ? '' : 's'}${ANSI_CODES.reset}`
          : `✖ ${summary.errorCount} error${summary.errorCount === 1 ? '' : 's'}`,
      )
    }

    if (summary.warningCount > 0) {
      parts.push(
        this.color
          ? `${ANSI_CODES.yellow}⚠ ${summary.warningCount} warning${summary.warningCount === 1 ? '' : 's'}${ANSI_CODES.reset}`
          : `⚠ ${summary.warningCount} warning${summary.warningCount === 1 ? '' : 's'}`,
      )
    }

    if (summary.infoCount > 0) {
      parts.push(
        this.color
          ? `${ANSI_CODES.blue}ℹ ${summary.infoCount} info${ANSI_CODES.reset}`
          : `ℹ ${summary.infoCount} info`,
      )
    }

    if (parts.length === 0) {
      this.printLine(
        this.color
          ? `${ANSI_CODES.green}✓ No problems found${ANSI_CODES.reset}`
          : '✓ No problems found',
      )
    } else {
      this.printLine(parts.join(' '))
    }

    this.printLine(
      this.color
        ? `${ANSI_CODES.gray}${summary.totalFiles} file${summary.totalFiles === 1 ? '' : 's'} analyzed in ${this.formatTime(summary.totalTime)}${ANSI_CODES.reset}`
        : `${summary.totalFiles} file${summary.totalFiles === 1 ? '' : 's'} analyzed in ${this.formatTime(summary.totalTime)}`,
    )
  }

  private printVerboseInfo(results: AnalysisResult): void {
    this.printLine('')
    this.printLine(
      this.color ? `${ANSI_CODES.dim}--- Details ---${ANSI_CODES.reset}` : '--- Details ---',
    )

    for (const file of results.files) {
      if (file.violations.length > 0) {
        this.printLine(
          this.color
            ? `${ANSI_CODES.dim}${file.filePath}: ${file.violations.length} violation(s) | parse: ${file.stats.parseTime}ms, analysis: ${file.stats.analysisTime}ms${ANSI_CODES.reset}`
            : `${file.filePath}: ${file.violations.length} violation(s) | parse: ${file.stats.parseTime}ms, analysis: ${file.stats.analysisTime}ms`,
        )
      }
    }
  }

  private reportFull(results: AnalysisResult): void {
    const filesWithViolations = results.files.filter(
      (f: FileAnalysisResult) => f.violations.length > 0,
    )

    for (const file of filesWithViolations) {
      this.printFileHeader(file.filePath)

      for (const violation of file.violations) {
        this.printLine(this.format(violation))

        if (this.includeSource && violation.source) {
          this.printSourceSnippet(violation)
        }

        if (violation.suggestion) {
          this.printSuggestion(violation.suggestion)
        }
      }

      this.printLine('')
    }

    this.printSummary(results.summary)

    if (this.verbose) {
      this.printVerboseInfo(results)
    }
  }

  private reportQuiet(results: AnalysisResult): void {
    const { summary } = results
    const hasErrors = summary.errorCount > 0

    for (const file of results.files) {
      for (const violation of file.violations) {
        if (violation.severity === 'error') {
          this.printLine(this.format(violation))
        }
      }
    }

    if (hasErrors) {
      this.printLine('')
      this.printSummary(summary)
    }
  }

  private supportsColor(): boolean {
    return process.stdout.isTTY === true && process.env.NO_COLOR === undefined
  }
}
