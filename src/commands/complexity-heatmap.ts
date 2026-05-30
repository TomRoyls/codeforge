import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  analyzeFileHeatmap,
  buildHeatmapResult,
  filterByMinComplexity,
  takeTopFiles,
} from './complexity-heatmap-helpers.js'
import {
  formatHeatmapJson,
  formatHeatmapTable,
  generateHeatmapBar,
} from './complexity-heatmap-format-helpers.js'
import type { HeatmapTableResult, HeatmapTableRow } from './complexity-heatmap-format-helpers.js'

export default class ComplexityHeatmap extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for complexity heatmap',
      required: false,
    }),
  }

  static override description = 'Generate a visual terminal heatmap of code complexity distribution'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show complexity heatmap for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output complexity heatmap as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10 --min-complexity 3',
      description: 'Show top 10 files with complexity >= 3',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --width 60',
      description: 'Use wider heatmap bars (60 chars)',
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
    'min-complexity': Flags.integer({
      default: 1,
      description: 'Minimum total file complexity to include',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    top: Flags.integer({
      default: 20,
      description: 'Show only top N most complex files',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
    width: Flags.integer({
      default: 40,
      description: 'Width of heatmap bars in characters',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ComplexityHeatmap)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { top, verbose, width } = flags
    const minComplexity = flags['min-complexity']

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

    const filteredFiles = extensions.length > 0
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing file complexity...'

    const fileResults = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          return analyzeFileHeatmap(content, file.path)
        } catch {
          return {
            filePath: file.path,
            functionCount: 0,
            maxFunctionComplexity: 0,
            riskLevel: 'low' as const,
            totalComplexity: 0,
          }
        }
      }),
    )

    let result = buildHeatmapResult(fileResults)

    result = {
      ...result,
      files: filterByMinComplexity(result.files, minComplexity),
    }

    if (top > 0) {
      result = {
        ...result,
        files: takeTopFiles(result.files, top),
      }
    }

    const totalFilesInResult = result.files.length
    const totalComplexityInResult = result.files.reduce((sum, f) => sum + f.totalComplexity, 0)
    const avgComplexity = totalFilesInResult > 0 ? totalComplexityInResult / totalFilesInResult : 0

    const riskDistribution = result.riskDistribution

    const tableRows: HeatmapTableRow[] = result.files.map((file) => ({
      filePath: file.filePath,
      totalComplexity: file.totalComplexity,
      functionCount: file.functionCount,
      maxFunctionComplexity: file.maxFunctionComplexity,
      heatmapBar: generateHeatmapBar(file.totalComplexity, result.maxFileComplexity, width),
      riskLevel: file.riskLevel,
    }))

    const tableResult: HeatmapTableResult = {
      rows: tableRows,
      totalFiles: totalFilesInResult,
      totalComplexity: totalComplexityInResult,
      averageComplexity: avgComplexity,
      riskDistribution,
    }

    spinner.succeed(`Analyzed ${filteredFiles.length} files, showing ${totalFilesInResult} in heatmap`)

    if (verbose) {
      this.log(`  Min complexity: >= ${minComplexity}`)
      if (top > 0) this.log(`  Showing top: ${top}`)
      this.log(`  Heatmap width: ${width}`)
    }

    const outputData =
      format === 'json'
        ? formatHeatmapJson(tableResult)
        : formatHeatmapTable(tableResult, width)

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
