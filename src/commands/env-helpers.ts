import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface ToolInfo {
  name: string
  version: string | null
  installed: boolean
  required: boolean
  requiredVersion: string | null
  compatible: boolean | null
  path: string | null
}

export interface EnvInfo {
  os: string
  arch: string
  nodeVersion: string
  npmVersion: string | null
  packageManager: string
  packageManagerVersion: string | null
  tools: ToolInfo[]
  shell: string | null
  gitVersion: string | null
  editor: string | null
}

export interface EnvCheck {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  fix: string | null
}

export interface EnvResult {
  info: EnvInfo
  checks: EnvCheck[]
  score: number
  issues: string[]
}

export interface EnvOptions {
  check?: boolean
  verbose?: boolean
}

// ─── Version parsing ────────────────────────────────────

const VERSION_REGEX = /(\d+\.\d+\.\d+)/

/**
 * Parse a version string like "v20.11.0" to "20.11.0".
 *
 * @example
 * ```ts
 * parseVersion('v20.11.0') // '20.11.0'
 * parseVersion('no version') // null
 * ```
 */
export function parseVersion(output: string): string | null {
  const match = output.match(VERSION_REGEX)
  const m = output.match(VERSION_REGEX)
  return m?.[1] !== undefined ? m[1] : null
}

/**
 * Extract major version number from a version string.
 *
 * @example
 * ```ts
 * majorVersion('20.11.0') // 20
 * ```
 */
export function majorVersion(version: string): number {
  const parts = version.split('.')
  return parseInt(parts[0] ?? '0', 10)
}

// ─── Tool detection ─────────────────────────────────────

/**
 * Detect an installed tool and its version.
 *
 * @example
 * ```ts
 * const tool = detectTool('node', ['--version'])
 * tool.installed // true
 * ```
 */
export function detectTool(name: string, versionArgs: string[] = ['--version']): ToolInfo {
  try {
    const output = execSync(`${name} ${versionArgs.join(' ')}`, {
      encoding: 'utf8',
      timeout: 3000,
    }).trim()
    const version = parseVersion(output)
    return {
      compatible: null, installed: true, name, path: null,
      required: false, requiredVersion: null, version,
    }
  } catch {
    return {
      compatible: null, installed: false, name, path: null,
      required: false, requiredVersion: null, version: null,
    }
  }
}

/**
 * Detect Node.js version from process.
 *
 * @example
 * ```ts
 * detectNodeVersion() // '20.11.0'
 * ```
 */
export function detectNodeVersion(): string {
  return process.version.replace(/^v/, '')
}

/**
 * Detect npm version by running npm --version.
 *
 * @example
 * ```ts
 * detectNpmVersion() // '10.2.3'
 * ```
 */
export function detectNpmVersion(): string | null {
  return detectTool('npm', ['--version']).version
}

/**
 * Detect git version.
 *
 * @example
 * ```ts
 * detectGitVersion() // '2.43.0'
 * ```
 */
export function detectGitVersion(): string | null {
  return detectTool('git', ['--version']).version
}

/**
 * Detect OS platform and architecture.
 *
 * @example
 * ```ts
 * detectOS() // { os: 'linux', arch: 'x64' }
 * ```
 */
export function detectOS(): { os: string; arch: string } {
  return { arch: process.arch, os: process.platform }
}

/**
 * Detect current shell from environment.
 *
 * @example
 * ```ts
 * detectShell() // '/bin/bash'
 * ```
 */
export function detectShell(): string | null {
  return process.env.SHELL ?? process.env.ComSpec ?? null
}

/**
 * Detect editor from environment variables.
 *
 * @example
 * ```ts
 * detectEditor() // 'vim'
 * ```
 */
export function detectEditor(): string | null {
  return process.env.EDITOR ?? process.env.VISUAL ?? null
}

// ─── Package manager detection ──────────────────────────

/**
 * Detect package manager from lock files.
 *
 * @example
 * ```ts
 * detectPackageManager('/project') // { name: 'npm', version: '10.2.3' }
 * ```
 */
