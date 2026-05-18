import { describe, it, expect } from 'vitest'
import { ServiceRegistry } from '../src/core/dependency-injector/service-registry.js'
import { DependencyInjector } from '../src/core/dependency-injector/dependency-injector.js'
import { DEFAULT_CONTAINER_CONFIG } from '../src/core/dependency-injector/types.js'
import type { ServiceRegistration, Container } from '../src/core/dependency-injector/types.js'

// ─── DEFAULT_CONTAINER_CONFIG ──────────────────────────────────────
describe('DEFAULT_CONTAINER_CONFIG', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_CONTAINER_CONFIG).toEqual({
      validateOnResolve: true,
      allowOverride: false,
      maxResolutionDepth: 50,
    })
  })
})

// ─── ServiceRegistry.register ──────────────────────────────────────
describe('ServiceRegistry.register', () => {
  it('registers a service', () => {
    const reg = new ServiceRegistry()
    reg.register({ token: 'svc', factory: () => 42, lifetime: 'singleton', dependencies: [] })
    expect(reg.has('svc')).toBe(true)
    expect(reg.get('svc')!.token).toBe('svc')
  })

  it('throws on duplicate when override disabled', () => {
    const reg = new ServiceRegistry(false)
    reg.register({ token: 'svc', factory: () => 1, lifetime: 'singleton', dependencies: [] })
    expect(() => reg.register({ token: 'svc', factory: () => 2, lifetime: 'transient', dependencies: [] }))
      .toThrow('already registered')
  })

  it('allows duplicate when override enabled', () => {
    const reg = new ServiceRegistry(true)
    reg.register({ token: 'svc', factory: () => 1, lifetime: 'singleton', dependencies: [] })
    expect(() => reg.register({ token: 'svc', factory: () => 2, lifetime: 'transient', dependencies: [] }))
      .not.toThrow()
  })

  it('registerSingleton shorthand', () => {
    const reg = new ServiceRegistry()
    reg.registerSingleton('svc', () => 'hello')
    expect(reg.get('svc')!.lifetime).toBe('singleton')
  })

  it('registerTransient shorthand', () => {
    const reg = new ServiceRegistry()
    reg.registerTransient('svc', () => 'hello')
    expect(reg.get('svc')!.lifetime).toBe('transient')
  })

  it('registerInstance shorthand', () => {
    const reg = new ServiceRegistry()
    reg.registerInstance('svc', { x: 1 })
    expect(reg.get('svc')!.lifetime).toBe('singleton')
  })
})

// ─── ServiceRegistry.unregister ────────────────────────────────────
describe('ServiceRegistry.unregister', () => {
  it('removes a registration', () => {
    const reg = new ServiceRegistry()
    reg.registerSingleton('svc', () => 1)
    expect(reg.unregister('svc')).toBe(true)
    expect(reg.has('svc')).toBe(false)
  })

  it('returns false for unknown token', () => {
    const reg = new ServiceRegistry()
    expect(reg.unregister('unknown')).toBe(false)
  })
})

// ─── ServiceRegistry.getAll / getDescriptors / size ─────────────────
describe('ServiceRegistry queries', () => {
  it('getAll returns all registrations', () => {
    const reg = new ServiceRegistry()
    reg.registerSingleton('a', () => 1)
    reg.registerTransient('b', () => 2)
    expect(reg.getAll()).toHaveLength(2)
  })

  it('getDescriptors returns descriptor list', () => {
    const reg = new ServiceRegistry()
    reg.registerSingleton('a', () => 1)
    const descs = reg.getDescriptors()
    expect(descs).toEqual([{ token: 'a', lifetime: 'singleton', created: false }])
  })

  it('size returns count', () => {
    const reg = new ServiceRegistry()
    reg.registerSingleton('a', () => 1)
    reg.registerSingleton('b', () => 2)
    expect(reg.size).toBe(2)
  })

  it('clear removes all', () => {
    const reg = new ServiceRegistry()
    reg.registerSingleton('a', () => 1)
    reg.clear()
    expect(reg.size).toBe(0)
  })
})

// ─── DependencyInjector constructor ─────────────────────────────────
describe('DependencyInjector constructor', () => {
  it('uses defaults', () => {
    const di = new DependencyInjector()
    expect(di.getConfig()).toMatchObject({
      validateOnResolve: true,
      allowOverride: false,
      maxResolutionDepth: 50,
    })
  })

  it('accepts partial config', () => {
    const di = new DependencyInjector({ allowOverride: true, maxResolutionDepth: 10 })
    const cfg = di.getConfig()
    expect(cfg.allowOverride).toBe(true)
    expect(cfg.maxResolutionDepth).toBe(10)
    expect(cfg.validateOnResolve).toBe(true)
  })

  it('accepts external registry', () => {
    const reg = new ServiceRegistry()
    reg.registerSingleton('svc', () => 42)
    const di = new DependencyInjector({}, reg)
    expect(di.has('svc')).toBe(true)
  })
})

// ─── DependencyInjector resolve singleton ───────────────────────────
describe('DependencyInjector resolve singleton', () => {
  it('resolves a singleton', () => {
    const di = new DependencyInjector()
    di.registerSingleton('svc', () => ({ x: 1 }))
    const instance = di.resolve<{ x: number }>('svc')
    expect(instance.x).toBe(1)
  })

  it('returns same instance for singleton', () => {
    const di = new DependencyInjector()
    di.registerSingleton('svc', () => ({ ts: Date.now() }))
    const a = di.resolve('svc')
    const b = di.resolve('svc')
    expect(a).toBe(b)
  })

  it('resolveInstance stores instance immediately', () => {
    const di = new DependencyInjector()
    const obj = { x: 42 }
    di.registerInstance('svc', obj)
    expect(di.resolve('svc')).toBe(obj)
    const instances = di.getInstances()
    expect(instances.get('svc')).toBe(obj)
  })
})

