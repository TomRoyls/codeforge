import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildMigrationResult, type MigrationResult } from './migration-helpers.js'
import { formatMigrationJson, formatMigrationTable } from './migration-format-helpers.js'

export default class Migration extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for migration patterns',
      required: false,
    }),
  }

  static override description = 'Track and analyze codebase migration patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze migration patterns in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze migration patterns in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output migration analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show all individual migration matches',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output migration.json',
      description: 'Export migration analysis to JSON file',
    },
  ]

  static override flags = {
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show all migration matches',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Migration)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for migration patterns...').start()

    const defaultIgnore = [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.git/**',
    ]
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.mjs',
        '**/*.cjs',
      ],
    })

    const filePaths = discoveredFiles.map((f) => f.absolutePath)

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result: MigrationResult = await buildMigrationResult(filePaths, contentReader, {
      verbose: flags.verbose,
    })

    spinner.succeed(
      `Analyzed ${filePaths.length} files — ${result.stats.completedMigrations}/${result.stats.totalMigrations} patterns migrated`,
    )

    const outputData =
      format === 'json' ? formatMigrationJson(result) : formatMigrationTable(result)

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

export { buildMigrationResult, computeMigrationStats, computeMigrationProgress, computeOverallProgress, getMigrationPatterns, scanForPattern } from './migration-helpers.js'
export type { MigrationMatch, MigrationOptions, MigrationPattern, MigrationProgress, MigrationResult, MigrationStats } from './migration-helpers.js'
export { buildProgressBar, formatMigrationJson, formatMigrationStats, formatMigrationTable, formatOverallProgress, formatProgressLines } from './migration-format-helpers.js'
