export class ReflectionUtils2 {
  static getPropertyNames(obj: unknown): string[] {
    if (typeof obj !== 'object' || obj === null) return []
    return Object.getOwnPropertyNames(obj)
  }

  static getOwnPropertyNames(obj: unknown): string[] {
    if (typeof obj !== 'object' || obj === null) return []
    return Object.getOwnPropertyNames(Object.getPrototypeOf(obj) || {})
  }

  static getDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    return Object.getOwnPropertyDescriptor(obj, key)
  }

  static defineProperty(obj: object, key: string, descriptor: PropertyDescriptor): void {
    Object.defineProperty(obj, key, descriptor)
  }

  static getOwnSymbols(obj: object): symbol[] {
    return Object.getOwnPropertySymbols(obj)
  }

  static getPrototypeOf(obj: object): object | null {
    return Object.getPrototypeOf(obj)
  }

  static setPrototypeOf(obj: object, proto: object | null): void {
    Object.setPrototypeOf(obj, proto)
  }

  static isExtensible(obj: object): boolean {
    return Object.isExtensible(obj)
  }

  static preventExtensions(obj: object): void {
    Object.preventExtensions(obj)
  }

  static seal(obj: object): void {
    Object.seal(obj)
  }

  static freeze(obj: object): void {
    Object.freeze(obj)
  }

  static isSealed(obj: object): boolean {
    return Object.isSealed(obj)
  }

  static isFrozen(obj: object): boolean {
    return Object.isFrozen(obj)
  }

  static getKeys(obj: object): string[] {
    return Object.keys(obj)
  }

  static getValues(obj: object): unknown[] {
    return Object.values(obj)
  }

  static getEntries(obj: object): [string, unknown][] {
    return Object.entries(obj)
  }

  static fromEntries(entries: [string, unknown][]): Record<string, unknown> {
    return Object.fromEntries(entries)
  }

  static assign<T extends object>(target: T, ...sources: Partial<T>[]): T {
    return Object.assign(target, ...sources)
  }

  static clone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return [...obj] as unknown as T
    return { ...obj }
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(ReflectionUtils2.deepClone) as unknown as T
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (obj instanceof Map) return new Map(obj) as unknown as T
    if (obj instanceof Set) return new Set(obj) as unknown as T
    const cloned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      cloned[key] = ReflectionUtils2.deepClone(value)
    }
    return cloned as T
  }

  static getConstructorName(obj: object): string {
    return obj.constructor?.name ?? 'Object'
  }

  static isInstanceOf(obj: unknown, ctor: Function): boolean {
    try { return obj instanceof ctor } catch { return false }
  }

  static getType(obj: unknown): string {
    if (obj === null) return 'null'
    if (obj === undefined) return 'undefined'
    if (Array.isArray(obj)) return 'array'
    if (obj instanceof Date) return 'date'
    if (obj instanceof RegExp) return 'regexp'
    if (obj instanceof Map) return 'map'
    if (obj instanceof Set) return 'set'
    if (obj instanceof Error) return 'error'
    return typeof obj
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): ReflectionUtils2 { return new ReflectionUtils2() }
  equals(other: unknown): boolean { return other instanceof ReflectionUtils2 }
}
