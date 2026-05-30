import chalk from 'chalk'

import type { CodeForgeConfig, ConfigFile } from './config-helpers.js'
import { DEFAULT_CONFIG } from './config-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

/**
 * Format a ConfigFile as a colorized table.
 *
 * Shows config source, file path, and a Key|Value|Source table.
 * User-overridden values appear in cyan, defaults in gray.
 *
 * @example
 * ```ts
 * const output = formatConfigTable(configFile)
 * console.log(output)
 * ```
 *
 * @param configFile - The config file to format
 * @returns Formatted table string
 */
export function formatConfigTable(configFile: ConfigFile): string {
  const { config, path, source } = configFile
  const lines: string[] = [chalk.bold('\n⚙  CodeForge Configuration'), '']

  lines.push(`  Source: ${chalk.cyan(source)}`)
  lines.push(`  Path:   ${chalk.dim(path)}`)
  lines.push('')

  const keys = Object.keys(DEFAULT_CONFIG) as Array<keyof CodeForgeConfig>
  const colKey = Math.max(14, ...keys.map((k) => k.length))
  const colSource = 8

  const header =
    chalk.cyan(padRight('Key', colKey)) +
    '  ' +
    chalk.cyan('Value') +
    '  ' +
    chalk.cyan(padRight('Source', colSource))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(60)))

  for (const key of keys) {
    const value = config[key]
    const defaultValue = DEFAULT_CONFIG[key]
    const isOverridden = JSON.stringify(value) !== JSON.stringify(defaultValue)

    const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
    const valueStr = isOverridden ? chalk.cyan(displayValue) : chalk.gray(displayValue)
    const sourceStr = isOverridden ? chalk.cyan(padRight('user', colSource)) : chalk.gray(padRight('default', colSource))

    lines.push(padRight(key, colKey) + '  ' + valueStr + '  ' + sourceStr)
  }

  lines.push(chalk.dim('─'.repeat(60)))
  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format a ConfigFile as pretty-printed JSON.
 *
 * @example
 * ```ts
 * const output = formatConfigJson(configFile)
 * console.log(output)
 * ```
 *
 * @param configFile - The config file to format
 * @returns JSON string
 */
export function formatConfigJson(configFile: ConfigFile): string {
  return JSON.stringify(
    {
      config: configFile.config,
      exists: configFile.exists,
      path: configFile.path,
      source: configFile.source,
    },
    null,
    2,
  )
}

// ─── Diff formatting ────────────────────────────────────

/**
 * Show only user-modified values compared to defaults.
 *
 * @example
 * ```ts
 * const output = formatConfigDiff(config, DEFAULT_CONFIG)
 * // Only shows keys that differ from defaults
 * ```
 *
 * @param config - Current config
 * @param defaults - Default config to compare against
 * @returns Formatted diff string showing only changed values
 */
export function formatConfigDiff(config: CodeForgeConfig, defaults: CodeForgeConfig): string {
  const lines: string[] = [chalk.bold('\n⚙  Configuration Diff (user overrides)'), '']

  const keys = Object.keys(defaults) as Array<keyof CodeForgeConfig>
  let hasDiff = false

  for (const key of keys) {
    const currentVal = config[key]
    const defaultVal = defaults[key]

    if (JSON.stringify(currentVal) !== JSON.stringify(defaultVal)) {
      hasDiff = true
      const displayCurrent = Array.isArray(currentVal) ? currentVal.join(', ') : String(currentVal)
      const displayDefault = Array.isArray(defaultVal) ? defaultVal.join(', ') : String(defaultVal)

      lines.push(`  ${chalk.cyan(key)}:`)
      lines.push(`    ${chalk.green('+ ' + displayCurrent)}`)
      lines.push(`    ${chalk.red('- ' + displayDefault)}`)
    }
  }

  if (!hasDiff) {
    lines.push(chalk.gray('  No user overrides — using all defaults'))
  }

  return lines.join('\n')
}
