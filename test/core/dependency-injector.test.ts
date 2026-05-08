import { describe, it, expect } from 'vitest'
import { ServiceRegistry } from '../../src/core/dependency-injector/service-registry.js'
import { DependencyInjector } from '../../src/core/dependency-injector/dependency-injector.js'
import type { ServiceRegistration, ContainerConfig, ServiceDescriptor, ServiceLifetime } from '../../src/core/dependency-injector/types.js'
import { DEFAULT_CONTAINER_CONFIG } from '../../src/core/dependency-injector/types.js'

function createRegistration<T>(overrides: Partial<ServiceRegistration<T>> = {}): ServiceRegistration<T> {
  return {
    token: 'test-service',
    factory: () => ({ value: 42 }) as T,
    lifetime: 'singleton',
    dependencies: [],
    ...overrides,
  }
}

describe('ServiceRegistry', () => {
  describe('register', () => {
    it('should register a service', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration())
      expect(registry.has('test-service')).toBe(true)
    })

    it('should throw on duplicate token by default', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration())
      expect(() => registry.register(createRegistration())).toThrow('already registered')
    })

    it('should allow override when configured', () => {
      const registry = new ServiceRegistry(true)
      registry.register(createRegistration())
      expect(() => registry.register(createRegistration())).not.toThrow()
    })

    it('should register multiple different services', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration({ token: 'service-a' }))
      registry.register(createRegistration({ token: 'service-b' }))
      expect(registry.size).toBe(2)
    })
  })

  describe('registerSingleton', () => {
    it('should register a singleton service', () => {
      const registry = new ServiceRegistry()
      registry.registerSingleton('db', () => ({ host: 'localhost' }))
      const reg = registry.get('db')
      expect(reg).toBeDefined()
      expect(reg?.lifetime).toBe('singleton')
    })

    it('should create registration with empty dependencies', () => {
      const registry = new ServiceRegistry()
      registry.registerSingleton('svc', () => 'hello')
      const reg = registry.get('svc')
      expect(reg?.dependencies).toEqual([])
    })
  })

  describe('registerTransient', () => {
    it('should register a transient service', () => {
      const registry = new ServiceRegistry()
      registry.registerTransient('logger', () => ({ level: 'info' }))
      const reg = registry.get('logger')
      expect(reg).toBeDefined()
      expect(reg?.lifetime).toBe('transient')
    })

    it('should create registration with empty dependencies', () => {
      const registry = new ServiceRegistry()
      registry.registerTransient('svc', () => 'hello')
      const reg = registry.get('svc')
      expect(reg?.dependencies).toEqual([])
    })
  })

  describe('registerInstance', () => {
    it('should register a pre-created instance as singleton', () => {
      const registry = new ServiceRegistry()
      const instance = { port: 3000 }
      registry.registerInstance('config', instance)
      const reg = registry.get('config')
      expect(reg).toBeDefined()
      expect(reg?.lifetime).toBe('singleton')
    })

    it('should store instance in factory return', () => {
      const registry = new ServiceRegistry()
      const instance = { name: 'test' }
      registry.registerInstance('svc', instance)
      const reg = registry.get('svc')
      expect(reg?.factory({ resolve: () => {}, has: () => false })).toBe(instance)
    })
  })

  describe('unregister', () => {
    it('should remove a registered service', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration())
      expect(registry.unregister('test-service')).toBe(true)
      expect(registry.has('test-service')).toBe(false)
    })

    it('should return false for non-existent service', () => {
      const registry = new ServiceRegistry()
      expect(registry.unregister('non-existent')).toBe(false)
    })

    it('should decrease size after unregister', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration({ token: 'a' }))
      registry.register(createRegistration({ token: 'b' }))
      registry.unregister('a')
      expect(registry.size).toBe(1)
    })
  })

  describe('has', () => {
    it('should return true for registered service', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration())
      expect(registry.has('test-service')).toBe(true)
    })

    it('should return false for non-existent service', () => {
      const registry = new ServiceRegistry()
      expect(registry.has('nope')).toBe(false)
    })
  })

  describe('get', () => {
    it('should return registration for existing service', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration())
      const reg = registry.get('test-service')
      expect(reg).toBeDefined()
      expect(reg?.token).toBe('test-service')
    })

    it('should return undefined for non-existent service', () => {
      const registry = new ServiceRegistry()
      expect(registry.get('nope')).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('should return empty array when no services registered', () => {
      const registry = new ServiceRegistry()
      expect(registry.getAll()).toEqual([])
    })

    it('should return all registered services', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration({ token: 'a' }))
      registry.register(createRegistration({ token: 'b' }))
      const all = registry.getAll()
      expect(all).toHaveLength(2)
      const tokens = all.map((r) => r.token)
      expect(tokens).toContain('a')
      expect(tokens).toContain('b')
    })
  })

  describe('clear', () => {
    it('should remove all registrations', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration({ token: 'a' }))
      registry.register(createRegistration({ token: 'b' }))
      registry.clear()
      expect(registry.size).toBe(0)
      expect(registry.getAll()).toEqual([])
    })
  })

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      const registry = new ServiceRegistry()
      expect(registry.size).toBe(0)
    })

    it('should return count of registered services', () => {
      const registry = new ServiceRegistry()
      registry.register(createRegistration({ token: 'a' }))
      registry.register(createRegistration({ token: 'b' }))
      expect(registry.size).toBe(2)
    })
  })

  describe('getDescriptors', () => {
    it('should return descriptors for all services', () => {
      const registry = new ServiceRegistry()
      registry.registerSingleton('a', () => 1)
      registry.registerTransient('b', () => 2)
      const descriptors = registry.getDescriptors()
      expect(descriptors).toHaveLength(2)
      expect(descriptors[0]?.token).toBe('a')
      expect(descriptors[0]?.lifetime).toBe('singleton')
      expect(descriptors[0]?.created).toBe(false)
      expect(descriptors[1]?.token).toBe('b')
      expect(descriptors[1]?.lifetime).toBe('transient')
    })
  })
})

