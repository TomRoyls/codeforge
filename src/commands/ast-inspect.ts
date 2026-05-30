import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { inspectSource, filterByType } from './ast-inspect-helpers.js'
import {
  formatInspectTable,
  formatInspectJson,
} from './ast-inspect-format-helpers.js'

export default class AstInspect extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to file or directory to inspect',
      required: false,
    }),
  }

  static override description = 'Inspect AST node types and structure of source files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/utils/matrix.ts',
      description: 'Inspect AST of a single file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output AST summary as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type FunctionDeclaration',
      description: 'Filter to show only function declarations',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --verbose',
      description: 'Show all line numbers for each node type',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated file extensions to analyze',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    'max-files': Flags.integer({
      default: 20,
      description: 'Maximum number of files to inspect',
    }),
    type: Flags.string({
      char: 't',
      description: 'Filter node types by substring match',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output with all line numbers',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AstInspect)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const typeFilter = flags.type
    const verbose = flags.verbose

    const stat = await fs.stat(targetPath)

    if (stat.isFile()) {
      const content = await fs.readFile(targetPath, 'utf-8')
      const result = inspectSource(content, targetPath)
      const filtered = filterByType(result, typeFilter ?? '')
      this.log(format === 'json' ? formatInspectJson(filtered) : formatInspectTable(filtered, verbose))
      return
    }

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const extensions = flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
    const patterns = extensions.map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: defaultIgnore,
      patterns,
    })

    const filteredFiles = discoveredFiles.filter((f) => {
      const ext = resolve(f.path).slice(resolve(f.path).lastIndexOf('.')).toLowerCase()
      return extensions.includes(ext)
    })

    const filesToProcess = filteredFiles.slice(0, flags['max-files'])

    spinner.text = `Inspecting ${filesToProcess.length} files...`

    const results = []
    for (const file of filesToProcess) {
      const content = await fs.readFile(file.path, 'utf-8')
      const result = inspectSource(content, file.path)
      const filtered = filterByType(result, typeFilter ?? '')
      results.push(filtered)
    }

    spinner.stop()

    if (format === 'json') {
      this.log(JSON.stringify(results, null, 2))
    } else {
      for (const result of results) {
        this.log(formatInspectTable(result, verbose))
        this.log('')
      }
      this.log(`Total files inspected: ${results.length}`)
    }
  }
}