export function detectPackageManager(cwd: string): { name: string; version: string | null } {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    const v = detectTool('pnpm', ['--version']).version
    return { name: 'pnpm', version: v }
  }
  if (existsSync(join(cwd, 'yarn.lock'))) {
    const v = detectTool('yarn', ['--version']).version
    return { name: 'yarn', version: v }
  }
  if (existsSync(join(cwd, 'bun.lockb'))) {
    const v = detectTool('bun', ['--version']).version
    return { name: 'bun', version: v }
  }
  return { name: 'npm', version: detectTool('npm', ['--version']).version }
}

// ─── Required tools from project config ─────────────────

/**
 * Read required tool versions from package.json engines.
 *
 * @example
 * ```ts
 * checkRequiredTools('/project') // [{ name: 'node', requiredVersion: '>=20', ... }]
 * ```
 */
export function checkRequiredTools(cwd: string): Map<string, string> {
  const required = new Map<string, string>()

  const pkgPath = join(cwd, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
      if (pkg.engines && typeof pkg.engines === 'object') {
        for (const [tool, version] of Object.entries(pkg.engines)) {
          if (typeof version === 'string') {
            required.set(tool, version)
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  const nvmrcPath = join(cwd, '.nvmrc')
  if (existsSync(nvmrcPath) && !required.has('node')) {
    try {
      const content = readFileSync(nvmrcPath, 'utf8').trim()
      if (content) required.set('node', content)
    } catch {
      // ignore
    }
  }

  return required
}

// ─── Compatibility ──────────────────────────────────────

/**
 * Compute compatibility between installed and required version.
 *
 * @example
 * ```ts
 * computeCompatibility('20.11.0', '>=18') // true
 * computeCompatibility('16.0.0', '>=18') // false
 * ```
 */
export function computeCompatibility(installed: string | null, required: string | null): boolean | null {
  if (!installed || !required) return null

  const installedMajor = majorVersion(installed)
  const reqStr: string = required

  const cleanRequired = reqStr.replace(/^[~^>=<]+\s*/, '')
  const requiredVersionMatch = cleanRequired.match(VERSION_REGEX)
  const bareMajorMatch = cleanRequired.match(/^(\d+)$/)

  let requiredMajor: number
  if (requiredVersionMatch) {
    requiredMajor = majorVersion(requiredVersionMatch[1] !== undefined ? requiredVersionMatch[1] : '0')
  } else if (bareMajorMatch) {
    requiredMajor = parseInt(bareMajorMatch[1] !== undefined ? bareMajorMatch[1] : '0', 10)
  } else {
    return null
  }

  if (reqStr.startsWith('>=')) return installedMajor >= requiredMajor
  if (reqStr.startsWith('>')) return installedMajor > requiredMajor
  if (reqStr.startsWith('<=')) return installedMajor <= requiredMajor
  if (reqStr.startsWith('<')) return installedMajor < requiredMajor
  if (reqStr.startsWith('~') || reqStr.startsWith('^')) return installedMajor === requiredMajor

  return installedMajor === requiredMajor
}

// ─── runEnvChecks ───────────────────────────────────────

/**
 * Run environment checks and return results.
 *
 * @example
 * ```ts
 * const checks = runEnvChecks(info, '/project')
 * checks[0].status // 'pass'
 * ```
 */
export function runEnvChecks(info: EnvInfo, cwd: string): EnvCheck[] {
  const checks: EnvCheck[] = []

  checks.push({
    fix: 'Install Node.js from https://nodejs.org',
    message: `Node.js ${info.nodeVersion} detected`,
    name: 'Node.js',
    status: 'pass',
  })

  if (info.npmVersion) {
    checks.push({
      fix: null, message: `npm ${info.npmVersion} detected`,
      name: 'npm', status: 'pass',
    })
  } else {
    checks.push({
      fix: 'Install npm: npm install -g npm',
      message: 'npm not found',
      name: 'npm', status: 'fail',
    })
  }

  if (info.gitVersion) {
    checks.push({
      fix: null, message: `git ${info.gitVersion} detected`,
      name: 'git', status: 'pass',
    })
  } else {
    checks.push({
      fix: 'Install git from https://git-scm.com',
      message: 'git not found',
      name: 'git', status: 'fail',
    })
  }

  const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb']
  const hasLock = lockFiles.some((f) => existsSync(join(cwd, f)))
  if (hasLock) {
    checks.push({
      fix: null, message: `Lock file found (${info.packageManager})`,
      name: 'Lock file', status: 'pass',
    })
  } else {
    checks.push({
      fix: 'Run npm install / yarn install / pnpm install to generate lock file',
      message: 'No lock file found',
      name: 'Lock file', status: 'warn',
    })
  }

  if (existsSync(join(cwd, 'node_modules'))) {
    checks.push({
      fix: null, message: 'Dependencies installed',
      name: 'Dependencies', status: 'pass',
    })
  } else {
    checks.push({
      fix: 'Run npm install / yarn install / pnpm install',
      message: 'node_modules not found',
      name: 'Dependencies', status: 'fail',
    })
  }

  const pkgPath = join(cwd, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
      if (pkg.engines?.node) {
        const compat = computeCompatibility(info.nodeVersion, pkg.engines.node)
        if (compat === true) {
          checks.push({
            fix: null, message: `Node.js ${info.nodeVersion} meets ${pkg.engines.node}`,
            name: 'engines.node', status: 'pass',
          })
        } else {
          checks.push({
            fix: `Upgrade Node.js to meet ${pkg.engines.node}`,
            message: `Node.js ${info.nodeVersion} does not meet ${pkg.engines.node}`,
            name: 'engines.node', status: 'fail',
          })
        }
      }
    } catch {
      // ignore
    }
  }

  return checks
}

// ─── computeEnvScore ────────────────────────────────────

/**
 * Compute environment health score from checks.
 *
 * @example
 * ```ts
 * computeEnvScore(checks) // 85
 * ```
 */
export function computeEnvScore(checks: EnvCheck[]): number {
  let score = 100
  for (const check of checks) {
    if (check.status === 'warn') score -= 10
    if (check.status === 'fail') score -= 25
  }
  return Math.max(0, score)
}

// ─── buildEnvResult ─────────────────────────────────────

/**
 * Orchestrate full environment analysis.
 *
 * @example
 * ```ts
 * const result = buildEnvResult('/project', {})
 * result.score // 85
 * ```
 */
export function buildEnvResult(cwd: string, options: EnvOptions): EnvResult {
  const { os, arch } = detectOS()
  const nodeVersion = detectNodeVersion()
  const npmVersion = detectNpmVersion()
  const gitVersion = detectGitVersion()
  const shell = detectShell()
  const editor = detectEditor()
  const pm = detectPackageManager(cwd)

  const requiredTools = options.check ? checkRequiredTools(cwd) : new Map<string, string>()

  const toolNames = ['node', 'npm', 'git', 'pnpm', 'yarn', 'bun', 'tsc', 'eslint']
  const tools: ToolInfo[] = toolNames.map((name) => {
    const tool = detectTool(name, name === 'git' ? ['--version'] : ['--version'])
    const reqVersion = requiredTools.get(name) ?? null
    const compatible = reqVersion ? computeCompatibility(tool.version, reqVersion) : null
    return {
      ...tool,
      compatible,
      required: requiredTools.has(name),
      requiredVersion: reqVersion,
    }
  })

  const info: EnvInfo = {
    arch,
    editor,
    gitVersion,
    nodeVersion,
    npmVersion,
    packageManager: pm.name,
    packageManagerVersion: pm.version,
    os,
    shell,
    tools,
  }

  const checks = runEnvChecks(info, cwd)
  const score = computeEnvScore(checks)

  const issues: string[] = checks
    .filter((c) => c.status !== 'pass')
    .map((c) => `${c.name}: ${c.message}`)

  return { checks, info, issues, score }
}
