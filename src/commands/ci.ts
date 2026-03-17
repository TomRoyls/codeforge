import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync, statSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

type Platform = 'all' | 'github' | 'gitlab'

interface CiOptions {
  force: boolean
  output: string
  platform: Platform
}

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

  async run(): Promise<void> {
    const { flags } = await this.parse(Ci)

    const options: CiOptions = {
      force: flags.force,
      output: flags.output,
      platform: flags.platform as Platform,
    }

    const outputDir = resolve(options.output)

    if (!existsSync(outputDir)) {
      this.error(`Output directory does not exist: ${outputDir}`)
    }

    if (!statSync(outputDir).isDirectory()) {
      this.error(`Output path is not a directory: ${outputDir}`)
    }

    if (options.platform === 'all' || options.platform === 'github') {
      await this.generateGitHubActions(outputDir, options.force)
    }

    if (options.platform === 'all' || options.platform === 'gitlab') {
      await this.generateGitLabCi(outputDir, options.force)
    }

    this.log('')
    this.log(chalk.bold('Next steps:'))
    this.log(chalk.gray('  1. Review and customize the generated CI configuration'))
    this.log(chalk.gray('  2. Ensure codeforge is installed in your CI environment'))
    this.log(chalk.gray('  3. Commit the changes to your repository'))
  }

  private async generateGitHubActions(outputDir: string, force: boolean): Promise<void> {
    const workflowsDir = join(outputDir, '.github', 'workflows')
    const workflowPath = join(workflowsDir, 'codeforge.yml')

    if (!force && existsSync(workflowPath)) {
      this.log(
        chalk.yellow(
          `Skipping .github/workflows/codeforge.yml (already exists). Use --force to overwrite.`,
        ),
      )
      return
    }

    const content = this.generateGitHubActionsContent()
    await fs.mkdir(dirname(workflowPath), { recursive: true })
    await fs.writeFile(workflowPath, content, 'utf8')

    this.log(chalk.green(`✓ Created .github/workflows/codeforge.yml`))
  }

  private generateGitHubActionsContent(): string {
    return `name: CodeForge Analysis

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  analyze:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run CodeForge analysis
        run: npx codeforge analyze
`
  }

  private async generateGitLabCi(outputDir: string, force: boolean): Promise<void> {
    const gitlabCiPath = join(outputDir, '.gitlab-ci.yml')

    if (!force && existsSync(gitlabCiPath)) {
      this.log(chalk.yellow(`Skipping .gitlab-ci.yml (already exists). Use --force to overwrite.`))
      return
    }

    const content = this.generateGitLabCiContent()
    await fs.mkdir(dirname(gitlabCiPath), { recursive: true })
    await fs.writeFile(gitlabCiPath, content, 'utf8')

    this.log(chalk.green(`✓ Created .gitlab-ci.yml`))
  }

  private generateGitLabCiContent(): string {
    return `stages:
  - analyze

codeforge:
  stage: analyze
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npx codeforge analyze
  only:
    - main
    - master
    - develop
  except:
    - tags
`
  }
}