describe('DependencyInjector', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const container = new DependencyInjector()
      const config = container.getConfig()
      expect(config.validateOnResolve).toBe(DEFAULT_CONTAINER_CONFIG.validateOnResolve)
      expect(config.allowOverride).toBe(DEFAULT_CONTAINER_CONFIG.allowOverride)
      expect(config.maxResolutionDepth).toBe(DEFAULT_CONTAINER_CONFIG.maxResolutionDepth)
    })

    it('should accept partial config', () => {
      const container = new DependencyInjector({ allowOverride: true })
      const config = container.getConfig()
      expect(config.allowOverride).toBe(true)
      expect(config.validateOnResolve).toBe(DEFAULT_CONTAINER_CONFIG.validateOnResolve)
    })

    it('should accept full config', () => {
      const container = new DependencyInjector({
        validateOnResolve: false,
        allowOverride: true,
        maxResolutionDepth: 100,
      })
      const config = container.getConfig()
      expect(config.validateOnResolve).toBe(false)
      expect(config.allowOverride).toBe(true)
      expect(config.maxResolutionDepth).toBe(100)
    })
  })

  describe('register + resolve', () => {
    it('should register and resolve a service', () => {
      const container = new DependencyInjector()
      container.register({
        token: 'value',
        factory: () => 42,
        lifetime: 'singleton',
        dependencies: [],
      })
      expect(container.resolve('value')).toBe(42)
    })

    it('should resolve a service returning an object', () => {
      const container = new DependencyInjector()
      container.register({
        token: 'config',
        factory: () => ({ port: 3000, host: 'localhost' }),
        lifetime: 'singleton',
        dependencies: [],
      })
      const config = container.resolve<{ port: number; host: string }>('config')
      expect(config.port).toBe(3000)
      expect(config.host).toBe('localhost')
    })
  })

  describe('resolve singleton', () => {
    it('should return the same instance for singleton', () => {
      const container = new DependencyInjector()
      container.registerSingleton('db', () => ({ id: Math.random() }))
      const a = container.resolve<{ id: number }>('db')
      const b = container.resolve<{ id: number }>('db')
      expect(a).toBe(b)
    })

    it('should cache singleton instance', () => {
      const container = new DependencyInjector()
      let callCount = 0
      container.registerSingleton('counter', () => {
        callCount++
        return callCount
      })
      container.resolve('counter')
      container.resolve('counter')
      container.resolve('counter')
      expect(callCount).toBe(1)
    })
  })

  describe('resolve transient', () => {
    it('should return a new instance each time for transient', () => {
      const container = new DependencyInjector()
      container.registerTransient('logger', () => ({ id: Math.random() }))
      const a = container.resolve<{ id: number }>('logger')
      const b = container.resolve<{ id: number }>('logger')
      expect(a).not.toBe(b)
    })

    it('should call factory every time for transient', () => {
      let callCount = 0
      const container = new DependencyInjector()
      container.registerTransient('svc', () => {
        callCount++
        return callCount
      })
      container.resolve('svc')
      container.resolve('svc')
      container.resolve('svc')
      expect(callCount).toBe(3)
    })
  })

  describe('resolve instance', () => {
    it('should resolve a pre-registered instance', () => {
      const container = new DependencyInjector()
      const instance = { name: 'my-instance' }
      container.registerInstance('svc', instance)
      expect(container.resolve('svc')).toBe(instance)
    })

    it('should return the exact same instance', () => {
      const container = new DependencyInjector()
      const arr = [1, 2, 3]
      container.registerInstance('arr', arr)
      expect(container.resolve('arr')).toBe(arr)
      expect(container.resolve('arr')).toBe(arr)
    })
  })

  describe('resolve with dependencies', () => {
    it('should pass container to factory for dependency resolution', () => {
      const container = new DependencyInjector()
      container.registerSingleton('config', () => ({ port: 3000 }))
      container.registerSingleton('server', (c) => {
        const config = c.resolve<{ port: number }>('config')
        return { url: `http://localhost:${config.port}` }
      })
      const server = container.resolve<{ url: string }>('server')
      expect(server.url).toBe('http://localhost:3000')
    })

    it('should resolve nested dependencies', () => {
      const container = new DependencyInjector()
      container.registerSingleton('db', () => ({ connection: 'connected' }))
      container.registerSingleton('repo', (c) => ({
        db: c.resolve('db'),
      }))
      container.registerSingleton('service', (c) => ({
        repo: c.resolve('repo'),
      }))
      const service = container.resolve<{ repo: { db: { connection: string } } }>('service')
      expect(service.repo.db.connection).toBe('connected')
    })
  })

  describe('resolve unregistered throws', () => {
    it('should throw when resolving unregistered service', () => {
      const container = new DependencyInjector()
      expect(() => container.resolve('non-existent')).toThrow('not registered')
    })
  })

  describe('circular dependency detection', () => {
    it('should detect direct circular dependency', () => {
      const container = new DependencyInjector()
      container.registerSingleton('a', (c) => c.resolve('b'))
      container.registerSingleton('b', (c) => c.resolve('a'))
      expect(() => container.resolve('a')).toThrow('Circular dependency detected')
    })

    it('should detect indirect circular dependency', () => {
      const container = new DependencyInjector()
      container.registerSingleton('a', (c) => c.resolve('c'))
      container.registerSingleton('b', (c) => c.resolve('a'))
      container.registerSingleton('c', (c) => c.resolve('b'))
      expect(() => container.resolve('a')).toThrow('Circular dependency detected')
    })

    it('should include chain in circular dependency error', () => {
      const container = new DependencyInjector()
      container.registerSingleton('x', (c) => c.resolve('y'))
      container.registerSingleton('y', (c) => c.resolve('x'))
      try {
        container.resolve('x')
        expect.unreachable('Should have thrown')
      } catch (err) {
        expect((err as Error).message).toContain('x')
        expect((err as Error).message).toContain('y')
      }
    })
  })

  describe('max resolution depth', () => {
    it('should throw when max resolution depth is exceeded', () => {
      const container = new DependencyInjector({ maxResolutionDepth: 3 })
      container.registerSingleton('a', (c) => c.resolve('b'))
      container.registerSingleton('b', (c) => c.resolve('c'))
      container.registerSingleton('c', (c) => c.resolve('d'))
      container.registerSingleton('d', (c) => c.resolve('e'))
      container.registerSingleton('e', (c) => c.resolve('f'))
      container.registerSingleton('f', (c) => c.resolve('g'))
      container.registerSingleton('g', () => 'done')
      expect(() => container.resolve('a')).toThrow('Maximum resolution depth')
    })

    it('should respect custom max resolution depth', () => {
      const container = new DependencyInjector({ maxResolutionDepth: 5 })
      container.registerSingleton('a', (c) => c.resolve('b'))
      container.registerSingleton('b', (c) => c.resolve('c'))
      container.registerSingleton('c', (c) => c.resolve('d'))
      container.registerSingleton('d', (c) => c.resolve('e'))
      container.registerSingleton('e', (c) => c.resolve('f'))
      container.registerSingleton('f', () => 'done')
      const result = container.resolve('a')
      expect(result).toBe('done')
    })

    it('should use default max resolution depth of 50', () => {
      const container = new DependencyInjector()
      const config = container.getConfig()
      expect(config.maxResolutionDepth).toBe(50)
    })
  })

  describe('createScope', () => {
    it('should create a new container sharing registry', () => {
      const container = new DependencyInjector()
      container.registerSingleton('svc', () => ({ id: Math.random() }))
      const scope1 = container.createScope()
      const scope2 = container.createScope()
      expect(scope1.has('svc')).toBe(true)
      expect(scope2.has('svc')).toBe(true)
    })

    it('should have independent instance caches', () => {
      const container = new DependencyInjector()
      container.registerSingleton('svc', () => ({ id: Math.random() }))
      const scope1 = container.createScope()
      const scope2 = container.createScope()
      const a = scope1.resolve<{ id: number }>('svc')
      const b = scope2.resolve<{ id: number }>('svc')
      expect(a).not.toBe(b)
    })

    it('should share registry between parent and scope', () => {
      const container = new DependencyInjector()
      container.registerSingleton('val', () => 42)
      const scope = container.createScope()
      expect(scope.resolve('val')).toBe(42)
    })

    it('should not affect parent cache when scope resolves', () => {
      const container = new DependencyInjector()
      container.registerSingleton('svc', () => ({ id: Math.random() }))
      const scope = container.createScope()
      scope.resolve('svc')
      const parentInstances = container.getInstances()
      expect(parentInstances.has('svc')).toBe(false)
    })

    it('should share registry registrations', () => {
      const container = new DependencyInjector()
      const scope = container.createScope()
      scope.registerSingleton('new-svc', () => 'hello')
      expect(container.has('new-svc')).toBe(true)
    })
  })

  describe('reset', () => {
    it('should clear all singleton instances', () => {
      const container = new DependencyInjector()
      container.registerSingleton('svc', () => ({ id: Math.random() }))
      const first = container.resolve<{ id: number }>('svc')
      container.reset()
      const second = container.resolve<{ id: number }>('svc')
      expect(first).not.toBe(second)
    })

    it('should not remove registrations', () => {
      const container = new DependencyInjector()
      container.registerSingleton('svc', () => 42)
      container.reset()
      expect(container.has('svc')).toBe(true)
      expect(container.resolve('svc')).toBe(42)
    })

    it('should clear instance cache completely', () => {
      const container = new DependencyInjector()
      container.registerSingleton('a', () => 1)
      container.registerSingleton('b', () => 2)
      container.resolve('a')
      container.resolve('b')
      container.reset()
      const instances = container.getInstances()
      expect(instances.size).toBe(0)
    })
  })

  describe('getConfig', () => {
    it('should return current config', () => {
      const container = new DependencyInjector({ maxResolutionDepth: 100 })
      const config = container.getConfig()
      expect(config.maxResolutionDepth).toBe(100)
    })

    it('should return a copy of config', () => {
      const container = new DependencyInjector()
      const config = container.getConfig()
      config.maxResolutionDepth = 9999
      expect(container.getConfig().maxResolutionDepth).toBe(DEFAULT_CONTAINER_CONFIG.maxResolutionDepth)
    })
  })

  describe('has', () => {
    it('should return true for registered service', () => {
      const container = new DependencyInjector()
      container.registerSingleton('svc', () => 'hello')
      expect(container.has('svc')).toBe(true)
    })

    it('should return false for non-existent service', () => {
      const container = new DependencyInjector()
      expect(container.has('nope')).toBe(false)
    })
  })

  describe('registerSingleton shorthand', () => {
    it('should register and resolve singleton', () => {
      const container = new DependencyInjector()
      container.registerSingleton('val', () => 'singleton-value')
      expect(container.resolve('val')).toBe('singleton-value')
    })
  })

  describe('registerTransient shorthand', () => {
    it('should register and resolve transient', () => {
      const container = new DependencyInjector()
      container.registerTransient('val', () => ({ ts: Date.now() }))
      const a = container.resolve<{ ts: number }>('val')
      const b = container.resolve<{ ts: number }>('val')
      expect(a).not.toBe(b)
    })
  })

  describe('registerInstance shorthand', () => {
    it('should register instance and resolve it', () => {
      const container = new DependencyInjector()
      const obj = { key: 'value' }
      container.registerInstance('obj', obj)
      expect(container.resolve('obj')).toBe(obj)
    })
  })

  describe('getRegistry', () => {
    it('should return the internal registry', () => {
      const container = new DependencyInjector()
      const registry = container.getRegistry()
      expect(registry).toBeInstanceOf(ServiceRegistry)
    })
  })

  describe('getInstances', () => {
    it('should return empty map initially', () => {
      const container = new DependencyInjector()
      expect(container.getInstances().size).toBe(0)
    })

    it('should return resolved singleton instances', () => {
      const container = new DependencyInjector()
      container.registerSingleton('a', () => 1)
      container.registerSingleton('b', () => 2)
      container.resolve('a')
      container.resolve('b')
      const instances = container.getInstances()
      expect(instances.size).toBe(2)
      expect(instances.get('a')).toBe(1)
      expect(instances.get('b')).toBe(2)
    })

    it('should not include transient instances', () => {
      const container = new DependencyInjector()
      container.registerTransient('svc', () => Math.random())
      container.resolve('svc')
      expect(container.getInstances().size).toBe(0)
    })
  })
})

