import { pathToFileURL } from 'node:url'

import { CLIError } from '../utils/errors.js'
import { readFileStrict } from '../utils/fs-helpers.js'
import { logger } from '../utils/logger.js'
import { type CodeForgeConfig } from './types.js'

/**
 * Parse a config file (JSON or JavaScript) and return the configuration.
 *
 * For JavaScript files, supports both CommonJS (module.exports) and ESM (export default).
 *
 * @param filePath - Path to the config file
 * @returns The parsed configuration
 * @throws CLIError if the file cannot be read, parsed, or contains invalid config
 */
export async function parseConfigFile(filePath: string): Promise<CodeForgeConfig> {
  const isJsFile = filePath.endsWith('.js')

  logger.debug(`Parsing config file: ${filePath}`)

  if (isJsFile) {
    return parseJsConfig(filePath)
  }

  return parseJsonConfig(filePath)
}

async function parseJsConfig(filePath: string): Promise<CodeForgeConfig> {
  try {
    const fileUrl = pathToFileURL(filePath).href
    logger.debug(`Loading JS config via dynamic import: ${fileUrl}`)

    const module = await import(fileUrl)
    let config: unknown

    if ('default' in module) {
      config = module.default
    } else if (module.config && typeof module.config === 'object') {
      config = module.config
    } else {
      config = module
    }

    validateConfig(config, filePath)

    logger.debug(`Successfully parsed JS config from: ${filePath}`)
    return config as CodeForgeConfig
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw CLIError.configError(
      `Failed to load JavaScript config file: ${filePath}\n  ${errorMessage}`,
      [
        'Ensure the file exports a valid config object',
        'For ESM: use `export default { ... }`',
        'For CommonJS: use `module.exports = { ... }`',
        'Check for syntax errors in the file',
      ],
    )
  }
}

async function parseJsonConfig(filePath: string): Promise<CodeForgeConfig> {
  try {
    const content = await readFileStrict(filePath)
    logger.debug(`Read JSON config content from: ${filePath}`)

    const config = JSON.parse(content)
    validateConfig(config, filePath)

    logger.debug(`Successfully parsed JSON config from: ${filePath}`)
    return config as CodeForgeConfig
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('File not found')) {
      throw CLIError.configError(`Config file not found: ${filePath}`, [
        'Check that the file path is correct',
        'Verify the file exists',
        'Use absolute path if relative path fails',
      ])
    }

    if (error instanceof SyntaxError) {
      throw CLIError.configError(`Invalid JSON in config file: ${filePath}\n  ${error.message}`, [
        'Validate your JSON syntax at jsonlint.com',
        'Ensure all strings are properly quoted',
        'Check for trailing commas or missing brackets',
      ])
    }

    if (error instanceof CLIError) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    throw CLIError.configError(`Failed to parse config file: ${filePath}\n  ${errorMessage}`, [
      'Check the file format and content',
    ])
  }
}

function validateConfig(config: unknown, filePath: string): void {
  if (config === null || config === undefined) {
    throw CLIError.configError(
      `Invalid config in file: ${filePath}\n  Config exported null or undefined`,
      [
        'Ensure the file exports a config object',
        'For ESM: use `export default { ... }`',
        'For CommonJS: use `module.exports = { ... }`',
      ],
    )
  }

  if (typeof config !== 'object' || Array.isArray(config)) {
    throw CLIError.configError(
      `Invalid config in file: ${filePath}\n  Config must be an object, got ${Array.isArray(config) ? 'array' : typeof config}`,
      ['Ensure the file exports a plain object', 'Example: { "files": ["**/*.ts"], "rules": {} }'],
    )
  }
}
