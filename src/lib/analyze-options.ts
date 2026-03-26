import path from 'node:path'

import type { OutputFormat } from '../core/reporter.js'

export interface AnalysisOptions {
  ciMode: boolean
  concurrency: number
  dryRun: boolean
  failOnWarnings: boolean
  files: string[]
  format: OutputFormat
  ignore: string[]
  maxWarnings: number
  output: string | undefined
  quiet: boolean
  rules: string[] | undefined
  severityLevel: 'error' | 'info' | 'warning'
  shouldFix: boolean
  stagedMode: boolean
  verbose: boolean
}

export function parseAnalysisFlags(
  flags: Record<string, unknown>,
  _config?: unknown,
): AnalysisOptions {
  const ciMode = flags.ci as boolean
  const format = ciMode && flags.format === 'console' ? 'json' : (flags.format as OutputFormat)
  const quiet = ciMode || (flags.quiet as boolean)
  const verbose = (flags.verbose as boolean) && !ciMode
  const stagedMode = flags.staged as boolean

  const files = flags.files
    ? Array.isArray(flags.files)
      ? (flags.files as string[])
      : [flags.files as string]
    : []

  const ignore = flags.ignore
    ? Array.isArray(flags.ignore)
      ? (flags.ignore as string[])
      : [flags.ignore as string]
    : []

  return {
    ciMode,
    concurrency: flags.concurrency as number,
    dryRun: flags['dry-run'] as boolean,
    failOnWarnings: flags['fail-on-warnings'] as boolean,
    files,
    format,
    ignore,
    maxWarnings: flags['max-warnings'] as number,
    output: flags.output as string | undefined,
    quiet,
    rules: flags.rules as string[] | undefined,
    severityLevel: flags['severity-level'] as 'error' | 'info' | 'warning',
    shouldFix: flags.fix as boolean,
    stagedMode,
    verbose,
  }
}

export function filterByExtensions(
  files: { path: string }[],
  extensions: null | string[],
): typeof files {
  if (!extensions) return files

  return files.filter((f) => {
    const ext = path.extname(f.path).toLowerCase()
    return extensions.includes(ext)
  })
}
