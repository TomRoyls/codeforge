import { Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

import {
  displayNextSteps,
  generateGitHubActionsContent,
  generateGitLabCiContent,
  resolveCiOptions,
  validateOutputDir,
} from './ci-helpers.js'

export default class Ci extends Command {
  static override description =
    'Generate CI/CD configuration files for GitHub Actions and GitLab CI'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate CI config for all platforms',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --platform github',
      description: 'Generate GitHub Actions workflow only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --platform gitlab',
      description: 'Generate GitLab CI configuration only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --output ./ci',
      description: 'Generate CI files in custom directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --force',
      description: 'Overwrite existing CI files',
    },
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing CI configuration files',
    }),
    output: Flags.string({
      char: 'o',
      default: '.',
      description: 'Output directory for generated files',
    }),
    platform: Flags.string({
      char: 'p',
      default: 'all',
      description: 'CI platform to generate config for',
      options: ['github', 'gitlab', 'all'],
    }),
  }

  generateGitHubActionsContent(): string {
    return generateGitHubActionsContent()
  }

  generateGitLabCiContent(): string {
    return generateGitLabCiContent()
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Ci)

    const options = resolveCiOptions(flags)
    const outputDir = resolve(options.output)

    const validation = validateOutputDir(outputDir)
    if (!validation.valid) {
      this.error(validation.error!)
    }

    if (options.platform === 'all' || options.platform === 'github') {
      await this.generateGitHubActions(outputDir, options.force)
    }

    if (options.platform === 'all' || options.platform === 'gitlab') {
      await this.generateGitLabCi(outputDir, options.force)
    }

    displayNextSteps((msg) => this.log(msg))
  }

  private async generateGitHubActions(outputDir: string, force: boolean): Promise<void> {
    const workflowsDir = join(outputDir, '.github', 'workflows')
    const workflowPath = join(workflowsDir, 'codeforge.yml')

    if (!force && existsSync(workflowPath)) {
      this.log(
        `Skipping .github/workflows/codeforge.yml (already exists). Use --force to overwrite.`,
      )
      return
    }

    const content = this.generateGitHubActionsContent()

    try {
      await fs.mkdir(dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, content, 'utf8')
    } catch (error) {
      this.error(
        `Failed to write GitHub Actions workflow to ${workflowPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    this.log(`✓ Created .github/workflows/codeforge.yml`)
  }

  private async generateGitLabCi(outputDir: string, force: boolean): Promise<void> {
    const gitlabCiPath = join(outputDir, '.gitlab-ci.yml')

    if (!force && existsSync(gitlabCiPath)) {
      this.log(`Skipping .gitlab-ci.yml (already exists). Use --force to overwrite.`)
      return
    }

    const content = this.generateGitLabCiContent()

    try {
      await fs.mkdir(dirname(gitlabCiPath), { recursive: true })
      await fs.writeFile(gitlabCiPath, content, 'utf8')
    } catch (error) {
      this.error(
        `Failed to write GitLab CI configuration to ${gitlabCiPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    this.log(`✓ Created .gitlab-ci.yml`)
  }
}
