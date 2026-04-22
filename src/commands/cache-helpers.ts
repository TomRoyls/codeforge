import chalk from 'chalk'

import { formatSize } from '../utils/formatting.js'



export type CacheAction = 'clear' | 'status'

export interface CacheOptions {
  action: CacheAction
  path: string
}

export function resolveCacheAction(
  args: Record<string, unknown>,
  flags: Record<string, unknown>,
): CacheAction {
  let action: CacheAction = (args.action as CacheAction) ?? 'status'
  if (flags.clear) {
    action = 'clear'
  } else if (flags.status) {
    action = 'status'
  }

  return action
}

export function resolveCacheOptions(
  args: Record<string, unknown>,
  flags: Record<string, unknown>,
  defaultPath: string,
): CacheOptions {
  const action = resolveCacheAction(args, flags)
  return {
    action,
    path: (flags.path as string) ?? defaultPath,
  }
}

export type LogFn = (message?: string, ...args: unknown[]) => void

export function displayCacheStatus(
  stats: { entries: number; size: number },
  cachePath: string,
  logFn: LogFn,
): void {
  logFn(chalk.bold('Cache Status'))
  logFn('')
  logFn(chalk.gray('  Path:'), cachePath)
  logFn(chalk.gray('  Entries:'), stats.entries.toString())
  logFn(chalk.gray('  Size:'), formatSize(stats.size))
  logFn('')

  if (stats.entries === 0) {
    logFn(chalk.yellow('Cache is empty'))
  } else {
    logFn(chalk.green('Cache is active'))
  }
}

export function displayClearResult(stats: { entries: number; size: number }, logFn: LogFn): void {
  if (stats.entries === 0) {
    logFn(chalk.yellow('Cache is already empty'))
    return
  }

  logFn(chalk.green('✓ Cache cleared'))
  logFn(chalk.gray(`  Removed ${stats.entries} entries (${formatSize(stats.size)})`))
}

export {formatSize} from '../utils/formatting.js'