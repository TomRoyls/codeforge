/**
 * Pure helper functions for the doctor command.
 *
 * Extracted from Doctor class to enable independent testing and reuse.
 * All functions are stateless — they accept parameters and return/mutate results.
 */
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import { basename, join, relative } from 'node:path'

import { discoverConfig } from '../config/discovery.js'
import { parseConfigFile } from '../config/parser.js'
import { CONFIG_FILE_NAMES } from '../config/types.js'
import { discoverFiles } from '../core/file-discovery.js'
import { getRuleIds } from '../rules/index.js'
import { FILE_COUNT_THRESHOLD, MAX_TOP_RULES_SHOWN } from '../utils/constants.js'

export interface CheckResult {
  details?: string
  message: string
  status: 'error' | 'ok' | 'warning'
}

export interface DoctorResult {
  checks: CheckResult[]
  errors: number
  passed: boolean
  warnings: number
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile()
  } catch {
    return false
  }
}

export async function checkNodeVersion(results: DoctorResult): Promise<void> {
  const nodeVersion = process.version
  const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0] ?? '0', 10)

  if (majorVersion >= 20) {
    results.checks.push({
      message: `Node.js version: ${nodeVersion}`,
      status: 'ok',
    })
  } else {
    results.checks.push({
      details: 'Please upgrade Node.js to version 20 or higher',
      message: `Node.js version: ${nodeVersion} (requires >= 20.0.0)`,
      status: 'error',
    })
  }
}

export async function checkMemory(results: DoctorResult): Promise<void> {
  const totalMemory = os.totalmem()
  const memoryGB = Math.round((totalMemory / 1024 / 1024 / 1024) * 10) / 10
  const memoryMB = totalMemory / 1024 / 1024

  if (memoryMB >= 512) {
    results.checks.push({
      message: `Memory available: ${memoryGB}GB`,
      status: 'ok',
    })
  } else {
    results.checks.push({
      details: 'Consider running with more memory for large codebases',
      message: `Memory available: ${memoryGB}GB (low)`,
      status: 'warning',
    })
  }
}

export async function checkConfigExists(results: DoctorResult, cwd: string): Promise<void> {
  const configPath = await discoverConfig({ cwd })

  if (configPath) {
    const relativePath = relative(cwd, configPath) || basename(configPath)
    results.checks.push({
      message: `Config file found: ${relativePath}`,
      status: 'ok',
    })
  } else {
    results.checks.push({
      details: `Expected one of: ${CONFIG_FILE_NAMES.join(', ')}`,
      message: 'No config file found',
      status: 'warning',
    })
  }
}