describe('DEFAULT_CONTAINER_CONFIG', () => {
  it('should have default values', () => {
    expect(DEFAULT_CONTAINER_CONFIG.validateOnResolve).toBe(true)
    expect(DEFAULT_CONTAINER_CONFIG.allowOverride).toBe(false)
    expect(DEFAULT_CONTAINER_CONFIG.maxResolutionDepth).toBe(50)
  })
})

describe('ServiceRegistration type', () => {
  it('should have all required fields', () => {
    const reg: ServiceRegistration<string> = {
      token: 'test',
      factory: () => 'hello',
      lifetime: 'singleton',
      dependencies: [],
    }
    expect(reg.token).toBe('test')
    expect(reg.lifetime).toBe('singleton')
    expect(reg.dependencies).toEqual([])
  })
})

describe('ServiceDescriptor type', () => {
  it('should have all required fields', () => {
    const desc: ServiceDescriptor = {
      token: 'test',
      lifetime: 'transient',
      created: false,
    }
    expect(desc.token).toBe('test')
    expect(desc.lifetime).toBe('transient')
    expect(desc.created).toBe(false)
  })
})

describe('ContainerConfig type', () => {
  it('should have all required fields', () => {
    const config: ContainerConfig = { ...DEFAULT_CONTAINER_CONFIG }
    expect(config).toHaveProperty('validateOnResolve')
    expect(config).toHaveProperty('allowOverride')
    expect(config).toHaveProperty('maxResolutionDepth')
  })
})

