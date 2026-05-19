import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { formatSecurityJson, formatSecurityTable } from './security-format-helpers.js'
import { buildSecurityResult } from './security-helpers.js'

export default class Security extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for security issues',
      required: false,
    }),
  }

  static override description = 'Scan source code for security anti-patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan current directory for security issues',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Scan src directory and output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Scan only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --severity high',
      description: 'Show only high and critical findings',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show matching code context and remediation',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Export results to JSON file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated file extensions to scan (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    severity: Flags.string({
      description: 'Filter by minimum severity level',
      options: ['critical', 'high', 'medium', 'low'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show matching code context',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Security)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const severity = flags.severity as 'critical' | 'high' | 'medium' | 'low' | undefined
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    spinner.text = 'Scanning for security issues...'

    const contentReader = async (filePath: string): Promise<string> => {
      try {
        return await fs.readFile(filePath, 'utf8')
      } catch {
        return ''
      }
    }

    const filePaths = discoveredFiles.map((f) => f.absolutePath)

    const result = await buildSecurityResult(filePaths, contentReader, {
      ignorePatterns: flags.ignore,
      severity,
    })

    spinner.succeed(`Scanned ${discoveredFiles.length} files, found ${result.stats.total} issues`)

    const outputData = format === 'json' ? formatSecurityJson(result) : formatSecurityTable(result, verbose)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }
  }
}

export { buildSecurityResult, computeSecurityStats, extractContext, getSecurityRules, scanFile, sortFindingsBySeverity } from './security-helpers.js'
export type { Category, ScanOptions, SecurityFinding, SecurityResult, SecurityRule, SecurityStats, Severity } from './security-helpers.js'
export { formatCategory, formatSecurityJson, formatSecurityTable } from './security-format-helpers.js'
