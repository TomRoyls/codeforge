import chalk from 'chalk'

import {
  calculateComplexitySummary,
  type ComplexityCategory,
  type FunctionComplexity,
} from '../core/complexity.js'

export { filterFilesByExtension } from '../utils/command-helpers.js'

export function buildIgnorePatterns(
  defaultIgnore: string[],
  userIgnore: string[] | undefined,
): string[] {
  if (!userIgnore) return defaultIgnore
  return [...defaultIgnore, ...userIgnore]
}

export function parseExtensions(extFlag: string): null | string[] {
  if (!extFlag) return null
  return extFlag
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
}

export function filterByThreshold(
  results: FunctionComplexity[],
  threshold: number,
): FunctionComplexity[] {
  if (threshold <= 0) return results
  return results.filter((r) => r.cyclomatic > threshold)
}

export type SortByField = 'complexity' | 'file' | 'name'

export function sortByField(
  results: FunctionComplexity[],
  sortBy: SortByField,
): FunctionComplexity[] {
  if (sortBy === 'complexity') {
    return [...results].sort((a, b) => b.cyclomatic - a.cyclomatic)
  }

  if (sortBy === 'file') {
    return [...results].sort((a, b) => a.filePath.localeCompare(b.filePath))
  }

  return [...results].sort((a, b) => a.functionName.localeCompare(b.functionName))
}

export function limitResults<T>(results: T[], limit: number): T[] {
  return results.slice(0, limit)
}

export function getCategoryColor(category: ComplexityCategory): (text: string) => string {
  const colors: Record<ComplexityCategory, (text: string) => string> = {
    extreme: chalk.magenta,
    high: chalk.red,
    low: chalk.green,
    moderate: chalk.yellow,
  }
  return colors[category] ?? chalk.white
}

export function buildJsonOutput(filtered: FunctionComplexity[]): string {
  return JSON.stringify(
    { functions: filtered, summary: calculateComplexitySummary(filtered) },
    null,
    2,
  )
}

export function formatMarkdown(results: FunctionComplexity[]): string {
  const lines = [
    '# Complexity Analysis',
    '',
    '| Function | Cyclomatic | Cognitive | Category | File |',
    '|--------|------------|-----------|----------|------|',
  ]

  for (const result of results) {
    lines.push(
      `| ${result.functionName} | ${result.cyclomatic} | ${result.cognitive} | ${result.category} | ${result.filePath} |`,
    )
  }

  const summary = calculateComplexitySummary(results)
  lines.push(
    '',
    '## Summary',
    '',
    `- **Total functions**: ${summary.totalFunctions}`,
    `- **Average cyclomatic complexity**: ${summary.averageCyclomatic.toFixed(1)}`,
    `- **Average cognitive complexity**: ${summary.averageCognitive.toFixed(1)}`,
    `- **Maximum cyclomatic complexity**: ${summary.maxCyclomatic}`,
    `- **Maximum cognitive complexity**: ${summary.maxCognitive}`,
    '',
    '## Category Breakdown',
    '',
    `- **Low**: ${summary.categoryBreakdown.low}`,
    `- **Moderate**: ${summary.categoryBreakdown.moderate}`,
    `- **High**: ${summary.categoryBreakdown.high}`,
    `- **Extreme**: ${summary.categoryBreakdown.extreme}`,
    '',
  )

  return lines.join('\n')
}

export function formatTable(results: FunctionComplexity[]): string {
  if (results.length === 0) {
    return chalk.dim('No functions found with complexity above threshold.')
  }

  const lines = [
    chalk.bold('\n📊 Complexity Analysis\n'),
    chalk.dim('─'.repeat(80)),
    '',
    chalk.dim(
      'Function'.padEnd(30) +
        'Cyclomatic'.padEnd(12) +
        'Cognitive'.padEnd(11) +
        'Category'.padEnd(12) +
        'File',
    ),
    chalk.dim('─'.repeat(80)),
    '',
  ]

  for (const result of results) {
    const categoryColor = getCategoryColor(result.category)
    lines.push(
      result.functionName.slice(0, 28).padEnd(30) +
        String(result.cyclomatic).padEnd(12) +
        String(result.cognitive).padEnd(11) +
        categoryColor(result.category.toUpperCase()).padEnd(12) +
        chalk.dim(result.filePath),
    )
  }

  const summary = calculateComplexitySummary(results)
  lines.push(
    '',
    chalk.dim('Summary:'),
    `  Total functions: ${summary.totalFunctions}`,
    `  Average cyclomatic complexity: ${summary.averageCyclomatic.toFixed(1)}`,
    `  Average cognitive complexity: ${summary.averageCognitive.toFixed(1)}`,
    `  Maximum cyclomatic complexity: ${summary.maxCyclomatic}`,
    `  Maximum cognitive complexity: ${summary.maxCognitive}`,
    '',
    chalk.dim('Category breakdown:'),
    `  ${chalk.green('Low')}: ${summary.categoryBreakdown.low}`,
    `  ${chalk.yellow('Moderate')}: ${summary.categoryBreakdown.moderate}`,
    `  ${chalk.red('High')}: ${summary.categoryBreakdown.high}`,
    `  ${chalk.magenta('Extreme')}: ${summary.categoryBreakdown.extreme}`,
    '',
  )

  return lines.join('\n')
}

export function formatOutput(results: FunctionComplexity[], format: string): string {
  if (format === 'markdown') {
    return formatMarkdown(results)
  }

  return formatTable(results)
}
