import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join, resolve } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

/** Detected license information with confidence score. */
export interface LicenseInfo {
  /** SPDX identifier, e.g. 'MIT', 'Apache-2.0', 'GPL-3.0' */
  spdxId: string
  /** Full license name */
  name: string
  /** Match confidence from 0 to 1 */
  confidence: number
}

/** License file found in the project. */
export interface LicenseFile {
  /** File path relative to project root */
  path: string
  /** File content */
  content: string
}

/** Project-level license analysis. */
export interface ProjectLicense {
  /** Detected licenses from file content analysis */
  detected: LicenseInfo[]
  /** License files found in the project */
  licenseFiles: LicenseFile[]
  /** License string from package.json */
  packageJsonLicense: string | null
}

/** Dependency license information. */
export interface DepLicense {
  /** Package name */
  name: string
  /** Package version */
  version: string
  /** License SPDX identifier */
  license: string
  /** Path to license file if found */
  licenseFile: string | null
  /** Whether this is a direct dependency */
  isDirect: boolean
}

/** License compatibility issue. */
export interface LicenseCheckIssue {
  /** Issue type */
  type: 'copyleft' | 'incompatible' | 'missing' | 'unknown'
  /** Dependency name */
  dependency: string
  /** License string */
  license: string
  /** Human-readable description */
  description: string
}

/** License breakdown entry. */
export interface LicenseBreakdown {
  /** License name */
  license: string
  /** Number of dependencies with this license */
  count: number
}

/** Summary statistics. */
export interface LicenseSummary {
  /** Total number of dependencies scanned */
  totalDeps: number
  /** License count breakdown */
  licenseBreakdown: LicenseBreakdown[]
  /** Number of issues found */
  issuesFound: number
}

/** Full license analysis result. */
export interface LicenseResult {
  /** Project license information */
  projectLicense: ProjectLicense
  /** Dependency license information */
  dependencies: DepLicense[]
  /** Compatibility issues */
  issues: LicenseCheckIssue[]
  /** Summary statistics */
  summary: LicenseSummary
}

/** Options for license analysis. */
export interface LicenseOptions {
  /** Include dependency license analysis */
  deps: boolean
  /** Check for license compatibility issues */
  check: boolean
  /** Show detailed output */
  verbose: boolean
}

// ─── License pattern definitions ──────────────────────────

interface LicensePattern {
  spdxId: string
  name: string
  patterns: string[]
  minConfidence: number
}

const LICENSE_PATTERNS: LicensePattern[] = [
  {
    minConfidence: 0.9,
    name: 'MIT License',
    patterns: ['MIT License', 'Permission is hereby granted', 'all copies or substantial'],
    spdxId: 'MIT',
  },
  {
    minConfidence: 0.85,
    name: 'Apache License 2.0',
    patterns: ['Apache License', 'Version 2.0', 'Licensed under the Apache'],
    spdxId: 'Apache-2.0',
  },
  {
    minConfidence: 0.85,
    name: 'GNU General Public License v3.0',
    patterns: ['GNU GENERAL PUBLIC LICENSE', 'Version 3'],
    spdxId: 'GPL-3.0',
  },
  {
    minConfidence: 0.85,
    name: 'GNU General Public License v2.0',
    patterns: ['GNU GENERAL PUBLIC LICENSE', 'Version 2'],
    spdxId: 'GPL-2.0',
  },
  {
    minConfidence: 0.85,
    name: 'BSD 2-Clause License',
    patterns: ['BSD 2-Clause', 'Redistribution and use'],
    spdxId: 'BSD-2-Clause',
  },
  {
    minConfidence: 0.85,
    name: 'BSD 3-Clause License',
    patterns: ['BSD 3-Clause', 'Redistribution and use in source'],
    spdxId: 'BSD-3-Clause',
  },
  {
    minConfidence: 0.9,
    name: 'ISC License',
    patterns: ['ISC License', 'Permission to use, copy, modify'],
    spdxId: 'ISC',
  },
  {
    minConfidence: 0.9,
    name: 'The Unlicense',
    patterns: ['unlicense.org', 'This is free and unencumbered software'],
    spdxId: 'Unlicense',
  },
]

// ─── License text detection ───────────────────────────────

/**
 * Detect license type from license text content.
 *
 * @example
 * ```ts
 * const results = detectLicenseFromText('MIT License\n\nPermission is hereby granted...')
 * // [{ spdxId: 'MIT', name: 'MIT License', confidence: 0.9 }]
 * ```
 *
 * @param text - License file text content
 * @returns Array of detected licenses sorted by confidence descending
 */
export function detectLicenseFromText(text: string): LicenseInfo[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const upperText = text.toUpperCase()
  const results: LicenseInfo[] = []

  for (const licenseDef of LICENSE_PATTERNS) {
    let matchCount = 0
    for (const pattern of licenseDef.patterns) {
      if (upperText.includes(pattern.toUpperCase())) {
        matchCount++
      }
    }

    if (matchCount > 0) {
      const confidence = Math.min(
        licenseDef.minConfidence * (matchCount / licenseDef.patterns.length) + matchCount * 0.05,
        1,
      )
      results.push({
        confidence: Math.round(confidence * 100) / 100,
        name: licenseDef.name,
        spdxId: licenseDef.spdxId,
      })
    }
  }

  results.sort((a, b) => b.confidence - a.confidence)
  return results
}

