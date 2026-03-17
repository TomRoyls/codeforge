import type { Reporter, ReporterFactory, ReporterOptions, ReporterRegistryEntry } from './types.js'

import { ConsoleReporter } from './console-reporter.js'
import { CSVReporter } from './csv-reporter.js'
import { GitLabReporter } from './gitlab-reporter.js'
import { HTMLReporter } from './html-reporter.js'
import { JSONReporter } from './json-reporter.js'
import { JUnitReporter } from './junit-reporter.js'
import { MarkdownReporter } from './markdown-reporter.js'
import { SARIFReporter } from './sarif-reporter.js'

export { ConsoleReporter } from './console-reporter.js'
export { CSVReporter } from './csv-reporter.js'
export { GitLabReporter } from './gitlab-reporter.js'
export { HTMLReporter } from './html-reporter.js'
export { JSONReporter } from './json-reporter.js'
export { JUnitReporter } from './junit-reporter.js'
export { MarkdownReporter } from './markdown-reporter.js'
export { SARIFReporter } from './sarif-reporter.js'
export * from './types.js'

const reporterRegistry = new Map<string, ReporterRegistryEntry>()

function initializeDefaultReporters(): void {
  registerReporter({
    description: 'Console output with colors and formatting',
    factory: (options: ReporterOptions) => new ConsoleReporter(options),
    name: 'console',
  })

  registerReporter({
    description: 'JSON output for programmatic consumption',
    factory: (options: ReporterOptions) => new JSONReporter(options),
    name: 'json',
  })

  registerReporter({
    description: 'Standalone HTML report with interactive features',
    factory: (options: ReporterOptions) => new HTMLReporter(options),
    name: 'html',
  })

  registerReporter({
    description: 'JUnit XML format for CI/CD test aggregation',
    factory: (options: ReporterOptions) => new JUnitReporter(options),
    name: 'junit',
  })

  registerReporter({
    description: 'SARIF format for GitHub Code Scanning',
    factory: (options: ReporterOptions) => new SARIFReporter(options),
    name: 'sarif',
  })

  registerReporter({
    description: 'Markdown format for documentation',
    factory: (options: ReporterOptions) => new MarkdownReporter(options),
    name: 'markdown',
  })

  registerReporter({
    description: 'GitLab Code Quality report format',
    factory: (options: ReporterOptions) => new GitLabReporter(options),
    name: 'gitlab',
  })

  registerReporter({
    description: 'CSV format for spreadsheet import and data analysis',
    factory: (options: ReporterOptions) => new CSVReporter(options),
    name: 'csv',
  })
}

export function registerReporter(entry: ReporterRegistryEntry): void {
  reporterRegistry.set(entry.name, entry)
}

export function getReporter(name: string, options: ReporterOptions = {}): Reporter {
  const entry = reporterRegistry.get(name)

  if (!entry) {
    const available = [...reporterRegistry.keys()].join(', ')
    throw new Error(`Unknown reporter: "${name}". Available reporters: ${available}`)
  }

  return entry.factory(options)
}

export function hasReporter(name: string): boolean {
  return reporterRegistry.has(name)
}

export function listReporters(): ReporterRegistryEntry[] {
  return [...reporterRegistry.values()]
}

export function getReporterFactory(name: string): ReporterFactory | undefined {
  const entry = reporterRegistry.get(name)
  return entry?.factory
}

initializeDefaultReporters()
