import type { ServiceRegistration, ContainerConfig, Container } from './types.js'
import { DEFAULT_CONTAINER_CONFIG } from './types.js'
import { ServiceRegistry } from './service-registry.js'

export class DependencyInjector implements Container {
  private config: ContainerConfig
  private registry: ServiceRegistry
  private instances: Map<string, unknown> = new Map()
  private resolutionStack: string[] = []

  constructor(config: Partial<ContainerConfig> = {}, registry?: ServiceRegistry) {
    this.config = { ...DEFAULT_CONTAINER_CONFIG, ...config }
    this.registry = registry ?? new ServiceRegistry(this.config.allowOverride)
  }

  register<T>(registration: ServiceRegistration<T>): void {
    this.registry.register(registration)
  }

  registerSingleton<T>(token: string, factory: (container: Container) => T): void {
    this.registry.registerSingleton(token, factory)
  }

  registerTransient<T>(token: string, factory: (container: Container) => T): void {
    this.registry.registerTransient(token, factory)
  }

  registerInstance<T>(token: string, instance: T): void {
    this.registry.registerInstance(token, instance)
    this.instances.set(token, instance)
  }

  resolve<T>(token: string): T {
    if (this.resolutionStack.length > this.config.maxResolutionDepth) {
      throw new Error(`Maximum resolution depth (${this.config.maxResolutionDepth}) exceeded`)
    }

    if (this.resolutionStack.includes(token)) {
      throw new Error(`Circular dependency detected: ${[...this.resolutionStack, token].join(' -> ')}`)
    }

    const registration = this.registry.get(token)
    if (!registration) {
      throw new Error(`Service '${token}' is not registered`)
    }

    if (registration.lifetime === 'singleton' && this.instances.has(token)) {
      return this.instances.get(token) as T
    }

    this.resolutionStack.push(token)
    try {
      const instance = registration.factory(this) as T

      if (registration.lifetime === 'singleton') {
        this.instances.set(token, instance)
      }

      return instance
    } finally {
      this.resolutionStack.pop()
    }
  }

  has(token: string): boolean {
    return this.registry.has(token)
  }

  createScope(): DependencyInjector {
    return new DependencyInjector(this.config, this.registry)
  }

  reset(): void {
    this.instances.clear()
    this.resolutionStack = []
  }

  getConfig(): ContainerConfig {
    return { ...this.config }
  }

  getRegistry(): ServiceRegistry {
    return this.registry
  }

  getInstances(): Map<string, unknown> {
    return new Map(this.instances)
  }
}
