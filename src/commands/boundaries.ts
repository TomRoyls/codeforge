import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildBoundariesResult } from './boundaries-helpers.js'
import { formatBoundariesCsv, formatBoundariesJson, formatBoundariesResultTable } from './boundaries-format-helpers.js'

export default class Boundaries extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to check module boundaries',
      required: false,
    }),
  }

  static override description = 'Check and enforce module boundary rules'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Check boundaries in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Check boundaries as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show all violations with details',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output boundaries.csv',
      description: 'Export violations to CSV',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show all violations with details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Boundaries)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
      ],
    })

    spinner.text = 'Checking module boundaries...'

    const filePaths: string[] = []
    const contents: string[] = []

    await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          filePaths.push(file.path)
          contents.push(content)
        } catch {
          // skip unreadable files
        }
      }),
    )

    const result = buildBoundariesResult(filePaths, contents, { verbose })

    spinner.succeed(`Checked ${result.stats.totalModules} modules — compliance: ${result.stats.complianceScore}/100 (${result.stats.violationsCount} violations)`)

    const outputData =
      format === 'json'
        ? formatBoundariesJson(result)
        : format === 'csv'
          ? formatBoundariesCsv(result)
          : formatBoundariesResultTable(result, verbose)

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

export { buildBoundariesResult, checkBoundaries, computeComplianceScore, computeModuleHealth, detectBoundaryViolation, discoverModules, generateRecommendations, generateSuggestion, getLayer, getModuleForFile, inferBoundaryRules, extractImports, resolvePath } from './boundaries-helpers.js'
export type { BoundaryCheck, BoundaryRule, BoundaryViolation, BoundariesOptions, BoundariesResult, BoundariesStats, ModuleDefinition, ModuleHealth } from './boundaries-helpers.js'
export { formatBoundaryMatrix, formatBoundariesCsv, formatBoundariesJson, formatBoundariesRecommendations, formatBoundariesResultTable, formatBoundariesStatsLine, formatComplianceGauge, formatModuleHealth, formatViolationsTable } from './boundaries-format-helpers.js'
