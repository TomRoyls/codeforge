import { Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'

import {
  type CleanFlags,
  displayCleanResult,
  formatCleanHeader,
  formatTargetStatus,
  getCleanTargets,
} from './clean-helpers.js'

export default class Clean extends Command {
  static override description = 'Clean generated files and caches'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Clean all generated files and caches',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --dry-run',
      description: 'Preview what would be cleaned without deleting',
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
    'dry-run': Flags.boolean({
      char: 'd',
      default: false,
      description: 'Preview what would be cleaned without actually deleting',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Clean)

    const cwd = process.cwd()
    const cleanFlags: CleanFlags = { cache: flags.cache, dist: flags.dist }
    const targets = getCleanTargets(cleanFlags, cwd)
    const dryRun = flags['dry-run']

    this.log(formatCleanHeader(dryRun))

    let cleaned = 0
    const cleanPromises = targets.map(async (target) => {
      if (existsSync(target.path)) {
        if (dryRun) {
          this.log(formatTargetStatus(target, true, false, undefined, true))
          return 1
        }

        try {
          await rm(target.path, { recursive: true })
          this.log(formatTargetStatus(target, true, true))
          return 1
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          this.log(formatTargetStatus(target, true, false, message))
          return 0
        }
      } else {
        this.log(formatTargetStatus(target, false, false))
        return 0
      }
    })

    const results = await Promise.all(cleanPromises)
    cleaned = results.reduce((sum: number, count: number) => sum + count, 0)

    displayCleanResult(cleaned, dryRun, (msg) => this.log(msg))
  }
}
