import chalk from 'chalk'

import type {
  CodeExplanation,
  CodeSection,
  ComplexityLevel,
  ControlFlowType,
  ExportExplanation,
  FileMetrics,
  ParamExplanation,
  SideEffectType,
} from './explain-code-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map complexity level to a chalk-colored indicator.
 *
 * @example
 * complexityIndicator('simple') // '●' (green)
 * complexityIndicator('complex') // '●' (red)
 */
export function complexityIndicator(level: ComplexityLevel): string {
  switch (level) {
    case 'simple':
      return chalk.green('●')
    case 'moderate':
      return chalk.yellow('●')
    case 'complex':
      return chalk.red('●')
  }
}

/**
 * Map control flow type to a human-readable label with color.
 *
 * @example
 * controlFlowLabel('branching') // '↗ branching' (yellow)
 * controlFlowLabel('async') // '⚡ async' (cyan)
 */
export function controlFlowLabel(flow: ControlFlowType): string {
  switch (flow) {
    case 'linear':
      return chalk.dim('→ linear')
    case 'branching':
      return chalk.yellow('↗ branching')
    case 'looping':
      return chalk.blue('↻ looping')
    case 'recursive':
      return chalk.magenta('⟲ recursive')
    case 'async':
      return chalk.cyan('⚡ async')
  }
}

/**
 * Map side effect type to a human-readable label with color.
 *
 * @example
 * sideEffectLabel('file-io') // '📁 file-io'
 * sideEffectLabel('logging') // '📝 logging'
 */
export function sideEffectLabel(effect: SideEffectType): string {
  const labels: Record<SideEffectType, string> = {
    'file-io': chalk.red('📁 file-io'),
    logging: chalk.yellow('📝 logging'),
    'env-access': chalk.blue('🔧 env-access'),
    network: chalk.magenta('🌐 network'),
    'non-deterministic': chalk.cyan('🎲 non-deterministic'),
    'state-mutation': chalk.rgb(255, 165, 0)('🔄 state-mutation'),
    timer: chalk.green('⏱ timer'),
    'event-listener': chalk.dim('👂 event-listener'),
  }
  return labels[effect]
}

/**
 * Format a single parameter explanation.
 *
 * @example
 * formatParam({ name: 'x', type: 'number', purpose: 'Input value' })
 * // '  x: number — Input value'
 */
export function formatParam(param: ParamExplanation): string {
  return `  ${chalk.cyan(param.name)}: ${chalk.dim(param.type)} — ${param.purpose}`
}

/**
 * Format an export explanation.
 *
 * @example
 * formatExport({ name: 'foo', type: 'function', purpose: 'Exported function' })
 * // 'foo (function) — Exported function'
 */
export function formatExport(exp: ExportExplanation): string {
  return `${chalk.bold(exp.name)} (${chalk.dim(exp.type)}) — ${exp.purpose}`
}

/**
 * Format file metrics as a summary line.
 *
 * @example
 * formatMetrics({ lines: 100, functions: 3, classes: 1, imports: 5, exports: 2, complexity: 8 })
 * // 'Lines: 100 | Functions: 3 | Classes: 1 | Imports: 5 | Exports: 2 | Complexity: 8'
 */
export function formatMetrics(metrics: FileMetrics): string {
  const parts = [
    `${chalk.bold('Lines:')} ${metrics.lines}`,
    `${chalk.bold('Functions:')} ${metrics.functions}`,
    `${chalk.bold('Classes:')} ${metrics.classes}`,
    `${chalk.bold('Imports:')} ${metrics.imports}`,
    `${chalk.bold('Exports:')} ${metrics.exports}`,
    `${chalk.bold('Complexity:')} ${metrics.complexity}`,
  ]
  return parts.join(` ${chalk.dim('|')} `)
}

/**
 * Format a single code section for display.
 *
 * @example
 * formatSection(section) // multi-line formatted section with params, calls, etc.
 */
