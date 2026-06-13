export type Constructor<T = unknown> = new (...args: unknown[]) => T

export class Mixins2 {
  static apply<T extends Constructor>(target: T, ...mixins: object[]): T {
    for (const mixin of mixins) {
      const descriptors = Object.getOwnPropertyDescriptors(mixin)
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (key !== 'constructor' && key !== 'prototype' && key !== '__proto__') {
          Object.defineProperty(target.prototype, key, {
            ...descriptor,
            configurable: true,
            writable: true,
          })
        }
      }
    }
    return target
  }

  static create<T extends object>(...mixins: object[]): T {
    const obj: Record<string, unknown> = {}
    for (const mixin of mixins) {
      for (const [key, value] of Object.entries(mixin)) {
        obj[key] = value
      }
    }
    return obj as T
  }

  static extend<T extends Constructor, U extends object>(base: T, mixin: U): T & Constructor<U> {
    const extended = class extends base {}
    Mixins2.apply(extended, mixin)
    return extended as T & Constructor<U>
  }

  static compose<T extends Constructor>(...constructors: T[]): T {
    if (constructors.length === 0) return class {} as T
    const [first, ...rest] = constructors
    let result = first
    for (const ctor of rest) {
      const proto = ctor.prototype
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== 'constructor') {
          const descriptor = Object.getOwnPropertyDescriptor(proto, key)
          if (descriptor) {
            Object.defineProperty(result.prototype, key, {
              ...descriptor,
              configurable: true,
              writable: true,
            })
          }
        }
      }
    }
    return result
  }

  static hasMixin<T extends object>(obj: T, mixin: object): boolean {
    const mixinKeys = Object.getOwnPropertyNames(mixin)
    return mixinKeys.every(key => typeof (obj as Record<string, unknown>)[key] === 'function')
  }

  static remove<T extends object>(target: T, mixin: object): T {
    const mixinKeys = Object.getOwnPropertyNames(mixin)
    for (const key of mixinKeys) {
      if (key in target) {
        delete (target as Record<string, unknown>)[key]
      }
    }
    return target
  }

  static getMethods(obj: object): string[] {
    return Object.getOwnPropertyNames(obj).filter(k => typeof (obj as Record<string, unknown>)[k] === 'function')
  }

  static getProperties(obj: object): string[] {
    return Object.getOwnPropertyNames(obj).filter(k => typeof (obj as Record<string, unknown>)[k] !== 'function')
  }

  static merge<T extends object, U extends object>(a: T, b: U): T & U {
    return { ...a, ...b }
  }

  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result: Record<string, unknown> = {}
    for (const key of keys) {
      if (key in obj) result[key as string] = obj[key]
    }
    return result as Pick<T, K>
  }

  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result: Record<string, unknown> = { ...obj }
    for (const key of keys) {
      delete result[key as string]
    }
    return result as Omit<T, K>
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): Mixins2 { return new Mixins2() }
  equals(other: unknown): boolean { return other instanceof Mixins2 }
}
