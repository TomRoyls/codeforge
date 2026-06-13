export type ServiceFactory<T = unknown> = (container: DependencyInjector2) => T

export interface Binding<T = unknown> {
  factory: ServiceFactory<T>
  singleton: boolean
  instance?: T
}

export class DependencyInjector2 {
  private bindings: Map<string, Binding> = new Map()
  private instances: Map<string, unknown> = new Map()

  bind<T>(key: string, factory: ServiceFactory<T>): this {
    this.bindings.set(key, { factory: factory as ServiceFactory, singleton: false })
    return this
  }

  singleton<T>(key: string, factory: ServiceFactory<T>): this {
    this.bindings.set(key, { factory: factory as ServiceFactory, singleton: true })
    return this
  }

  instance<T>(key: string, value: T): this {
    this.instances.set(key, value)
    return this
  }

  resolve<T>(key: string): T {
    if (this.instances.has(key)) return this.instances.get(key) as T
    const binding = this.bindings.get(key)
    if (!binding) throw new Error(`No binding found for: ${key}`)
    const value = binding.factory(this) as T
    if (binding.singleton) {
      this.instances.set(key, value)
    }
    return value
  }

  tryResolve<T>(key: string): T | undefined {
    try { return this.resolve<T>(key) } catch { return undefined }
  }

  has(key: string): boolean {
    return this.bindings.has(key) || this.instances.has(key)
  }

  remove(key: string): boolean {
    return this.bindings.delete(key) || this.instances.delete(key)
  }

  clear(): void {
    this.bindings.clear()
    this.instances.clear()
  }

  keys(): string[] {
    return Array.from(new Set([...this.bindings.keys(), ...this.instances.keys()]))
  }

  size(): number {
    return this.keys().length
  }

  isSingleton(key: string): boolean {
    const binding = this.bindings.get(key)
    return binding?.singleton ?? this.instances.has(key)
  }

  createScope(): DependencyInjector2 {
    const scope = new DependencyInjector2()
    scope.bindings = new Map(this.bindings)
    return scope
  }

  toArray(): string[] { return this.keys() }
  toString(): string { return JSON.stringify(this.keys()) }
  toJSON(): string[] { return this.keys() }
  clone(): DependencyInjector2 {
    const d = new DependencyInjector2()
    d.bindings = new Map(this.bindings)
    d.instances = new Map(this.instances)
    return d
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DependencyInjector2)) return false
    return this.size() === other.size()
  }
}
