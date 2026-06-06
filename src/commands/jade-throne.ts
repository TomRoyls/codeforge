// ─── Imports ───────────────────────────────────────────────────────
import { Command, Flags, Args } from '@oclif/core'
import fg from 'fast-glob'
import ora from 'ora'
import {
  buildJadeThroneResult,
  gatherFiles,
} from './jade-throne-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './jade-throne-format-helpers.js'

/**
 * @example
 * codeforge jade-throne ./src
 */
export default class JadeThrone extends Command {
  static override description = 'Analyze code wisdom-depth, throne-authority, carving-precision, jade-purity, and dynasty-endurance'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze the src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output analysis results as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --ignore "**/test/**"',
      description: 'Ignore test directory during analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
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
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    ext: Flags.string({
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
      default: '',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  static override args = {
    path: Args.string({ description: 'Directory to analyze', required: true }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(JadeThrone)
    const spinner = ora('Scanning jade throne...').start()

    try {
      const extensions = flags.ext
        ? flags.ext.split(',').map((e: string) => e.trim()).filter(Boolean)
        : []
      const ignorePatterns = flags.ignore
        ? [...flags.ignore, '**/node_modules/**']
        : ['**/node_modules/**']

      const files = extensions.length > 0
        ? await gatherFiles(args.path, extensions, ignorePatterns)
        : await fg('**/*.ts', { cwd: args.path, absolute: true, ignore: ignorePatterns })

      if (files.length === 0) {
        spinner.warn('No files found')
        return
      }

      const contents: string[] = []
      for (const file of files) {
        const fs = await import('node:fs')
        contents.push(fs.readFileSync(file, 'utf-8'))
      }

      spinner.text = 'Computing jade throne analysis...'
      const result = await buildJadeThroneResult(
        Array.from(files),
        contents,
        { ext: flags.ext, verbose: flags.verbose },
      )
      spinner.succeed('Jade throne analysis complete')

      const outputData = flags.format === 'json'
        ? formatResultJson(result)
        : formatResultTable(result)

      if (flags.output) {
        const nodeFs = await import('node:fs/promises')
        await nodeFs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } else {
        this.log(outputData)
      }
    } catch (error) {
      spinner.fail('Jade throne analysis failed')
      this.error(String(error))
    }
  }
}
