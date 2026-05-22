import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildAuroraCurtainResult,
  type AuroraCurtainResult,
} from './aurora-curtain-helpers.js'
import { formatAuroraCurtainJson, formatAuroraCurtainTable } from './aurora-curtain-format-helpers.js'

export default class AuroraCurtain extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze aurora curtain patterns',
      required: false,
    }),
  }

  static override description = 'Analyze code radiance, pattern, flow, energy, and illumination like a curtain of aurora light'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze aurora curtain in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze aurora curtain in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output aurora.json',
      description: 'Export aurora curtain analysis to JSON file',
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
      description: 'Show per-file breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AuroraCurtain)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.json',
        '**/*.css', '**/*.html', '**/*.md', '**/*.py', '**/*.rs',
        '**/*.go', '**/*.java', '**/*.rb', '**/*.sh',
        '**/*.yaml', '**/*.yml', '**/*.xml', '**/*.sql',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discoveredFiles

    spinner.text = 'Analyzing aurora curtain...'

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

    const result: AuroraCurtainResult = buildAuroraCurtainResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.displays.length} curtain displays`)

    const outputData =
      format === 'json'
        ? formatAuroraCurtainJson(result)
        : formatAuroraCurtainTable(result, verbose)

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

export { buildAuroraCurtainResult } from './aurora-curtain-helpers.js'
export type { AuroraCurtainResult, CurtainRay, CurtainDisplay, EmissionMeasure, PatternMeasure, EnergyMeasure, ColorMeasure, MovementMeasure, IlluminationMeasure } from './aurora-curtain-helpers.js'
export { formatAuroraCurtainJson, formatAuroraCurtainTable } from './aurora-curtain-format-helpers.js'
