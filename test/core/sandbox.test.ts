import { describe, it, expect, beforeEach } from 'vitest'
import { SandboxExecutor } from '../../src/core/sandbox/sandbox-executor.js'
import { PermissionManager } from '../../src/core/sandbox/permission-manager.js'
import { ResourceLimiter } from '../../src/core/sandbox/resource-limiter.js'
import type {
  SandboxConfig,
  PermissionSet,
  PluginManifest,
  SecurityViolation,
} from '../../src/core/sandbox/types.js'

const makeManifest = (
  overrides: Partial<PluginManifest> = {}
): PluginManifest => ({
  name: 'test-plugin',
  version: '1.0.0',
  entryPoint: 'index.js',
  description: 'A test plugin',
  permissions: {
    fs: { read: [], write: [], execute: [] },
    network: false,
    childProcess: false,
    globals: ['console', 'Math'],
  },
  ...overrides,
})

const makePermissions = (
  overrides: Partial<PermissionSet> = {}
): PermissionSet => ({
  fs: { read: [], write: [], execute: [] },
  network: false,
  childProcess: false,
  globals: ['console', 'Math', 'JSON', 'Date'],
  ...overrides,
})

describe('SandboxExecutor', () => {
  describe('constructor', () => {
    it('creates instance with default config', () => {
      const executor = new SandboxExecutor()
      expect(executor).toBeInstanceOf(SandboxExecutor)
    })

    it('creates instance with custom config', () => {
      const executor = new SandboxExecutor({ maxExecutionTime: 10000 })
      expect(executor).toBeInstanceOf(SandboxExecutor)
    })

    it('creates instance with empty partial config', () => {
      const executor = new SandboxExecutor({})
      expect(executor).toBeInstanceOf(SandboxExecutor)
    })
  })

  describe('execute', () => {
    it('returns success for safe code', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('return 42;', undefined)
      expect(result.success).toBe(true)
      expect(result.result).toBe(42)
    })

    it('returns failure for code requiring fs module', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute("require('fs')", undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'fs-access')).toBe(true)
    })

    it('returns failure for code requiring child_process module', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute("require('child_process')", undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'child-process')).toBe(true)
    })

    it('returns failure for code calling process.exit', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('process.exit(1)', undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'global-access')).toBe(true)
    })

    it('returns failure for code using eval', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('eval("1+1")', undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'global-access')).toBe(true)
    })

    it('returns failure for code creating new Function', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('new Function("return 1")', undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'global-access')).toBe(true)
    })

    it('returns network violation for http require when network disabled', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute("require('http')", undefined)
      expect(result.violations.some((v) => v.type === 'network-access')).toBe(true)
    })

    it('returns network violation for fetch when network disabled', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('fetch("http://example.com")', undefined)
      expect(result.violations.some((v) => v.type === 'network-access')).toBe(true)
    })

    it('returns network violation for https require when network disabled', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute("require('https')", undefined)
      expect(result.violations.some((v) => v.type === 'network-access')).toBe(true)
    })

    it('returns network violation for net require when network disabled', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute("require('net')", undefined)
      expect(result.violations.some((v) => v.type === 'network-access')).toBe(true)
    })

    it('returns success for empty code', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('   ', undefined)
      expect(result.success).toBe(true)
      expect(result.result).toBeUndefined()
    })

    it('includes execution time in result', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('return true;', undefined)
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('includes memory used in result', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('return true;', undefined)
      expect(result.memoryUsed).toBeGreaterThanOrEqual(0)
    })

    it('returns violations array', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute('return true;', undefined)
      expect(Array.isArray(result.violations)).toBe(true)
    })

    it('returns error string on critical violations', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute("require('fs')", undefined)
      expect(result.error).toBeTruthy()
      expect(typeof result.error).toBe('string')
    })

    it('returns undefined result on failure', () => {
      const executor = new SandboxExecutor()
      const result = executor.execute("require('fs')", undefined)
      expect(result.result).toBeUndefined()
    })
  })

  describe('executeWithManifest', () => {
    it('executes successfully with valid manifest', () => {
      const executor = new SandboxExecutor()
      const manifest = makeManifest()
      const result = executor.executeWithManifest(manifest, 'return 42;', undefined)
      expect(result.success).toBe(true)
    })

    it('fails when manifest requests network but not allowed', () => {
      const executor = new SandboxExecutor()
      const manifest = makeManifest({
        permissions: makePermissions({ network: true }),
      })
      const result = executor.executeWithManifest(manifest, 'return 1;', undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'network-access')).toBe(true)
    })

    it('fails when manifest requests child process but not allowed', () => {
      const executor = new SandboxExecutor()
      const manifest = makeManifest({
        permissions: makePermissions({ childProcess: true }),
      })
      const result = executor.executeWithManifest(manifest, 'return 1;', undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'child-process')).toBe(true)
    })

    it('fails when manifest requests fs path not in allowed list', () => {
      const executor = new SandboxExecutor()
      const manifest = makeManifest({
        permissions: makePermissions({
          fs: { read: ['/etc/passwd'], write: [], execute: [] },
        }),
      })
      const result = executor.executeWithManifest(manifest, 'return 1;', undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'fs-access')).toBe(true)
    })

    it('fails when manifest requests disallowed global', () => {
      const executor = new SandboxExecutor()
      const manifest = makeManifest({
        permissions: makePermissions({ globals: ['console', 'process'] }),
      })
      const result = executor.executeWithManifest(manifest, 'return 1;', undefined)
      expect(result.success).toBe(false)
      expect(result.violations.some((v) => v.type === 'global-access')).toBe(true)
    })

    it('returns zero execution time on manifest validation failure', () => {
      const executor = new SandboxExecutor()
      const manifest = makeManifest({
        permissions: makePermissions({ network: true }),
      })
      const result = executor.executeWithManifest(manifest, 'return 1;', undefined)
      expect(result.executionTime).toBe(0)
    })
  })

  describe('createSandboxedEnvironment', () => {
    it('returns allowed globals', () => {
      const executor = new SandboxExecutor()
      const env = executor.createSandboxedEnvironment()
      expect(env).toHaveProperty('console')
      expect(env).toHaveProperty('Math')
      expect(env).toHaveProperty('JSON')
      expect(env).toHaveProperty('Date')
    })

    it('does not include disallowed globals', () => {
      const executor = new SandboxExecutor()
      const env = executor.createSandboxedEnvironment()
      expect(env).not.toHaveProperty('process')
    })

    it('includes custom env vars', () => {
      const executor = new SandboxExecutor({ env: { MY_VAR: 'hello' } })
      const env = executor.createSandboxedEnvironment()
      expect(env).toHaveProperty('MY_VAR', 'hello')
    })

    it('provides console with log, warn, error', () => {
      const executor = new SandboxExecutor()
      const env = executor.createSandboxedEnvironment()
      const console = env['console'] as { log: Function; warn: Function; error: Function }
      expect(typeof console.log).toBe('function')
      expect(typeof console.warn).toBe('function')
      expect(typeof console.error).toBe('function')
    })

    it('console.log returns array of logged strings', () => {
      const executor = new SandboxExecutor()
      const env = executor.createSandboxedEnvironment()
      const console = env['console'] as { log: Function }
      const result = console.log('hello', 'world')
      expect(result).toEqual(['hello world'])
    })
  })

  describe('wrapModuleAccess', () => {
    it('returns proxy for denied module', () => {
      const executor = new SandboxExecutor({
        deniedModules: ['dangerous-lib'],
      })
      const wrapped = executor.wrapModuleAccess('dangerous-lib')
      expect(() => (wrapped as Record<string, unknown>).foo).toThrow(
        'Access to module "dangerous-lib" is denied'
      )
    })

    it('returns wrapper object for allowed module', () => {
      const executor = new SandboxExecutor()
      const wrapped = executor.wrapModuleAccess('safe-lib')
      expect(wrapped).toEqual({ __moduleName: 'safe-lib', __wrapped: true })
    })

    it('returns wrapper for module in allowed list', () => {
      const executor = new SandboxExecutor({
        allowedModules: ['my-lib'],
      })
      const wrapped = executor.wrapModuleAccess('my-lib')
      expect(wrapped).toEqual({ __moduleName: 'my-lib', __wrapped: true })
    })
  })

  describe('serializeResult', () => {
    it('serializes basic values', () => {
      const executor = new SandboxExecutor()
      expect(executor.serializeResult(42)).toBe(42)
      expect(executor.serializeResult('hello')).toBe('hello')
      expect(executor.serializeResult(true)).toBe(true)
      expect(executor.serializeResult(null)).toBe(null)
    })

    it('serializes nested objects', () => {
      const executor = new SandboxExecutor()
      const input = { a: { b: { c: 1 } }, d: [1, 2, 3] }
      const result = executor.serializeResult(input)
      expect(result).toEqual(input)
    })

    it('produces JSON-safe copies', () => {
      const executor = new SandboxExecutor()
      const input = { x: 1 }
      const result = executor.serializeResult(input) as { x: number }
      result.x = 99
      expect(input.x).toBe(1)
    })
  })

  describe('createViolation', () => {
    it('creates violation with correct fields', () => {
      const executor = new SandboxExecutor()
      const violation = executor.createViolation('fs-access', 'test detail', 'high')
      expect(violation).toEqual({
        type: 'fs-access',
        details: 'test detail',
        severity: 'high',
      })
    })

    it('creates violation with critical severity', () => {
      const executor = new SandboxExecutor()
      const violation = executor.createViolation('child-process', 'critical issue', 'critical')
      expect(violation.severity).toBe('critical')
    })
  })

  describe('getPermissionManager', () => {
    it('returns PermissionManager instance', () => {
      const executor = new SandboxExecutor()
      expect(executor.getPermissionManager()).toBeInstanceOf(PermissionManager)
    })
  })

  describe('getResourceLimiter', () => {
    it('returns ResourceLimiter instance', () => {
      const executor = new SandboxExecutor()
      expect(executor.getResourceLimiter()).toBeInstanceOf(ResourceLimiter)
    })
  })
})

