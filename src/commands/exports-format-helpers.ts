import chalk from 'chalk'

import type { ExportInfo, FormatOptions } from './exports-helpers.js'

// ============================================================================
// Output Formatting
// ============================================================================

export function getTypeColor(type: string): (text: string) => string {
  const colors: Record<string, (text: string) => string> = {
    class: chalk.blue,
    const: chalk.cyan,
    function: chalk.green,
    interface: chalk.magenta,
    type: chalk.yellow,
  }
  return colors[type] ?? chalk.white
}

export function formatConsole(exports: ExportInfo[], options: FormatOptions): string {
  const lines: string[] = []

  lines.push(
    chalk.bold('\n📦 Export Analysis\n'),
    chalk.dim('Summary:'),
    `  Total exports: ${exports.length}`,
    `  Files analyzed: ${options.totalFiles}`,
    '',
    chalk.dim('Export types:'),
    `  Functions: ${options.typeSummary.function}`,
    `  Classes: ${options.typeSummary.class}`,
    `  Interfaces: ${options.typeSummary.interface}`,
    `  Types: ${options.typeSummary.type}`,
    `  Constants: ${options.typeSummary.const}`,
    '',
  )

  if (exports.length > 0) {
    lines.push(chalk.dim('Exports:'))
    for (const exp of exports) {
      const typeColor = getTypeColor(exp.type)
      const defaultStr = exp.isDefault ? ' (default)' : ''
      const unusedStr = exp.usageCount === 0 ? chalk.yellow(' ⚠️') : ''

      lines.push(
        `  ${typeColor(exp.type.padEnd(10))} ${exp.name}${defaultStr}${unusedStr}`,
        ...(exp.signature ? [chalk.dim(`    Signature: ${exp.signature}`)] : []),
        chalk.dim(`    File: ${exp.file}:${exp.line}`),
        chalk.dim(`    Usage count: ${exp.usageCount}`),
        '',
      )
    }
  }

  if (options.showUnused && options.unusedExports.length > 0) {
    lines.push(chalk.yellow.bold('⚠️  Potentially Unused Exports:\n'))
    for (const exp of options.unusedExports) {
      lines.push(`  ${exp.name} (${exp.type})`, chalk.dim(`    File: ${exp.file}:${exp.line}`), '')
    }
  }

  return lines.join('\n')
}

export function formatJson(exports: ExportInfo[], options: FormatOptions): string {
  return JSON.stringify(
    {
      exports,
      summary: {
        exportTypes: options.typeSummary,
        files: options.totalFiles,
        total: exports.length,
        unused: options.unusedExports.length,
      },
      unusedExports: options.unusedExports,
    },
    null,
    2,
  )
}

export function formatMarkdown(exports: ExportInfo[], options: FormatOptions): string {
  const lines: string[] = []

  lines.push(
    '# Export Analysis\n',
    '## Summary\n',
    `- **Total Exports:** ${exports.length}`,
    `- **Files Analyzed:** ${options.totalFiles}`,
    '',
    '## Export Types\n',
    `- **Functions:** ${options.typeSummary.function}`,
    `- **Classes:** ${options.typeSummary.class}`,
    `- **Interfaces:** ${options.typeSummary.interface}`,
    `- **Types:** ${options.typeSummary.type}`,
    `- **Constants:** ${options.typeSummary.const}`,
    '',
  )

  if (exports.length > 0) {
    lines.push('## All Exports\n')
    for (const exp of exports) {
      const defaultStr = exp.isDefault ? ' (default)' : ''
      lines.push(`### ${exp.name}${defaultStr}\n`, `- **Type:** ${exp.type}`)
      if (exp.signature) {
        lines.push(`- **Signature:** \`${exp.signature}\``)
      }

      lines.push(
        `- **File:** ${exp.file}:${exp.line}`,
        `- **Usage Count:** ${exp.usageCount}`,
        `- **Status:** ${exp.usageCount === 0 ? '⚠️ Potentially Unused' : '✓ Used'}`,
        '',
      )
    }
  }

  if (options.showUnused && options.unusedExports.length > 0) {
    lines.push('## Potentially Unused Exports\n')
    for (const exp of options.unusedExports) {
      lines.push(
        `### ${exp.name}\n`,
        `- **Type:** ${exp.type}`,
        `- **File:** ${exp.file}:${exp.line}`,
        '',
      )
    }
  }

  return lines.join('\n')
}

export function formatOutput(exports: ExportInfo[], options: FormatOptions): string {
  if (options.format === 'json') {
    return formatJson(exports, options)
  }

  if (options.format === 'markdown') {
    return formatMarkdown(exports, options)
  }

  return formatConsole(exports, options)
}
