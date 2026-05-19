import chalk from 'chalk'

import type { ReadmeCommand, ReadmeData, ReadmeResult, ReadmeSection } from './readme-generator-helpers.js'

// ─── Format Preview Table ───────────────────────────────

/**
 * @example
 * const table = formatReadmePreview(result)
 * console.log(table)
 */
export function formatReadmePreview(result: ReadmeResult): string {
  const lines: string[] = []

  lines.push(chalk.bold(`  ${result.data.projectName} v${result.data.version}`))
  lines.push(chalk.gray(`  ${result.data.description}`))
  lines.push('')

  if (result.data.commands.length > 0) {
    lines.push(chalk.bold('  Commands'))
    lines.push(chalk.gray('  ────────────────────────'))
    for (const cmd of result.data.commands.slice(0, 10)) {
      lines.push(`  ${chalk.cyan(cmd.name.padEnd(20))} ${cmd.description}`)
    }
    if (result.data.commands.length > 10) {
      lines.push(chalk.gray(`  ... and ${result.data.commands.length - 10} more`))
    }
    lines.push('')
  }

  if (result.data.features.length > 0) {
    lines.push(chalk.bold('  Features'))
    lines.push(chalk.gray('  ────────────────────────'))
    for (const f of result.data.features) {
      lines.push(`  ${chalk.green('✓')} ${f}`)
    }
    lines.push('')
  }

  if (result.data.techStack.length > 0) {
    lines.push(chalk.bold('  Tech Stack'))
    lines.push(chalk.gray('  ────────────────────────'))
    for (const t of result.data.techStack) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('●')} ${t}`)
    }
    lines.push('')
  }

  lines.push(chalk.bold('  Sections'))
  lines.push(chalk.gray('  ────────────────────────'))
  for (const section of result.sections) {
    lines.push(`  ${section.order}. ${section.title}`)
  }

  return lines.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatReadmeJson(result)
 * console.log(json)
 */
export function formatReadmeJson(result: ReadmeResult): string {
  return JSON.stringify(
    {
      commands: result.data.commands,
      features: result.data.features,
      projectName: result.data.projectName,
      sections: result.sections.map((s) => s.title),
      techStack: result.data.techStack,
      version: result.data.version,
    },
    null,
    2,
  )
}

// ─── Format Markdown ────────────────────────────────────

/**
 * @example
 * const md = formatReadmeMarkdown(result)
 * console.log(md)
 */
export function formatReadmeMarkdown(result: ReadmeResult): string {
  return result.markdown
}
