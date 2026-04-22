import type { ImportDeclaration, SourceFile } from 'ts-morph'

import chalk from 'chalk'

export interface ImportGroup {
  external: ImportDeclaration[]
  internal: ImportDeclaration[]
  relative: ImportDeclaration[]
  sideEffects: ImportDeclaration[]
}

export interface OrganizeResult {
  filesModified: number
  importsOrganized: number
  skipped: number
}

export const GROUP_ORDER = ['external', 'internal', 'relative', 'sideEffects'] as const

export function categorizeImport(
  imp: ImportDeclaration,
  internalPatterns: string[],
): keyof ImportGroup {
  const source = imp.getModuleSpecifierValue()

  if (!source.startsWith('.') && !source.startsWith('/')) {
    for (const pattern of internalPatterns) {
      if (source.startsWith(pattern)) {
        return 'internal'
      }
    }

    return 'external'
  }

  return 'relative'
}

export function detectInternalPatterns(_sourceFile: SourceFile): string[] {
  return ['@/', '~/src/', '@/src/']
}

export function getImportGroups(sourceFile: SourceFile, internalPatterns: string[]): ImportGroup {
  const imports = sourceFile.getImportDeclarations()

  const groups: ImportGroup = {
    external: [],
    internal: [],
    relative: [],
    sideEffects: [],
  }

  for (const imp of imports) {
    if (imp.getNamespaceImport() || imp.getDefaultImport()) {
      groups.external.push(imp)
      continue
    }

    const category = categorizeImport(imp, internalPatterns)
    groups[category].push(imp)
  }

  return groups
}

export function organizeFile(
  sourceFile: SourceFile,
  options: { dryRun: boolean; group: boolean; sort: boolean },
): { changed: boolean; organized: string; original: string } {
  const original = sourceFile.getFullText()

  if (!options.group && !options.sort) {
    return { changed: false, organized: original, original }
  }

  const internalPatterns = detectInternalPatterns(sourceFile)
  const groups = getImportGroups(sourceFile, internalPatterns)

  const importStart = sourceFile.getImportDeclarations()[0]?.getStart() ?? 0
  const lastImport = sourceFile.getImportDeclarations().at(-1)
  const importEnd = lastImport?.getEnd() ?? 0

  if (importStart === importEnd) {
    return { changed: false, organized: original, original }
  }

  const beforeImports = original.slice(0, importStart)
  const afterImports = original.slice(importEnd)

  let organizedImports = ''

  if (options.group) {
    const parts: string[] = []

    for (const groupKey of GROUP_ORDER) {
      const groupImports = groups[groupKey]
      if (groupImports.length > 0) {
        const sorted = options.sort
          ? [...groupImports].sort((a, b) =>
              a.getModuleSpecifierValue().localeCompare(b.getModuleSpecifierValue()),
            )
          : groupImports

        parts.push(sorted.map((imp) => imp.getText()).join('\n'))
      }
    }

    organizedImports = parts.join('\n\n')
  } else {
    const allImports = [...groups.external, ...groups.internal, ...groups.relative]
    const sorted = options.sort
      ? [...allImports].sort((a, b) =>
          a.getModuleSpecifierValue().localeCompare(b.getModuleSpecifierValue()),
        )
      : allImports

    organizedImports = sorted.map((imp) => imp.getText()).join('\n')
  }

  const organized = beforeImports + organizedImports + afterImports

  return {
    changed: organized !== original,
    organized,
    original,
  }
}

export function displayOrganizeResult(
  result: OrganizeResult,
  filesCount: number,
  dryRun: boolean,
  logFn: (msg?: string) => void,
): void {
  logFn('')
  logFn(chalk.bold('  Import Organization Complete'))
  logFn('')
  logFn(`    Files processed: ${filesCount.toString()}`)
  logFn(`    Imports organized: ${chalk.green(result.importsOrganized.toString())}`)
  logFn(`    Skipped: ${chalk.yellow(result.skipped.toString())}`)

  if (dryRun) {
    logFn('')
    logFn(chalk.gray('  (dry-run mode - no files were modified)'))
  }

  logFn('')
}

export function buildOrganizeOptions(flags: {
  'dry-run'?: boolean
  group?: boolean
  sort?: boolean
}): { dryRun: boolean; group: boolean; sort: boolean } {
  return {
    dryRun: flags['dry-run'] ?? false,
    group: flags.group ?? false,
    sort: flags.sort ?? true,
  }
}

export function shouldWriteChanges(flags: { 'dry-run'?: boolean; write?: boolean }): boolean {
  return flags.write || !flags['dry-run']
}
