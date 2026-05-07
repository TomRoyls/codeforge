import { Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  type DangerfileOptions,
  displayDangerNextSteps,
  generateDangerfileContent as generateDangerfileContentHelper,
  resolveDangerOptions,
  validateDangerOutputPath,
} from './danger-helpers.js'

export default class Danger extends Command {
  static override description = 'Generate a Dangerfile for Danger.js integration'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate Dangerfile with default settings',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --output dangerfile.js',
      description: 'Generate Dangerfile with custom output path',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --force',
      description: 'Overwrite existing Dangerfile',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ci-command "codeforge analyze --format json"',
      description: 'Use custom analysis command',
    },
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing Dangerfile',
    }),
    output: Flags.string({
      char: 'o',
      default: 'dangerfile.js',
      description: 'Output path for generated Dangerfile',
    }),
    'ci-command': Flags.string({
      char: 'c',
      default: 'codeforge analyze --format json --output codeforge-results.json',
      description: 'Custom CI command to run CodeForge analysis',
    }),
  }

  generateDangerfileContent(options: DangerfileOptions): string {
    return generateDangerfileContentHelper(options)
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Danger)

    const options = resolveDangerOptions(flags)
    const outputPath = resolve(options.outputFile)

    const validation = validateDangerOutputPath(options.outputFile)
    if (!validation.valid) {
      this.error(validation.error!)
    }

    if (existsSync(outputPath) && !flags.force) {
      this.error(
        `Dangerfile already exists at ${outputPath}. Use --force to overwrite.`,
      )
    }

    const content = this.generateDangerfileContent(options)

    try {
      await fs.mkdir(dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, content, 'utf8')
    } catch (error) {
      this.error(
        `Failed to write Dangerfile to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    this.log(`✓ Created ${options.outputFile}`)
    displayDangerNextSteps((...args) => this.log(...args))
  }
}
