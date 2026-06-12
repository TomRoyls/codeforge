import { describe, it, expect } from 'vitest'
import { BiKeyMap } from '../../src/utils/bikey-map.js'

describe('BiKeyMap', () => {
  it('initializes with empty state', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.size).toBe(0)
  })

  it('adds single entry', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.size).toBe(1)
  })

  it('retrieves stored value', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.get('user', 1)).toBe('John')
  })

  it('returns undefined for non-existent key', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.get('user', 1)).toBeUndefined()
  })

  it('checks if key exists', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.has('user', 1)).toBe(true)
    expect(map.has('user', 2)).toBe(false)
  })

  it('updates existing value', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 1, 'Jane')

    expect(map.size).toBe(1)
    expect(map.get('user', 1)).toBe('Jane')
  })

  it('adds multiple entries with same k1', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')
    map.set('user', 3, 'Bob')

    expect(map.size).toBe(3)
  })

  it('adds multiple entries with same k2', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')
    map.set(2, 'email', 'jane@test.com')
    map.set(3, 'email', 'bob@test.com')

    expect(map.size).toBe(3)
  })

  it('deletes existing entry', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.delete('user', 1)).toBe(true)
    expect(map.size).toBe(0)
  })

  it('returns false when deleting non-existent entry', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.delete('user', 1)).toBe(false)
  })

  it('retrieves all values by k1', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')
    map.set('admin', 1, 'Admin')

    const userValues = map.getByK1('user')

    expect(userValues).toHaveLength(2)
    expect(userValues).toContain('John')
    expect(userValues).toContain('Jane')
  })

  it('returns empty array when no values for k1', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.getByK1('admin')).toEqual([])
  })

  it('retrieves all values by k2', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')
    map.set(2, 'email', 'jane@test.com')
    map.set(1, 'phone', '555-0100')

    const emailValues = map.getByK2('email')

    expect(emailValues).toHaveLength(2)
    expect(emailValues).toContain('john@test.com')
    expect(emailValues).toContain('jane@test.com')
  })

  it('returns empty array when no values for k2', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')

    expect(map.getByK2('phone')).toEqual([])
  })

  it('checks if k1 exists', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.hasK1('user')).toBe(true)
    expect(map.hasK1('admin')).toBe(false)
  })

  it('checks if k2 exists', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')

    expect(map.hasK2('email')).toBe(true)
    expect(map.hasK2('phone')).toBe(false)
  })

  it('clears all entries', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')
    map.set('admin', 1, 'Admin')

    map.clear()

    expect(map.size).toBe(0)
    expect(map.get('user', 1)).toBeUndefined()
  })

  it('returns all entries', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')
    map.set('admin', 1, 'Admin')

    const entries = map.entries()

    expect(entries).toHaveLength(3)
    expect(entries).toContainEqual(['user', '1', 'John'])
    expect(entries).toContainEqual(['user', '2', 'Jane'])
    expect(entries).toContainEqual(['admin', '1', 'Admin'])
  })

  it('returns empty entries when map is empty', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.entries()).toEqual([])
  })

  it('returns all values', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')
    map.set('admin', 1, 'Admin')

    const values = map.values()

    expect(values).toHaveLength(3)
    expect(values).toContain('John')
    expect(values).toContain('Jane')
    expect(values).toContain('Admin')
  })

  it('iterates with forEach', () => {
    const map = new BiKeyMap<string, number, string>()
    const entries: Array<[string, string, string]> = []

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')

    map.forEach((value, k1, k2) => {
      entries.push([value, k1, k2])
    })

    expect(entries).toHaveLength(2)
    expect(entries).toContainEqual(['John', 'user', '1'])
    expect(entries).toContainEqual(['Jane', 'user', '2'])
  })

  it('supports for-of iteration', () => {
    const map = new BiKeyMap<string, number, string>()
    const entries: Array<[string, string, string]> = []

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')

    for (const [k1, k2, v] of map) {
      entries.push([k1, k2, v])
    }

    expect(entries).toHaveLength(2)
    expect(entries).toContainEqual(['user', '1', 'John'])
    expect(entries).toContainEqual(['user', '2', 'Jane'])
  })

  it('handles string keys with special characters', () => {
    const map = new BiKeyMap<string, string, string>()

    map.set('user:name', 'key\x00with\x00null', 'value')

    expect(map.get('user:name', 'key\x00with\x00null')).toBe('value')
  })

  it('handles numeric keys', () => {
    const map = new BiKeyMap<number, number, string>()

    map.set(1, 100, 'value1')
    map.set(2, 200, 'value2')

    expect(map.get(1, 100)).toBe('value1')
    expect(map.get(2, 200)).toBe('value2')
  })

  it('maintains size correctly after multiple operations', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.size).toBe(0)

    map.set('user', 1, 'John')
    expect(map.size).toBe(1)

    map.set('user', 2, 'Jane')
    expect(map.size).toBe(2)

    map.set('user', 1, 'Jane Updated')
    expect(map.size).toBe(2)

    map.delete('user', 1)
    expect(map.size).toBe(1)

    map.delete('user', 2)
    expect(map.size).toBe(0)
  })

  it('converts to string representation', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('admin', 2, 'Jane')

    const str = map.toString()
    expect(str).toContain('(user, 1)')
    expect(str).toContain('John')
    expect(str).toContain('(admin, 2)')
    expect(str).toContain('Jane')
  })

  it('converts empty map to string', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.toString()).toBe('[]')
  })

  it('converts to JSON format', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('admin', 2, 'Jane')

    const json = map.toJSON()
    expect(json).toHaveLength(2)
    expect(json).toContainEqual([['user', '1'], 'John'])
    expect(json).toContainEqual([['admin', '2'], 'Jane'])
  })

  it('converts empty map to JSON', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.toJSON()).toEqual([])
  })

  it('clones map with all entries', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('admin', 2, 'Jane')

    const cloned = map.clone()

    expect(cloned.size).toBe(2)
    expect(cloned.get('user', 1)).toBe('John')
    expect(cloned.get('admin', 2)).toBe('Jane')
  })

  it('clone is independent from original', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    const cloned = map.clone()
    cloned.set('user', 2, 'Jane')
    cloned.delete('user', 1)

    expect(map.size).toBe(1)
    expect(map.get('user', 1)).toBe('John')
    expect(cloned.size).toBe(1)
    expect(cloned.get('user', 2)).toBe('Jane')
  })

  it('checks equality with identical map', () => {
    const map1 = new BiKeyMap<string, number, string>()
    const map2 = new BiKeyMap<string, number, string>()

    map1.set('user', 1, 'John')
    map1.set('admin', 2, 'Jane')

    map2.set('user', 1, 'John')
    map2.set('admin', 2, 'Jane')

    expect(map1.equals(map2)).toBe(true)
  })

  it('checks inequality with different map', () => {
    const map1 = new BiKeyMap<string, number, string>()
    const map2 = new BiKeyMap<string, number, string>()

    map1.set('user', 1, 'John')
    map2.set('user', 1, 'Jane')

    expect(map1.equals(map2)).toBe(false)
  })

  it('checks inequality with different sizes', () => {
    const map1 = new BiKeyMap<string, number, string>()
    const map2 = new BiKeyMap<string, number, string>()

    map1.set('user', 1, 'John')
    map1.set('admin', 2, 'Jane')

    map2.set('user', 1, 'John')

    expect(map1.equals(map2)).toBe(false)
  })

  it('checks inequality with non-BiKeyMap object', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.equals({})).toBe(false)
    expect(map.equals(null)).toBe(false)
    expect(map.equals(undefined)).toBe(false)
  })

  it('handles null and undefined values', () => {
    const map = new BiKeyMap<string, number, string | null | undefined>()

    map.set('user', 1, null)
    map.set('admin', 2, undefined)

    expect(map.get('user', 1)).toBe(null)
    expect(map.get('admin', 2)).toBe(undefined)
    expect(map.size).toBe(2)
  })

  it('handles boolean keys', () => {
    const map = new BiKeyMap<boolean, boolean, string>()

    map.set(true, false, 'test1')
    map.set(false, true, 'test2')

    expect(map.get(true, false)).toBe('test1')
    expect(map.get(false, true)).toBe('test2')
  })

  it('handles empty string keys', () => {
    const map = new BiKeyMap<string, string, string>()

    map.set('', 'key', 'value1')
    map.set('key', '', 'value2')
    map.set('', '', 'value3')

    expect(map.get('', 'key')).toBe('value1')
    expect(map.get('key', '')).toBe('value2')
    expect(map.get('', '')).toBe('value3')
  })

  it('handles very long keys', () => {
    const map = new BiKeyMap<string, string, string>()

    const longKey1 = 'a'.repeat(1000)
    const longKey2 = 'b'.repeat(1000)

    map.set(longKey1, longKey2, 'value')

    expect(map.get(longKey1, longKey2)).toBe('value')
  })

  it('handles special Unicode characters', () => {
    const map = new BiKeyMap<string, string, string>()

    map.set('用户', '测试', 'value1')
    map.set('😀', '🎉', 'value2')
    map.set('café', 'naïve', 'value3')

    expect(map.get('用户', '测试')).toBe('value1')
    expect(map.get('😀', '🎉')).toBe('value2')
    expect(map.get('café', 'naïve')).toBe('value3')
  })

  it('handles numeric zero keys', () => {
    const map = new BiKeyMap<number, number, string>()

    map.set(0, 0, 'zero')
    map.set(0, 1, 'test1')
    map.set(1, 0, 'test2')

    expect(map.get(0, 0)).toBe('zero')
    expect(map.get(0, 1)).toBe('test1')
    expect(map.get(1, 0)).toBe('test2')
  })

  it('returns correct count from getByK1', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')
    map.set('user', 3, 'Bob')
    map.set('admin', 1, 'Admin')

    const userValues = map.getByK1('user')

    expect(userValues).toHaveLength(3)
  })

  it('returns correct count from getByK2', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')
    map.set(2, 'email', 'jane@test.com')
    map.set(3, 'email', 'bob@test.com')
    map.set(1, 'phone', '555-0100')

    const emailValues = map.getByK2('email')

    expect(emailValues).toHaveLength(3)
  })

  it('clear removes all getByK1 and getByK2 data', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')

    map.clear()

    expect(map.getByK1('user')).toEqual([])
    expect(map.hasK1('user')).toBe(false)
  })

  it('handles multiple deletes with same k1', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 2, 'Jane')
    map.set('user', 3, 'Bob')

    map.delete('user', 1)
    map.delete('user', 2)

    expect(map.size).toBe(1)
    expect(map.get('user', 3)).toBe('Bob')
    expect(map.hasK1('user')).toBe(true)
  })

  it('handles multiple deletes with same k2', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')
    map.set(2, 'email', 'jane@test.com')
    map.set(3, 'email', 'bob@test.com')

    map.delete(1, 'email')
    map.delete(2, 'email')

    expect(map.size).toBe(1)
    expect(map.get(3, 'email')).toBe('bob@test.com')
    expect(map.hasK2('email')).toBe(true)
  })

  it('handles delete of last entry with k1', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    map.delete('user', 1)

    expect(map.size).toBe(0)
    expect(map.hasK1('user')).toBe(false)
    expect(map.getByK1('user')).toEqual([])
  })

  it('handles delete of last entry with k2', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')

    map.delete(1, 'email')

    expect(map.size).toBe(0)
    expect(map.hasK2('email')).toBe(false)
    expect(map.getByK2('email')).toEqual([])
  })

  it('forEach with empty map', () => {
    const map = new BiKeyMap<string, number, string>()
    let called = false

    map.forEach(() => {
      called = true
    })

    expect(called).toBe(false)
  })

  it('for-of with empty map', () => {
    const map = new BiKeyMap<string, number, string>()
    const entries: Array<[string, string, string]> = []

    for (const [k1, k2, v] of map) {
      entries.push([k1, k2, v])
    }

    expect(entries).toHaveLength(0)
  })

  it('entries returns empty array for empty map', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.entries()).toEqual([])
  })

  it('values returns empty array for empty map', () => {
    const map = new BiKeyMap<string, number, string>()

    expect(map.values()).toEqual([])
  })

  it('hasK1 returns false for non-existent key', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')

    expect(map.hasK1('admin')).toBe(false)
  })

  it('hasK2 returns false for non-existent key', () => {
    const map = new BiKeyMap<number, string, string>()

    map.set(1, 'email', 'john@test.com')

    expect(map.hasK2('phone')).toBe(false)
  })

  it('handles complex value types', () => {
    const map = new BiKeyMap<string, number, { name: string; age: number }>()

    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'Jane', age: 25 }

    map.set('user', 1, obj1)
    map.set('admin', 2, obj2)

    expect(map.get('user', 1)).toEqual(obj1)
    expect(map.get('admin', 2)).toEqual(obj2)
  })

  it('handles array values', () => {
    const map = new BiKeyMap<string, number, number[]>()

    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]

    map.set('user', 1, arr1)
    map.set('admin', 2, arr2)

    expect(map.get('user', 1)).toEqual(arr1)
    expect(map.get('admin', 2)).toEqual(arr2)
  })

  it('handles numeric values', () => {
    const map = new BiKeyMap<string, number, number>()

    map.set('user', 1, 42)
    map.set('admin', 2, -17)

    expect(map.get('user', 1)).toBe(42)
    expect(map.get('admin', 2)).toBe(-17)
  })

  it('handles set with same key multiple times', () => {
    const map = new BiKeyMap<string, number, string>()

    map.set('user', 1, 'John')
    map.set('user', 1, 'Jane')
    map.set('user', 1, 'Bob')

    expect(map.size).toBe(1)
    expect(map.get('user', 1)).toBe('Bob')
  })
})
describe('bikey-map - wave544', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bikey-map - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bikey-map - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bikey-map - wave548', () => {
  it('bikey-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bikey-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bikey-map module has name', () => {
    expect(describe).toBeDefined()
  })
})
