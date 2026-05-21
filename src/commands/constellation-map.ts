import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildConstellationMapResult, type ConstellationMapResult } from './constellation-map-helpers.js'
import { formatConstellationMapJson, formatConstellationMapTable } from './constellation-map-format-helpers.js'

export default class ConstellationMap extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for dependency constellations',
      required: false,
    }),
  }

  static override description = 'Map code dependencies as constellations in the sky'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Map current directory as constellations',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Map src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed star and constellation analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output map.json',
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
      description: 'Show detailed star and constellation analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConstellationMap)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Scanning star field...').start()

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
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
        '**/*.xml',
        '**/*.sql',
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

    spinner.text = 'Mapping constellations...'

    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const files = filteredFiles.map((f) => f.path)
    const result: ConstellationMapResult = buildConstellationMapResult(files, contents, { verbose, format })

    spinner.succeed(`Mapped ${result.galaxy.totalStars} stars in ${result.galaxy.totalConstellations} constellations`)

    const outputData =
      format === 'json'
        ? formatConstellationMapJson(result)
        : formatConstellationMapTable(result, verbose)

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
export type { StarNode, StarConnection, ConstellationGroup, GalacticStructure, ConstellationMapStats, ConstellationMapResult, StarPosition } from './constellation-map-helpers.js'
export { formatConstellationMapJson, formatConstellationMapTable } from './constellation-map-format-helpers.js'
