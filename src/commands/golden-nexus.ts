// ─── Imports ───────────────────────────────────────────────────────
import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import ora from 'ora'
import { resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { buildGoldenNexusResult, gatherFiles } from './golden-nexus-helpers.js'
import type { GoldenNexusResult } from './golden-nexus-helpers.js'
import { formatResultJson, formatResultTable } from './golden-nexus-format-helpers.js'

export default class GoldenNexus extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for golden nexus quality',
      required: false,
    }),
  }

  static override description = 'Analyze code radiant-clarity/connection-strength/nexus-precision/field-resilience/core-wisdom'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze golden nexus quality in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed thread breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Export results to JSON file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed thread breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(GoldenNexus)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering golden threads...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      ? flags.ext.split(',').map(e => e.trim()).filter(Boolean)
      : []

    const discoveredFiles = extensions.length > 0
      ? await gatherFiles(targetPath, extensions, ignore)
      : (await discoverFiles({
          cwd: targetPath,
          ignore,
          patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        })).map(f => f.path)

    if (discoveredFiles.length === 0) {
      spinner.warn('No files found to analyze')
      return
    }

    spinner.text = 'Weaving golden threads...'

    const contents = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          return await fs.readFile(resolve(targetPath, file), 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: GoldenNexusResult = await buildGoldenNexusResult(
      discoveredFiles,
      contents,
      { verbose },
    )

    spinner.succeed(`Analyzed ${result.stats.totalFiles} files across ${result.stats.totalWebs} web(s) — radiance: ${result.stats.overallRadiance}`)

    const outputData = format === 'json'
      ? formatResultJson(result)
      : formatResultTable(result)

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

export { buildGoldenNexusResult, gatherFiles } from './golden-nexus-helpers.js'
export type { GoldenNexusResult, GoldenThread, GoldenWeb } from './golden-nexus-helpers.js'
export { formatResultJson, formatResultTable } from './golden-nexus-format-helpers.js'
