import { Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'

import {
  DEFAULT_COMMAND,
  displayPostInstallMessage,
  generateHookContent as generateHookContentHelper,
  generatePrecommitFrameworkConfig,
  getGitHookPath as getGitHookPathHelper,
  getHookDir,
  getHuskyHookPath as getHuskyHookPathHelper,
  getPrecommitFrameworkConfigPath as getPrecommitFrameworkConfigPathHelper,
  isGitRepository as isGitRepositoryHelper,
  type PrecommitOptions,
  resolvePrecommitOptions,
} from './precommit-helpers.js'

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
      command: '<%= config.bin %> <%= command.id %> --installer pre-commit-framework',
      description: 'Set up pre-commit framework hook',
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
      options: ['git', 'husky', 'pre-commit-framework'],
    }),
  }

  generateHookContent(options: PrecommitOptions): string {
    return generateHookContentHelper(options)
  }

  getGitHookPath(): string {
    return getGitHookPathHelper(process.cwd())
  }

  getHuskyHookPath(): string {
    return getHuskyHookPathHelper(process.cwd())
  }

  getPrecommitFrameworkConfigPath(): string {
    return getPrecommitFrameworkConfigPathHelper(process.cwd())
  }

  isGitRepository(): boolean {
    return isGitRepositoryHelper(process.cwd(), existsSync)
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Precommit)
    const cwd = process.cwd()

    const options = resolvePrecommitOptions(flags)

    if (!this.isGitRepository()) {
      this.error('Not a git repository. Please run this command from within a git repository.')
    }

    const hookPath = options.installer === 'husky'
      ? this.getHuskyHookPath()
      : options.installer === 'pre-commit-framework'
        ? this.getPrecommitFrameworkConfigPath()
        : this.getGitHookPath()
    const hookDir = getHookDir(options, cwd)

    if (existsSync(hookPath) && !options.force) {
      this.error(`Pre-commit hook already exists at ${hookPath}. Use --force to overwrite.`)
    }

    const hookContent = options.installer === 'pre-commit-framework'
      ? generatePrecommitFrameworkConfig(options)
      : this.generateHookContent(options)

    try {
      await fs.mkdir(hookDir, { recursive: true })
      await fs.writeFile(hookPath, hookContent, 'utf8')
      if (options.installer !== 'pre-commit-framework') {
        await fs.chmod(hookPath, 0o755)
      }
    } catch (error) {
      this.error(
        `Failed to create pre-commit hook at ${hookPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    displayPostInstallMessage(options, hookPath, (msg) => this.log(msg))
  }
}
