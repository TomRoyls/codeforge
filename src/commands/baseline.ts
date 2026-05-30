import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildBaselineResult } from './baseline-helpers.js'
import { formatBaselineJson, formatBaselineMetrics } from './baseline-format-helpers.js'

export default class Baseline extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for baseline',
      required: false,
    }),
  }

  static override description = 'Create and compare codebase baselines for drift detection'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> --action create --name v1',
      description: 'Create a named baseline',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --action compare --name v1',
      description: 'Compare current state against baseline',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --action list',
      description: 'List stored baselines',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output baseline.json',
      description: 'Export baseline as JSON',
    },
  ]

  static override flags = {
    action: Flags.string({
      char: 'a',
      default: 'create',
      description: 'Action to perform',
      options: ['compare', 'create', 'list'],
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    name: Flags.string({
      char: 'n',
      default: 'default',
      description: 'Baseline name',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Baseline)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const action = flags.action as 'compare' | 'create' | 'list'

    const spinner = ora('Analyzing codebase for baseline...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: defaultIgnore,
      patterns: [
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.json',
        '**/*.css', '**/*.html', '**/*.md', '**/*.py', '**/*.rs',
        '**/*.go', '**/*.java', '**/*.rb', '**/*.sh', '**/*.yaml',
        '**/*.yml', '**/*.xml', '**/*.sql',
      ],
    })

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result = await buildBaselineResult(discoveredFiles, contentReader, {
      action,
      name: flags.name,
      verbose: flags.verbose,
    })

    spinner.succeed(`Baseline ${action} complete for ${discoveredFiles.length} files`)

    let outputData: string

    if (result.metrics) {
      outputData = format === 'json'
        ? formatBaselineJson(result.metrics)
        : formatBaselineMetrics(result.metrics)
    } else {
      outputData = JSON.stringify({ action: result.action, names: result.names ?? [] }, null, 2)
    }

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

export {
  buildBaselineResult,
  captureMetrics,
  classifyMetricDirection,
  compareBaselines,
  computeHealthDelta,
  createBaseline,
  deserializeBaseline,
  listBaselines,
  serializeBaseline,
} from './baseline-helpers.js'
export type {
  BaselineComparison,
  BaselineDiff,
  BaselineMetrics,
  BaselineOptions,
  BaselineStore,
  ContentReader as BaselineContentReader,
  FileEntry as BaselineFileEntry,
  TopFile,
} from './baseline-helpers.js'
export {
  formatBaselineJson,
  formatBaselineMetrics,
  formatComparison,
  formatDelta,
  formatDiffTable,
  statusIcon,
} from './baseline-format-helpers.js'
