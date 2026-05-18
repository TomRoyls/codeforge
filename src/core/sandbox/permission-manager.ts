import type {
  PermissionSet,
  FSPermission,
  ModuleAccessPolicy,
  PluginManifest,
  SecurityViolation,
} from './types.js'

const _globCache = new Map<string, RegExp>()

const DEFAULT_PERMISSIONS: PermissionSet = {
  fs: { read: [], write: [], execute: [] },
  network: false,
  childProcess: false,
  globals: ['console', 'Math', 'JSON', 'Date'],
}

export class PermissionManager {
  private permissions: PermissionSet
  private allowedModules: string[]
  private deniedModules: string[]

  constructor(permissions: PermissionSet = DEFAULT_PERMISSIONS) {
    this.permissions = {
      fs: { ...permissions.fs },
      network: permissions.network,
      childProcess: permissions.childProcess,
      globals: [...permissions.globals],
    }
    this.allowedModules = []
    this.deniedModules = []
  }

  checkFSAccess(path: string, mode: 'read' | 'write' | 'execute'): boolean {
    const patterns = this.permissions.fs[mode]
    if (patterns.length === 0) return false
    return patterns.some((pattern) => this.matchesGlob(path, pattern))
  }

  checkModuleAccess(moduleName: string): ModuleAccessPolicy {
    if (this.deniedModules.includes(moduleName)) return 'deny'
    if (this.allowedModules.length === 0) return 'allow'
    if (this.allowedModules.includes(moduleName)) return 'allow'
    return 'ask'
  }

  checkGlobalAccess(globalName: string): boolean {
    return this.permissions.globals.includes(globalName)
  }

  isNetworkAllowed(): boolean {
    return this.permissions.network
  }

  isChildProcessAllowed(): boolean {
    return this.permissions.childProcess
  }

  grantPermission(permission: keyof PermissionSet, value: unknown): void {
    if (permission === 'fs') {
      this.permissions.fs = value as FSPermission
    } else if (permission === 'network') {
      this.permissions.network = value as boolean
    } else if (permission === 'childProcess') {
      this.permissions.childProcess = value as boolean
    } else if (permission === 'globals') {
      this.permissions.globals = value as string[]
    }
  }

  revokePermission(permission: keyof PermissionSet): void {
    if (permission === 'fs') {
      this.permissions.fs = { read: [], write: [], execute: [] }
    } else if (permission === 'network') {
      this.permissions.network = false
    } else if (permission === 'childProcess') {
      this.permissions.childProcess = false
    } else if (permission === 'globals') {
      this.permissions.globals = []
    }
  }

  validateManifest(manifest: PluginManifest): SecurityViolation[] {
    const violations: SecurityViolation[] = []

    if (manifest.permissions.network && !this.permissions.network) {
      violations.push({
        type: 'network-access',
        details: `Plugin "${manifest.name}" requests network access but it is not allowed`,
        severity: 'high',
      })
    }

    if (manifest.permissions.childProcess && !this.permissions.childProcess) {
      violations.push({
        type: 'child-process',
        details: `Plugin "${manifest.name}" requests child process access but it is not allowed`,
        severity: 'critical',
      })
    }

    for (const mode of ['read', 'write', 'execute'] as const) {
      for (const pattern of manifest.permissions.fs[mode]) {
        if (!this.permissions.fs[mode].some((p) => this.matchesGlob(pattern, p))) {
          violations.push({
            type: 'fs-access',
            details: `Plugin "${manifest.name}" requests fs.${mode} access to "${pattern}" which is not allowed`,
            severity: 'medium',
          })
        }
      }
    }

    for (const global of manifest.permissions.globals) {
      if (!this.permissions.globals.includes(global)) {
        violations.push({
          type: 'global-access',
          details: `Plugin "${manifest.name}" requests access to global "${global}" which is not allowed`,
          severity: 'low',
        })
      }
    }

    return violations
  }

  matchesGlob(path: string, pattern: string): boolean {
    let regex = _globCache.get(pattern)
    if (!regex) {
      const regexStr = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '<<<DOUBLESTAR>>>')
        .replace(/\*/g, '[^/]*')
        .replace(/<<<DOUBLESTAR>>>/g, '.*')
        .replace(/\?/g, '[^/]')
      regex = new RegExp(`^${regexStr}$`)
      _globCache.set(pattern, regex)
    }
    return regex.test(path)
  }

  setAllowedModules(modules: string[]): void {
    this.allowedModules = [...modules]
  }

  setDeniedModules(modules: string[]): void {
    this.deniedModules = [...modules]
  }

  getAllowedModules(): string[] {
    return [...this.allowedModules]
  }

  getDeniedModules(): string[] {
    return [...this.deniedModules]
  }

  getPermissions(): PermissionSet {
    return { ...this.permissions }
  }
}
