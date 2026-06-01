import { describe, it, expect } from 'vitest'
import { RobinHopMap } from '../../src/utils/robin-hood-map.js'

describe('RobinHopMap', () => {
  it('starts empty', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.size).toBe(0)
    expect(map.capacity).toBeGreaterThanOrEqual(16)
  })

  it('sets and gets a value', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('handles multiple keys', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(3)
  })

  it('has returns correct boolean', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 42)
    expect(map.has('x')).toBe(true)
    expect(map.has('y')).toBe(false)
  })

  it('deletes a key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.delete('a')).toBe(true)
    expect(map.has('a')).toBe(false)
    expect(map.get('b')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('delete returns false for missing key', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.delete('missing')).toBe(false)
  })

  it('clear empties the map', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.has('a')).toBe(false)
  })

  it('iterates entries', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 10)
    map.set('y', 20)
    const entries = [...map.entries()]
    expect(entries.length).toBe(2)
    expect(entries.some(([k, v]) => k === 'x' && v === 10)).toBe(true)
    expect(entries.some(([k, v]) => k === 'y' && v === 20)).toBe(true)
  })

  it('iterates keys', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const keys = [...map.keysIterator()]
    expect(keys.sort()).toEqual(['a', 'b'])
  })

  it('iterates values', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const vals = [...map.valuesIterator()]
    expect(vals.sort()).toEqual([1, 2])
  })

  it('handles number keys', () => {
    const map = new RobinHopMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })

  it('resizes when load factor exceeded', () => {
    const map = new RobinHopMap<number, number>(4)
    for (let i = 0; i < 20; i++) {
      map.set(i, i * 10)
    }
    expect(map.size).toBe(20)
    for (let i = 0; i < 20; i++) {
      expect(map.get(i)).toBe(i * 10)
    }
  })

  it('handles delete and reinsert', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.delete('a')
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('maxPSL returns non-negative value', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    expect(map.maxPSL()).toBeGreaterThanOrEqual(0)
  })

  it('delete returns true for existing key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 10)
    expect(map.delete('x')).toBe(true)
    expect(map.has('x')).toBe(false)
  })

  it('has returns false for missing key', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.has('missing')).toBe(false)
  })
})
