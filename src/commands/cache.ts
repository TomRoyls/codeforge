import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'

type CacheAction = 'clear' | 'status'

interface CacheOptions {
  action: CacheAction
  path: string
}

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

    let action: CacheAction = args.action as CacheAction
    if (flags.clear) {
      action = 'clear'
    } else if (flags.status) {
      action = 'status'
    }

    const options: CacheOptions = {
      action,
      path: flags.path ?? this.getDefaultCachePath(),
    }

    await (options.action === 'clear'
      ? this.clearCache(options.path)
      : this.showStatus(options.path))
  }

  private async clearCache(cachePath: string): Promise<void> {
    const stats = await this.getCacheStats(cachePath)

    if (stats.entries === 0) {
      this.log(chalk.yellow('Cache is already empty'))
      return
    }

    await this.doClear(cachePath)

    this.log(chalk.green('✓ Cache cleared'))
    this.log(chalk.gray(`  Removed ${stats.entries} entries (${this.formatSize(stats.size)})`))
  }

  private async doClear(cachePath: string): Promise<void> {
    try {
      const files = await fs.readdir(cachePath)
      await Promise.all(files.map((file) => fs.unlink(join(cachePath, file))))
    } catch {
      // Directory doesn't exist or cannot be cleared
    }
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  private async getCacheStats(cachePath: string): Promise<{ entries: number; size: number }> {
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

  private async showStatus(cachePath: string): Promise<void> {
    const stats = await this.getCacheStats(cachePath)

    this.log(chalk.bold('Cache Status'))
    this.log('')
    this.log(chalk.gray('  Path:'), cachePath)
    this.log(chalk.gray('  Entries:'), stats.entries.toString())
    this.log(chalk.gray('  Size:'), this.formatSize(stats.size))
    this.log('')

    if (stats.entries === 0) {
      this.log(chalk.yellow('Cache is empty'))
    } else {
      this.log(chalk.green('Cache is active'))
    }
  }
}
