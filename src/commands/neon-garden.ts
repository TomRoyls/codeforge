// ─── Imports ───────────────────────────────────────────────────────
import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildNeonGardenResult, gatherFiles } from './neon-garden-helpers.js'
import type { NeonGardenResult } from './neon-garden-helpers.js'
import { formatResultJson, formatResultTable } from './neon-garden-format-helpers.js'

export default class NeonGarden extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for neon garden quality',
      required: false,
    }),
  }

  static override description = 'Analyze code luminosity-quality/structure-vibrancy/glow-consistency/bloom-diversity/root-brightness'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze neon garden quality in current directory',
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
      description: 'Show detailed bloom breakdown',
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
      description: 'Show detailed bloom breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(NeonGarden)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering neon blooms...').start()

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

    spinner.text = 'Scanning the neon garden...'

    const contents = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          return await fs.readFile(resolve(targetPath, file), 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: NeonGardenResult = await buildNeonGardenResult(
      discoveredFiles,
      contents,
      { verbose },
    )

    spinner.succeed(`Analyzed ${result.stats.totalFiles} files across ${result.stats.totalBeds} bed(s) — brilliance: ${result.stats.overallBrilliance}`)

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

export { buildNeonGardenResult, gatherFiles } from './neon-garden-helpers.js'
export type { NeonGardenResult, NeonBloom, NeonBed } from './neon-garden-helpers.js'
export { formatResultJson, formatResultTable } from './neon-garden-format-helpers.js'
