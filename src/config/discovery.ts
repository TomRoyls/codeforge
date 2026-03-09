import fs from 'node:fs/promises'
import path from 'node:path'

import { CLIError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'
import { CONFIG_FILE_NAMES, type ConfigDiscoveryOptions } from './types.js'

async function findConfigInDirectory(dir: string): Promise<null | string> {
  for (const configName of CONFIG_FILE_NAMES) {
    const configPath = path.join(dir, configName)
    try {
      // eslint-disable-next-line no-await-in-loop
      const stat = await fs.stat(configPath)
      if (stat.isFile()) {
        return configPath
      }
    } catch {}
  }

  return null
}

async function hasPackageJson(dir: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path.join(dir, 'package.json'))

    return stat.isFile()
  } catch {
    return false
  }
}

function isFilesystemRoot(dir: string): boolean {
  return path.dirname(dir) === dir
}

export async function discoverConfig(options: ConfigDiscoveryOptions): Promise<null | string> {
  const { cwd, stopAt } = options
  let currentDir = path.resolve(cwd)
  const stopAtDir = stopAt ? path.resolve(stopAt) : undefined

  logger.debug(`Starting config discovery from: ${currentDir}`)

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const foundConfig = await findConfigInDirectory(currentDir)
    if (foundConfig) {
      logger.debug(`Found config file: ${foundConfig}`)

      return foundConfig
    }

    if (isFilesystemRoot(currentDir)) {
      logger.debug('Reached filesystem root, stopping search')

      break
    }

    // eslint-disable-next-line no-await-in-loop
    if (await hasPackageJson(currentDir)) {
      logger.debug(`Found package.json at ${currentDir}, stopping search at project root`)

      break
    }

    if (stopAtDir && currentDir === stopAtDir) {
      logger.debug(`Reached stopAt directory: ${stopAtDir}`)

      break
    }

    currentDir = path.dirname(currentDir)
  }

  logger.debug('No config file found')

  return null
}

export async function findConfigPath(explicitPath?: string, cwd?: string): Promise<null | string> {
  if (explicitPath) {
    const absolutePath = path.resolve(cwd ?? process.cwd(), explicitPath)
    logger.debug(`Validating explicit config path: ${absolutePath}`)

    try {
      const stat = await fs.stat(absolutePath)
      if (stat.isFile()) {
        return absolutePath
      }

      throw CLIError.configError(`Config path is not a file: ${absolutePath}`, [
        'Ensure the path points to a valid file',
      ])
    } catch (error) {
      if (error instanceof CLIError) {
        throw error
      }

      throw CLIError.configError(`Config file not found: ${absolutePath}`, [
        'Check that the file path is correct',
        'Verify the file exists',
        'Use an absolute path if relative path fails',
      ])
    }
  }

  const searchCwd = cwd ?? process.cwd()

  return discoverConfig({ cwd: searchCwd })
}
