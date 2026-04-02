import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export default class Clean extends Command {
  static override description = 'Clean generated files and caches'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Clean all generated files and caches',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --cache',
      description: 'Clean only cache directories',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --dist',
      description: 'Clean only dist directory',
    },
  ]

  static override flags = {
    cache: Flags.boolean({
      default: false,
      description: 'Clean only cache directories',
    }),
    dist: Flags.boolean({
      default: false,
      description: 'Clean only dist directory',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Clean)

    const cwd = process.cwd()
    const targets: Array<{ name: string; path: string }> = []

    if (flags.cache) {
      targets.push(
        { name: 'Cache directory', path: join(cwd, '.cache') },
        { name: 'CodeForge cache', path: join(cwd, '.codeforge') },
      )
    } else if (flags.dist) {
      targets.push({ name: 'Dist directory', path: join(cwd, 'dist') })
    } else {
      targets.push(
        { name: 'Dist directory', path: join(cwd, 'dist') },
        { name: 'Cache directory', path: join(cwd, '.cache') },
        { name: 'CodeForge cache', path: join(cwd, '.codeforge') },
        { name: 'Coverage directory', path: join(cwd, 'coverage') },
      )
    }

    this.log(chalk.bold('Cleaning generated files...\n'))

    let cleaned = 0
    for (const target of targets) {
      if (existsSync(target.path)) {
        try {
          await rm(target.path, { recursive: true })
          this.log(chalk.green(`  ✓ ${target.name}`))
          cleaned++
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          this.log(chalk.red(`  ✗ ${target.name}: ${message}`))
        }
      } else {
        this.log(chalk.gray(`  - ${target.name} (not found)`))
      }
    }

    this.log('')
    if (cleaned > 0) {
      this.log(chalk.green(`Cleaned ${cleaned} director${cleaned === 1 ? 'y' : 'ies'}`))
    } else {
      this.log(chalk.yellow('Nothing to clean'))
    }
  }
}