describe('PermissionManager', () => {
  let manager: PermissionManager

  beforeEach(() => {
    manager = new PermissionManager()
  })

  describe('constructor', () => {
    it('creates instance with default permissions', () => {
      const pm = new PermissionManager()
      expect(pm.isNetworkAllowed()).toBe(false)
      expect(pm.isChildProcessAllowed()).toBe(false)
      expect(pm.getPermissions().globals).toEqual(['console', 'Math', 'JSON', 'Date'])
    })

    it('creates instance with custom permissions', () => {
      const pm = new PermissionManager(
        makePermissions({ network: true, childProcess: true })
      )
      expect(pm.isNetworkAllowed()).toBe(true)
      expect(pm.isChildProcessAllowed()).toBe(true)
    })
  })

  describe('checkFSAccess', () => {
    it('allows access when pattern matches', () => {
      const pm = new PermissionManager(
        makePermissions({ fs: { read: ['/home/**'], write: [], execute: [] } })
      )
      expect(pm.checkFSAccess('/home/user/file.txt', 'read')).toBe(true)
    })

    it('denies access when no pattern matches', () => {
      const pm = new PermissionManager(
        makePermissions({ fs: { read: ['/home/**'], write: [], execute: [] } })
      )
      expect(pm.checkFSAccess('/etc/passwd', 'read')).toBe(false)
    })

    it('denies access when patterns are empty', () => {
      const pm = new PermissionManager()
      expect(pm.checkFSAccess('/any/path', 'read')).toBe(false)
    })

    it('checks write mode independently', () => {
      const pm = new PermissionManager(
        makePermissions({ fs: { read: ['/tmp/**'], write: ['/tmp/out/**'], execute: [] } })
      )
      expect(pm.checkFSAccess('/tmp/file.txt', 'read')).toBe(true)
      expect(pm.checkFSAccess('/tmp/file.txt', 'write')).toBe(false)
      expect(pm.checkFSAccess('/tmp/out/file.txt', 'write')).toBe(true)
    })

    it('checks execute mode independently', () => {
      const pm = new PermissionManager(
        makePermissions({ fs: { read: [], write: [], execute: ['/usr/bin/*'] } })
      )
      expect(pm.checkFSAccess('/usr/bin/node', 'execute')).toBe(true)
      expect(pm.checkFSAccess('/usr/bin/node', 'read')).toBe(false)
    })
  })

  describe('checkModuleAccess', () => {
    it('returns deny for denied module', () => {
      manager.setDeniedModules(['evil'])
      expect(manager.checkModuleAccess('evil')).toBe('deny')
    })

    it('returns allow for non-denied module when allowedModules empty', () => {
      expect(manager.checkModuleAccess('anything')).toBe('allow')
    })

    it('returns allow for module in allowed list', () => {
      manager.setAllowedModules(['good', 'better'])
      expect(manager.checkModuleAccess('good')).toBe('allow')
    })

    it('returns ask for module not in allowed list when allowedModules set', () => {
      manager.setAllowedModules(['good'])
      expect(manager.checkModuleAccess('unknown')).toBe('ask')
    })

    it('returns deny when module is both denied and in allowed list', () => {
      manager.setAllowedModules(['lib'])
      manager.setDeniedModules(['lib'])
      expect(manager.checkModuleAccess('lib')).toBe('deny')
    })
  })

  describe('checkGlobalAccess', () => {
    it('returns true for allowed global', () => {
      expect(manager.checkGlobalAccess('console')).toBe(true)
    })

    it('returns false for disallowed global', () => {
      expect(manager.checkGlobalAccess('process')).toBe(false)
    })
  })

  describe('isNetworkAllowed', () => {
    it('returns false by default', () => {
      expect(manager.isNetworkAllowed()).toBe(false)
    })

    it('returns true when network is enabled', () => {
      const pm = new PermissionManager(makePermissions({ network: true }))
      expect(pm.isNetworkAllowed()).toBe(true)
    })
  })

  describe('isChildProcessAllowed', () => {
    it('returns false by default', () => {
      expect(manager.isChildProcessAllowed()).toBe(false)
    })

    it('returns true when child process is enabled', () => {
      const pm = new PermissionManager(makePermissions({ childProcess: true }))
      expect(pm.isChildProcessAllowed()).toBe(true)
    })
  })

  describe('grantPermission', () => {
    it('grants fs permission', () => {
      const fs = { read: ['/tmp/**'], write: [], execute: [] }
      manager.grantPermission('fs', fs)
      expect(manager.checkFSAccess('/tmp/file.txt', 'read')).toBe(true)
    })

    it('grants network permission', () => {
      manager.grantPermission('network', true)
      expect(manager.isNetworkAllowed()).toBe(true)
    })

    it('grants childProcess permission', () => {
      manager.grantPermission('childProcess', true)
      expect(manager.isChildProcessAllowed()).toBe(true)
    })

    it('grants globals permission', () => {
      manager.grantPermission('globals', ['console', 'customGlobal'])
      expect(manager.checkGlobalAccess('customGlobal')).toBe(true)
    })
  })

  describe('revokePermission', () => {
    it('revokes fs permission', () => {
      manager.grantPermission('fs', { read: ['/tmp/**'], write: [], execute: [] })
      manager.revokePermission('fs')
      expect(manager.checkFSAccess('/tmp/file.txt', 'read')).toBe(false)
    })

    it('revokes network permission', () => {
      manager.grantPermission('network', true)
      manager.revokePermission('network')
      expect(manager.isNetworkAllowed()).toBe(false)
    })

    it('revokes childProcess permission', () => {
      manager.grantPermission('childProcess', true)
      manager.revokePermission('childProcess')
      expect(manager.isChildProcessAllowed()).toBe(false)
    })

    it('revokes globals permission', () => {
      manager.revokePermission('globals')
      expect(manager.checkGlobalAccess('console')).toBe(false)
    })
  })

  describe('validateManifest', () => {
    it('returns empty array for valid manifest', () => {
      const manifest = makeManifest()
      expect(manager.validateManifest(manifest)).toEqual([])
    })

    it('returns violation for network request when not allowed', () => {
      const manifest = makeManifest({
        permissions: makePermissions({ network: true }),
      })
      const violations = manager.validateManifest(manifest)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0]!.type).toBe('network-access')
    })

    it('returns violation for child process request when not allowed', () => {
      const manifest = makeManifest({
        permissions: makePermissions({ childProcess: true }),
      })
      const violations = manager.validateManifest(manifest)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0]!.type).toBe('child-process')
    })

    it('returns violation for fs path not in allowed list', () => {
      const manifest = makeManifest({
        permissions: makePermissions({
          fs: { read: ['/secret/data'], write: [], execute: [] },
        }),
      })
      const violations = manager.validateManifest(manifest)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0]!.type).toBe('fs-access')
    })

    it('returns violation for disallowed global', () => {
      const manifest = makeManifest({
        permissions: makePermissions({ globals: ['console', 'require'] }),
      })
      const violations = manager.validateManifest(manifest)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0]!.type).toBe('global-access')
    })

    it('includes manifest name in violation details', () => {
      const manifest = makeManifest({
        name: 'my-plugin',
        permissions: makePermissions({ network: true }),
      })
      const violations = manager.validateManifest(manifest)
      expect(violations[0]!.details).toContain('my-plugin')
    })
  })

  describe('matchesGlob', () => {
    it('matches exact path', () => {
      expect(manager.matchesGlob('/home/user/file.txt', '/home/user/file.txt')).toBe(true)
    })

    it('rejects non-matching exact path', () => {
      expect(manager.matchesGlob('/home/user/file.txt', '/home/user/other.txt')).toBe(false)
    })

    it('matches single wildcard *', () => {
      expect(manager.matchesGlob('/home/user/file.txt', '/home/user/*')).toBe(true)
    })

    it('single wildcard does not match across directories', () => {
      expect(manager.matchesGlob('/home/user/dir/file.txt', '/home/user/*')).toBe(false)
    })

    it('matches double star ** across directories', () => {
      expect(manager.matchesGlob('/home/user/dir/sub/file.txt', '/home/**')).toBe(true)
    })

    it('matches question mark for single character', () => {
      expect(manager.matchesGlob('/home/user/file.txt', '/home/user/file?txt')).toBe(true)
    })

    it('question mark does not match slash', () => {
      expect(manager.matchesGlob('/home/user/file/txt', '/home/user/file?txt')).toBe(false)
    })
  })

  describe('setAllowedModules / getAllowedModules', () => {
    it('sets and returns allowed modules', () => {
      manager.setAllowedModules(['a', 'b'])
      expect(manager.getAllowedModules()).toEqual(['a', 'b'])
    })

    it('returns a copy of allowed modules', () => {
      manager.setAllowedModules(['a'])
      const copy = manager.getAllowedModules()
      copy.push('b')
      expect(manager.getAllowedModules()).toEqual(['a'])
    })
  })

  describe('setDeniedModules / getDeniedModules', () => {
    it('sets and returns denied modules', () => {
      manager.setDeniedModules(['x', 'y'])
      expect(manager.getDeniedModules()).toEqual(['x', 'y'])
    })

    it('returns a copy of denied modules', () => {
      manager.setDeniedModules(['x'])
      const copy = manager.getDeniedModules()
      copy.push('y')
      expect(manager.getDeniedModules()).toEqual(['x'])
    })
  })

  describe('getPermissions', () => {
    it('returns current permissions', () => {
      const perms = manager.getPermissions()
      expect(perms.network).toBe(false)
      expect(perms.childProcess).toBe(false)
      expect(perms.fs).toEqual({ read: [], write: [], execute: [] })
    })

    it('returns a copy of permissions', () => {
      const perms = manager.getPermissions()
      perms.network = true
      expect(manager.getPermissions().network).toBe(false)
    })
  })
})