// ─── DependencyInjector resolve transient ───────────────────────────
describe('DependencyInjector resolve transient', () => {
  it('creates new instance each time', () => {
    const di = new DependencyInjector()
    di.registerTransient('svc', () => ({ id: Math.random() }))
    const a = di.resolve('svc')
    const b = di.resolve('svc')
    expect(a).not.toBe(b)
  })
})

// ─── DependencyInjector resolve with dependencies ──────────────────
describe('DependencyInjector resolve dependencies', () => {
  it('resolves dependencies from factory', () => {
    const di = new DependencyInjector()
    di.registerSingleton('config', () => ({ port: 3000 }))
    di.registerSingleton('server', (c: Container) => ({
      port: c.resolve<{ port: number }>('config').port,
    }))
    const server = di.resolve<{ port: number }>('server')
    expect(server.port).toBe(3000)
  })
})

// ─── DependencyInjector circular detection ──────────────────────────
describe('DependencyInjector circular detection', () => {
  it('throws on circular dependency', () => {
    const di = new DependencyInjector()
    di.registerSingleton('a', (c: Container) => c.resolve('b'))
    di.registerSingleton('b', (c: Container) => c.resolve('a'))
    expect(() => di.resolve('a')).toThrow('Circular dependency')
  })

  it('includes chain in error message', () => {
    const di = new DependencyInjector()
    di.registerSingleton('a', (c: Container) => c.resolve('b'))
    di.registerSingleton('b', (c: Container) => c.resolve('a'))
    try {
      di.resolve('a')
      expect.unreachable('Should have thrown')
    } catch (err) {
      expect((err as Error).message).toContain('a -> b -> a')
    }
  })
})

// ─── DependencyInjector max depth ──────────────────────────────────
describe('DependencyInjector max depth', () => {
  it('throws when exceeding maxResolutionDepth', () => {
    const di = new DependencyInjector({ maxResolutionDepth: 3 })
    di.registerSingleton('d0', (c: Container) => c.resolve('d1'))
    di.registerSingleton('d1', (c: Container) => c.resolve('d2'))
    di.registerSingleton('d2', (c: Container) => c.resolve('d3'))
    di.registerSingleton('d3', (c: Container) => c.resolve('d4'))
    di.registerSingleton('d4', (c: Container) => c.resolve('d5'))
    di.registerSingleton('d5', () => 'end')
    expect(() => di.resolve('d0')).toThrow('Maximum resolution depth')
  })
})

// ─── DependencyInjector unregistered ───────────────────────────────
describe('DependencyInjector unregistered', () => {
  it('throws for unregistered service', () => {
    const di = new DependencyInjector()
    expect(() => di.resolve('unknown')).toThrow('not registered')
  })

  it('has returns false for unregistered', () => {
    const di = new DependencyInjector()
    expect(di.has('unknown')).toBe(false)
  })
})

// ─── DependencyInjector createScope ────────────────────────────────
describe('DependencyInjector createScope', () => {
  it('creates scoped injector sharing registry', () => {
    const di = new DependencyInjector()
    di.registerTransient('svc', () => Math.random())
    const scope = di.createScope()
    expect(scope.has('svc')).toBe(true)
  })

  it('scoped injector has separate instances', () => {
    const di = new DependencyInjector()
    di.registerSingleton('svc', () => ({ ts: Date.now() }))
    const scope1 = di.createScope()
    const scope2 = di.createScope()
    const a = scope1.resolve('svc')
    const b = scope2.resolve('svc')
    expect(a).not.toBe(b)
  })
})

// ─── DependencyInjector reset ──────────────────────────────────────
describe('DependencyInjector reset', () => {
  it('clears cached instances', () => {
    const di = new DependencyInjector()
    di.registerSingleton('svc', () => ({ ts: Date.now() }))
    const first = di.resolve('svc')
    di.reset()
    const second = di.resolve('svc')
    expect(first).not.toBe(second)
  })
})

// ─── DependencyInjector getInstances ───────────────────────────────
describe('DependencyInjector getInstances', () => {
  it('returns copy of instances map', () => {
    const di = new DependencyInjector()
    di.registerInstance('svc', 42)
    const instances = di.getInstances()
    expect(instances.get('svc')).toBe(42)
    instances.set('other', 99)
    expect(di.getInstances().has('other')).toBe(false)
  })
})

// ─── DependencyInjector getConfig ──────────────────────────────────
describe('DependencyInjector getConfig', () => {
  it('returns copy of config', () => {
    const di = new DependencyInjector()
    const cfg = di.getConfig()
    cfg.maxResolutionDepth = 0
    expect(di.getConfig().maxResolutionDepth).toBe(50)
  })
})

// ─── DependencyInjector getRegistry ────────────────────────────────
describe('DependencyInjector getRegistry', () => {
  it('returns the registry', () => {
    const di = new DependencyInjector()
    di.registerSingleton('svc', () => 1)
    expect(di.getRegistry().has('svc')).toBe(true)
  })
})
