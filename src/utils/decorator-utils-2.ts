export type ClassDecorator<T = unknown> = (target: new (...args: unknown[]) => T) => new (...args: unknown[]) => T
export type MethodDecorator2 = (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor
export type PropertyDecorator2 = (target: object, propertyKey: string) => void

export class DecoratorUtils2 {
  static memoize(): MethodDecorator2 {
    const cache = new Map<string, unknown>()
    return (_target, propertyKey, descriptor) => {
      const original = descriptor.value
      descriptor.value = function (...args: unknown[]) {
        const key = `${propertyKey}:${JSON.stringify(args)}`
        if (cache.has(key)) return cache.get(key)
        const result = original.apply(this, args)
        cache.set(key, result)
        return result
      }
      return descriptor
    }
  }

  static debounce(ms: number): MethodDecorator2 {
    return (_target, _propertyKey, descriptor) => {
      const original = descriptor.value
      let timer: ReturnType<typeof setTimeout> | null = null
      descriptor.value = function (...args: unknown[]) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => original.apply(this, args), ms)
      }
      return descriptor
    }
  }

  static throttle(ms: number): MethodDecorator2 {
    return (_target, _propertyKey, descriptor) => {
      const original = descriptor.value
      let last = 0
      descriptor.value = function (...args: unknown[]) {
        const now = Date.now()
        if (now - last >= ms) {
          last = now
          return original.apply(this, args)
        }
      }
      return descriptor
    }
  }

  static log(prefix?: string): MethodDecorator2 {
    return (_target, propertyKey, descriptor) => {
      const original = descriptor.value
      descriptor.value = function (...args: unknown[]) {
        const tag = prefix || propertyKey
        const result = original.apply(this, args)
        return result
      }
      return descriptor
    }
  }

  static readonly(): MethodDecorator2 {
    return (_target, _propertyKey, descriptor) => {
      descriptor.writable = false
      return descriptor
    }
  }

  static deprecated(message?: string): MethodDecorator2 {
    return (_target, propertyKey, descriptor) => {
      const original = descriptor.value
      descriptor.value = function (...args: unknown[]) {
        return original.apply(this, args)
      }
      return descriptor
    }
  }

  static catch(defaultValue?: unknown): MethodDecorator2 {
    return (_target, _propertyKey, descriptor) => {
      const original = descriptor.value
      descriptor.value = function (...args: unknown[]) {
        try {
          return original.apply(this, args)
        } catch {
          return defaultValue
        }
      }
      return descriptor
    }
  }

  static time(): MethodDecorator2 {
    return (_target, propertyKey, descriptor) => {
      const original = descriptor.value
      descriptor.value = function (...args: unknown[]) {
        const start = Date.now()
        const result = original.apply(this, args)
        const elapsed = Date.now() - start
        return result
      }
      return descriptor
    }
  }

  static bound(): MethodDecorator2 {
    return (target, propertyKey, descriptor) => {
      const original = descriptor.value
      return {
        get() {
          const bound = original.bind(this)
          Object.defineProperty(this, propertyKey, { value: bound, writable: true, configurable: true })
          return bound
        },
        configurable: true,
      }
    }
  }

  static compose(...decorators: MethodDecorator2[]): MethodDecorator2 {
    return (target, propertyKey, descriptor) => {
      let result = descriptor
      for (let i = decorators.length - 1; i >= 0; i--) {
        result = decorators[i](target, propertyKey, result)
      }
      return result
    }
  }

  static mixin<T extends object>(target: T, ...sources: object[]): T {
    for (const source of sources) {
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === 'function') {
          (target as Record<string, unknown>)[key] = value
        }
      }
    }
    return target
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): DecoratorUtils2 { return new DecoratorUtils2() }
  equals(other: unknown): boolean { return other instanceof DecoratorUtils2 }
}