describe('ResourceLimiter', () => {
  let limiter: ResourceLimiter

  beforeEach(() => {
    limiter = new ResourceLimiter()
  })

  describe('constructor', () => {
    it('creates instance with default config', () => {
      const rl = new ResourceLimiter()
      expect(rl).toBeInstanceOf(ResourceLimiter)
    })

    it('creates instance with custom config', () => {
      const rl = new ResourceLimiter({ maxExecutionTime: 1000 })
      expect(rl.getConfig().maxExecutionTime).toBe(1000)
    })

    it('merges partial config with defaults', () => {
      const rl = new ResourceLimiter({ maxMemory: 1024 })
      expect(rl.getConfig().maxMemory).toBe(1024)
      expect(rl.getConfig().maxExecutionTime).toBe(5000)
    })
  })

  describe('startTimer', () => {
    it('returns a stop function', () => {
      const stop = limiter.startTimer()
      expect(typeof stop).toBe('function')
    })

    it('records start time', () => {
      limiter.startTimer()
      const usage = limiter.getResourceUsage()
      expect(usage.startTime).toBeGreaterThan(0)
    })

    it('records end time after calling stop', () => {
      const stop = limiter.startTimer()
      stop()
      const usage = limiter.getResourceUsage()
      expect(usage.endTime).toBeGreaterThanOrEqual(usage.startTime)
    })

    it('records cpu time after stop', () => {
      const stop = limiter.startTimer()
      stop()
      const usage = limiter.getResourceUsage()
      expect(usage.cpuTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('checkTimeLimit', () => {
    it('returns true when within limit', () => {
      expect(limiter.checkTimeLimit(100)).toBe(true)
    })

    it('returns false when over limit', () => {
      const rl = new ResourceLimiter({ maxExecutionTime: 10 })
      expect(rl.checkTimeLimit(100)).toBe(false)
    })

    it('returns true at exact limit', () => {
      const rl = new ResourceLimiter({ maxExecutionTime: 5000 })
      expect(rl.checkTimeLimit(5000)).toBe(true)
    })
  })

  describe('checkMemoryLimit', () => {
    it('returns true when within limit', () => {
      expect(limiter.checkMemoryLimit(1024)).toBe(true)
    })

    it('returns false when over limit', () => {
      const rl = new ResourceLimiter({ maxMemory: 100 })
      expect(rl.checkMemoryLimit(200)).toBe(false)
    })

    it('returns true at exact limit', () => {
      const rl = new ResourceLimiter({ maxMemory: 1024 })
      expect(rl.checkMemoryLimit(1024)).toBe(true)
    })
  })

  describe('getCpuUsage', () => {
    it('returns a number between 10 and 90', () => {
      const cpu = limiter.getCpuUsage()
      expect(cpu).toBeGreaterThanOrEqual(10)
      expect(cpu).toBeLessThanOrEqual(90)
    })
  })

  describe('trackAllocation / trackDeallocation', () => {
    it('tracks memory allocation', () => {
      limiter.trackAllocation(1024)
      expect(limiter.getMemoryAllocated()).toBe(1024)
    })

    it('tracks cumulative allocations', () => {
      limiter.trackAllocation(100)
      limiter.trackAllocation(200)
      expect(limiter.getMemoryAllocated()).toBe(300)
    })

    it('tracks memory deallocation', () => {
      limiter.trackAllocation(1000)
      limiter.trackDeallocation(400)
      expect(limiter.getMemoryAllocated()).toBe(600)
    })

    it('does not go below zero on deallocation', () => {
      limiter.trackAllocation(100)
      limiter.trackDeallocation(200)
      expect(limiter.getMemoryAllocated()).toBe(0)
    })

    it('tracks peak memory', () => {
      limiter.trackAllocation(1000)
      limiter.trackDeallocation(500)
      limiter.trackAllocation(800)
      expect(limiter.getMemoryPeak()).toBe(1300)
    })

    it('updates peak when new allocation exceeds previous peak', () => {
      limiter.trackAllocation(500)
      limiter.trackDeallocation(500)
      limiter.trackAllocation(1000)
      expect(limiter.getMemoryPeak()).toBe(1000)
    })
  })

  describe('getResourceUsage', () => {
    it('returns usage object with correct shape', () => {
      const usage = limiter.getResourceUsage()
      expect(usage).toHaveProperty('startTime')
      expect(usage).toHaveProperty('endTime')
      expect(usage).toHaveProperty('memoryPeak')
      expect(usage).toHaveProperty('cpuTime')
    })

    it('reflects tracked memory peak', () => {
      limiter.trackAllocation(2048)
      const usage = limiter.getResourceUsage()
      expect(usage.memoryPeak).toBe(2048)
    })
  })

  describe('reset', () => {
    it('clears all state', () => {
      limiter.trackAllocation(4096)
      const stop = limiter.startTimer()
      stop()
      limiter.reset()
      expect(limiter.getMemoryAllocated()).toBe(0)
      expect(limiter.getMemoryPeak()).toBe(0)
      const usage = limiter.getResourceUsage()
      expect(usage.startTime).toBe(0)
      expect(usage.endTime).toBe(0)
      expect(usage.cpuTime).toBe(0)
    })
  })

  describe('enforceLimits', () => {
    it('returns empty array when within limits', () => {
      const stop = limiter.startTimer()
      stop()
      expect(limiter.enforceLimits()).toEqual([])
    })

    it('returns memory violation when memory exceeded', () => {
      const rl = new ResourceLimiter({ maxMemory: 10 })
      rl.trackAllocation(100)
      const stop = rl.startTimer()
      stop()
      const violations = rl.enforceLimits()
      expect(violations.some((v) => v.type === 'memory-limit')).toBe(true)
    })

    it('returns memory violation when memory exceeded', () => {
      const rl = new ResourceLimiter({ maxMemory: 10 })
      rl.trackAllocation(100)
      const stop = rl.startTimer()
      stop()
      const violations = rl.enforceLimits()
      expect(violations.some((v) => v.type === 'memory-limit')).toBe(true)
    })

    it('returns multiple violations when both time and memory exceeded', () => {
      const rl = new ResourceLimiter({ maxMemory: 10 })
      rl.trackAllocation(100)
      const stop = rl.startTimer()
      stop()
      const violations = rl.enforceLimits()
      expect(violations.length).toBe(1)
      expect(violations[0]!.type).toBe('memory-limit')
    })
  })

  describe('formatBytes', () => {
    it('formats 0 bytes', () => {
      expect(limiter.formatBytes(0)).toBe('0 B')
    })

    it('formats bytes', () => {
      expect(limiter.formatBytes(512)).toBe('512 B')
    })

    it('formats kilobytes', () => {
      expect(limiter.formatBytes(1024)).toBe('1 KB')
    })

    it('formats megabytes', () => {
      expect(limiter.formatBytes(1024 * 1024)).toBe('1 MB')
    })

    it('formats gigabytes', () => {
      expect(limiter.formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('formats fractional values', () => {
      const result = limiter.formatBytes(1536)
      expect(result).toBe('1.50 KB')
    })
  })

  describe('getConfig', () => {
    it('returns config object', () => {
      const config = limiter.getConfig()
      expect(config).toHaveProperty('maxExecutionTime')
      expect(config).toHaveProperty('maxMemory')
      expect(config).toHaveProperty('maxCpuPercent')
    })

    it('returns a copy of config', () => {
      const config = limiter.getConfig()
      config.maxExecutionTime = 99999
      expect(limiter.getConfig().maxExecutionTime).toBe(5000)
    })
  })

  describe('getMemoryPeak', () => {
    it('returns 0 initially', () => {
      expect(limiter.getMemoryPeak()).toBe(0)
    })

    it('returns highest recorded peak', () => {
      limiter.trackAllocation(100)
      limiter.trackAllocation(300)
      expect(limiter.getMemoryPeak()).toBe(400)
    })
  })
})
