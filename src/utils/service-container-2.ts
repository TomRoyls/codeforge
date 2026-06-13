export type Lifecycle = 'singleton' | 'transient' | 'scoped'

export interface ServiceRegistration<T = unknown> {
  key: string
  factory: (container: ServiceContainer2) => T
  lifecycle: Lifecycle
}

export class ServiceContainer2 {
  private services: Map<string, ServiceRegistration> = new Map()
  private singletons: Map<string, unknown> = new Map()
  private scopedInstances: Map<string, unknown> = new Map()
  private hooks: { onResolve?: (key: string) => void; onRegister?: (key: string) => void } = {}

  register<T>(key: string, factory: (container: ServiceContainer2) => T, lifecycle: Lifecycle = 'transient'): this {
    this.services.set(key, { key, factory: factory as (c: ServiceContainer2) => unknown, lifecycle })
    if (this.hooks.onRegister) this.hooks.onRegister(key)
    return this
  }

  registerSingleton<T>(key: string, factory: (container: ServiceContainer2) => T): this {
    return this.register(key, factory, 'singleton')
  }

  registerInstance<T>(key: string, instance: T): this {
    this.services.set(key, { key, factory: () => instance, lifecycle: 'singleton' })
    this.singletons.set(key, instance)
    return this
  }

  resolve<T>(key: string): T {
    if (this.hooks.onResolve) this.hooks.onResolve(key)
    const registration = this.services.get(key)
    if (!registration) throw new Error(`Service not registered: ${key}`)
    if (registration.lifecycle === 'singleton') {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, registration.factory(this))
      }
      return this.singletons.get(key) as T
    }
    if (registration.lifecycle === 'scoped') {
      if (!this.scopedInstances.has(key)) {
        this.scopedInstances.set(key, registration.factory(this))
      }
      return this.scopedInstances.get(key) as T
    }
    return registration.factory(this) as T
  }

  tryResolve<T>(key: string): T | undefined {
    try { return this.resolve<T>(key) } catch { return undefined }
  }

  isRegistered(key: string): boolean {
    return this.services.has(key)
  }

  unregister(key: string): boolean {
    this.singletons.delete(key)
    this.scopedInstances.delete(key)
    return this.services.delete(key)
  }

  clear(): void {
    this.services.clear()
    this.singletons.clear()
    this.scopedInstances.clear()
  }

  clearScope(): void {
    this.scopedInstances.clear()
  }

  clearSingletons(): void {
    this.singletons.clear()
  }

  keys(): string[] {
    return Array.from(this.services.keys())
  }

  size(): number {
    return this.services.size
  }

  getLifecycle(key: string): Lifecycle | undefined {
    return this.services.get(key)?.lifecycle
  }

  setHooks(hooks: { onResolve?: (key: string) => void; onRegister?: (key: string) => void }): void {
    this.hooks = hooks
  }

  toArray(): string[] { return this.keys() }
  toString(): string { return JSON.stringify(this.keys()) }
  toJSON(): string[] { return this.keys() }
  clone(): ServiceContainer2 {
    const c = new ServiceContainer2()
    this.services.forEach((reg, key) => c.register(key, reg.factory, reg.lifecycle))
    return c
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ServiceContainer2)) return false
    return this.size() === other.size()
  }
}
