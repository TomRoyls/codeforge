import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTerrainResult, type TerrainResult } from './terrain-helpers.js'
import { formatTerrainJSON, formatTerrainTable } from './terrain-format-helpers.js'

export default class Terrain extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to map',
      required: false,
    }),
  }

  static override description = 'Map codebase as terrain with elevation, features, and danger zones'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Map current directory as terrain',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output terrain as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Map only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed terrain analysis',
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
      description: 'Show detailed terrain analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Terrain)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Discovering terrain...').start()

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

    spinner.text = 'Analyzing terrain features...'

    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: TerrainResult = buildTerrainResult(
      filteredFiles.map((f) => f.path),
      contents,
      { verbose: flags.verbose },
    )

    spinner.succeed(`Terrain mapped: ${result.stats.totalFiles} tiles, ${result.features.length} features, avg elevation ${result.stats.averageElevation}`)

    const outputData = format === 'json' ? formatTerrainJSON(result) : formatTerrainTable(result)

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

export { buildTerrainResult } from './terrain-helpers.js'
export type { DangerLevel, FeatureType, TerrainFeature, TerrainResult, TerrainStats, TerrainTile, TerrainType } from './terrain-helpers.js'
export { formatTerrainJSON, formatTerrainTable } from './terrain-format-helpers.js'
