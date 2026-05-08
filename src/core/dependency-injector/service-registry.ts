import type { ServiceRegistration, ServiceDescriptor, Container } from './types.js'

export class ServiceRegistry {
  private registrations: Map<string, ServiceRegistration<unknown>> = new Map()
  private allowOverride: boolean

  constructor(allowOverride = false) {
    this.allowOverride = allowOverride
  }

  register<T>(registration: ServiceRegistration<T>): void {
    if (this.registrations.has(registration.token) && !this.allowOverride) {
      throw new Error(`Service '${registration.token}' is already registered`)
    }
    this.registrations.set(registration.token, registration as ServiceRegistration<unknown>)
  }

  registerSingleton<T>(token: string, factory: (container: Container) => T): void {
    this.register({
      token,
      factory: factory as (container: Container) => unknown,
      lifetime: 'singleton',
      dependencies: [],
    })
  }

  registerTransient<T>(token: string, factory: (container: Container) => T): void {
    this.register({
      token,
      factory: factory as (container: Container) => unknown,
      lifetime: 'transient',
      dependencies: [],
    })
  }

  registerInstance<T>(token: string, instance: T): void {
    this.register({
      token,
      factory: (_container: Container) => instance,
      lifetime: 'singleton',
      dependencies: [],
    })
  }

  unregister(token: string): boolean {
    return this.registrations.delete(token)
  }

  has(token: string): boolean {
    return this.registrations.has(token)
  }

  get(token: string): ServiceRegistration<unknown> | undefined {
    return this.registrations.get(token)
  }

  getAll(): ServiceRegistration<unknown>[] {
    return Array.from(this.registrations.values())
  }

  clear(): void {
    this.registrations.clear()
  }

  get size(): number {
    return this.registrations.size
  }

  getDescriptors(): ServiceDescriptor[] {
    return Array.from(this.registrations.values()).map((r) => ({
      token: r.token,
      lifetime: r.lifetime,
      created: false,
    }))
  }
}
