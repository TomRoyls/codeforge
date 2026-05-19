import chalk from 'chalk'

import type { PipelineConfig, PipelineIssue, PipelineJob, PipelineStats } from './pipeline-helpers.js'

// ─── Severity Color ─────────────────────────────────────

/**
 * @example
 * const text = severityLabel('error')
 * console.log(text)
 */
export function severityLabel(severity: string): string {
  if (severity === 'error') return chalk.red('ERROR')
  if (severity === 'warning') return chalk.rgb(255, 165, 0)('WARN')
  return chalk.cyan('INFO')
}

// ─── Format Jobs ────────────────────────────────────────

/**
 * @example
 * const text = formatPipelineJobs(jobs)
 * console.log(text)
 */
export function formatPipelineJobs(jobs: PipelineJob[]): string {
  if (jobs.length === 0) return chalk.gray('  No jobs found')

  const lines: string[] = []
  lines.push(chalk.bold('  Jobs'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const job of jobs) {
    const cache = job.hasCache ? chalk.green('cache') : chalk.red('no-cache')
    const artifacts = job.hasArtifacts ? chalk.green('artifacts') : ''
    const timeout = job.timeout ? chalk.gray(`${job.timeout}min`) : chalk.rgb(255, 165, 0)('no-timeout')
    const triggers = job.triggers.length > 0 ? chalk.gray(`[${job.triggers.join(', ')}]`) : ''

    lines.push(`  ${chalk.bold(job.name.padEnd(20))} ${chalk.cyan(job.runsOn.padEnd(16))} ${job.steps} steps  ${cache} ${artifacts} ${timeout} ${triggers}`)
  }

  return lines.join('\n')
}

// ─── Format Issues ──────────────────────────────────────

/**
 * @example
 * const text = formatPipelineIssues(issues)
 * console.log(text)
 */
export function formatPipelineIssues(issues: PipelineIssue[]): string {
  if (issues.length === 0) return chalk.green('  ✓ No issues found')

  const lines: string[] = []
  lines.push(chalk.bold('  Issues'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const issue of issues) {
    const label = severityLabel(issue.severity)
    const loc = issue.line ? chalk.gray(`L${issue.line}`) : ''
    lines.push(`  ${label} ${issue.message} ${loc}`)
    if (issue.fix) {
      lines.push(`    ${chalk.gray('Fix:')} ${issue.fix}`)
    }
  }

  return lines.join('\n')
}

// ─── Format Stats ───────────────────────────────────────

/**
 * @example
 * const text = formatPipelineStats(stats)
 * console.log(text)
 */
export function formatPipelineStats(stats: PipelineStats): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold('  Statistics'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))
  lines.push(`  ${chalk.cyan('Platform:')}          ${stats.platforms.join(', ') || 'unknown'}`)
  lines.push(`  ${chalk.cyan('Total Jobs:')}         ${stats.totalJobs}`)
  lines.push(`  ${chalk.cyan('Total Steps:')}        ${stats.totalSteps}`)
  lines.push(`  ${chalk.cyan('Avg Steps/Job:')}      ${stats.averageStepsPerJob}`)
  lines.push(`  ${chalk.cyan('Has Caching:')}        ${stats.hasCache ? chalk.green('yes') : chalk.red('no')}`)
  lines.push(`  ${chalk.cyan('Has Artifacts:')}      ${stats.hasArtifacts ? chalk.green('yes') : chalk.red('no')}`)
  lines.push(`  ${chalk.cyan('Matrix Testing:')}     ${stats.hasMatrix ? chalk.green('yes') : chalk.red('no')}`)
  lines.push(`  ${chalk.cyan('Security Scanning:')}  ${stats.securityScanning ? chalk.green('yes') : chalk.red('no')}`)
  lines.push(`  ${chalk.cyan('Coverage Reporting:')} ${stats.coverageReporting ? chalk.green('yes') : chalk.red('no')}`)

  return lines.join('\n')
}

// ─── Format Table ───────────────────────────────────────

/**
 * @example
 * const text = formatPipelineTable(config, stats)
 * console.log(text)
 */
export function formatPipelineTable(config: PipelineConfig, stats: PipelineStats): string {
  const parts: string[] = []

  parts.push('')
  parts.push(chalk.bold('  CI/CD Pipeline Analysis'))
  parts.push(chalk.gray('  ══════════════════════════════════════════════'))
  parts.push(`  ${chalk.cyan('Platform:')} ${chalk.bold(config.platform)}`)
  parts.push(`  ${chalk.cyan('Config Files:')} ${config.files.join(', ') || 'none'}`)
  parts.push('')

  parts.push(formatPipelineJobs(config.jobs))
  parts.push('')
  parts.push(formatPipelineIssues(config.issues))
  parts.push(formatPipelineStats(stats))

  if (config.suggestions.length > 0) {
    parts.push('')
    parts.push(chalk.bold('  Suggestions'))
    parts.push(chalk.gray('  ──────────────────────────────────────────────'))
    for (const s of config.suggestions) {
      parts.push(`  ${chalk.rgb(255, 165, 0)('→')} ${s}`)
    }
  }

  parts.push('')
  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatPipelineJson(config, stats)
 * console.log(json)
 */
export function formatPipelineJson(config: PipelineConfig, stats: PipelineStats): string {
  return JSON.stringify(
    {
      files: config.files,
      issues: config.issues,
      jobs: config.jobs,
      platform: config.platform,
      stages: config.stages,
      stats,
      suggestions: config.suggestions,
    },
    null,
    2,
  )
}
