import chalk from 'chalk'

import type { ApiExport, ApiModule, SurfaceResult, SurfaceStats, ExportType } from './surface-helpers.js'

// ─── Badges ───────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<ExportType, string> = {
  function: 'ƒ',
  class: '⬡',
  interface: '◇',
  type: '△',
  constant: '●',
  enum: '◈',
  namespace: '▣',
}

const TYPE_COLORS: Record<ExportType, (s: string) => string> = {
  function: (s) => chalk.rgb(100, 200, 255)(s),
  class: (s) => chalk.rgb(255, 180, 100)(s),
  interface: (s) => chalk.rgb(150, 255, 150)(s),
  type: (s) => chalk.rgb(200, 150, 255)(s),
  constant: (s) => chalk.rgb(255, 255, 150)(s),
  enum: (s) => chalk.rgb(255, 150, 200)(s),
  namespace: (s) => chalk.rgb(180, 180, 180)(s),
}

/**
 * Format an export type badge with icon and color.
 *
 * @example
 * exportTypeBadge('function')
 * // => 'ƒ'
 */
export function exportTypeBadge(type: ExportType): string {
  return TYPE_COLORS[type](TYPE_ICONS[type])
}

// ─── Coverage meter ───────────────────────────────────────────────────────────

/**
 * Render an ASCII documentation coverage meter.
 *
 * @example
 * docCoverageMeter(75.5)
 * // => '███████░░░ 75.5%'
 */
export function docCoverageMeter(coverage: number): string {
  const filled = Math.round(coverage / 10)
  const empty = 10 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return `${bar} ${coverage}%`
}

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Format the API surface table.
 *
 * @example
 * formatSurfaceTable(exports)
 */
export function formatSurfaceTable(exports: ApiExport[]): string {
  if (exports.length === 0) return chalk.dim('  (no exports)')

  const rows = exports.map((exp) => {
    const badge = exportTypeBadge(exp.type)
    const doc = exp.hasJSDoc ? chalk.green('✓') : chalk.red('✗')
    const deprecated = exp.isDeprecated ? chalk.rgb(255, 100, 100)('⚠') : ' '
    const usage = exp.usageCount > 0 ? chalk.dim(`used:${exp.usageCount}`) : chalk.yellow('unused')
    const def = exp.isDefaultExport ? chalk.dim('default') : ''

    return `  ${badge} ${deprecated} ${chalk.bold(exp.name.padEnd(25))} ${doc} ${usage.padEnd(12)} ${def} ${chalk.dim(exp.file + ':' + exp.line)}`
  })

  return rows.join('\n')
}

/**
 * Format the per-module breakdown.
 *
 * @example
 * formatModuleBreakdown(modules)
 */
export function formatModuleBreakdown(modules: ApiModule[]): string {
  if (modules.length === 0) return chalk.dim('  (no modules)')

  const rows = modules.map((mod) => {
    const docPct = mod.exportCount > 0
      ? Math.round((mod.documentedCount / mod.exportCount) * 100)
      : 100
    const docColor = docPct >= 80 ? chalk.green : docPct >= 50 ? chalk.yellow : chalk.red
    return `  ${chalk.bold(mod.file)} — ${mod.exportCount} exports, ${docColor(docPct + '%')} documented, ${mod.unusedCount} unused`
  })

  return rows.join('\n')
}

// ─── Stats formatting ─────────────────────────────────────────────────────────

/**
 * Format the statistics summary.
 *
 * @example
 * formatSurfaceStats(stats)
 */
export function formatSurfaceStats(stats: SurfaceStats): string {
  const lines = [
    chalk.bold('  Total Exports:            ') + String(stats.totalExports),
    chalk.bold('  Total Modules:            ') + String(stats.totalModules),
    chalk.bold('  Documented Exports:       ') + chalk.green(String(stats.documentedExports)),
    chalk.bold('  Undocumented Exports:     ') + chalk.yellow(String(stats.undocumentedExports)),
    chalk.bold('  Deprecated Exports:       ') + chalk.rgb(255, 100, 100)(String(stats.deprecatedExports)),
    chalk.bold('  Unused Exports:           ') + chalk.yellow(String(stats.unusedExports)),
    chalk.bold('  Default Exports:          ') + String(stats.defaultExports),
    chalk.bold('  Named Exports:            ') + String(stats.namedExports),
    chalk.bold('  Type-Only Exports:        ') + String(stats.typeOnlyExports),
    chalk.bold('  Avg Usage Count:          ') + String(stats.averageUsageCount),
    chalk.bold('  Doc Coverage:             ') + docCoverageMeter(stats.documentationCoverage),
    chalk.bold('  Surface Area:             ') + String(stats.surfaceArea),
  ]
  return lines.join('\n')
}

