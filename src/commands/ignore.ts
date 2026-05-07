import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { access, readFile, writeFile } from 'node:fs/promises'

import {
  addPatternToContent,
  extractPatterns as extractPatternsHelper,
  formatAddResult,
  formatDuplicateWarning,
  formatNoFileMessage,
  formatPatternList,
  formatRemoveResult,
  isDuplicatePattern,
  removePatternFromContent,
  resolveIgnoreOptions,
  type IgnoreOptions,
} from './ignore-helpers.js'

export default class Ignore extends Command {
  static override args = {
    action: Args.string({
      default: 'list',
      description: 'Action to perform',
      options: ['add', 'list', 'remove'],
    }),
    pattern: Args.string({
      description: 'Pattern to add or remove',
      required: false,
    }),
  }

  static override description = 'Manage ignore patterns for CodeForge analysis'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> add "node_modules/**"',
      description: 'Add a pattern to the ignore file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> remove "dist/**"',
      description: 'Remove a pattern from the ignore file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> list',
      description: 'List current ignore patterns',
    },
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List current ignore patterns (default)',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --file .customignore',
      description: 'Use custom ignore file',
    },
  ]

  static override flags = {
    file: Flags.string({
      char: 'f',
      default: '.codeforgeignore',
      description: 'Path to ignore file',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Ignore)

    const options: IgnoreOptions = resolveIgnoreOptions(args, flags)

    if (options.action === 'add') {
      if (!options.pattern) {
        this.error(chalk.red('Pattern is required for add action'))
      }

      await this.addPattern(options.file, options.pattern!)
    } else if (options.action === 'remove') {
      if (!options.pattern) {
        this.error(chalk.red('Pattern is required for remove action'))
      }

      await this.removePattern(options.file, options.pattern!)
    } else {
      await this.listPatterns(options.file)
    }
  }

  private async addPattern(filePath: string, pattern: string): Promise<void> {
    try {
      const content = await this.readFileContent(filePath)
      const lines = content.split('\n')

      if (isDuplicatePattern(lines, pattern)) {
        formatDuplicateWarning(pattern, (msg) => this.log(msg))
        return
      }

      const newContent = addPatternToContent(content, pattern)
      await writeFile(filePath, newContent, 'utf8')

      formatAddResult(pattern, filePath, (msg) => this.log(msg))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.error(chalk.red(`Failed to add pattern: ${message}`))
    }
  }

  private extractPatterns(content: string): string[] {
    return extractPatternsHelper(content)
  }

  private async listPatterns(filePath: string): Promise<void> {
    try {
      await access(filePath)
    } catch {
      formatNoFileMessage(filePath, (msg) => this.log(msg))
      return
    }

    try {
      const content = await readFile(filePath, 'utf8')
      const patterns = this.extractPatterns(content)

      formatPatternList(patterns, filePath, (msg) => this.log(msg))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.error(chalk.red(`Failed to read ignore file: ${message}`))
    }
  }

  private async readFileContent(filePath: string): Promise<string> {
    try {
      await access(filePath)
      return await readFile(filePath, 'utf8')
    } catch {
      return ''
    }
  }

  private async removePattern(filePath: string, pattern: string): Promise<void> {
    try {
      const content = await this.readFileContent(filePath)

      if (content.trim() === '') {
        this.error(chalk.red(`Pattern "${pattern}" not found (file is empty or doesn't exist)`))
      }

      const result = removePatternFromContent(content, pattern)

      if (!result.found) {
        this.error(chalk.red(`Pattern "${pattern}" not found in ignore file`))
      }

      await writeFile(filePath, result.content, 'utf8')

      formatRemoveResult(pattern, filePath, (msg) => this.log(msg))
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }

      const message = error instanceof Error ? error.message : 'Unknown error'
      this.error(chalk.red(`Failed to remove pattern: ${message}`))
    }
  }
}
