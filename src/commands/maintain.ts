import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { formatMaintainJson, formatMaintainTable } from './maintain-format-helpers.js'
import { buildMaintainResult } from './maintain-helpers.js'

export default class Maintain extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for maintainability',
      required: false,
    }),
  }

  static override description = 'Analyze codebase maintainability with refactoring suggestions'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze maintainability of current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 70',
      description: 'Use custom maintainability threshold',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed per-function analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Export maintainability report to file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
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
    threshold: Flags.integer({
      default: 65,
      description: 'Maintainability index threshold (0-100)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed per-function analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Maintain)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

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

    const filteredFiles = discoveredFiles.filter((f) => {
      const ext = extname(f.path).toLowerCase()
      return extensions.includes(ext)
    })

    spinner.text = `Analyzing ${filteredFiles.length} files for maintainability...`

    const filePaths = filteredFiles.map((f) => f.path)

    const result = await buildMaintainResult(
      filePaths,
      async (filePath) => {
        const absolute = resolve(targetPath, filePath)
        return fs.readFile(absolute, 'utf8')
      },
      { threshold: flags.threshold },
    )

    spinner.succeed(
      `Analyzed ${filteredFiles.length} files — Score: ${result.overallScore}/100 (Grade: ${result.grade})`,
    )

    const outputData =
      format === 'json'
        ? formatMaintainJson(result)
        : formatMaintainTable(result, flags.verbose)

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

export { analyzeFile, buildMaintainResult, computeCyclomaticComplexity, computeFunctionMI, computeMaintainabilityStats, computeNestingDepth, computeOverallScore, countParameters, findFunctions, generateFunctionIssues, generateRefactoringSuggestions } from './maintain-helpers.js'
export type { FileMaintainability, FunctionMetrics, MaintainResult, MaintainabilityStats, RawFunction, RefactoringSuggestion } from './maintain-helpers.js'
export { formatImpact, formatMaintainJson, formatMaintainTable } from './maintain-format-helpers.js'
