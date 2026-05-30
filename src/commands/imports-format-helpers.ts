import chalk from 'chalk'

import type { ImportsResult } from './imports-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

/**
 * Format imports result as a colorized table for terminal output.
 *
 * @example
 * ```ts
 * const output = formatImportsTable(result, false);
 * console.log(output);
 * ```
 */
export function formatImportsTable(result: ImportsResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n📦 Import Analysis Report'), '']

  // ─── Summary ────────────────────────────────────────────
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total imports:       ${chalk.white(String(result.totalImports))}`)
  lines.push(
    `  External imports:    ${chalk.blue(String(result.externalImports))}  (${result.externalRatio}%)`,
  )
  lines.push(
    `  Internal imports:    ${chalk.green(String(result.internalImports))}  (${result.totalImports > 0 ? Math.round((result.internalImports / result.totalImports) * 10000) / 100 : 0}%)`,
  )
  lines.push(`  Type-only imports:   ${chalk.yellow(String(result.typeOnlyImports))}`)

  // Style breakdown
  if (result.byStyle.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Import Styles:'))
    for (const s of result.byStyle) {
      lines.push(`  ${padRight(s.style, 12)} ${padLeft(String(s.count), 6)}  (${s.percentage}%)`)
    }
  }

  // ─── Top Modules ────────────────────────────────────────
  if (result.topModules.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Top Imported Modules:'))

    const modules = result.topModules
    const colModule = Math.max(8, ...modules.map((m) => m.module.length))
    const colCount = Math.max(5, ...modules.map((m) => String(m.importCount).length))
    const colStyles = Math.max(6, ...modules.map((m) => m.styles.map((s) => `${s.style}(${s.count})`).join(', ').length))
    const colFiles = Math.max(5, ...modules.map((m) => String(m.files.length).length))

    const header =
      chalk.cyan(padRight('Module', colModule)) +
      '  ' +
      chalk.cyan(padLeft('Count', colCount)) +
      '  ' +
      chalk.cyan(padRight('Styles', colStyles)) +
      '  ' +
      chalk.cyan(padLeft('Files', colFiles)) +
      '  ' +
      chalk.cyan('Type')

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const mod of modules) {
      const stylesStr = mod.styles.map((s) => `${s.style}(${s.count})`).join(', ')
      const typeStr = mod.isExternal ? chalk.blue('external') : chalk.green('internal')
      const moduleStr = mod.isExternal ? chalk.blue(padRight(mod.module, colModule)) : chalk.green(padRight(mod.module, colModule))

      const row =
        moduleStr +
        '  ' +
        padLeft(String(mod.importCount), colCount) +
        '  ' +
        padRight(stylesStr, colStyles) +
        '  ' +
        padLeft(String(mod.files.length), colFiles) +
        '  ' +
        typeStr

      lines.push(row)
    }

    lines.push(chalk.dim('─'.repeat(header.length)))
  }

  // ─── Circular Dependencies ──────────────────────────────
  if (result.circularDeps.length > 0) {
    lines.push('')
    lines.push(chalk.bold.red(`⚠ Circular Dependencies (${result.circularDeps.length}):`))
    for (const dep of result.circularDeps) {
      lines.push(chalk.red(`  → ${dep.path.join(' → ')}`))
      lines.push(chalk.dim(`    (cycle length: ${dep.length})`))
    }
  }

  // ─── Verbose: all imports per file ──────────────────────
  if (verbose && result.imports.length > 0) {
    lines.push('')
    lines.push(chalk.bold('All Imports by File:'))
    lines.push('')

    const byFile = new Map<string, typeof result.imports>()
    for (const imp of result.imports) {
      const existing = byFile.get(imp.filePath) ?? []
      existing.push(imp)
      byFile.set(imp.filePath, existing)
    }

    for (const [filePath, fileImports] of byFile) {
      lines.push(chalk.cyan(`  ${filePath}:`))
      for (const imp of fileImports) {
        const styleStr = chalk.dim(`[${imp.style}]`)
        const typeTag = imp.isTypeOnly ? chalk.yellow(' (type)') : ''
        const extTag = imp.isExternal ? chalk.blue(' (ext)') : chalk.green(' (int)')
        const namesStr = imp.names.length > 0 ? ` {${imp.names.join(', ')}}` : ''
        lines.push(`    ${styleStr} ${imp.module}${namesStr}${typeTag}${extTag}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format imports result as CSV.
 *
 * @example
 * ```ts
 * const csv = formatImportsCsv(result);
 * ```
 */
export function formatImportsCsv(result: ImportsResult): string {
  const headers = ['Module', 'ImportCount', 'Styles', 'FileCount', 'IsExternal']
  const rows: string[] = [headers.join(',')]

  for (const mod of result.moduleStats) {
    const stylesStr = mod.styles.map((s) => `${s.style}:${s.count}`).join(';')
    rows.push(
      [
        escapeCsv(mod.module),
        String(mod.importCount),
        escapeCsv(stylesStr),
        String(mod.files.length),
        String(mod.isExternal),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format imports result as JSON.
 *
 * @example
 * ```ts
 * const json = formatImportsJson(result);
 * JSON.parse(json);
 * ```
 */
export function formatImportsJson(result: ImportsResult): string {
  return JSON.stringify(result, null, 2)
}
