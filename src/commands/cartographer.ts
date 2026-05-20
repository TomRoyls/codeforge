import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildCartographerResult, type CartographerOptions, type CartographerResult } from './cartographer-helpers.js'
import { formatCartographerJSON, formatCartographerTable } from './cartographer-format-helpers.js'

export default class Cartographer extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to map',
      required: false,
    }),
  }

  static override description = 'Map codebase territories, regions, and rivers'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Map current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Map src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed territory info',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Map only TypeScript files',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to map (e.g., ".ts,.tsx")',
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
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Cartographer)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const options: CartographerOptions = { verbose: flags.verbose }

    const spinner = ora('Surveying codebase...').start()

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
        '**/*.json',
        '**/*.css',
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Mapping territories...'

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

    const result: CartographerResult = buildCartographerResult(files, contents, options)

    spinner.succeed(`Map complete — ${result.stats.totalTerritories} territories across ${result.stats.totalRegions} regions`)

    const outputData = format === 'json' ? formatCartographerJSON(result) : formatCartographerTable(result)

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

export { buildCartographerResult, mapTerritory, mapRegion, classifyBiome, extractImports, extractExports, computeComplexity, countPopulation, computeCommentRatio, traceRivers, computeMapCompleteness, buildRegions, generateCartographerRecommendations } from './cartographer-helpers.js'
export type { River, Territory, MapRegion, CartographerStats, CartographerResult, CartographerOptions } from './cartographer-helpers.js'
export { formatCartographerJSON, formatCartographerTable, formatTerritoryMap, formatElevationProfile, formatBiomeDistribution, formatRegionOverview, formatLegend, formatCartographerStats, formatCartographerRecommendations, getBiomeColor, getBiomeSymbol } from './cartographer-format-helpers.js'
