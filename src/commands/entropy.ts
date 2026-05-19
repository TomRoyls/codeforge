import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildEntropyResult, type EntropyResult } from './entropy-helpers.js'
import { formatEntropyCsv, formatEntropyJson, formatEntropyResultTable } from './entropy-format-helpers.js'

export default class Entropy extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code entropy',
      required: false,
    }),
  }

  static override description = 'Measure code entropy — disorder and randomness in the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze entropy in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output entropy as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show entropy spectrum visualization',
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
      description: 'Show entropy spectrum visualization',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Entropy)

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
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = '.' + f.path.split('.').pop()
          return extensions.includes(ext!)
        })
      : discoveredFiles

    spinner.text = 'Computing entropy...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result: EntropyResult = buildEntropyResult(files, contents, { verbose })

    spinner.succeed(`Analyzed ${result.stats.totalFiles} files (avg entropy: ${result.stats.averageEntropy})`)

    const outputData =
      format === 'json'
        ? formatEntropyJson(result)
        : format === 'csv'
          ? formatEntropyCsv(result)
          : formatEntropyResultTable(result, verbose)

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

export { buildEntropyResult, computeShannonEntropy, computeCharacterEntropy, computeTokenEntropy, computeLineLengthEntropy, computeNamingEntropy, computeOverallEntropy, classifyEntropy, computeDistribution, detectAnomalies, computeEntropyStats, generateEntropyRecommendations } from './entropy-helpers.js'
export type { EntropyResult, FileEntropy, EntropyMetrics, EntropyDistribution, EntropyStats, EntropyOptions } from './entropy-helpers.js'
export { formatEntropyCsv, formatEntropyJson, formatEntropyResultTable, formatEntropyTable, formatDistributionHistogram, formatAnomalousFiles, formatEntropySpectrum, formatStatsLine } from './entropy-format-helpers.js'
