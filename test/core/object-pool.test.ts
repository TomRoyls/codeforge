import { describe, it, expect, beforeEach } from 'vitest'
import { ObjectPool } from '../../src/core/object-pool/object-pool.js'
import type { ObjectPoolOptions, ObjectPoolStats } from '../../src/core/object-pool/types.js'

interface TestObj {
  value: number
  label: string
  active: boolean
}

function createTestObj(): TestObj {
  return { value: 0, label: '', active: false }
}

function resetTestObj(obj: TestObj): void {
  obj.value = 0
  obj.label = ''
  obj.active = false
}

describe('ObjectPool', () => {
  describe('constructor', () => {
    it('should create pool with factory only', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      expect(pool.size).toBe(0)
      expect(pool.allocated).toBe(0)
      expect(pool.inUse).toBe(0)
    })

    it('should create pool with factory and reset', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, resetTestObj)
      expect(pool.size).toBe(0)
    })

    it('should create pool with initial size', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      expect(pool.size).toBe(5)
      expect(pool.allocated).toBe(5)
      expect(pool.inUse).toBe(0)
    })

    it('should create pool with all parameters', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, resetTestObj, 3)
      expect(pool.size).toBe(3)
      expect(pool.allocated).toBe(3)
    })

    it('should handle initial size of 0', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 0)
      expect(pool.size).toBe(0)
      expect(pool.allocated).toBe(0)
    })

    it('should handle negative initial size', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, -5)
      expect(pool.size).toBe(0)
      expect(pool.allocated).toBe(0)
    })

    it('should handle undefined initial size', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, undefined)
      expect(pool.size).toBe(0)
    })
  })

  describe('acquire', () => {
    it('should acquire a new object when pool is empty', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj = pool.acquire()
      expect(obj).toBeDefined()
      expect(typeof obj.value).toBe('number')
      expect(pool.inUse).toBe(1)
      expect(pool.size).toBe(0)
    })

    it('should acquire a pooled object when available', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 3)
      const obj = pool.acquire()
      expect(obj).toBeDefined()
      expect(pool.size).toBe(2)
      expect(pool.inUse).toBe(1)
      expect(pool.allocated).toBe(3)
    })

    it('should reuse objects from pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj1 = pool.acquire()
      obj1.value = 42
      pool.release(obj1)
      const obj2 = pool.acquire()
      expect(obj2).toBe(obj1)
    })

    it('should increment allocated when creating new objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.acquire()
      pool.acquire()
      pool.acquire()
      expect(pool.allocated).toBe(3)
    })

    it('should not increment allocated when reusing', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj = pool.acquire()
      pool.release(obj)
      pool.acquire()
      expect(pool.allocated).toBe(1)
    })

    it('should increment inUse for each acquire', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.acquire()
      pool.acquire()
      expect(pool.inUse).toBe(2)
    })

    it('should work with primitive factory', () => {
      const pool = new ObjectPool<number>(() => 0)
      const val = pool.acquire()
      expect(val).toBe(0)
    })

    it('should work with array factory', () => {
      const pool = new ObjectPool<number[]>(() => [])
      const arr = pool.acquire()
      expect(Array.isArray(arr)).toBe(true)
    })
  })

  describe('release', () => {
    let pool: ObjectPool<TestObj>

    beforeEach(() => {
      pool = new ObjectPool<TestObj>(createTestObj)
    })

    it('should return object to pool', () => {
      const obj = pool.acquire()
      pool.release(obj)
      expect(pool.size).toBe(1)
      expect(pool.inUse).toBe(0)
    })

    it('should call reset function on release', () => {
      const resetPool = new ObjectPool<TestObj>(createTestObj, resetTestObj)
      const obj = resetPool.acquire()
      obj.value = 99
      obj.label = 'test'
      obj.active = true
      resetPool.release(obj)
      expect(obj.value).toBe(0)
      expect(obj.label).toBe('')
      expect(obj.active).toBe(false)
    })

    it('should not call reset if no reset function', () => {
      const obj = pool.acquire()
      obj.value = 77
      pool.release(obj)
      const reused = pool.acquire()
      expect(reused.value).toBe(77)
    })

    it('should decrement inUse on release', () => {
      const obj = pool.acquire()
      expect(pool.inUse).toBe(1)
      pool.release(obj)
      expect(pool.inUse).toBe(0)
    })

    it('should handle multiple releases', () => {
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      const obj3 = pool.acquire()
      pool.release(obj1)
      pool.release(obj2)
      pool.release(obj3)
      expect(pool.size).toBe(3)
      expect(pool.inUse).toBe(0)
    })
  })

  describe('acquire/release cycle', () => {
    it('should handle multiple acquire/release cycles', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj1 = pool.acquire()
      pool.release(obj1)
      const obj2 = pool.acquire()
      pool.release(obj2)
      const obj3 = pool.acquire()
      pool.release(obj3)
      expect(pool.size).toBe(1)
      expect(pool.allocated).toBe(1)
      expect(pool.inUse).toBe(0)
    })

    it('should handle interleaved acquire and release', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      pool.release(obj1)
      const obj3 = pool.acquire()
      expect(pool.inUse).toBe(2)
      pool.release(obj2)
      pool.release(obj3)
      expect(pool.inUse).toBe(0)
      expect(pool.size).toBe(2)
    })

    it('should track allocated correctly through cycles', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 2)
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      const obj3 = pool.acquire()
      expect(pool.allocated).toBe(3)
      pool.release(obj1)
      pool.release(obj2)
      pool.release(obj3)
      expect(pool.allocated).toBe(3)
    })

    it('should handle rapid acquire/release of same object', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      for (let i = 0; i < 100; i++) {
        const obj = pool.acquire()
        pool.release(obj)
      }
      expect(pool.allocated).toBe(1)
      expect(pool.size).toBe(1)
    })

    it('should reuse objects in LIFO order', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      pool.release(obj1)
      pool.release(obj2)
      const reused = pool.acquire()
      expect(reused).toBe(obj2)
    })
  })

  describe('size property', () => {
    it('should return 0 for empty pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      expect(pool.size).toBe(0)
    })

    it('should return correct size after preallocate', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      expect(pool.size).toBe(5)
    })

    it('should update after acquire', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 3)
      pool.acquire()
      expect(pool.size).toBe(2)
    })

    it('should update after release', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj = pool.acquire()
      pool.release(obj)
      expect(pool.size).toBe(1)
    })
  })

  describe('allocated property', () => {
    it('should return 0 for new pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      expect(pool.allocated).toBe(0)
    })

    it('should count preallocated objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      expect(pool.allocated).toBe(10)
    })

    it('should count newly created objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.acquire()
      pool.acquire()
      expect(pool.allocated).toBe(2)
    })
  })

  describe('inUse property', () => {
    it('should return 0 when no objects acquired', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      expect(pool.inUse).toBe(0)
    })

    it('should return count of acquired objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.acquire()
      pool.acquire()
      pool.acquire()
      expect(pool.inUse).toBe(3)
    })

    it('should decrease on release', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj = pool.acquire()
      pool.release(obj)
      expect(pool.inUse).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      expect(pool.isEmpty()).toBe(true)
    })

    it('should return false when objects available', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 1)
      expect(pool.isEmpty()).toBe(false)
    })

    it('should return true after all objects acquired', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 2)
      pool.acquire()
      pool.acquire()
      expect(pool.isEmpty()).toBe(true)
    })

    it('should return false after release', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj = pool.acquire()
      pool.release(obj)
      expect(pool.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return false when no max capacity set', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      expect(pool.isFull()).toBe(false)
    })

    it('should return false even with preallocated objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 100)
      expect(pool.isFull()).toBe(false)
    })

    it('should return true when pool reaches max capacity', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 3 })
      pool.preallocate(3)
      expect(pool.isFull()).toBe(true)
    })

    it('should return false when below max capacity', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 5 })
      pool.preallocate(2)
      expect(pool.isFull()).toBe(false)
    })
  })

  describe('max capacity', () => {
    it('should limit release when max capacity reached', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 2 })
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      const obj3 = pool.acquire()
      pool.release(obj1)
      pool.release(obj2)
      pool.release(obj3)
      expect(pool.size).toBe(2)
      expect(pool.allocated).toBe(2)
    })

    it('should limit preallocate to max capacity', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 3 })
      pool.preallocate(10)
      expect(pool.size).toBe(3)
    })

    it('should not acquire beyond max capacity via release', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 1 })
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      pool.release(obj1)
      pool.release(obj2)
      expect(pool.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all available objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.clear()
      expect(pool.size).toBe(0)
    })

    it('should not affect allocated count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.clear()
      expect(pool.allocated).toBe(5)
    })

    it('should not affect inUse count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.acquire()
      pool.clear()
      expect(pool.inUse).toBe(1)
    })

    it('should work on empty pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.clear()
      expect(pool.size).toBe(0)
    })

    it('should allow acquiring after clear', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.clear()
      const obj = pool.acquire()
      expect(obj).toBeDefined()
      expect(pool.allocated).toBe(6)
    })
  })

  describe('preallocate', () => {
    it('should add objects to pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.preallocate(5)
      expect(pool.size).toBe(5)
      expect(pool.allocated).toBe(5)
    })

    it('should add to existing pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 3)
      pool.preallocate(4)
      expect(pool.size).toBe(7)
      expect(pool.allocated).toBe(7)
    })

    it('should handle zero count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.preallocate(0)
      expect(pool.size).toBe(0)
    })

    it('should handle negative count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.preallocate(-3)
      expect(pool.size).toBe(0)
    })

    it('should handle large count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.preallocate(1000)
      expect(pool.size).toBe(1000)
      expect(pool.allocated).toBe(1000)
    })

    it('should respect max capacity', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 5 })
      pool.preallocate(10)
      expect(pool.size).toBe(5)
    })

    it('should respect max capacity with partial preallocate', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 5 })
      pool.preallocate(3)
      pool.preallocate(5)
      expect(pool.size).toBe(5)
    })
  })

  describe('trim', () => {
    it('should remove objects from pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      pool.trim(5)
      expect(pool.size).toBe(5)
    })

    it('should decrement allocated count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      pool.trim(3)
      expect(pool.allocated).toBe(7)
    })

    it('should not trim more than available', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 3)
      pool.trim(10)
      expect(pool.size).toBe(0)
      expect(pool.allocated).toBe(0)
    })

    it('should handle zero count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.trim(0)
      expect(pool.size).toBe(5)
    })

    it('should handle negative count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.trim(-3)
      expect(pool.size).toBe(5)
    })

    it('should not affect inUse objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.acquire()
      pool.trim(10)
      expect(pool.inUse).toBe(1)
    })

    it('should trim all available objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.trim(5)
      expect(pool.size).toBe(0)
      expect(pool.allocated).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate over available objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 3)
      const items: TestObj[] = []
      pool.forEach((obj) => items.push(obj))
      expect(items.length).toBe(3)
    })

    it('should not iterate over inUse objects', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.acquire()
      pool.acquire()
      const items: TestObj[] = []
      pool.forEach((obj) => items.push(obj))
      expect(items.length).toBe(3)
    })

    it('should handle empty pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      let count = 0
      pool.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct objects', () => {
      const pool = new ObjectPool<number[]>(() => [1, 2, 3], undefined, 2)
      const items: number[][] = []
      pool.forEach((obj) => items.push(obj))
      expect(items.length).toBe(2)
      for (const item of items) {
        expect(item).toEqual([1, 2, 3])
      }
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      const cloned = pool.clone()
      expect(cloned.size).toBe(5)
      expect(cloned.allocated).toBe(5)
    })

    it('should share the same factory', () => {
      let callCount = 0
      const factory = (): TestObj => {
        callCount++
        return createTestObj()
      }
      const pool = new ObjectPool<TestObj>(factory)
      const cloned = pool.clone()
      cloned.acquire()
      expect(callCount).toBe(1)
    })

    it('should share the same reset function', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, resetTestObj)
      const cloned = pool.clone()
      const obj = cloned.acquire()
      obj.value = 42
      cloned.release(obj)
      expect(obj.value).toBe(0)
    })

    it('should not affect original when modified', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      const cloned = pool.clone()
      cloned.acquire()
      expect(pool.size).toBe(5)
      expect(cloned.size).toBe(4)
    })

    it('should preserve max capacity', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 10 })
      const cloned = pool.clone()
      expect(cloned.isFull()).toBe(false)
    })

    it('should preserve inUse count', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.acquire()
      pool.acquire()
      const cloned = pool.clone()
      expect(cloned.inUse).toBe(2)
    })
  })

  describe('static create', () => {
    it('should create pool with factory only', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj)
      expect(pool.size).toBe(0)
    })

    it('should create pool with options', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, {
        reset: resetTestObj,
        initialSize: 5,
      })
      expect(pool.size).toBe(5)
    })

    it('should create pool with max capacity', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 10 })
      expect(pool.isFull()).toBe(false)
    })

    it('should create pool with all options', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, {
        reset: resetTestObj,
        initialSize: 3,
        maxCapacity: 10,
      })
      expect(pool.size).toBe(3)
      expect(pool.isFull()).toBe(false)
    })

    it('should create pool with empty options', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, {})
      expect(pool.size).toBe(0)
    })

    it('should create pool with undefined options', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, undefined)
      expect(pool.size).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for new pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const stats = pool.getStats()
      expect(stats.size).toBe(0)
      expect(stats.allocated).toBe(0)
      expect(stats.inUse).toBe(0)
      expect(stats.isEmpty).toBe(true)
      expect(stats.isFull).toBe(false)
      expect(stats.maxCapacity).toBeUndefined()
    })

    it('should return correct stats after operations', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      pool.acquire()
      pool.acquire()
      const stats = pool.getStats()
      expect(stats.size).toBe(8)
      expect(stats.allocated).toBe(10)
      expect(stats.inUse).toBe(2)
      expect(stats.isEmpty).toBe(false)
    })

    it('should include max capacity in stats', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 5 })
      const stats = pool.getStats()
      expect(stats.maxCapacity).toBe(5)
    })
  })

  describe('object reuse', () => {
    it('should reuse the same object reference', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj1 = pool.acquire()
      pool.release(obj1)
      const obj2 = pool.acquire()
      expect(Object.is(obj1, obj2)).toBe(true)
    })

    it('should reset object state on release when reset provided', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, resetTestObj)
      const obj = pool.acquire()
      obj.value = 100
      obj.label = 'modified'
      obj.active = true
      pool.release(obj)
      expect(obj.value).toBe(0)
      expect(obj.label).toBe('')
      expect(obj.active).toBe(false)
    })

    it('should not reset object state when no reset provided', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj = pool.acquire()
      obj.value = 100
      pool.release(obj)
      expect(obj.value).toBe(100)
    })

    it('should handle multiple objects being reused', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      const objects = new Set<TestObj>()
      for (let i = 0; i < 5; i++) {
        objects.add(pool.acquire()!)
      }
      for (const obj of objects) {
        pool.release(obj)
      }
      expect(pool.size).toBe(5)
      const reused = pool.acquire()
      expect(objects.has(reused)).toBe(true)
    })
  })

  describe('pool growth', () => {
    it('should grow when acquiring beyond available', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 2)
      pool.acquire()
      pool.acquire()
      pool.acquire()
      expect(pool.allocated).toBe(3)
      expect(pool.inUse).toBe(3)
    })

    it('should grow unbounded without max capacity', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      for (let i = 0; i < 100; i++) {
        pool.acquire()
      }
      expect(pool.allocated).toBe(100)
      expect(pool.inUse).toBe(100)
    })

    it('should track growth correctly', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      expect(pool.allocated).toBe(0)
      pool.acquire()
      expect(pool.allocated).toBe(1)
      pool.acquire()
      expect(pool.allocated).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle release then immediate acquire', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj = pool.acquire()
      pool.release(obj)
      const reacquired = pool.acquire()
      expect(reacquired).toBe(obj)
    })

    it('should handle clear then acquire', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      pool.clear()
      const obj = pool.acquire()
      expect(obj).toBeDefined()
      expect(pool.allocated).toBe(11)
    })

    it('should handle trim then preallocate', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      pool.trim(5)
      expect(pool.size).toBe(5)
      pool.preallocate(3)
      expect(pool.size).toBe(8)
    })

    it('should handle acquiring all then releasing all', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 3)
      const objs = [pool.acquire(), pool.acquire(), pool.acquire()]
      expect(pool.size).toBe(0)
      for (const obj of objs) {
        pool.release(obj)
      }
      expect(pool.size).toBe(3)
      expect(pool.inUse).toBe(0)
    })

    it('should work with complex object types', () => {
      interface Complex {
        data: Map<string, number>
        children: Complex[]
      }
      const pool = new ObjectPool<Complex>(() => ({
        data: new Map(),
        children: [],
      }))
      const obj = pool.acquire()
      expect(obj.data).toBeInstanceOf(Map)
      expect(obj.children).toEqual([])
    })

    it('should handle factory that returns different instances', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      expect(obj1).not.toBe(obj2)
    })

    it('should handle string pool', () => {
      let counter = 0
      const pool = new ObjectPool<string>(() => `item-${counter++}`)
      const s1 = pool.acquire()
      const s2 = pool.acquire()
      expect(s1).toBe('item-0')
      expect(s2).toBe('item-1')
    })

    it('should handle null-like objects in pool', () => {
      const pool = new ObjectPool<{ v: number | null }>(() => ({ v: null }))
      const obj = pool.acquire()
      expect(obj.v).toBeNull()
    })

    it('should maintain consistency after many operations', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, resetTestObj)
      const acquired: TestObj[] = []
      for (let i = 0; i < 50; i++) {
        acquired.push(pool.acquire())
      }
      expect(pool.inUse).toBe(50)
      expect(pool.allocated).toBe(50)
      for (const obj of acquired) {
        pool.release(obj)
      }
      expect(pool.inUse).toBe(0)
      expect(pool.size).toBe(50)
      expect(pool.isEmpty()).toBe(false)
    })

    it('should handle clone of empty pool', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      const cloned = pool.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.allocated).toBe(0)
      expect(cloned.inUse).toBe(0)
    })

    it('should handle preallocate after partial usage', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 5)
      pool.acquire()
      pool.acquire()
      pool.preallocate(3)
      expect(pool.size).toBe(6)
      expect(pool.allocated).toBe(8)
    })

    it('should handle trim to exact size', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      pool.trim(10)
      expect(pool.size).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export ObjectPoolOptions type', () => {
      const options: ObjectPoolOptions<TestObj> = {
        reset: resetTestObj,
        initialSize: 5,
        maxCapacity: 10,
      }
      expect(options.initialSize).toBe(5)
    })

    it('should export ObjectPoolStats type', () => {
      const stats: ObjectPoolStats = {
        size: 0,
        allocated: 0,
        inUse: 0,
        isEmpty: true,
        isFull: false,
        maxCapacity: undefined,
      }
      expect(stats.isEmpty).toBe(true)
    })
  })

  describe('concurrent-like usage patterns', () => {
    it('should handle burst acquire pattern', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 20)
      const objs: TestObj[] = []
      for (let i = 0; i < 20; i++) {
        objs.push(pool.acquire()!)
      }
      expect(pool.size).toBe(0)
      expect(pool.inUse).toBe(20)
      for (const obj of objs) {
        pool.release(obj)
      }
      expect(pool.size).toBe(20)
    })

    it('should handle alternating acquire/release', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      for (let i = 0; i < 50; i++) {
        const obj = pool.acquire()
        obj.value = i
        pool.release(obj)
      }
      expect(pool.allocated).toBe(1)
      expect(pool.size).toBe(1)
    })

    it('should handle partial return pattern', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 10)
      const objs: TestObj[] = []
      for (let i = 0; i < 10; i++) {
        objs.push(pool.acquire()!)
      }
      for (let i = 0; i < 5; i++) {
        pool.release(objs[i]!)
      }
      expect(pool.size).toBe(5)
      expect(pool.inUse).toBe(5)
      expect(pool.allocated).toBe(10)
    })
  })

  describe('reset callback behavior', () => {
    it('should call reset for every release', () => {
      let resetCount = 0
      const pool = new ObjectPool<TestObj>(
        createTestObj,
        () => { resetCount++ },
      )
      const obj = pool.acquire()
      pool.release(obj)
      pool.acquire()
      pool.release(obj)
      expect(resetCount).toBe(2)
    })

    it('should pass the correct object to reset', () => {
      let lastResetObj: TestObj | null = null
      const pool = new ObjectPool<TestObj>(
        createTestObj,
        (obj) => { lastResetObj = obj },
      )
      const obj = pool.acquire()
      pool.release(obj)
      expect(lastResetObj).toBe(obj)
    })

    it('should allow reset to modify the object', () => {
      const pool = new ObjectPool<{ x: number }>(
        () => ({ x: 1 }),
        (obj) => { obj.x = -1 },
      )
      const obj = pool.acquire()
      obj.x = 100
      pool.release(obj)
      expect(obj.x).toBe(-1)
    })
  })

  describe('preallocate and trim interaction', () => {
    it('should handle preallocate then trim to zero', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.preallocate(10)
      expect(pool.size).toBe(10)
      pool.trim(10)
      expect(pool.size).toBe(0)
      expect(pool.allocated).toBe(0)
    })

    it('should handle repeated preallocate and trim', () => {
      const pool = new ObjectPool<TestObj>(createTestObj)
      pool.preallocate(5)
      pool.trim(2)
      pool.preallocate(3)
      expect(pool.size).toBe(6)
      expect(pool.allocated).toBe(6)
    })

    it('should handle trim more than available gracefully', () => {
      const pool = new ObjectPool<TestObj>(createTestObj, undefined, 3)
      pool.trim(100)
      expect(pool.size).toBe(0)
    })
  })

  describe('max capacity edge cases', () => {
    it('should allow max capacity of 0', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 0 })
      expect(pool.isFull()).toBe(true)
    })

    it('should handle max capacity with initial size exceeding it', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, {
        maxCapacity: 3,
        initialSize: 10,
      })
      expect(pool.size).toBe(3)
    })

    it('should drop objects released beyond max capacity', () => {
      const pool = ObjectPool.create<TestObj>(createTestObj, { maxCapacity: 2 })
      const objs = [pool.acquire(), pool.acquire(), pool.acquire()]
      for (const obj of objs) {
        pool.release(obj)
      }
      expect(pool.size).toBe(2)
      expect(pool.allocated).toBe(2)
    })
  })
})
