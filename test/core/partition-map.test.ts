import { describe, it, expect } from 'vitest'
import { PartitionMap } from '../../src/core/partition-map/partition-map.js'
import type { PartitionMapOptions, PartitionMapStats } from '../../src/core/partition-map/types.js'

describe('PartitionMap', () => {
  describe('construction', () => {
    it('should create empty partition map with partitionKey', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      expect(pm.size).toBe(0)
      expect(pm.partitionCount).toBe(0)
      expect(pm.isEmpty).toBe(true)
    })

    it('should create partition map without capacity', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.isEmpty).toBe(true)
    })

    it('should create partition map with capacity', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => 'all', capacity: 5 })
      expect(pm.isEmpty).toBe(true)
    })

    it('should create partition map with capacity of 1', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => 'all', capacity: 1 })
      expect(pm.add(1)).toBe(true)
      expect(pm.add(2)).toBe(false)
    })

    it('should handle undefined capacity via undefined', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => 'all', capacity: undefined })
      for (let i = 0; i < 100; i++) {
        expect(pm.add(i)).toBe(true)
      }
      expect(pm.size).toBe(100)
    })

    it('should accept function as partitionKey', () => {
      const fn = (s: string) => s.length
      const pm = new PartitionMap<string, number>({ partitionKey: fn })
      expect(pm.isEmpty).toBe(true)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      expect(pm.add(3)).toBe(true)
      expect(pm.size).toBe(1)
    })

    it('should add items to correct partitions', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(2)
      pm.add(10)
      pm.add(20)
      expect(pm.getPartition('low')).toEqual([1, 2])
      expect(pm.getPartition('high')).toEqual([10, 20])
    })

    it('should return true for successful add', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.add(1)).toBe(true)
    })

    it('should add duplicate items to same partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(1)
      pm.add(1)
      expect(pm.size).toBe(3)
      expect(pm.getPartition('all')).toEqual([1, 1, 1])
    })

    it('should increment size for each add', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n % 2) })
      expect(pm.size).toBe(0)
      pm.add(1)
      expect(pm.size).toBe(1)
      pm.add(2)
      expect(pm.size).toBe(2)
      pm.add(3)
      expect(pm.size).toBe(3)
    })

    it('should create new partition for new key', () => {
      const pm = new PartitionMap<string, number>({ partitionKey: (s) => s.length })
      pm.add('a')
      expect(pm.partitionCount).toBe(1)
      pm.add('ab')
      expect(pm.partitionCount).toBe(2)
      pm.add('abc')
      expect(pm.partitionCount).toBe(3)
    })

    it('should not create new partition for existing key', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      expect(pm.partitionCount).toBe(1)
    })

    it('should handle string items', () => {
      const pm = new PartitionMap<string, string>({ partitionKey: (s) => s[0]!.toUpperCase() })
      pm.add('apple')
      pm.add('avocado')
      pm.add('banana')
      expect(pm.size).toBe(3)
      expect(pm.getPartition('A')).toEqual(['apple', 'avocado'])
      expect(pm.getPartition('B')).toEqual(['banana'])
    })

    it('should handle object items', () => {
      interface Person { name: string; age: number }
      const pm = new PartitionMap<Person, string>({ partitionKey: (p) => p.age < 18 ? 'minor' : 'adult' })
      pm.add({ name: 'Alice', age: 25 })
      pm.add({ name: 'Bob', age: 10 })
      expect(pm.size).toBe(2)
      expect(pm.partitionCount).toBe(2)
    })

    it('should handle numeric keys', () => {
      const pm = new PartitionMap<string, number>({ partitionKey: (s) => s.length })
      pm.add('a')
      pm.add('bb')
      pm.add('ccc')
      expect(pm.partitions).toContain(1)
      expect(pm.partitions).toContain(2)
      expect(pm.partitions).toContain(3)
    })

    it('should handle boolean keys', () => {
      const pm = new PartitionMap<number, boolean>({ partitionKey: (n) => n > 0 })
      pm.add(-1)
      pm.add(0)
      pm.add(1)
      pm.add(2)
      expect(pm.getPartition(false)).toEqual([-1, 0])
      expect(pm.getPartition(true)).toEqual([1, 2])
    })
  })

  describe('remove', () => {
    it('should remove an existing item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      expect(pm.remove(1)).toBe(true)
      expect(pm.size).toBe(0)
    })

    it('should return false for non-existent item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.remove(1)).toBe(false)
    })

    it('should return false when item is in wrong partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'a' })
      pm.add(1)
      expect(pm.remove(2)).toBe(false)
    })

    it('should remove partition when last item is removed', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      expect(pm.partitionCount).toBe(1)
      pm.remove(1)
      expect(pm.partitionCount).toBe(0)
    })

    it('should not remove partition when other items remain', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.remove(1)
      expect(pm.partitionCount).toBe(1)
      expect(pm.getPartition('all')).toEqual([2])
    })

    it('should decrement size on removal', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      expect(pm.size).toBe(3)
      pm.remove(2)
      expect(pm.size).toBe(2)
    })

    it('should handle removing same item twice', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      expect(pm.remove(1)).toBe(true)
      expect(pm.remove(1)).toBe(false)
    })

    it('should handle remove on empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.remove(1)).toBe(false)
    })

    it('should remove correct item from partition with multiple items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.remove(2)
      expect(pm.getPartition('all')).toEqual([1, 3])
    })

    it('should handle remove with reference equality for objects', () => {
      const pm = new PartitionMap<object, string>({ partitionKey: () => 'all' })
      const obj = { x: 1 }
      pm.add(obj)
      expect(pm.remove(obj)).toBe(true)
      expect(pm.remove({ x: 1 })).toBe(false)
    })
  })

  describe('has', () => {
    it('should return true for existing item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      expect(pm.has(1)).toBe(true)
    })

    it('should return false for non-existent item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.has(1)).toBe(false)
    })

    it('should return false for item in wrong partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      expect(pm.has(2)).toBe(false)
    })

    it('should return false on empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.has(1)).toBe(false)
    })

    it('should return false after item is removed', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.remove(1)
      expect(pm.has(1)).toBe(false)
    })

    it('should find item among many in same partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      expect(pm.has(2)).toBe(true)
    })

    it('should use reference equality for objects', () => {
      const pm = new PartitionMap<object, string>({ partitionKey: () => 'all' })
      const obj = { x: 1 }
      pm.add(obj)
      expect(pm.has(obj)).toBe(true)
      expect(pm.has({ x: 1 })).toBe(false)
    })
  })

  describe('getPartition', () => {
    it('should return items in partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(3)
      pm.add(10)
      expect(pm.getPartition('low')).toEqual([1, 3])
    })

    it('should return empty array for non-existent partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.getPartition('missing')).toEqual([])
    })

    it('should return copy of partition array', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      const arr = pm.getPartition('all')
      arr.push(3)
      expect(pm.getPartition('all')).toEqual([1, 2])
    })

    it('should not be affected by mutations to returned array', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      const arr = pm.getPartition('all')
      arr.length = 0
      expect(pm.getPartition('all')).toEqual([1])
    })

    it('should return all items in partition', () => {
      const pm = new PartitionMap<string, string>({ partitionKey: (s) => s[0]!.toUpperCase() })
      pm.add('apple')
      pm.add('avocado')
      pm.add('apricot')
      expect(pm.getPartition('A')).toEqual(['apple', 'avocado', 'apricot'])
    })

    it('should return empty after partition is emptied', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.remove(1)
      expect(pm.getPartition('1')).toEqual([])
    })
  })

  describe('partitions', () => {
    it('should return empty array for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.partitions).toEqual([])
    })

    it('should return all partition keys', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(10)
      const keys = pm.partitions
      expect(keys).toContain('low')
      expect(keys).toContain('high')
      expect(keys.length).toBe(2)
    })

    it('should not duplicate keys', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      expect(pm.partitions).toEqual(['all'])
    })

    it('should reflect removals', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.remove(1)
      expect(pm.partitions).toEqual(['2'])
    })

    it('should reflect all removals', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.remove(1)
      expect(pm.partitions).toEqual([])
    })
  })

  describe('partitionSize', () => {
    it('should return 0 for non-existent partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.partitionSize('missing')).toBe(0)
    })

    it('should return correct size for partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      expect(pm.partitionSize('all')).toBe(3)
    })

    it('should return 0 for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.partitionSize('1')).toBe(0)
    })

    it('should update after removal', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.remove(2)
      expect(pm.partitionSize('all')).toBe(2)
    })

    it('should return 0 after partition is emptied', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.remove(1)
      expect(pm.partitionSize('1')).toBe(0)
    })

    it('should handle multiple partitions with different sizes', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.add(10)
      expect(pm.partitionSize('low')).toBe(3)
      expect(pm.partitionSize('high')).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.size).toBe(0)
    })

    it('should count total items across all partitions', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(2)
      pm.add(10)
      pm.add(20)
      expect(pm.size).toBe(4)
    })

    it('should update after add', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.size).toBe(0)
      pm.add(1)
      expect(pm.size).toBe(1)
    })

    it('should update after remove', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.remove(1)
      expect(pm.size).toBe(0)
    })

    it('should update after clear', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.clear()
      expect(pm.size).toBe(0)
    })
  })

  describe('partitionCount', () => {
    it('should return 0 for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.partitionCount).toBe(0)
    })

    it('should count distinct partitions', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n % 2 === 0 ? 'even' : 'odd' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.add(4)
      expect(pm.partitionCount).toBe(2)
    })

    it('should decrease when partition is emptied', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      expect(pm.partitionCount).toBe(2)
      pm.remove(1)
      expect(pm.partitionCount).toBe(1)
    })

    it('should not decrease when partition still has items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.remove(1)
      expect(pm.partitionCount).toBe(1)
    })

    it('should reset to 0 after clear', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.clear()
      expect(pm.partitionCount).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.isEmpty).toBe(true)
    })

    it('should return false after adding item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      expect(pm.isEmpty).toBe(false)
    })

    it('should return true after removing all items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.remove(1)
      expect(pm.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.clear()
      expect(pm.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.clear()
      expect(pm.size).toBe(0)
      expect(pm.partitionCount).toBe(0)
      expect(pm.isEmpty).toBe(true)
    })

    it('should be safe to call on empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.clear()
      expect(pm.isEmpty).toBe(true)
    })

    it('should allow adding after clear', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.clear()
      pm.add(2)
      expect(pm.size).toBe(1)
      expect(pm.has(2)).toBe(true)
      expect(pm.has(1)).toBe(false)
    })

    it('should clear all partitions', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n % 2 === 0 ? 'even' : 'odd' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.clear()
      expect(pm.getPartition('even')).toEqual([])
      expect(pm.getPartition('odd')).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      let count = 0
      pm.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate over all items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(2)
      pm.add(10)
      const items: number[] = []
      pm.forEach((item) => { items.push(item) })
      expect(items.sort((a, b) => a - b)).toEqual([1, 2, 10])
    })

    it('should pass correct key for each item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n % 2 === 0 ? 'even' : 'odd' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      const pairs: Array<[number, string]> = []
      pm.forEach((item, key) => { pairs.push([item, key]) })
      expect(pairs).toContainEqual([1, 'odd'])
      expect(pairs).toContainEqual([2, 'even'])
      expect(pairs).toContainEqual([3, 'odd'])
    })

    it('should iterate in insertion order within partitions', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      const items: number[] = []
      pm.forEach((item) => { items.push(item) })
      expect(items).toEqual([1, 2, 3])
    })

    it('should iterate correct number of times', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      let count = 0
      pm.forEach(() => { count++ })
      expect(count).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.toArray()).toEqual([])
    })

    it('should return all items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(10)
      pm.add(2)
      pm.add(20)
      const arr = pm.toArray()
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 10, 20])
    })

    it('should return copy of items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      const arr = pm.toArray()
      arr.push(2)
      expect(pm.size).toBe(1)
    })
  })

  describe('items', () => {
    it('should return same result as toArray', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      expect(pm.items()).toEqual(pm.toArray())
    })

    it('should return empty array for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.items()).toEqual([])
    })

    it('should return all items', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      expect(pm.items()).toEqual([1, 2, 3])
    })
  })

  describe('from', () => {
    it('should create partition map from array', () => {
      const pm = PartitionMap.from([1, 2, 3, 4, 5], { partitionKey: (n) => n % 2 === 0 ? 'even' : 'odd' })
      expect(pm.size).toBe(5)
      expect(pm.partitionCount).toBe(2)
      expect(pm.getPartition('even')).toEqual([2, 4])
      expect(pm.getPartition('odd')).toEqual([1, 3, 5])
    })

    it('should create empty map from empty array', () => {
      const pm = PartitionMap.from<number, string>([], { partitionKey: (n) => String(n) })
      expect(pm.isEmpty).toBe(true)
    })

    it('should respect capacity in from', () => {
      const pm = PartitionMap.from([1, 2, 3], { partitionKey: () => 'all', capacity: 2 })
      expect(pm.size).toBe(2)
    })

    it('should handle single item array', () => {
      const pm = PartitionMap.from([42], { partitionKey: (n) => String(n) })
      expect(pm.size).toBe(1)
      expect(pm.has(42)).toBe(true)
    })

    it('should handle string items', () => {
      const pm = PartitionMap.from(['apple', 'banana', 'avocado'], { partitionKey: (s) => s[0]!.toUpperCase() })
      expect(pm.partitionCount).toBe(2)
      expect(pm.getPartition('A')).toEqual(['apple', 'avocado'])
      expect(pm.getPartition('B')).toEqual(['banana'])
    })

    it('should handle numeric keys from from', () => {
      const pm = PartitionMap.from(['a', 'bb', 'ccc', 'dd'], { partitionKey: (s) => s.length })
      expect(pm.partitionCount).toBe(3)
      expect(pm.getPartition(1)).toEqual(['a'])
      expect(pm.getPartition(2)).toEqual(['bb', 'dd'])
      expect(pm.getPartition(3)).toEqual(['ccc'])
    })
  })

  describe('rebalance', () => {
    it('should rebuild partitions', () => {
      let key = 'a'
      const pm = new PartitionMap<number, string>({ partitionKey: () => key })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      expect(pm.getPartition('a')).toEqual([1, 2, 3])
      key = 'b'
      pm.rebalance()
      expect(pm.getPartition('a')).toEqual([])
      expect(pm.getPartition('b')).toEqual([1, 2, 3])
    })

    it('should maintain all items after rebalance', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n % 2 === 0 ? 'even' : 'odd' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.add(4)
      pm.rebalance()
      expect(pm.size).toBe(4)
    })

    it('should handle rebalance on empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.rebalance()
      expect(pm.isEmpty).toBe(true)
    })

    it('should handle rebalance with single item', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.rebalance()
      expect(pm.size).toBe(1)
      expect(pm.has(1)).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      const s = pm.stats()
      expect(s.partitionCount).toBe(0)
      expect(s.totalItems).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.avgItemsPerPartition).toBe(0)
      expect(s.maxItemsPerPartition).toBe(0)
      expect(s.minItemsPerPartition).toBe(0)
      expect(s.capacity).toBeNull()
    })

    it('should return correct stats for populated map', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.add(10)
      const s = pm.stats()
      expect(s.partitionCount).toBe(2)
      expect(s.totalItems).toBe(4)
      expect(s.isEmpty).toBe(false)
      expect(s.avgItemsPerPartition).toBe(2)
      expect(s.maxItemsPerPartition).toBe(3)
      expect(s.minItemsPerPartition).toBe(1)
    })

    it('should return correct stats for single partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      pm.add(1)
      const s = pm.stats()
      expect(s.partitionCount).toBe(1)
      expect(s.totalItems).toBe(1)
      expect(s.avgItemsPerPartition).toBe(1)
      expect(s.maxItemsPerPartition).toBe(1)
      expect(s.minItemsPerPartition).toBe(1)
    })

    it('should return correct capacity', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all', capacity: 10 })
      const s = pm.stats()
      expect(s.capacity).toBe(10)
    })

    it('should return null capacity when not set', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      const s = pm.stats()
      expect(s.capacity).toBeNull()
    })

    it('should update stats after removal', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.remove(2)
      const s = pm.stats()
      expect(s.totalItems).toBe(2)
      expect(s.partitionCount).toBe(2)
    })

    it('should update stats after clear', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(1)
      pm.add(2)
      pm.clear()
      const s = pm.stats()
      expect(s.isEmpty).toBe(true)
      expect(s.partitionCount).toBe(0)
    })

    it('should handle stats with uneven distribution', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(2)
      pm.add(3)
      pm.add(4)
      pm.add(0)
      pm.add(10)
      const s = pm.stats()
      expect(s.maxItemsPerPartition).toBe(5)
      expect(s.minItemsPerPartition).toBe(1)
      expect(s.avgItemsPerPartition).toBe(3)
    })
  })

  describe('edge cases - empty map', () => {
    it('should handle getPartition on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.getPartition('x')).toEqual([])
    })

    it('should handle remove on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.remove(1)).toBe(false)
    })

    it('should handle has on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.has(1)).toBe(false)
    })

    it('should handle partitions on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.partitions).toEqual([])
    })

    it('should handle partitionSize on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.partitionSize('x')).toBe(0)
    })

    it('should handle toArray on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.toArray()).toEqual([])
    })

    it('should handle items on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      expect(pm.items()).toEqual([])
    })

    it('should handle forEach on empty', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      let count = 0
      pm.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('edge cases - single item', () => {
    it('should handle single item operations', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      pm.add(42)
      expect(pm.size).toBe(1)
      expect(pm.partitionCount).toBe(1)
      expect(pm.isEmpty).toBe(false)
      expect(pm.has(42)).toBe(true)
      expect(pm.getPartition('42')).toEqual([42])
      expect(pm.partitions).toEqual(['42'])
      expect(pm.partitionSize('42')).toBe(1)
      expect(pm.toArray()).toEqual([42])
      expect(pm.items()).toEqual([42])
    })
  })

  describe('edge cases - all same partition', () => {
    it('should handle all items in one partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      for (let i = 0; i < 100; i++) {
        pm.add(i)
      }
      expect(pm.partitionCount).toBe(1)
      expect(pm.size).toBe(100)
      expect(pm.getPartition('all').length).toBe(100)
    })
  })

  describe('edge cases - unique partitions', () => {
    it('should handle each item in its own partition', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n })
      for (let i = 0; i < 50; i++) {
        pm.add(i)
      }
      expect(pm.partitionCount).toBe(50)
      expect(pm.size).toBe(50)
    })

    it('should handle unique string keys', () => {
      const pm = new PartitionMap<string, string>({ partitionKey: (s) => s })
      pm.add('a')
      pm.add('b')
      pm.add('c')
      expect(pm.partitionCount).toBe(3)
    })
  })

  describe('capacity limits', () => {
    it('should reject items when partition is at capacity', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all', capacity: 3 })
      expect(pm.add(1)).toBe(true)
      expect(pm.add(2)).toBe(true)
      expect(pm.add(3)).toBe(true)
      expect(pm.add(4)).toBe(false)
      expect(pm.size).toBe(3)
    })

    it('should allow adding to different partitions when one is full', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high', capacity: 2 })
      pm.add(1)
      pm.add(2)
      expect(pm.add(3)).toBe(false)
      expect(pm.add(10)).toBe(true)
      expect(pm.size).toBe(3)
    })

    it('should allow adding after removing from full partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all', capacity: 2 })
      pm.add(1)
      pm.add(2)
      expect(pm.add(3)).toBe(false)
      pm.remove(1)
      expect(pm.add(3)).toBe(true)
      expect(pm.size).toBe(2)
    })

    it('should handle capacity of 0', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all', capacity: 0 })
      expect(pm.add(1)).toBe(false)
      expect(pm.size).toBe(0)
    })

    it('should report capacity in stats', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all', capacity: 5 })
      expect(pm.stats().capacity).toBe(5)
    })

    it('should handle from with capacity', () => {
      const pm = PartitionMap.from([1, 2, 3, 4, 5], { partitionKey: () => 'all', capacity: 3 })
      expect(pm.size).toBe(3)
    })

    it('should handle large capacity', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all', capacity: 1000000 })
      for (let i = 0; i < 1000; i++) {
        expect(pm.add(i)).toBe(true)
      }
      expect(pm.size).toBe(1000)
    })
  })

  describe('different key types', () => {
    it('should handle number keys', () => {
      const pm = new PartitionMap<string, number>({ partitionKey: (s) => s.length })
      pm.add('a')
      pm.add('bb')
      pm.add('ccc')
      expect(pm.getPartition(1)).toEqual(['a'])
      expect(pm.getPartition(2)).toEqual(['bb'])
      expect(pm.getPartition(3)).toEqual(['ccc'])
    })

    it('should handle boolean keys', () => {
      const pm = new PartitionMap<number, boolean>({ partitionKey: (n) => n > 0 })
      pm.add(-1)
      pm.add(0)
      pm.add(1)
      expect(pm.getPartition(false)).toEqual([-1, 0])
      expect(pm.getPartition(true)).toEqual([1])
    })

    it('should handle string keys', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n % 2 === 0 ? 'even' : 'odd' })
      pm.add(1)
      pm.add(2)
      expect(pm.getPartition('even')).toEqual([2])
      expect(pm.getPartition('odd')).toEqual([1])
    })

    it('should handle object keys by reference', () => {
      const key1 = { id: 1 }
      const key2 = { id: 2 }
      const pm = new PartitionMap<string, object>({ partitionKey: () => key1 })
      pm.add('a')
      expect(pm.getPartition(key1)).toEqual(['a'])
      expect(pm.getPartition(key2)).toEqual([])
    })
  })

  describe('large maps', () => {
    it('should handle 10000 items', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n % 100 })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      expect(pm.size).toBe(10000)
      expect(pm.partitionCount).toBe(100)
    })

    it('should handle 10000 unique partitions', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      expect(pm.partitionCount).toBe(10000)
      expect(pm.size).toBe(10000)
    })

    it('should handle 10000 items in single partition', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: () => 'all' })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      expect(pm.size).toBe(10000)
      expect(pm.partitionCount).toBe(1)
    })

    it('should handle forEach with 10000 items', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n % 100 })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      let count = 0
      pm.forEach(() => { count++ })
      expect(count).toBe(10000)
    })

    it('should handle toArray with 10000 items', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n % 100 })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      expect(pm.toArray().length).toBe(10000)
    })

    it('should handle items with 10000 items', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n % 100 })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      expect(pm.items().length).toBe(10000)
    })

    it('should handle stats with 10000 items', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n % 100 })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      const s = pm.stats()
      expect(s.totalItems).toBe(10000)
      expect(s.partitionCount).toBe(100)
      expect(s.maxItemsPerPartition).toBe(100)
      expect(s.minItemsPerPartition).toBe(100)
    })

    it('should handle clear with 10000 items', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n % 100 })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      pm.clear()
      expect(pm.isEmpty).toBe(true)
      expect(pm.size).toBe(0)
    })

    it('should handle from with 10000 items', () => {
      const items: number[] = []
      for (let i = 0; i < 10000; i++) {
        items.push(i)
      }
      const pm = PartitionMap.from(items, { partitionKey: (n) => n % 100 })
      expect(pm.size).toBe(10000)
      expect(pm.partitionCount).toBe(100)
    })

    it('should handle remove from large map', () => {
      const pm = new PartitionMap<number, number>({ partitionKey: (n) => n % 100 })
      for (let i = 0; i < 10000; i++) {
        pm.add(i)
      }
      for (let i = 0; i < 5000; i++) {
        pm.remove(i)
      }
      expect(pm.size).toBe(5000)
    })
  })

  describe('edge cases - repeated add-remove cycles', () => {
    it('should handle repeated add-remove cycles', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => String(n) })
      for (let i = 0; i < 100; i++) {
        pm.add(i)
        pm.remove(i)
      }
      expect(pm.isEmpty).toBe(true)
      expect(pm.size).toBe(0)
      expect(pm.partitionCount).toBe(0)
    })
  })

  describe('edge cases - rebalance after mutations', () => {
    it('should rebalance after adding and removing', () => {
      const pm = new PartitionMap<number, string>({ partitionKey: (n) => n < 5 ? 'low' : 'high' })
      pm.add(1)
      pm.add(10)
      pm.add(2)
      pm.add(20)
      pm.rebalance()
      expect(pm.size).toBe(4)
      expect(pm.partitionCount).toBe(2)
    })
  })
})
