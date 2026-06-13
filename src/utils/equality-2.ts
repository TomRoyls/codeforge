export class Equality2 {
  static strictEqual(a: unknown, b: unknown): boolean {
    return a === b
  }

  static deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a === null || b === null) return false
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object') return a === b
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((v, i) => Equality2.deepEqual(v, b[i]))
    }
    if (Array.isArray(a) !== Array.isArray(b)) return false
    const objA = a as Record<string, unknown>
    const objB = b as Record<string, unknown>
    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)
    if (keysA.length !== keysB.length) return false
    return keysA.every(k => Equality2.deepEqual(objA[k], objB[k]))
  }

  static shallowEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every(k => (a as Record<string, unknown>)[k] === (b as Record<string, unknown>)[k])
  }

  static referenceEqual(a: unknown, b: unknown): boolean {
    return Object.is(a, b)
  }

  static isNull(a: unknown): boolean { return a === null }
  static isUndefined(a: unknown): boolean { return a === undefined }
  static isNil(a: unknown): boolean { return a == null }
  static isPrimitive(a: unknown): boolean {
    return a === null || (typeof a !== 'object' && typeof a !== 'function')
  }

  static sameType(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    return typeof a === typeof b
  }

  static hashEqual(a: unknown, b: unknown): boolean {
    return Equality2.hashCode(a) === Equality2.hashCode(b)
  }

  private static hashCode(value: unknown): number {
    if (typeof value === 'string') {
      let hash = 0
      for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
      }
      return hash
    }
    return String(value).length
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): Equality2 { return new Equality2() }
  equals(other: unknown): boolean { return other instanceof Equality2 }
}