// ─── Unused export warnings ───────────────────────────────────────────────────

/**
 * Format unused export warnings.
 *
 * @example
 * formatUnusedExports(unused)
 */
export function formatUnusedExports(unused: ApiExport[]): string {
  if (unused.length === 0) return chalk.dim('  (all exports are used)')
  return unused.map((e) => {
    const badge = exportTypeBadge(e.type)
    return `  ${chalk.red('◆')} ${badge} ${e.name} — ${chalk.dim(e.file + ':' + e.line)}`
  }).join('\n')
}

// ─── Undocumented exports ─────────────────────────────────────────────────────

/**
 * Format undocumented export alerts.
 *
 * @example
 * formatUndocumentedExports(undocumented)
 */
export function formatUndocumentedExports(undocumented: ApiExport[]): string {
  if (undocumented.length === 0) return chalk.dim('  (all exports documented)')
  return undocumented.map((e) => {
    const badge = exportTypeBadge(e.type)
    return `  ${chalk.yellow('◆')} ${badge} ${e.name} — ${chalk.dim(e.file + ':' + e.line)}`
  }).join('\n')
}

// ─── Deprecated exports ───────────────────────────────────────────────────────

/**
 * Format deprecated export listing.
 *
 * @example
 * formatDeprecatedExports(deprecated)
 */
export function formatDeprecatedExports(deprecated: ApiExport[]): string {
  if (deprecated.length === 0) return chalk.dim('  (no deprecated exports)')
  return deprecated.map((e) => {
    const badge = exportTypeBadge(e.type)
    const reason = e.jsDocDescription ? ` — ${e.jsDocDescription}` : ''
    return `  ${chalk.rgb(255, 100, 100)('⚠')} ${badge} ${e.name}${reason} ${chalk.dim(e.file + ':' + e.line)}`
  }).join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations as a bullet list.
 *
 * @example
 * formatSurfaceRecommendations(recs)
 */
export function formatSurfaceRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('  (no recommendations)')
  return recommendations.map((r) => `  ${chalk.cyan('→')} ${r}`).join('\n')
}

// ─── Full output ──────────────────────────────────────────────────────────────

/**
 * Format the full console output.
 *
 * @example
 * formatSurfaceOutput(result)
 */
export function formatSurfaceOutput(result: SurfaceResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(150, 220, 255)('\n╔═ API Surface Statistics ════════════════════════════════╗'))
  sections.push(formatSurfaceStats(result.stats))
  sections.push('')

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ API Surface Table ═════════════════════════════════════╗'))
  sections.push(formatSurfaceTable(result.exports))
  sections.push('')

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Module Breakdown ══════════════════════════════════════╗'))
  sections.push(formatModuleBreakdown(result.modules))
  sections.push('')

  if (result.unused.length > 0) {
    sections.push(chalk.bold.rgb(255, 200, 100)('╔═ Unused Exports ════════════════════════════════════════╗'))
    sections.push(formatUnusedExports(result.unused))
    sections.push('')
  }

  if (result.undocumented.length > 0) {
    sections.push(chalk.bold.rgb(255, 200, 100)('╔═ Undocumented Exports ══════════════════════════════════╗'))
    sections.push(formatUndocumentedExports(result.undocumented))
    sections.push('')
  }

  if (result.deprecated.length > 0) {
    sections.push(chalk.bold.rgb(255, 100, 100)('╔═ Deprecated Exports ════════════════════════════════════╗'))
    sections.push(formatDeprecatedExports(result.deprecated))
    sections.push('')
  }

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Recommendations ══════════════════════════════════════╗'))
  sections.push(formatSurfaceRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * Format the result as JSON.
 *
 * @example
 * formatSurfaceJson(result)
 */
export function formatSurfaceJson(result: SurfaceResult): string {
  return JSON.stringify(result, null, 2)
}
