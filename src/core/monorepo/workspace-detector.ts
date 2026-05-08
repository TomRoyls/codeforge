import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { WorkspaceConfig, WorkspacePackage } from './types.js'

export class WorkspaceDetector {
  detectWorkspace(rootPath: string): WorkspaceConfig | null {
    const npmResult = this.tryNpmWorkspace(rootPath)
    if (npmResult) return npmResult

    const pnpmResult = this.tryPnpmWorkspace(rootPath)
    if (pnpmResult) return pnpmResult

    const lernaResult = this.tryLernaWorkspace(rootPath)
    if (lernaResult) return lernaResult

    const yarnResult = this.tryYarnWorkspace(rootPath)
    if (yarnResult) return yarnResult

    const turboResult = this.tryTurborepoWorkspace(rootPath)
    if (turboResult) return turboResult

    const nxResult = this.tryNxWorkspace(rootPath)
    if (nxResult) return nxResult

    return null
  }

  private tryNpmWorkspace(rootPath: string): WorkspaceConfig | null {
    const pkgPath = join(rootPath, 'package.json')
    const content = this.readFileContent(pkgPath)
    if (!content) return null

    const pkgJson = this.parseJson(content)
    if (!pkgJson) return null

    const patterns = this.detectNPMWorkspace(pkgJson)
    if (!patterns) return null

    return {
      type: 'npm',
      rootPath,
      packages: this.resolveGlobPatterns(rootPath, patterns),
    }
  }

  private tryPnpmWorkspace(rootPath: string): WorkspaceConfig | null {
    const pnpmPath = join(rootPath, 'pnpm-workspace.yaml')
    const content = this.readFileContent(pnpmPath)
    if (!content) return null

    const patterns = this.detectPnpmWorkspace(content)
    if (!patterns) return null

    return {
      type: 'pnpm',
      rootPath,
      packages: this.resolveGlobPatterns(rootPath, patterns),
    }
  }

  private tryLernaWorkspace(rootPath: string): WorkspaceConfig | null {
    const lernaPath = join(rootPath, 'lerna.json')
    const content = this.readFileContent(lernaPath)
    if (!content) return null

    const patterns = this.detectLernaWorkspace(content)
    if (!patterns) return null

    return {
      type: 'lerna',
      rootPath,
      packages: this.resolveGlobPatterns(rootPath, patterns),
    }
  }

  private tryYarnWorkspace(rootPath: string): WorkspaceConfig | null {
    const pkgPath = join(rootPath, 'package.json')
    const content = this.readFileContent(pkgPath)
    if (!content) return null

    const pkgJson = this.parseJson(content)
    if (!pkgJson) return null

    const patterns = this.detectYarnWorkspace(pkgJson)
    if (!patterns) return null

    return {
      type: 'yarn',
      rootPath,
      packages: this.resolveGlobPatterns(rootPath, patterns),
    }
  }

  private tryTurborepoWorkspace(rootPath: string): WorkspaceConfig | null {
    const turboPath = join(rootPath, 'turbo.json')
    const content = this.readFileContent(turboPath)
    if (!content) return null

    return {
      type: 'turborepo',
      rootPath,
      packages: this.resolveGlobPatterns(rootPath, ['packages/*', 'apps/*']),
    }
  }

  private tryNxWorkspace(rootPath: string): WorkspaceConfig | null {
    const nxPath = join(rootPath, 'nx.json')
    const content = this.readFileContent(nxPath)
    if (!content) return null

    return {
      type: 'nx',
      rootPath,
      packages: this.resolveGlobPatterns(rootPath, ['packages/*', 'apps/*', 'libs/*']),
    }
  }

  detectNPMWorkspace(packageJson: Record<string, unknown>): string[] | null {
    if (!packageJson.workspaces) return null

    if (Array.isArray(packageJson.workspaces)) {
      return packageJson.workspaces as string[]
    }

    if (
      typeof packageJson.workspaces === 'object' &&
      packageJson.workspaces !== null
    ) {
      const ws = packageJson.workspaces as { packages?: string[] }
      if (ws.packages && Array.isArray(ws.packages)) {
        return ws.packages
      }
    }

    return null
  }

  detectYarnWorkspace(packageJson: Record<string, unknown>): string[] | null {
    if (typeof packageJson.workspaces === 'undefined') return null

    const hasYarnLock =
      this.fileExists(join(arguments[1] ?? '', 'yarn.lock')) ||
      typeof packageJson.workspaces !== 'undefined'

    if (!hasYarnLock && !Array.isArray(packageJson.workspaces)) return null

    if (Array.isArray(packageJson.workspaces)) {
      return packageJson.workspaces as string[]
    }

    if (
      typeof packageJson.workspaces === 'object' &&
      packageJson.workspaces !== null
    ) {
      const ws = packageJson.workspaces as { packages?: string[] }
      if (ws.packages && Array.isArray(ws.packages)) {
        return ws.packages
      }
    }

    return null
  }

