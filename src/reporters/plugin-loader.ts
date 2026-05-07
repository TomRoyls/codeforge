import { existsSync } from 'node:fs'
import path from 'node:path'

import type { ReporterFactory } from './types.js'

import { CLIError } from '../utils/errors.js'

export function isCustomReporterFormat(format: string): boolean {
  return format.startsWith('custom:')
}

export function resolveReporterModulePath(modulePath: string, cwd: string = process.cwd()): string {
  const resolved = path.isAbsolute(modulePath) ? modulePath : path.resolve(cwd, modulePath)

  if (!existsSync(resolved)) {
    throw CLIError.fileNotFound(resolved)
  }

  return resolved
}

export function validateReporterModule(
  module: unknown,
): module is { default: ReporterFactory } | ReporterFactory {
  if (typeof module === 'function') {
    return true
  }

  if (
    module !== null &&
    typeof module === 'object' &&
    'default' in module &&
    typeof (module as { default: unknown }).default === 'function'
  ) {
    return true
  }

  return false
}

export async function loadReporterFromPath(modulePath: string): Promise<ReporterFactory> {
  let imported: unknown
  try {
    imported = await import(modulePath)
  } catch (importError) {
    throw CLIError.invalidInput(
      `Failed to load reporter module: ${modulePath}`,
      [
        importError instanceof Error ? importError.message : String(importError),
        'Ensure the module exports a ReporterFactory function',
        'Check the file path is correct and the module is valid',
      ],
    )
  }

  if (!validateReporterModule(imported)) {
    throw CLIError.invalidInput(
      `Invalid reporter module: ${modulePath} does not export a valid ReporterFactory`,
      [
        'The module must export a function (options: ReporterOptions) => Reporter',
        'Use a default export: export default function myReporter(options) { ... }',
        'Or a named export matching CommonJS interop patterns',
      ],
    )
  }

  if (typeof imported === 'function') {
    return imported as ReporterFactory
  }

  return (imported as { default: ReporterFactory }).default
}
