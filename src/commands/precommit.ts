import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'

interface PrecommitOptions {
  command: string
  force: boolean
  installer: 'git' | 'husky'
}

const DEFAULT_COMMAND = 'codeforge analyze --staged'

export default class Precommit extends Command {
  static override description = 'Set up git pre-commit hooks to run CodeForge'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Set up git pre-commit hook with default settings',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --installer husky',
      description: 'Set up husky pre-commit hook',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --force',
      description: 'Overwrite existing pre-commit hook',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --command "npm test"',
      description: 'Use custom command in pre-commit hook',
    },
  ]

  static override flags = {
    command: Flags.string({
      char: 'c',
      default: DEFAULT_COMMAND,
      description: 'Custom command to run in pre-commit hook',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing pre-commit hook',
    }),
    installer: Flags.string({
      char: 'i',
      default: 'git',
      description: 'Hook installation method',
      options: ['git', 'husky'],
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Precommit)

    const options: PrecommitOptions = {
      command: flags.command,
      force: flags.force,
      installer: flags.installer as 'git' | 'husky',
    }

    if (!this.isGitRepository()) {
      this.error('Not a git repository. Please run this command from within a git repository.')
    }

    const hookPath = options.installer === 'husky' ? this.getHuskyHookPath() : this.getGitHookPath()
    const hookDir =
      options.installer === 'husky'
        ? join(process.cwd(), '.husky')
        : join(process.cwd(), '.git', 'hooks')

    if (existsSync(hookPath) && !options.force) {
      this.error(`Pre-commit hook already exists at ${hookPath}. Use --force to overwrite.`)
    }

    const hookContent = this.generateHookContent(options)

    await fs.mkdir(hookDir, { recursive: true })
    await fs.writeFile(hookPath, hookContent, 'utf8')
    await fs.chmod(hookPath, 0o755)

    this.log(chalk.green(`✓ Created pre-commit hook at ${hookPath}`))
    this.log('')
    this.log(chalk.bold('Hook configuration:'))
    this.log(chalk.gray(`  Installer: ${options.installer}`))
    this.log(chalk.gray(`  Command: ${options.command}`))
    this.log('')
    this.log(chalk.bold('Next steps:'))
    if (options.installer === 'husky') {
      this.log(chalk.gray('  1. Ensure husky is installed (npm install husky --save-dev)'))
      this.log(chalk.gray('  2. Run `git commit` to trigger the hook'))
    } else {
      this.log(chalk.gray('  1. Run `git commit` to trigger the hook'))
    }
  }

  private generateHookContent(options: PrecommitOptions): string {
    const huskySource =
      options.installer === 'husky'
        ? '. "$(dirname -- "$0")/_/husky.sh" 2>/dev/null || true\n\n'
        : ''

    return `#!/usr/bin/env sh
${huskySource}${options.command}
`
  }

  private getGitHookPath(): string {
    return join(process.cwd(), '.git', 'hooks', 'pre-commit')
  }

  private getHuskyHookPath(): string {
    return join(process.cwd(), '.husky', 'pre-commit')
  }

  private isGitRepository(): boolean {
    return existsSync(join(process.cwd(), '.git'))
  }
}