export function formatSection(section: CodeSection, verbose?: boolean): string {
  const lines: string[] = []

  const typeLabel = chalk.dim(`[${section.type}]`)
  const indicator = complexityIndicator(section.complexity)
  lines.push(
    `${indicator} ${chalk.bold(section.name)} ${typeLabel} ${chalk.dim(`(L${section.lineStart}-${section.lineEnd})`)}`,
  )
  lines.push(`  ${chalk.dim('Description:')} ${section.description}`)
  lines.push(`  ${chalk.dim('Returns:')} ${section.returns}`)
  lines.push(`  ${chalk.dim('Control Flow:')} ${controlFlowLabel(section.controlFlow)}`)

  if (section.parameters.length > 0) {
    lines.push(`  ${chalk.dim('Parameters:')}`)
    for (const param of section.parameters) {
      lines.push(formatParam(param))
    }
  }

  if (section.sideEffects.length > 0) {
    lines.push(`  ${chalk.dim('Side Effects:')} ${section.sideEffects.map(sideEffectLabel).join(', ')}`)
  }

  if (verbose) {
    if (section.calls.length > 0) {
      lines.push(`  ${chalk.dim('Calls:')} ${section.calls.join(', ')}`)
    }
    if (section.calledBy.length > 0) {
      lines.push(`  ${chalk.dim('Called By:')} ${section.calledBy.join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format a code explanation as a structured table for terminal display.
 *
 * @example
 * formatExplainTable(explanation) // colored terminal output
 */
export function formatExplainTable(explanation: CodeExplanation, verbose?: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.underline(`Code Explanation: ${explanation.file}`))
  lines.push('')

  lines.push(`${chalk.bold('Language:')} ${explanation.language}`)
  lines.push(`${chalk.bold('Purpose:')} ${explanation.purpose}`)
  lines.push(`${chalk.bold('Overview:')} ${explanation.overview}`)
  lines.push('')

  if (explanation.patterns.length > 0) {
    lines.push(chalk.bold('Patterns Detected:'))
    for (const pattern of explanation.patterns) {
      lines.push(`  ${chalk.green('✓')} ${pattern}`)
    }
    lines.push('')
  }

  if (explanation.dependencies.length > 0) {
    lines.push(chalk.bold('Dependencies:'))
    const external = explanation.dependencies.filter((d) => !d.startsWith('.'))
    const internal = explanation.dependencies.filter((d) => d.startsWith('.'))
    if (external.length > 0) {
      lines.push(`  ${chalk.dim('External:')} ${external.join(', ')}`)
    }
    if (internal.length > 0) {
      lines.push(`  ${chalk.dim('Internal:')} ${internal.join(', ')}`)
    }
    lines.push('')
  }

  if (explanation.sections.length > 0) {
    lines.push(chalk.bold('Sections:'))
    lines.push('')
    for (const section of explanation.sections) {
      lines.push(formatSection(section, verbose))
      lines.push('')
    }
  }

  if (explanation.exports.length > 0) {
    lines.push(chalk.bold('Exports:'))
    for (const exp of explanation.exports) {
      lines.push(`  ${formatExport(exp)}`)
    }
    lines.push('')
  }

  lines.push(chalk.bold('Metrics:'))
  lines.push(`  ${formatMetrics(explanation.metrics)}`)
  lines.push('')

  return lines.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format a code explanation as a JSON string.
 *
 * @example
 * formatExplainJson(explanation) // '{"file":"src/foo.ts","language":"TypeScript",...}'
 */
export function formatExplainJson(explanation: CodeExplanation): string {
  return JSON.stringify(explanation, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format a code explanation as CSV with section details.
 *
 * @example
 * formatExplainCsv(explanation)
 * // 'name,type,lineStart,lineEnd,complexity,controlFlow,...'
 */
export function formatExplainCsv(explanation: CodeExplanation): string {
  const header = 'name,type,lineStart,lineEnd,complexity,controlFlow,sideEffects,description'
  const rows = explanation.sections.map((s) => {
    const effects = s.sideEffects.join(';')
    return `"${s.name}","${s.type}",${s.lineStart},${s.lineEnd},"${s.complexity}","${s.controlFlow}","${effects}","${s.description.replace(/"/g, '""')}"`
  })
  return [header, ...rows].join('\n')
}
