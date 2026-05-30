import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildAnnotateResult,
  type AnnotateResult,
} from './annotate-helpers.js'
import { formatAnnotateJson, formatAnnotateTable } from './annotate-format-helpers.js'

export default class Annotate extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for code annotations',
      required: false,
    }),
  }

  static override description = 'Analyze code annotations (TODO, FIXME, HACK, etc.)'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze annotations in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze annotations in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze annotations for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type todo',
      description: 'Show only TODO annotations',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sort severity',
      description: 'Sort annotations by severity',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show full annotation text with context',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output annotations.json',
      description: 'Export annotations to JSON file',
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
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    sort: Flags.string({
      default: 'count',
      description: 'Sort results by metric',
      options: ['count', 'file', 'severity', 'type'],
    }),
    type: Flags.string({
      description: 'Filter by annotation type',
      options: ['bug', 'changed', 'fixme', 'hack', 'idea', 'note', 'optimize', 'review', 'todo', 'xxx'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show full annotation text with context',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Annotate)

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
      patterns: ['**/*'],
    })

    const extensions = flags.ext
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing annotations...'

    const contentReader = async (filePath: string) => {
      const file = filteredFiles.find((f) => f.path === filePath)
      if (file) return fs.readFile(file.absolutePath, 'utf8')
      return fs.readFile(resolve(targetPath, filePath), 'utf8')
    }

    const filePaths = filteredFiles.map((f) => f.path)

    const result: AnnotateResult = await buildAnnotateResult(filePaths, contentReader, {
      type: flags.type,
    })

    spinner.succeed(
      `Found ${result.stats.total} annotations across ${filteredFiles.length} files`,
    )

    const outputData =
      format === 'json' ? formatAnnotateJson(result) : formatAnnotateTable(result, verbose)

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

export { buildAnnotateResult, extractAnnotations, filterByType, getAnnotationTypes, sortAnnotations, computeAnnotationStats, getContext } from './annotate-helpers.js'
export type { Annotation, AnnotateOptions, AnnotateResult, AnnotationStats, AnnotationTypeMetadata, AnnotationTypeStats, FileAnnotations } from './annotate-helpers.js'
export { formatAnnotateJson, formatAnnotateTable, formatAnnotationType, formatSeverity } from './annotate-format-helpers.js'
