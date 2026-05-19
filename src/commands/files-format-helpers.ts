import chalk from 'chalk'

import type { FileGroup, FilesResult } from './files-helpers.js'

// ─── Utility formatters ──────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ─── Table helpers ───────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Table formatting ────────────────────────────────────

export function formatFilesTable(result: FilesResult, groupBy: string): string {
  const { files, groups, totalFiles, totalSize, totalLines, byExtension } = result
  const lines: string[] = [chalk.bold('\n📁 File Inventory'), '']

  if (files.length === 0) {
    lines.push(chalk.dim('No files found.'))
    return lines.join('\n')
  }

  const sizeStr = formatFileSize(totalSize)
  lines.push(chalk.dim(`Total: ${totalFiles} files, ${sizeStr}, ${totalLines} lines`))
  lines.push('')

  if (groups && groups.length > 0) {
    for (const group of groups) {
      lines.push(chalk.bold.cyan(`── ${group.key} (${group.files.length} files) ──`))
      formatFileRows(group.files, lines)
      lines.push(
        chalk.dim(
          `  Subtotal: ${group.files.length} files, ${formatFileSize(group.totalSize)}, ${group.totalLines} lines`,
        ),
      )
      lines.push('')
    }
  } else {
    formatFileRows(files, lines)
  }

  lines.push(chalk.dim('─'.repeat(60)))
  lines.push(
    chalk.bold(
      `Total: ${totalFiles} files | ${sizeStr} | ${totalLines} lines`,
    ),
  )

  if (byExtension.length > 0) {
    lines.push('')
    lines.push(chalk.bold('By Extension:'))
    for (const ext of byExtension) {
      lines.push(`  ${chalk.cyan(ext.ext || '(none)')}: ${ext.count} files, ${formatFileSize(ext.totalSize)}`)
    }
  }

  return lines.join('\n')
}

function formatFileRows(files: import('./files-helpers.js').FileInfo[], lines: string[]): void {
  const colWidths = {
    ext: Math.max(10, ...files.map((f) => f.extension.length)),
    file: Math.max(20, ...files.map((f) => f.relativePath.length)),
    lines: Math.max(6, ...files.map((f) => String(f.lineCount ?? '-').length)),
    modified: 10,
    size: Math.max(10, ...files.map((f) => formatFileSize(f.size).length)),
  }

  const header =
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Ext', colWidths.ext)) +
    '  ' +
    chalk.cyan(padLeft('Size', colWidths.size)) +
    '  ' +
    chalk.cyan(padLeft('Lines', colWidths.lines)) +
    '  ' +
    chalk.cyan(padLeft('Modified', colWidths.modified))

  lines.push(`  ${header}`)
  lines.push(chalk.dim(`  ${'─'.repeat(header.length)}`))

  for (const file of files) {
    const lineStr = file.lineCount !== null ? String(file.lineCount) : '-'
    const row =
      padRight(file.relativePath, colWidths.file) +
      '  ' +
      padLeft(file.extension || '(none)', colWidths.ext) +
      '  ' +
      padLeft(formatFileSize(file.size), colWidths.size) +
      '  ' +
      padLeft(lineStr, colWidths.lines) +
      '  ' +
      padLeft(formatDate(file.modifiedTime), colWidths.modified)
    lines.push(`  ${row}`)
  }
}

// ─── CSV formatting ──────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatFilesCsv(result: FilesResult): string {
  const headers = ['File', 'Extension', 'Size', 'Lines', 'Modified', 'Directory']
  const rows: string[] = [headers.join(',')]

  for (const file of result.files) {
    rows.push(
      [
        escapeCsv(file.relativePath),
        escapeCsv(file.extension),
        String(file.size),
        file.lineCount !== null ? String(file.lineCount) : '',
        formatDate(file.modifiedTime),
        escapeCsv(file.directory),
      ].join(','),
    )
  }

  rows.push('')
  rows.push(
    [
      escapeCsv(`TOTAL (${result.totalFiles} files)`),
      '',
      String(result.totalSize),
      String(result.totalLines),
      '',
      '',
    ].join(','),
  )

  return rows.join('\n')
}

// ─── JSON formatting ─────────────────────────────────────

export function formatFilesJson(result: FilesResult): string {
  return JSON.stringify(result, null, 2)
}
