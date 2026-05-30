import { describe, expect, it } from 'vitest'
import { Bag } from '../../../src/core/bag/bag.js'

describe('Bag', () => {
  it('constructor creates empty bag', () => {
    const bag = new Bag<number>()
    expect(bag.size).toBe(0)
    expect(bag.uniqueSize).toBe(0)
    expect(bag.isEmpty()).toBe(true)
  })

  it('constructor with options', () => {
    const bag = new Bag<number>({ hash: (v) => v.toString() })
    expect(bag.size).toBe(0)
    expect(bag.isEmpty()).toBe(true)
  })

  it('add single value', () => {
    const bag = new Bag<number>()
    bag.add(1)
    expect(bag.size).toBe(1)
    expect(bag.uniqueSize).toBe(1)
    expect(bag.contains(1)).toBe(true)
    expect(bag.countOf(1)).toBe(1)
  })

  it('add multiple values', () => {
    const bag = new Bag<number>()
    bag.add(1)
    bag.add(2)
    bag.add(3)
    expect(bag.size).toBe(3)
    expect(bag.uniqueSize).toBe(3)
    expect(bag.contains(1)).toBe(true)
    expect(bag.contains(2)).toBe(true)
    expect(bag.contains(3)).toBe(true)
  })

  it('add with count increases multiplicity', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    expect(bag.size).toBe(5)
    expect(bag.uniqueSize).toBe(1)
    expect(bag.countOf(1)).toBe(5)
  })

  it('add same value multiple times increases count', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    bag.add(1, 3)
    expect(bag.size).toBe(5)
    expect(bag.countOf(1)).toBe(5)
  })

  it('add with count < 1 is no-op', () => {
    const bag = new Bag<number>()
    bag.add(1, 0)
    bag.add(2, -1)
    expect(bag.size).toBe(0)
    expect(bag.isEmpty()).toBe(true)
  })

  it('remove single value', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    const removed = bag.remove(1)
    expect(removed).toBe(1)
    expect(bag.size).toBe(4)
    expect(bag.countOf(1)).toBe(4)
  })

  it('remove with count', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    const removed = bag.remove(1, 3)
    expect(removed).toBe(3)
    expect(bag.size).toBe(2)
    expect(bag.countOf(1)).toBe(2)
  })

  it('remove removes all when count exceeds available', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    const removed = bag.remove(1, 10)
    expect(removed).toBe(5)
    expect(bag.size).toBe(0)
    expect(bag.contains(1)).toBe(false)
  })

  it('remove last occurrence deletes key', () => {
    const bag = new Bag<number>()
    bag.add(1, 1)
    bag.remove(1)
    expect(bag.size).toBe(0)
    expect(bag.uniqueSize).toBe(0)
    expect(bag.contains(1)).toBe(false)
  })

  it('remove non-existent returns 0', () => {
    const bag = new Bag<number>()
    const removed = bag.remove(1)
    expect(removed).toBe(0)
    expect(bag.size).toBe(0)
  })

  it('remove with count < 1 returns 0', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    const removed1 = bag.remove(1, 0)
    const removed2 = bag.remove(1, -1)
    expect(removed1).toBe(0)
    expect(removed2).toBe(0)
    expect(bag.size).toBe(5)
  })

  it('countOf returns 0 for non-existent value', () => {
    const bag = new Bag<number>()
    expect(bag.countOf(1)).toBe(0)
  })

  it('contains returns false for non-existent value', () => {
    const bag = new Bag<number>()
    expect(bag.contains(1)).toBe(false)
  })

  it('size returns total count', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    bag.add(2, 3)
    bag.add(3, 1)
    expect(bag.size).toBe(6)
  })

  it('uniqueSize returns number of distinct values', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    bag.add(2, 3)
    bag.add(3, 2)
    expect(bag.uniqueSize).toBe(3)
  })

  it('isEmpty returns true for empty bag', () => {
    const bag = new Bag<number>()
    expect(bag.isEmpty()).toBe(true)
  })

  it('isEmpty returns false for non-empty bag', () => {
    const bag = new Bag<number>()
    bag.add(1)
    expect(bag.isEmpty()).toBe(false)
  })

  it('clear empties bag', () => {
    const bag = new Bag<number>()
    bag.add(1, 3)
    bag.add(2, 2)
    bag.clear()
    expect(bag.size).toBe(0)
    expect(bag.uniqueSize).toBe(0)
    expect(bag.isEmpty()).toBe(true)
  })

  it('clone creates independent copy', () => {
    const bag = new Bag<number>()
    bag.add(1, 3)
    bag.add(2, 2)
    const clone = bag.clone()
    expect(clone.size).toBe(bag.size)
    expect(clone.uniqueSize).toBe(bag.uniqueSize)
    expect(clone.countOf(1)).toBe(3)
    expect(clone.countOf(2)).toBe(2)
    clone.add(1)
    expect(bag.size).toBe(5)
    expect(clone.size).toBe(6)
  })

  it('toArray expands multiplicities', () => {
    const bag = new Bag<number>()
    bag.add(1, 3)
    bag.add(2, 2)
    const arr = bag.toArray()
    expect(arr.length).toBe(5)
    expect(arr.filter((x) => x === 1).length).toBe(3)
    expect(arr.filter((x) => x === 2).length).toBe(2)
  })

  it('uniqueValues returns distinct values', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    bag.add(2, 3)
    bag.add(3, 2)
    const values = bag.uniqueValues()
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('forEach calls callback per occurrence', () => {
    const bag = new Bag<number>()
    bag.add(1, 3)
    bag.add(2, 2)
    const calls: number[] = []
    bag.forEach((value) => calls.push(value))
    expect(calls.length).toBe(5)
    expect(calls.filter((x) => x === 1).length).toBe(3)
    expect(calls.filter((x) => x === 2).length).toBe(2)
  })

  it('from creates bag from array', () => {
    const bag = Bag.from([1, 2, 2, 3, 3, 3])
    expect(bag.size).toBe(6)
    expect(bag.countOf(1)).toBe(1)
    expect(bag.countOf(2)).toBe(2)
    expect(bag.countOf(3)).toBe(3)
  })

  it('from creates bag from string', () => {
    const bag = Bag.from('hello')
    expect(bag.size).toBe(5)
    expect(bag.countOf('l')).toBe(2)
  })

  it('from with options', () => {
    const bag = Bag.from([1, 2, 2, 3], { hash: (v) => v.toString() })
    expect(bag.size).toBe(4)
    expect(bag.countOf(2)).toBe(2)
  })

  it('union with overlapping values', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    bag1.add(2, 2)
    const bag2 = new Bag<number>()
    bag2.add(2, 4)
    bag2.add(3, 1)
    const result = bag1.union(bag2)
    expect(result.countOf(1)).toBe(3)
    expect(result.countOf(2)).toBe(4)
    expect(result.countOf(3)).toBe(1)
  })

  it('union with empty bag', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    bag1.add(2, 2)
    const bag2 = new Bag<number>()
    const result = bag1.union(bag2)
    expect(result.size).toBe(5)
    expect(result.countOf(1)).toBe(3)
    expect(result.countOf(2)).toBe(2)
  })

  it('intersection with overlapping values', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    bag1.add(2, 5)
    bag1.add(3, 2)
    const bag2 = new Bag<number>()
    bag2.add(2, 3)
    bag2.add(3, 4)
    bag2.add(4, 1)
    const result = bag1.intersection(bag2)
    expect(result.countOf(2)).toBe(3)
    expect(result.countOf(3)).toBe(2)
    expect(result.contains(1)).toBe(false)
    expect(result.contains(4)).toBe(false)
  })

  it('intersection with empty bag', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    const bag2 = new Bag<number>()
    const result = bag1.intersection(bag2)
    expect(result.size).toBe(0)
    expect(result.isEmpty()).toBe(true)
  })

  it('difference removes other bag counts', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 5)
    bag1.add(2, 3)
    bag1.add(3, 1)
    const bag2 = new Bag<number>()
    bag2.add(1, 2)
    bag2.add(2, 3)
    const result = bag1.difference(bag2)
    expect(result.countOf(1)).toBe(3)
    expect(result.countOf(2)).toBe(0)
    expect(result.countOf(3)).toBe(1)
  })

  it('difference with empty bag', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    bag1.add(2, 2)
    const bag2 = new Bag<number>()
    const result = bag1.difference(bag2)
    expect(result.size).toBe(5)
    expect(result.countOf(1)).toBe(3)
    expect(result.countOf(2)).toBe(2)
  })

  it('isSubsetOf returns true for subset', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    bag1.add(2, 1)
    const bag2 = new Bag<number>()
    bag2.add(1, 3)
    bag2.add(2, 2)
    bag2.add(3, 1)
    expect(bag1.isSubsetOf(bag2)).toBe(true)
  })

  it('isSubsetOf returns false for non-subset', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 4)
    bag1.add(2, 1)
    const bag2 = new Bag<number>()
    bag2.add(1, 3)
    bag2.add(2, 2)
    expect(bag1.isSubsetOf(bag2)).toBe(false)
  })

  it('isSubsetOf with empty bag', () => {
    const bag1 = new Bag<number>()
    const bag2 = new Bag<number>()
    bag2.add(1, 3)
    expect(bag1.isSubsetOf(bag2)).toBe(true)
    expect(bag2.isSubsetOf(bag1)).toBe(false)
  })

  it('stats on empty bag', () => {
    const bag = new Bag<number>()
    const stats = bag.stats()
    expect(stats.size).toBe(0)
    expect(stats.uniqueSize).toBe(0)
    expect(stats.minCount).toBe(0)
    expect(stats.maxCount).toBe(0)
    expect(stats.meanCount).toBe(0)
  })

  it('stats on non-empty bag', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    bag.add(2, 5)
    bag.add(3, 3)
    const stats = bag.stats()
    expect(stats.size).toBe(10)
    expect(stats.uniqueSize).toBe(3)
    expect(stats.minCount).toBe(2)
    expect(stats.maxCount).toBe(5)
    expect(stats.meanCount).toBe(10 / 3)
  })

  it('handles large bag (100+ items)', () => {
    const bag = new Bag<number>()
    for (let i = 0; i < 100; i++) {
      bag.add(i % 10)
    }
    expect(bag.size).toBe(100)
    expect(bag.uniqueSize).toBe(10)
  })
})