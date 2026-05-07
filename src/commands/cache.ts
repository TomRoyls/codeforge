import { Args, Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'

import {
  displayCacheStatus,
  displayClearResult,
  formatSize,
  resolveCacheOptions,
} from './cache-helpers.js'

export default class Cache extends Command {
  static override args = {
    action: Args.string({
      default: 'status',
      description: 'Cache action to perform',
      options: ['status', 'clear'],
    }),
  }

  static override description = 'Manage the CodeForge cache'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show cache status',
    },
    {
      command: '<%= config.bin %> <%= command.id %> status',
      description: 'Show detailed cache status',
    },
    {
      command: '<%= config.bin %> <%= command.id %> clear',
      description: 'Clear the cache',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --clear',
      description: 'Clear the cache using flag',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --status',
      description: 'Show cache status using flag',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --path ./custom-cache',
      description: 'Use a custom cache path',
    },
  ]

  static override flags = {
    clear: Flags.boolean({
      char: 'c',
      default: false,
      description: 'Clear the cache',
      exclusive: ['status'],
    }),
    path: Flags.string({
      char: 'p',
      description: 'Custom cache path',
    }),
    status: Flags.boolean({
      char: 's',
      default: false,
      description: 'Show cache status',
      exclusive: ['clear'],
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Cache)

    const options = resolveCacheOptions(args, flags, this.getDefaultCachePath())

    await (options.action === 'clear'
      ? this.clearCache(options.path)
      : this.showStatus(options.path))
  }

  private async clearCache(cachePath: string): Promise<void> {
    const stats = await this.getCacheStats(cachePath)

    if (stats.entries === 0) {
      this.log('')
      this.log('Cache is already empty')
      return
    }

    await this.doClear(cachePath)

    displayClearResult(stats, (...args) => this.log(...args))
  }

  private async doClear(cachePath: string): Promise<void> {
    try {
      const files = await fs.readdir(cachePath)
      await Promise.all(files.map((file) => fs.unlink(join(cachePath, file))))
    } catch {
      // Directory doesn't exist or cannot be cleared
    }
  }

  async getCacheStats(cachePath: string): Promise<{ entries: number; size: number }> {
    try {
      const files = await fs.readdir(cachePath)
      const stats = await Promise.all(files.map((file) => fs.stat(join(cachePath, file))))
      const totalSize = stats.reduce((sum, stat) => sum + stat.size, 0)

      return { entries: files.length, size: totalSize }
    } catch {
      return { entries: 0, size: 0 }
    }
  }

  private getDefaultCachePath(): string {
    return join(process.cwd(), '.codeforge', 'cache')
  }

  formatSize(bytes: number): string {
    return formatSize(bytes)
  }

  private async showStatus(cachePath: string): Promise<void> {
    const stats = await this.getCacheStats(cachePath)
    displayCacheStatus(stats, cachePath, (...args) => this.log(...args))
  }
}
