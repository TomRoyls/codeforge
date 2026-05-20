import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildArchaeologistResult, type ArchaeologistResult } from './archaeologist-helpers.js'
import { formatArchaeologistJSON, formatArchaeologistTable } from './archaeologist-format-helpers.js'

export default class Archaeologist extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to excavate',
      required: false,
    }),
  }

  static override description = 'Archaeological dig through codebase layers and history'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Excavate current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Excavate src as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx --verbose',
      description: 'Excavate TypeScript files with details',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output dig.json',
      description: 'Save excavation report',
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
    const { args, flags } = await this.parse(Archaeologist)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning files...').start()

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

    spinner.text = 'Excavating layers...'

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

    const result: ArchaeologistResult = buildArchaeologistResult(files, contents, { maxDepth: 50 })

    spinner.succeed(`Excavated ${files.length} files — ${result.stats.totalArtifacts} artifacts, ${result.stats.faultLineCount} fault lines`)

    const outputData = format === 'json' ? formatArchaeologistJSON(result) : formatArchaeologistTable(result)

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

export { buildArchaeologistResult } from './archaeologist-helpers.js'
export type { ArchaeologistResult, ArchaeologistStats, Artifact, Era, FaultLine, Stratum } from './archaeologist-helpers.js'
export { formatArchaeologistJSON, formatArchaeologistTable } from './archaeologist-format-helpers.js'
