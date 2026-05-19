import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildLearningGuide,
  type ContentMap,
  type LearningOptions,
} from './learning-helpers.js'
import { formatLearningJson, formatLearningTable } from './learning-format-helpers.js'

/**
 * Generate a learning guide for the codebase.
 *
 * @example
 * ```sh
 * codeforge learning ./src
 * codeforge learning ./src --role junior
 * codeforge learning ./src --focus architecture
 * ```
 */
export default class Learning extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Generate a codebase learning guide'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate learning guide for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Generate guide for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --role junior',
      description: 'Tailor guide for junior developer',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --focus architecture',
      description: 'Focus on architecture layers',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show full glossary and key files',
    },
  ]

  static override flags = {
    focus: Flags.string({
      char: 'F',
      default: 'all',
      description: 'Focus area for the guide',
      options: ['all', 'architecture', 'patterns', 'workflow'],
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
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    role: Flags.string({
      char: 'r',
      default: 'mid',
      description: 'Target developer role for reading pace',
      options: ['junior', 'mid', 'senior'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show full glossary, key files, and details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Learning)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const role = flags.role as 'junior' | 'mid' | 'senior'
    const focus = flags.focus as 'architecture' | 'patterns' | 'workflow' | 'all'

    const spinner = ora('Analyzing codebase for learning guide...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    const contents: ContentMap = new Map()
    await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          contents.set(file.path, content)
        } catch {
          // skip unreadable files
        }
      }),
    )

    const filePaths = filteredFiles.map((f) => f.path)
    const options: LearningOptions = { focus, role }

    const guide = buildLearningGuide(targetPath, filePaths, contents, options)

    spinner.succeed(`Generated learning guide for ${filePaths.length} files`)

    const outputData =
      format === 'json'
        ? formatLearningJson(guide)
        : formatLearningTable(guide, flags.verbose)

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
