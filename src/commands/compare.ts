import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import {
  analyzeFileStats,
  buildComparisonMetrics,
  calculateSimilarity,
  type CompareResult,
} from './compare-helpers.js'
import {
  formatCompareJson,
  formatCompareSideBySide,
  formatCompareTable,
  formatDiffView,
} from './compare-format-helpers.js'

export default class Compare extends Command {
  static override args = {
    file1: Args.string({
      description: 'Path to the first file',
      required: true,
    }),
    file2: Args.string({
      description: 'Path to the second file',
      required: true,
    }),
  }

  static override description = 'Compare two files and show differences'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/index.ts src/index.old.ts',
      description: 'Compare two versions of a file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> a.ts b.ts --format json',
      description: 'Compare files and output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> a.ts b.ts --format side-by-side',
      description: 'Compare files in side-by-side view',
    },
    {
      command: '<%= config.bin %> <%= command.id %> a.ts b.ts --diff',
      description: 'Compare files with line-level diff',
    },
    {
      command: '<%= config.bin %> <%= command.id %> a.ts b.ts --verbose',
      description: 'Compare files with detailed metrics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> a.ts b.ts --format json --output report.json',
      description: 'Compare files and save JSON to file',
    },
  ]

  static override flags = {
    diff: Flags.boolean({
      default: false,
      description: 'Show line-level diff between files',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'side-by-side', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed metrics',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Compare)

    const path1 = resolve(args.file1 as string)
    const path2 = resolve(args.file2 as string)

    if (!existsSync(path1)) {
      this.error(`File not found: ${path1}`, { exit: 1 })
    }

    if (!existsSync(path2)) {
      this.error(`File not found: ${path2}`, { exit: 1 })
    }

    const spinner = ora('Comparing files...').start()

    const [file1Stats, file2Stats] = await Promise.all([
      analyzeFileStats(path1),
      analyzeFileStats(path2),
    ])

    const metrics = buildComparisonMetrics(file1Stats, file2Stats)

    const content1 = await fs.readFile(path1, 'utf8')
    const content2 = await fs.readFile(path2, 'utf8')
    const similarity = calculateSimilarity(content1, content2)

    const result: CompareResult = {
      file1: file1Stats,
      file2: file2Stats,
      metrics,
      similarity,
    }

    spinner.succeed(`Comparison complete`)

    const format = flags.format as 'json' | 'side-by-side' | 'table'
    let outputData: string

    switch (format) {
      case 'json': {
        outputData = formatCompareJson(result)
        break
      }
      case 'side-by-side': {
        outputData = formatCompareSideBySide(result)
        break
      }
      default: {
        outputData = formatCompareTable(result, flags.verbose)
        break
      }
    }

    if (flags.diff) {
      outputData += '\n' + formatDiffView(content1, content2, path1, path2)
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
  analyzeFileStats,
  buildComparisonMetrics,
  calculateSimilarity,
  type CompareResult,
  type ComparisonMetric,
  type FileStats,
} from './compare-helpers.js'
export {
  formatCompareJson,
  formatCompareSideBySide,
  formatCompareTable,
  formatDiffView,
} from './compare-format-helpers.js'
