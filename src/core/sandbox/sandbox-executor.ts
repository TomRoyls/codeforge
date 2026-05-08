import type {
  SandboxConfig,
  SandboxResult,
  PluginManifest,
  SecurityViolation,
} from './types.js'
import { PermissionManager } from './permission-manager.js'
import { ResourceLimiter } from './resource-limiter.js'

const DEFAULT_CONFIG: SandboxConfig = {
  maxExecutionTime: 5000,
  maxMemory: 50 * 1024 * 1024,
  maxCpuPercent: 80,
  allowedModules: [],
  deniedModules: [],
  permissions: {
    fs: { read: [], write: [], execute: [] },
    network: false,
    childProcess: false,
    globals: ['console', 'Math', 'JSON', 'Date'],
  },
  env: {},
}

const FORBIDDEN_PATTERNS: Array<{
  pattern: RegExp
  type: SecurityViolation['type']
  severity: SecurityViolation['severity']
  details: string
}> = [
  {
    pattern: /require\s*\(\s*['"]fs['"]\s*\)/,
    type: 'fs-access',
    severity: 'high',
    details: "Attempted to access 'fs' module",
  },
  {
    pattern: /require\s*\(\s*['"]child_process['"]\s*\)/,
    type: 'child-process',
    severity: 'critical',
    details: "Attempted to access 'child_process' module",
  },
  {
    pattern: /process\.exit/,
    type: 'global-access',
    severity: 'critical',
    details: 'Attempted to call process.exit',
  },
  {
    pattern: /eval\s*\(/,
    type: 'global-access',
    severity: 'critical',
    details: 'Attempted to use eval()',
  },
  {
    pattern: /new\s+Function\s*\(/,
    type: 'global-access',
    severity: 'critical',
    details: 'Attempted to create Function dynamically',
  },
]

export class SandboxExecutor {
  private config: SandboxConfig
  private permissionManager: PermissionManager
  private resourceLimiter: ResourceLimiter

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.permissionManager = new PermissionManager(this.config.permissions)
    this.permissionManager.setAllowedModules(this.config.allowedModules)
    this.permissionManager.setDeniedModules(this.config.deniedModules)
    this.resourceLimiter = new ResourceLimiter(this.config)
  }

  execute(pluginCode: string, input: unknown): SandboxResult {
    const violations: SecurityViolation[] = []
    const stopTimer = this.resourceLimiter.startTimer()
    const startTime = Date.now()

    this.resourceLimiter.trackAllocation(this.estimateCodeSize(pluginCode))

    const codeViolations = this.scanCode(pluginCode)
    violations.push(...codeViolations)

    const moduleViolations = this.checkModuleAccess(pluginCode)
    violations.push(...moduleViolations)

    const networkViolations = this.checkNetworkAccess(pluginCode)
    violations.push(...networkViolations)

    const criticalViolations = violations.filter(
      (v) => v.severity === 'critical' || v.severity === 'high'
    )

    stopTimer()
    const endTime = Date.now()
    const executionTime = endTime - startTime

    const usage = this.resourceLimiter.getResourceUsage()
    const limitViolations = this.resourceLimiter.enforceLimits()
    violations.push(...limitViolations)

    if (criticalViolations.length > 0) {
      return {
        success: false,
        result: undefined,
        error: `Security violations detected: ${criticalViolations.map((v) => v.details).join('; ')}`,
        executionTime,
        memoryUsed: usage.memoryPeak,
        violations,
      }
    }

    const result = this.simulateExecution(pluginCode, input)

    return {
      success: true,
      result,
      executionTime,
      memoryUsed: usage.memoryPeak,
      violations,
    }
  }

  executeWithManifest(
    manifest: PluginManifest,
    pluginCode: string,
    input: unknown
  ): SandboxResult {
    const manifestViolations = this.permissionManager.validateManifest(manifest)
    if (manifestViolations.length > 0) {
      const stopTimer = this.resourceLimiter.startTimer()
      stopTimer()
      return {
        success: false,
        result: undefined,
        error: `Manifest validation failed: ${manifestViolations.map((v) => v.details).join('; ')}`,
        executionTime: 0,
        memoryUsed: 0,
        violations: manifestViolations,
      }
    }

    const result = this.execute(pluginCode, input)
    return result
  }

  createSandboxedEnvironment(): Record<string, unknown> {
    const env: Record<string, unknown> = {}

    const allowedGlobals = this.config.permissions.globals
    for (const global of allowedGlobals) {
      if (global === 'console') {
        env[global] = this.interceptConsole()
      } else if (global === 'Math') {
        env[global] = Math
      } else if (global === 'JSON') {
        env[global] = JSON
      } else if (global === 'Date') {
        env[global] = Date
      }
    }

    for (const [key, value] of Object.entries(this.config.env)) {
      env[key] = value
    }

    return env
  }

  wrapModuleAccess(moduleName: string): unknown {
    const policy = this.permissionManager.checkModuleAccess(moduleName)
    if (policy === 'deny') {
      return new Proxy(
        {},
        {
          get() {
            throw new Error(`Access to module "${moduleName}" is denied`)
          },
        }
      )
    }
    return { __moduleName: moduleName, __wrapped: true }
  }

  serializeResult(value: unknown): unknown {
    return JSON.parse(JSON.stringify(value))
  }

  createViolation(
    type: SecurityViolation['type'],
    details: string,
    severity: SecurityViolation['severity']
  ): SecurityViolation {
    return { type, details, severity }
  }

  private interceptConsole(): {
    log: (...args: unknown[]) => string[]
    warn: (...args: unknown[]) => string[]
    error: (...args: unknown[]) => string[]
  } {
    const logs: string[] = []
    const warns: string[] = []
    const errors: string[] = []

    return {
      log: (...args: unknown[]) => {
        const msg = args.map(String).join(' ')
        logs.push(msg)
        return logs
      },
      warn: (...args: unknown[]) => {
        const msg = args.map(String).join(' ')
        warns.push(msg)
        return warns
      },
      error: (...args: unknown[]) => {
        const msg = args.map(String).join(' ')
        errors.push(msg)
        return errors
      },
    }
  }

  private scanCode(code: string): SecurityViolation[] {
    const violations: SecurityViolation[] = []
    for (const { pattern, type, severity, details } of FORBIDDEN_PATTERNS) {
      if (pattern.test(code)) {
        violations.push({ type, details, severity })
      }
    }
    return violations
  }

  private checkModuleAccess(code: string): SecurityViolation[] {
    const violations: SecurityViolation[] = []
    const requireMatch = code.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g)
    for (const match of requireMatch) {
      const moduleName = match[1] ?? ''
      const policy = this.permissionManager.checkModuleAccess(moduleName)
      if (policy === 'deny') {
        violations.push({
          type: 'module-access',
          details: `Access to module "${moduleName}" is denied`,
          severity: 'high',
        })
      } else if (policy === 'ask') {
        violations.push({
          type: 'module-access',
          details: `Access to module "${moduleName}" requires approval`,
          severity: 'medium',
        })
      }
    }
    return violations
  }

  private checkNetworkAccess(code: string): SecurityViolation[] {
    const violations: SecurityViolation[] = []
    const networkPatterns = [
      /require\s*\(\s*['"]http['"]\s*\)/,
      /require\s*\(\s*['"]https['"]\s*\)/,
      /require\s*\(\s*['"]net['"]\s*\)/,
      /require\s*\(\s*['"]dgram['"]\s*\)/,
      /fetch\s*\(/,
    ]
    for (const pattern of networkPatterns) {
      if (pattern.test(code) && !this.permissionManager.isNetworkAllowed()) {
        violations.push({
          type: 'network-access',
          details: 'Network access is not allowed',
          severity: 'high',
        })
        break
      }
    }
    return violations
  }

  private estimateCodeSize(code: string): number {
    return code.length * 2
  }

  private simulateExecution(code: string, input: unknown): unknown {
    if (code.trim().length === 0) {
      return undefined
    }

    const returnMatch = code.match(/return\s+(.+?)(?:;|\n|$)/)
    if (returnMatch) {
      const expr = returnMatch[1]?.trim()
      if (expr === 'input') return this.serializeResult(input)
      if (expr === 'true') return true
      if (expr === 'false') return false
      if (expr === 'null') return null
      if (expr === 'undefined') return undefined
      const numVal = Number(expr)
      if (!isNaN(numVal) && expr !== '') return numVal
      if (expr?.startsWith('"') || expr?.startsWith("'")) {
        return expr.slice(1, -1)
      }
    }

    return { simulated: true, codeLength: code.length }
  }

  getPermissionManager(): PermissionManager {
    return this.permissionManager
  }

  getResourceLimiter(): ResourceLimiter {
    return this.resourceLimiter
  }
}
