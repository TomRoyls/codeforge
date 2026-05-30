import chalk from 'chalk'

import type { CommandCategory, CommandEntry, InteractiveMenu, InteractiveResult } from './interactive-menu-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Helpers ────────────────────────────────────────────

// ─── formatCategoryHeader ───────────────────────────────

/**
 * Format a category header line.
 *
 * @example
 * ```ts
 * formatCategoryHeader({ name: 'Metrics', icon: '📊', commands: [] })
 * ```
 */
export function formatCategoryHeader(category: CommandCategory): string {
  return `${category.icon} ${chalk.bold(category.name)} (${category.commands.length})`
}

// ─── formatCommandRow ───────────────────────────────────

/**
 * Format a single command as a table row.
 *
 * @example
 * ```ts
 * formatCommandRow(entry, 20)
 * ```
 */
export function formatCommandRow(entry: CommandEntry, nameWidth: number): string {
  const name = chalk.cyan(padRight(entry.name, nameWidth))
  const desc = chalk.gray(entry.description)
  const flags = entry.flags.length > 0 ? chalk.yellow(` [${entry.flags.join(', ')}]`) : ''
  return `  ${name} ${desc}${flags}`
}

// ─── formatMenuForDisplay ───────────────────────────────

/**
 * Format the full interactive menu for terminal display.
 *
 * @example
 * ```ts
 * const output = formatMenuForDisplay(menu)
 * ```
 */
export function formatMenuForDisplay(menu: InteractiveMenu): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold('  ╔══════════════════════════════════════════╗'))
  lines.push(chalk.bold('  ║') + chalk.bold.cyan('     CodeForge Interactive Menu') + chalk.bold('           ║'))
  lines.push(chalk.bold('  ╚══════════════════════════════════════════╝'))
  lines.push('')
  lines.push(`  ${chalk.gray('Commands:')} ${chalk.white(String(menu.totalCommands))} | ${chalk.gray('Categories:')} ${chalk.white(String(menu.totalCategories))}`)
  lines.push('')

  if (menu.recentCommands.length > 0) {
    lines.push(chalk.bold('  Recent'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const cmd of menu.recentCommands) {
      lines.push(`  ${chalk.green('→')} ${chalk.cyan(cmd)}`)
    }
    lines.push('')
  }

  for (const category of menu.categories) {
    lines.push(`  ${formatCategoryHeader(category)}`)
    lines.push(chalk.gray('  ───────────────────────────────────'))

    const maxNameLen = Math.max(...category.commands.map((c) => c.name.length), 8)
    for (const cmd of category.commands) {
      lines.push(formatCommandRow(cmd, maxNameLen))
    }
    lines.push('')
  }

  lines.push(chalk.gray('  Run `codeforge <command> --help` for details'))
  lines.push('')

  return lines.join('\n')
}

// ─── formatMenuJson ─────────────────────────────────────

/**
 * Format the interactive result as JSON.
 *
 * @example
 * ```ts
 * const json = formatMenuJson(result)
 * ```
 */
export function formatMenuJson(result: InteractiveResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── formatQuickRef ─────────────────────────────────────

/**
 * Format a quick reference table of all commands.
 *
 * @example
 * ```ts
 * const ref = formatQuickRef(entries)
 * ```
 */
export function formatQuickRef(entries: CommandEntry[]): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold('  Quick Reference'))
  lines.push(chalk.gray('  ───────────────────────────────────'))

  const maxName = Math.max(...entries.map((e) => e.name.length), 4)
  for (const entry of entries) {
    const name = chalk.cyan(padRight(entry.name, maxName))
    const cat = chalk.gray(`[${entry.category}]`)
    lines.push(`  ${name} ${cat} ${chalk.gray(entry.description)}`)
  }
  lines.push('')

  return lines.join('\n')
}
