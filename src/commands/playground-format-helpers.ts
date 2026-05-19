import chalk from 'chalk'

import type { FileAnalysis, PlaygroundResult } from './playground-helpers.js'

// ─── Score Bar ──────────────────────────────────────────

/**
 * @example
 * const bar = buildScoreBar(85, 15)
 * console.log(bar)
 */
export function buildScoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled

  if (score >= 80) return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  if (score >= 60) return chalk.rgb(255, 165, 0)('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  return chalk.red('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
}

// ─── Format Section Header ──────────────────────────────

function sectionHeader(title: string): string {
  return `\n${chalk.bold(`  ${title}`)}\n${chalk.gray('  ' + '─'.repeat(50))}`
}

// ─── Format Overview ────────────────────────────────────

export function formatOverview(analysis: FileAnalysis, score: number): string {
  const lines: string[] = []
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'

  const gradeColor = grade === 'A' ? chalk.green : grade === 'B' ? chalk.cyan : grade === 'C' ? chalk.rgb(255, 165, 0) : chalk.red

  lines.push('')
  lines.push(chalk.bold(`  ${analysis.fileName}`) + chalk.gray(` — ${analysis.language}`))
  lines.push(chalk.gray(`  ${analysis.lines} lines | ${analysis.codeLines} code | ${analysis.commentLines} comments | ${analysis.blankLines} blank`))
  lines.push(`  ${buildScoreBar(score, 30)} ${chalk.bold(`${score}/100`)} ${gradeColor.bold(grade)}`)

  return lines.join('\n')
}

// ─── Format Structure ───────────────────────────────────

export function formatStructure(analysis: FileAnalysis): string {
  const parts: string[] = [sectionHeader('Structure')]

  if (analysis.imports.length > 0) {
    parts.push(`  ${chalk.cyan('Imports:')} ${analysis.imports.length}`)
    for (const imp of analysis.imports.slice(0, 10)) {
      const typeLabel = imp.type === 'esm' ? chalk.green('ESM') : imp.type === 'cjs' ? chalk.rgb(255, 165, 0)('CJS') : chalk.gray('DYN')
      parts.push(`    ${typeLabel} ${chalk.gray(imp.source)} (${imp.items} items, L${imp.line})`)
    }
  }

  if (analysis.exports.length > 0) {
    parts.push(`  ${chalk.cyan('Exports:')} ${analysis.exports.length}`)
    for (const exp of analysis.exports.slice(0, 10)) {
      const typeLabel = exp.type === 'named' ? chalk.green('named') : exp.type === 'default' ? chalk.rgb(255, 165, 0)('default') : chalk.gray('re-export')
      parts.push(`    ${typeLabel} ${exp.name} (L${exp.line})`)
    }
  }

  if (analysis.functions.length > 0) {
    parts.push(`  ${chalk.cyan('Functions:')} ${analysis.functions.length}`)
    for (const fn of analysis.functions.slice(0, 10)) {
      const asyncLabel = fn.async ? chalk.rgb(255, 165, 0)('async ') : ''
      parts.push(`    ${asyncLabel}${chalk.white(fn.name)}(${fn.params} params) L${fn.line}-${fn.endLine}`)
    }
  }

  if (analysis.classes.length > 0) {
    parts.push(`  ${chalk.cyan('Classes:')} ${analysis.classes.length}`)
    for (const cls of analysis.classes) {
      parts.push(`    ${chalk.white(cls.name)} (${cls.methods} methods, ${cls.properties} props) L${cls.line}`)
    }
  }

  if (analysis.interfaces.length > 0) {
    parts.push(`  ${chalk.cyan('Interfaces:')} ${analysis.interfaces.length}`)
    for (const iface of analysis.interfaces) {
      parts.push(`    ${chalk.white(iface.name)} (${iface.properties} props) L${iface.line}`)
    }
  }

  if (analysis.types.length > 0) {
    parts.push(`  ${chalk.cyan('Types:')} ${analysis.types.length}`)
    for (const t of analysis.types) {
      parts.push(`    ${chalk.white(t.name)} L${t.line}`)
    }
  }

  return parts.join('\n')
}

// ─── Format Quality ─────────────────────────────────────

export function formatQuality(analysis: FileAnalysis): string {
  const parts: string[] = [sectionHeader('Quality Metrics')]

  const ccColor = analysis.cyclomaticComplexity <= 10 ? chalk.green : analysis.cyclomaticComplexity <= 20 ? chalk.rgb(255, 165, 0) : chalk.red
  parts.push(`  ${chalk.cyan('Cyclomatic Complexity:')} ${ccColor(String(analysis.cyclomaticComplexity))}`)

  const miColor = analysis.maintainabilityIndex >= 65 ? chalk.green : analysis.maintainabilityIndex >= 40 ? chalk.rgb(255, 165, 0) : chalk.red
  parts.push(`  ${chalk.cyan('Maintainability Index:')} ${miColor(String(analysis.maintainabilityIndex))}`)

  const nestColor = analysis.nestingDepth <= 3 ? chalk.green : analysis.nestingDepth <= 5 ? chalk.rgb(255, 165, 0) : chalk.red
  parts.push(`  ${chalk.cyan('Max Nesting Depth:')} ${nestColor(String(analysis.nestingDepth))}`)

  return parts.join('\n')
}