// ─── License file discovery ───────────────────────────────

const LICENSE_FILE_NAMES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md', 'COPYING', 'COPYING.md']

/**
 * Find license files in the given directory.
 *
 * @example
 * ```ts
 * const files = await findLicenseFiles('/path/to/project')
 * // [{ path: 'LICENSE', content: 'MIT License...' }]
 * ```
 *
 * @param dir - Directory to scan for license files
 * @returns Array of found license files with their content
 */
export async function findLicenseFiles(dir: string): Promise<LicenseFile[]> {
  const results: LicenseFile[] = []

  if (!existsSync(dir)) {
    return results
  }

  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch {
    return results
  }

  const entryUpper = new Map<string, string>()
  for (const entry of entries) {
    entryUpper.set(entry.toUpperCase(), entry)
  }

  for (const licenseName of LICENSE_FILE_NAMES) {
    const actualName = entryUpper.get(licenseName.toUpperCase())
    if (actualName) {
      const fullPath = join(dir, actualName)
      try {
        const content = await fs.readFile(fullPath, 'utf8')
        results.push({ content, path: actualName })
      } catch {
        // skip unreadable files
      }
    }
  }

  return results
}

// ─── Package.json license reading ─────────────────────────

interface PackageJson {
  license?: string
  licenses?: Array<{ type: string }>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/**
 * Read the license field from package.json.
 *
 * @example
 * ```ts
 * const license = await readPackageJsonLicense('/path/to/project')
 * // 'MIT'
 * ```
 *
 * @param dir - Directory containing package.json
 * @returns License string or null if not found
 */
export async function readPackageJsonLicense(dir: string): Promise<string | null> {
  const pkgPath = join(dir, 'package.json')
  if (!existsSync(pkgPath)) {
    return null
  }

  try {
    const content = await fs.readFile(pkgPath, 'utf8')
    const pkg: PackageJson = JSON.parse(content)

    if (typeof pkg.license === 'string' && pkg.license.length > 0) {
      return pkg.license
    }

    // Check legacy `licenses` array format
    if (Array.isArray(pkg.licenses) && pkg.licenses.length > 0) {
      const first = pkg.licenses[0]
      if (first && typeof first.type === 'string') {
        return first.type
      }
    }

    return null
  } catch {
    return null
  }
}

// ─── Dependency license scanning ──────────────────────────

interface DepPackageJson {
  name?: string
  version?: string
  license?: string
  licenses?: Array<{ type: string }>
}

/**
 * Scan dependency licenses from node_modules.
 *
 * @example
 * ```ts
 * const deps = await scanDependencyLicenses('/path/to/project')
 * // [{ name: 'chalk', version: '5.3.0', license: 'MIT', ... }]
 * ```
 *
 * @param dir - Project root directory
 * @returns Array of dependency license information
 */
export async function scanDependencyLicenses(dir: string): Promise<DepLicense[]> {
  const pkgPath = join(dir, 'package.json')
  if (!existsSync(pkgPath)) {
    return []
  }

  let pkg: PackageJson
  try {
    const content = await fs.readFile(pkgPath, 'utf8')
    pkg = JSON.parse(content)
  } catch {
    return []
  }

  const directDeps = new Set<string>()

  const deps = pkg.dependencies ?? {}
  const devDeps = pkg.devDependencies ?? {}

  for (const name of Object.keys(deps)) {
    directDeps.add(name)
  }
  for (const name of Object.keys(devDeps)) {
    directDeps.add(name)
  }

  const allDepNames = Array.from(directDeps)
  const results: DepLicense[] = []
  const nodeModulesDir = join(dir, 'node_modules')
  const hasNodeModules = existsSync(nodeModulesDir)

  for (const depName of allDepNames) {
    let license: string = 'UNKNOWN'
    let version = '0.0.0'
    let licenseFile: string | null = null

    if (hasNodeModules) {
      const depPkgPath = join(nodeModulesDir, depName, 'package.json')
      try {
        const depContent = await fs.readFile(depPkgPath, 'utf8')
        const depPkg: DepPackageJson = JSON.parse(depContent)

        version = depPkg.version ?? '0.0.0'

        if (typeof depPkg.license === 'string' && depPkg.license.length > 0) {
          license = depPkg.license
        } else if (Array.isArray(depPkg.licenses) && depPkg.licenses.length > 0) {
          const first = depPkg.licenses[0]
          if (first && typeof first.type === 'string') {
            license = first.type
          }
        }
      } catch {
        // Package not found or unreadable
      }

      const depDir = join(nodeModulesDir, depName)
      const licenseFiles = await findLicenseFiles(depDir)
      if (licenseFiles.length > 0) {
        licenseFile = licenseFiles[0]!.path
      }
    }

    results.push({
      isDirect: true,
      license,
      licenseFile,
      name: depName,
      version,
    })
  }

  return results
}

// ─── License compatibility checking ───────────────────────

const COPYLEFT_PREFIXES = ['GPL', 'AGPL']
const PERMISSIVE_LICENSES = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense'])

function isCopyleft(license: string): boolean {
  const upper = license.toUpperCase()
  return COPYLEFT_PREFIXES.some((prefix) => upper.startsWith(prefix))
}

function isPermissive(license: string): boolean {
  return PERMISSIVE_LICENSES.has(license)
}

function isGpl(license: string): boolean {
  const upper = license.toUpperCase()
  return upper.startsWith('GPL')
}

/**
 * Check license compatibility between project and its dependencies.
 *
 * @example
 * ```ts
 * const issues = checkLicenseCompatibility('MIT', depLicenses)
 * // [{ type: 'copyleft', dependency: 'some-gpl-pkg', ... }]
 * ```
 *
 * @param projectLicense - The project's SPDX license identifier
 * @param depLicenses - Array of dependency license information
 * @returns Array of compatibility issues found
 */
export function checkLicenseCompatibility(projectLicense: string, depLicenses: DepLicense[]): LicenseCheckIssue[] {
  const issues: LicenseCheckIssue[] = []
  const projectIsPermissive = isPermissive(projectLicense)
  const projectIsGpl = isGpl(projectLicense)

  for (const dep of depLicenses) {
    if (dep.license === 'UNKNOWN' || dep.license === '') {
      issues.push({
        dependency: dep.name,
        description: `Dependency "${dep.name}" has no license information`,
        license: dep.license,
        type: 'missing',
      })
      continue
    }

    if (!isPermissive(dep.license) && !isCopyleft(dep.license) && dep.license !== projectLicense) {
      issues.push({
        dependency: dep.name,
        description: `Dependency "${dep.name}" has unrecognized license "${dep.license}"`,
        license: dep.license,
        type: 'unknown',
      })
      continue
    }

    if (projectIsPermissive && isCopyleft(dep.license)) {
      issues.push({
        dependency: dep.name,
        description: `Copyleft license "${dep.license}" may impose restrictions on permissive project license "${projectLicense}"`,
        license: dep.license,
        type: 'copyleft',
      })
    }

    if (!projectIsGpl && isGpl(dep.license)) {
      issues.push({
        dependency: dep.name,
        description: `GPL dependency "${dep.name}" (${dep.license}) may require the project to be GPL-compatible`,
        license: dep.license,
        type: 'incompatible',
      })
    }
  }

  return issues
}

// ─── Result builder ───────────────────────────────────────

/**
 * Build a complete license analysis result for a project.
 *
 * @example
 * ```ts
 * const result = await buildLicenseResult('/path/to/project', { deps: true, check: true, verbose: false })
 * console.log(result.summary)
 * ```
 *
 * @param projectDir - Project root directory
 * @param options - Analysis options
 * @returns Complete license analysis result
 */
export async function buildLicenseResult(projectDir: string, options: LicenseOptions): Promise<LicenseResult> {
  const absDir = resolve(projectDir)

  // Find project license files
  const licenseFiles = await findLicenseFiles(absDir)

  // Detect license from file contents
  const detected: LicenseInfo[] = []
  for (const file of licenseFiles) {
    const fileDetected = detectLicenseFromText(file.content)
    for (const info of fileDetected) {
      if (!detected.some((d) => d.spdxId === info.spdxId)) {
        detected.push(info)
      }
    }
  }

  // Read package.json license
  const packageJsonLicense = await readPackageJsonLicense(absDir)

  const projectLicense: ProjectLicense = {
    detected,
    licenseFiles,
    packageJsonLicense,
  }

  // Scan dependencies if requested
  const dependencies: DepLicense[] = options.deps ? await scanDependencyLicenses(absDir) : []

  // Check compatibility if requested
  const effectiveProjectLicense = packageJsonLicense ?? (detected.length > 0 ? detected[0]!.spdxId : 'UNKNOWN')
  const issues: LicenseCheckIssue[] = options.check ? checkLicenseCompatibility(effectiveProjectLicense, dependencies) : []

  // Build summary
  const licenseMap = new Map<string, number>()
  for (const dep of dependencies) {
    const lic = dep.license || 'UNKNOWN'
    const current = licenseMap.get(lic) ?? 0
    licenseMap.set(lic, current + 1)
  }

  const licenseBreakdown: LicenseBreakdown[] = Array.from(licenseMap.entries())
    .map(([license, count]) => ({ count, license }))
    .sort((a, b) => b.count - a.count)

  const summary: LicenseSummary = {
    issuesFound: issues.length,
    licenseBreakdown,
    totalDeps: dependencies.length,
  }

  return {
    dependencies,
    issues,
    projectLicense,
    summary,
  }
}
