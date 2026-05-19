import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildAtlasResult, type AtlasResult } from './atlas-helpers.js'
import { formatAtlasJson, formatAtlasReport } from './atlas-format-helpers.js'

export default class Atlas extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to generate atlas for',
      required: false,
    }),
  }

  static override description = 'Generate a codebase atlas — bird\'s-eye view map'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate atlas for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output atlas as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed region table',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output atlas.json',
      description: 'Export atlas to file',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed region breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Atlas)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: defaultIgnore,
      patterns: [
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx',
        '**/*.json', '**/*.css', '**/*.html', '**/*.md',
        '**/*.py', '**/*.rs', '**/*.go', '**/*.java',
        '**/*.rb', '**/*.sh', '**/*.yaml', '**/*.yml',
        '**/*.sql',
      ],
    })

    spinner.text = 'Building atlas...'

    const contents = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const filePaths = discoveredFiles.map((f) => f.path)
    const result: AtlasResult = buildAtlasResult(filePaths, contents, { verbose })

    spinner.succeed(
      `Mapped ${result.stats.totalFiles} files across ${result.stats.totalRegions} regions`,
    )

    const outputData = format === 'json' ? formatAtlasJson(result) : formatAtlasReport(result, verbose)

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

export { buildAtlasResult } from './atlas-helpers.js'
export type {
  AtlasOptions,
  AtlasRegion,
  AtlasResult,
  AtlasStats,
} from './atlas-helpers.js'
export { formatAtlasJson, formatAtlasReport } from './atlas-format-helpers.js'