  detectPnpmWorkspace(content: string): string[] | null {
    const packagesMatch = content.match(/packages:\s*\n((?:\s*-\s*.+\n?)+)/)
    if (!packagesMatch || !packagesMatch[1]) return null

    const packages: string[] = []
    const lines = packagesMatch[1].split('\n')
    for (const line of lines) {
      const match = line.match(/^\s*-\s*['"]?([^'"\n]+)['"]?\s*$/)
      if (match && match[1]) {
        packages.push(match[1].trim())
      }
    }

    return packages.length > 0 ? packages : null
  }

  detectLernaWorkspace(content: string): string[] | null {
    const parsed = this.parseJson(content)
    if (!parsed) return null

    if (parsed.packages && Array.isArray(parsed.packages)) {
      return parsed.packages as string[]
    }

    return null
  }

  resolveGlobPatterns(rootPath: string, patterns: string[]): string[] {
    const results: string[] = []
    const seen = new Set<string>()

    for (const pattern of patterns) {
      const normalizedPattern = pattern.replace(/\/$/, '')
      const globStarIndex = normalizedPattern.indexOf('/*')

      if (globStarIndex !== -1) {
        const basePath = normalizedPattern.substring(0, globStarIndex)
        const fullPath = resolve(rootPath, basePath)

        if (!this.dirExists(fullPath)) continue

        const entries = this.readDir(fullPath)
        for (const entry of entries) {
          const entryPath = join(fullPath, entry)
          if (
            this.dirExists(entryPath) &&
            this.fileExists(join(entryPath, 'package.json'))
          ) {
            const pkg = this.parsePackageJson(join(entryPath, 'package.json'))
            if (pkg && !seen.has(pkg.path)) {
              seen.add(pkg.path)
              results.push(pkg.path)
            }
          }
        }
      } else {
        const fullPath = resolve(rootPath, normalizedPattern)
        if (
          this.dirExists(fullPath) &&
          this.fileExists(join(fullPath, 'package.json'))
        ) {
          const pkg = this.parsePackageJson(join(fullPath, 'package.json'))
          if (pkg && !seen.has(pkg.path)) {
            seen.add(pkg.path)
            results.push(pkg.path)
          }
        }
      }
    }

    return results
  }

  parsePackageJson(filePath: string): WorkspacePackage | null {
    const content = this.readFileContent(filePath)
    if (!content) return null

    const pkg = this.parseJson(content)
    if (!pkg || typeof pkg !== 'object') return null

    const name = pkg.name
    if (typeof name !== 'string') return null

    const deps: string[] = []
    const devDeps: string[] = []
    const peerDeps: string[] = []

    if (pkg.dependencies && typeof pkg.dependencies === 'object') {
      deps.push(...Object.keys(pkg.dependencies as Record<string, string>))
    }
    if (pkg.devDependencies && typeof pkg.devDependencies === 'object') {
      devDeps.push(
        ...Object.keys(pkg.devDependencies as Record<string, string>),
      )
    }
    if (pkg.peerDependencies && typeof pkg.peerDependencies === 'object') {
      peerDeps.push(
        ...Object.keys(pkg.peerDependencies as Record<string, string>),
      )
    }

    return {
      name,
      path: filePath,
      version: typeof pkg.version === 'string' ? pkg.version : '0.0.0',
      dependencies: deps,
      devDependencies: devDeps,
      peerDependencies: peerDeps,
      scripts:
        pkg.scripts && typeof pkg.scripts === 'object'
          ? (pkg.scripts as Record<string, string>)
          : {},
      private: pkg.private === true,
    }
  }

  private readFileContent(filePath: string): string | null {
    try {
      return readFileSync(filePath, 'utf-8')
    } catch {
      return null
    }
  }

  private parseJson(content: string): Record<string, unknown> | null {
    try {
      return JSON.parse(content) as Record<string, unknown>
    } catch {
      return null
    }
  }

  private fileExists(filePath: string): boolean {
    try {
      return statSync(filePath).isFile()
    } catch {
      return false
    }
  }

  private dirExists(dirPath: string): boolean {
    try {
      return statSync(dirPath).isDirectory()
    } catch {
      return false
    }
  }

  private readDir(dirPath: string): string[] {
    try {
      return readdirSync(dirPath)
    } catch {
      return []
    }
  }
}