// ─── Format Issues ──────────────────────────────────────

export function formatIssues(analysis: FileAnalysis): string {
  const parts: string[] = [sectionHeader('Issues')]

  const totalIssues = analysis.todos.length + analysis.securityIssues.length + analysis.perfIssues.length + analysis.deadCode.length

  if (totalIssues === 0) {
    parts.push(`  ${chalk.green('✓')} No issues found`)
    return parts.join('\n')
  }

  if (analysis.securityIssues.length > 0) {
    parts.push(`  ${chalk.red('Security:')} ${analysis.securityIssues.length}`)
    for (const issue of analysis.securityIssues) {
      parts.push(`    ${chalk.red('!')} L${issue.line}: ${issue.message}`)
    }
  }

  if (analysis.perfIssues.length > 0) {
    parts.push(`  ${chalk.rgb(255, 165, 0)('Performance:')} ${analysis.perfIssues.length}`)
    for (const issue of analysis.perfIssues) {
      parts.push(`    ${chalk.rgb(255, 165, 0)('!')} L${issue.line}: ${issue.message}`)
    }
  }

  if (analysis.todos.length > 0) {
    parts.push(`  ${chalk.cyan('TODOs:')} ${analysis.todos.length}`)
    for (const todo of analysis.todos) {
      parts.push(`    L${todo.line}: [${todo.type}] ${todo.text}`)
    }
  }

  if (analysis.deadCode.length > 0) {
    parts.push(`  ${chalk.gray('Dead Code:')} ${analysis.deadCode.length}`)
    for (const dc of analysis.deadCode) {
      parts.push(`    L${dc.line}: ${dc.name} (${dc.confidence}% confidence)`)
    }
  }

  return parts.join('\n')
}

// ─── Format Style ───────────────────────────────────────

export function formatStyle(analysis: FileAnalysis): string {
  const parts: string[] = [sectionHeader('Style')]

  parts.push(`  ${chalk.cyan('Indentation:')} ${analysis.indentationStyle}`)
  parts.push(`  ${chalk.cyan('Quotes:')} ${analysis.quoteStyle}`)
  parts.push(`  ${chalk.cyan('Semicolons:')} ${analysis.semicolonUsage ? 'yes' : 'no'}`)

  return parts.join('\n')
}

// ─── Format Suggestions ─────────────────────────────────

export function formatSuggestions(analysis: FileAnalysis): string {
  const parts: string[] = [sectionHeader('Refactoring Suggestions')]

  if (analysis.refactoringSuggestions.length === 0) {
    parts.push(`  ${chalk.green('✓')} No suggestions`)
    return parts.join('\n')
  }

  for (const suggestion of analysis.refactoringSuggestions) {
    parts.push(`  ${chalk.rgb(255, 165, 0)('→')} ${suggestion}`)
  }

  return parts.join('\n')
}

// ─── Format Full Report ─────────────────────────────────

/**
 * @example
 * const text = formatPlaygroundReport(result)
 * console.log(text)
 */
export function formatPlaygroundReport(result: PlaygroundResult): string {
  const a = result.analysis
  const parts: string[] = []

  parts.push(formatOverview(a, result.score))
  parts.push(formatStructure(a))
  parts.push(formatQuality(a))
  parts.push(formatIssues(a))
  parts.push(formatStyle(a))
  parts.push(formatSuggestions(a))
  parts.push('')

  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatPlaygroundJson(result)
 * console.log(json)
 */
export function formatPlaygroundJson(result: PlaygroundResult): string {
  return JSON.stringify(
    {
      analysis: {
        classes: result.analysis.classes,
        codeLines: result.analysis.codeLines,
        commentLines: result.analysis.commentLines,
        cyclomaticComplexity: result.analysis.cyclomaticComplexity,
        exports: result.analysis.exports,
        fileName: result.analysis.fileName,
        functions: result.analysis.functions,
        imports: result.analysis.imports,
        interfaces: result.analysis.interfaces,
        language: result.analysis.language,
        lines: result.analysis.lines,
        maintainabilityIndex: result.analysis.maintainabilityIndex,
        nestingDepth: result.analysis.nestingDepth,
        securityIssues: result.analysis.securityIssues,
        size: result.analysis.size,
        todos: result.analysis.todos,
        types: result.analysis.types,
      },
      score: result.score,
    },
    null,
    2,
  )
}
