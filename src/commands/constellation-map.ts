import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildConstellationMapResult,
  type ConstellationMapOptions,
  type ConstellationMapResult,
} from './constellation-map-helpers.js'
import { formatConstellationMapJson, formatConstellationMapTable } from './constellation-map-format-helpers.js'

export default class ConstellationMap extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Create a navigational star chart of the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> constellation-map',
      description: 'Map codebase constellations',
    },
    {
      command: '<%= config.bin %> constellation-map ./src --format json',
      description: 'Map as JSON',
    },
    {
      command: '<%= config.bin %> constellation-map --verbose',
      description: 'Detailed star chart',
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
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConstellationMap)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const options: ConstellationMapOptions = { verbose: flags.verbose }

    const spinner = ora('Scanning star field...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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

    spinner.text = 'Mapping constellations...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const files = filteredFiles.map((f) => f.path)

    const result: ConstellationMapResult = buildConstellationMapResult(files, contents, options)

    spinner.succeed(`Mapped ${result.stats.totalStars} stars in ${result.stats.totalConstellations} constellations`)

    const outputData = format === 'json' ? formatConstellationMapJson(result) : formatConstellationMapTable(result)

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

export { buildConstellationMapResult } from './constellation-map-helpers.js'
export type { ConstellationMapResult, ConstellationMapStats, Star, ConstellationGroup, NavigationPath, StarConnection } from './constellation-map-helpers.js'
export { formatConstellationMapJson, formatConstellationMapTable } from './constellation-map-format-helpers.js'
