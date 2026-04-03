/**
 * Ignore command - manages .codeforgeignore files.
 *
 * Provides functionality to add, remove, and list ignore patterns
 * in the .codeforgeignore file.
 *
 * Features:
 * - Add patterns to ignore file
 * - Remove patterns from ignore file
 * - List current ignore patterns
 * - Custom ignore file path support
 * - Preserves comments and blank lines
 *
 * @example
 * ```bash
 * codeforge ignore add "node_modules/**"
 * codeforge ignore remove "dist/**"
 * codeforge ignore list
 * codeforge ignore --file .customignore
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { access, readFile, writeFile } from 'node:fs/promises'

type IgnoreAction = 'add' | 'list' | 'remove'

interface IgnoreOptions {
  action: IgnoreAction
  file: string
  pattern?: string
}

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

    const options: IgnoreOptions = {
      action: args.action as IgnoreAction,
      file: flags.file,
      pattern: args.pattern,
    }

    if (options.action === 'add') {
      if (!options.pattern) {
        this.error(chalk.red('Pattern is required for add action'))
      }
      await this.addPattern(options.file, options.pattern)
    } else if (options.action === 'remove') {
      if (!options.pattern) {
        this.error(chalk.red('Pattern is required for remove action'))
      }
      await this.removePattern(options.file, options.pattern)
    } else {
      await this.listPatterns(options.file)
    }
  }

  private async addPattern(filePath: string, pattern: string): Promise<void> {
    try {
      const content = await this.readFileContent(filePath)
      const lines = content.split('\n')

      // Check for duplicate pattern (exact match, ignoring whitespace)
      const trimmedPattern = pattern.trim()
      const isDuplicate = lines.some((line) => line.trim() === trimmedPattern)

      if (isDuplicate) {
        this.log(chalk.yellow(`Pattern "${pattern}" already exists in ignore file`))
        return
      }

      // Add pattern to file
      const newContent = content.trim() === '' ? pattern : `${content}\n${pattern}`
      await writeFile(filePath, newContent, 'utf8')

      this.log(chalk.green(`✓ Added pattern "${pattern}" to ${filePath}`))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.error(chalk.red(`Failed to add pattern: ${message}`))
    }
  }

  private async listPatterns(filePath: string): Promise<void> {
    try {
      await access(filePath)
    } catch {
      this.log(chalk.gray(`No ignore file found at ${filePath}`))
      this.log(chalk.gray('Use "codeforge ignore add <pattern>" to create one'))
      return
    }

    try {
      const content = await readFile(filePath, 'utf8')
      const patterns = this.extractPatterns(content)

      this.log(chalk.bold('Ignore Patterns'))
      this.log('')
      this.log(chalk.gray(`File: ${filePath}`))
      this.log('')

      if (patterns.length === 0) {
        this.log(chalk.gray('(empty)'))
      } else {
        for (const pattern of patterns) {
          this.log(`  ${pattern}`)
        }
      }

      this.log('')
      this.log(chalk.gray(`${patterns.length} pattern${patterns.length === 1 ? '' : 's'} found`))
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
      // File doesn't exist, return empty string
      return ''
    }
  }

  private async removePattern(filePath: string, pattern: string): Promise<void> {
    try {
      const content = await this.readFileContent(filePath)

      if (content.trim() === '') {
        this.error(chalk.red(`Pattern "${pattern}" not found (file is empty or doesn't exist)`))
      }

      const lines = content.split('\n')
      const trimmedPattern = pattern.trim()

      // Find the exact line to remove
      const lineIndex = lines.findIndex((line) => line.trim() === trimmedPattern)

      if (lineIndex === -1) {
        this.error(chalk.red(`Pattern "${pattern}" not found in ignore file`))
      }

      // Remove the line
      lines.splice(lineIndex, 1)

      // Reconstruct file content
      const newContent = lines.join('\n')
      await writeFile(filePath, newContent, 'utf8')

      this.log(chalk.green(`✓ Removed pattern "${pattern}" from ${filePath}`))
    } catch (error) {
      // Re-throw CLI errors
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.error(chalk.red(`Failed to remove pattern: ${message}`))
    }
  }

  private extractPatterns(content: string): string[] {
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'))
  }
}