export async function checkConfigValid(results: DoctorResult, cwd: string): Promise<void> {
  const configPath = await discoverConfig({ cwd })

  if (!configPath) {
    // Already reported in checkConfigExists
    return
  }

  try {
    await parseConfigFile(configPath)
    results.checks.push({
      message: 'Config is valid',
      status: 'ok',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    results.checks.push({
      details: errorMessage,
      message: 'Config is invalid',
      status: 'error',
    })
  }
}

export async function checkRulesValid(results: DoctorResult, cwd: string): Promise<void> {
  const configPath = await discoverConfig({ cwd })

  if (!configPath) {
    return
  }

  try {
    const config = await parseConfigFile(configPath)
    const knownRules = new Set(getRuleIds())
    const unknownRules: string[] = []

    if (config.rules) {
      for (const ruleId of Object.keys(config.rules)) {
        if (!knownRules.has(ruleId)) {
          unknownRules.push(ruleId)
        }
      }
    }

    if (unknownRules.length === 0) {
      results.checks.push({
        message: 'All rules are valid',
        status: 'ok',
      })
    } else {
      results.checks.push({
        details: `Valid rules: ${[...knownRules].slice(0, MAX_TOP_RULES_SHOWN).join(', ')}, ...`,
        message: `Unknown rules found: ${unknownRules.join(', ')}`,
        status: 'error',
      })
    }
  } catch {
    // Error already reported in checkConfigValid
  }
}

export async function checkFilePatterns(results: DoctorResult, cwd: string): Promise<void> {
  const configPath = await discoverConfig({ cwd })

  if (!configPath) {
    return
  }

  try {
    const config = await parseConfigFile(configPath)
    const patterns = config.files ?? []

    if (patterns.length === 0) {
      results.checks.push({
        details: 'Add file patterns to your config',
        message: 'No file patterns configured',
        status: 'warning',
      })
      return
    }

    // Basic glob validation - check for obvious syntax errors
    const invalidPatterns: string[] = []
    for (const pattern of patterns) {
      if (typeof pattern !== 'string' || pattern.trim() === '') {
        invalidPatterns.push(pattern)
      }
    }

    if (invalidPatterns.length === 0) {
      results.checks.push({
        message: 'File patterns are valid globs',
        status: 'ok',
      })
    } else {
      results.checks.push({
        details: 'File patterns must be non-empty strings',
        message: `Invalid file patterns: ${invalidPatterns.join(', ')}`,
        status: 'error',
      })
    }
  } catch {
    // Error already reported in checkConfigValid
  }
}

export async function checkFileCount(results: DoctorResult, cwd: string): Promise<void> {
  try {
    const configPath = await discoverConfig({ cwd })
    let patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
    let ignore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']

    if (configPath) {
      try {
        const config = await parseConfigFile(configPath)
        patterns = config.files ?? patterns
        ignore = config.ignore ?? ignore
      } catch {
        // Use defaults
      }
    }

    const files = await discoverFiles({
      cwd,
      ignore: ignore.map((p) => (p.startsWith('**') ? p : `**/${p}`)),
      patterns,
    })

    const fileCount = files.length

    if (fileCount > FILE_COUNT_THRESHOLD) {
      results.checks.push({
        details: 'Consider using .codeforgeignore to exclude unnecessary files',
        message: `Large codebase detected (${fileCount} files)`,
        status: 'warning',
      })
    } else {
      results.checks.push({
        message: `Files to analyze: ${fileCount}`,
        status: 'ok',
      })
    }
  } catch (error) {
    results.checks.push({
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Could not count files',
      status: 'warning',
    })
  }
}

export async function checkTsConfig(results: DoctorResult, cwd: string): Promise<void> {
  const tsconfigPath = join(cwd, 'tsconfig.json')
  const exists = await fileExists(tsconfigPath)

  if (exists) {
    results.checks.push({
      message: 'tsconfig.json exists',
      status: 'ok',
    })
  } else {
    // Check if there are TypeScript files
    try {
      const tsFiles = await discoverFiles({
        cwd,
        ignore: ['**/node_modules/**', '**/dist/**'],
        patterns: ['**/*.ts', '**/*.tsx'],
      })

      if (tsFiles.length > 0) {
        results.checks.push({
          details: 'Consider adding a tsconfig.json for better TypeScript support',
          message: 'tsconfig.json not found but TypeScript files detected',
          status: 'warning',
        })
      }
    } catch {
      // Ignore errors in this optional check
    }
  }
}

export async function checkPackageJson(results: DoctorResult, cwd: string): Promise<void> {
  const packageJsonPath = join(cwd, 'package.json')
  const exists = await fileExists(packageJsonPath)

  if (exists) {
    results.checks.push({
      message: 'package.json exists',
      status: 'ok',
    })
  } else {
    results.checks.push({
      details: 'This may not be a Node.js project',
      message: 'package.json not found',
      status: 'warning',
    })
  }
}

export async function checkTypeScript(results: DoctorResult, cwd: string): Promise<void> {
  try {
    const tsconfigPath = join(cwd, 'tsconfig.json')
    const hasTsConfig = await fileExists(tsconfigPath)

    if (hasTsConfig) {
      // Try to get TypeScript version
      try {
        const packageJsonPath = join(cwd, 'node_modules', 'typescript', 'package.json')
        const content = await fs.readFile(packageJsonPath, 'utf8')
        const pkg = JSON.parse(content) as { version?: string }
        results.checks.push({
          message: `TypeScript version: v${pkg.version ?? 'unknown'}`,
          status: 'ok',
        })
      } catch {
        results.checks.push({
          details: 'Run npm install typescript to install TypeScript',
          message: 'TypeScript: tsconfig.json found but TypeScript not installed',
          status: 'warning',
        })
      }
    }
  } catch {
    // TypeScript check is optional, so we don't add an error
  }
}

export { colorMessage, displayResults, getStatusSymbol } from './doctor-format-helpers.js'
