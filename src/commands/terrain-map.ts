import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTerrainMapResult, type TerrainMapResult } from './terrain-map-helpers.js'
import { formatTerrainMapJson, formatTerrainMapTable } from './terrain-map-format-helpers.js'

export default class TerrainMap extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to map terrain topography',
      required: false,
    }),
  }

  static override description = 'Map code terrain topography — elevation, contours, features'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Map terrain of current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Map src directory terrain as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Map TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show elevation profiles',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output terrain.json',
      description: 'Export terrain map to JSON file',
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
      description: 'Show elevation profiles',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TerrainMap)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Surveying terrain...').start()

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
          .map((e: string) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f: { path: string }) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Computing elevations...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        files.push(file.path)
        contents.push('')
      }
    }

    const result: TerrainMapResult = buildTerrainMapResult(files, contents, { verbose })

    spinner.succeed(`Mapped ${files.length} terrain point(s)`)

    const outputData = format === 'json'
      ? formatTerrainMapJson(result)
      : formatTerrainMapTable(result, verbose)

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

export { buildTerrainMapResult } from './terrain-map-helpers.js'
export type { ContourLine, ElevationProfile, TerrainMapOptions, TerrainMapResult, TerrainMapStats, TerrainPoint, TopographicFeature } from './terrain-map-helpers.js'
export { formatTerrainMapJson, formatTerrainMapTable } from './terrain-map-format-helpers.js'