describe('ServiceLifetime type', () => {
  it('should accept singleton', () => {
    const lifetime: ServiceLifetime = 'singleton'
    expect(lifetime).toBe('singleton')
  })

  it('should accept transient', () => {
    const lifetime: ServiceLifetime = 'transient'
    expect(lifetime).toBe('transient')
  })

  it('should accept scoped', () => {
    const lifetime: ServiceLifetime = 'scoped'
    expect(lifetime).toBe('scoped')
  })
})

describe('Edge Cases', () => {
  it('should resolve null value from factory', () => {
    const container = new DependencyInjector()
    container.registerSingleton('null-svc', () => null)
    expect(container.resolve('null-svc')).toBeNull()
  })

  it('should resolve undefined value from factory', () => {
    const container = new DependencyInjector()
    container.registerSingleton('undef-svc', () => undefined)
    expect(container.resolve('undef-svc')).toBeUndefined()
  })

  it('should resolve factory that returns a function', () => {
    const container = new DependencyInjector()
    container.registerSingleton('fn-svc', () => (x: number) => x * 2)
    const fn = container.resolve<(x: number) => number>('fn-svc')
    expect(fn(5)).toBe(10)
  })

  it('should handle multiple services resolving same dependency', () => {
    const container = new DependencyInjector()
    container.registerSingleton('shared', () => ({ count: 0 }))
    container.registerSingleton('a', (c) => {
      const s = c.resolve<{ count: number }>('shared')
      s.count++
      return s
    })
    container.registerSingleton('b', (c) => {
      const s = c.resolve<{ count: number }>('shared')
      s.count++
      return s
    })
    const a = container.resolve<{ count: number }>('a')
    const b = container.resolve<{ count: number }>('b')
    expect(a).toBe(b)
    expect(a.count).toBe(2)
  })

  it('should handle transient service depending on singleton', () => {
    const container = new DependencyInjector()
    container.registerSingleton('config', () => ({ port: 8080 }))
    container.registerTransient('handler', (c) => ({
      config: c.resolve<{ port: number }>('config'),
    }))
    const h1 = container.resolve<{ config: { port: number } }>('handler')
    const h2 = container.resolve<{ config: { port: number } }>('handler')
    expect(h1).not.toBe(h2)
    expect(h1.config).toBe(h2.config)
  })

  it('should resolve deep chain within depth limit', () => {
    const container = new DependencyInjector({ maxResolutionDepth: 10 })
    container.registerSingleton('leaf', () => 'leaf-value')
    for (let i = 9; i >= 1; i--) {
      const dep = i === 9 ? 'leaf' : `node-${i + 1}`
      container.registerSingleton(`node-${i}`, (c) => c.resolve(dep))
    }
    const result = container.resolve('node-1')
    expect(result).toBe('leaf-value')
  })

  it('should allow registering after resolving other services', () => {
    const container = new DependencyInjector({ allowOverride: false })
    container.registerSingleton('a', () => 1)
    container.resolve('a')
    container.registerSingleton('b', () => 2)
    expect(container.resolve('b')).toBe(2)
  })

  it('should preserve resolution stack after error', () => {
    const container = new DependencyInjector()
    container.registerSingleton('a', (c) => c.resolve('missing'))
    try {
      container.resolve('a')
    } catch {
    }
    container.registerSingleton('valid', () => 42)
    expect(container.resolve('valid')).toBe(42)
  })

  it('should handle registerInstance with primitive values', () => {
    const container = new DependencyInjector()
    container.registerInstance('num', 42)
    container.registerInstance('str', 'hello')
    container.registerInstance('bool', true)
    expect(container.resolve('num')).toBe(42)
    expect(container.resolve('str')).toBe('hello')
    expect(container.resolve('bool')).toBe(true)
  })

  it('should handle service with multiple dependencies', () => {
    const container = new DependencyInjector()
    container.registerSingleton('db', () => ({ type: 'postgres' }))
    container.registerSingleton('cache', () => ({ type: 'redis' }))
    container.registerSingleton('app', (c) => ({
      db: c.resolve('db'),
      cache: c.resolve('cache'),
    }))
    const app = container.resolve<{ db: { type: string }; cache: { type: string } }>('app')
    expect(app.db.type).toBe('postgres')
    expect(app.cache.type).toBe('redis')
  })

  it('should create multiple independent scopes', () => {
    const container = new DependencyInjector()
    container.registerSingleton('svc', () => ({ id: Math.random() }))
    const scopes = [container.createScope(), container.createScope(), container.createScope()]
    const results = scopes.map((s) => s.resolve<{ id: number }>('svc'))
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        expect(results[i]).not.toBe(results[j])
      }
    }
  })
})
