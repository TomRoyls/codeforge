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
})