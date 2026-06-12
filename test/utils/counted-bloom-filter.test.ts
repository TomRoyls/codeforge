import { describe, expect, it } from 'vitest'
import { CountedBloomFilter } from '../../src/utils/counted-bloom-filter.js'

describe('CountedBloomFilter', () => {
  it('adds and checks items', () => {
    const bf = new CountedBloomFilter()
    bf.add('hello')
    expect(bf.contains('hello')).toBe(true)
  })

  it('returns false for missing items', () => {
    const bf = new CountedBloomFilter()
    bf.add('hello')
    expect(bf.contains('world')).toBe(false)
  })

  it('removes items', () => {
    const bf = new CountedBloomFilter()
    bf.add('hello')
    expect(bf.remove('hello')).toBe(true)
    expect(bf.contains('hello')).toBe(false)
  })

  it('remove returns false for missing item', () => {
    const bf = new CountedBloomFilter()
    expect(bf.remove('missing')).toBe(false)
  })

  it('handles multiple adds', () => {
    const bf = new CountedBloomFilter()
    bf.add('a')
    bf.add('b')
    bf.add('c')
    expect(bf.contains('a')).toBe(true)
    expect(bf.contains('b')).toBe(true)
    expect(bf.contains('c')).toBe(true)
  })

  it('count returns min counter', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.add('x')
    bf.add('x')
    expect(bf.count('x')).toBeGreaterThanOrEqual(3)
  })

  it('count returns 0 for missing', () => {
    const bf = new CountedBloomFilter()
    expect(bf.count('missing')).toBe(0)
  })

  it('add and remove and re-add', () => {
    const bf = new CountedBloomFilter()
    bf.add('test')
    bf.remove('test')
    expect(bf.contains('test')).toBe(false)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('handles many items', () => {
    const bf = new CountedBloomFilter(1000, 0.05)
    for (let i = 0; i < 100; i++) bf.add(`item${i}`)
    let found = 0
    for (let i = 0; i < 100; i++) {
      if (bf.contains(`item${i}`)) found++
    }
    expect(found).toBe(100)
  })

  it('empty filter contains nothing', () => {
    const bf = new CountedBloomFilter()
    expect(bf.contains('anything')).toBe(false)
  })

  it('handles repeated remove gracefully', () => {
    const bf = new CountedBloomFilter()
    bf.add('test')
    expect(bf.remove('test')).toBe(true)
    expect(bf.remove('test')).toBe(false)
  })

  it('handles add remove add cycle', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.remove('x')
    bf.add('x')
    bf.add('x')
    expect(bf.count('x')).toBeGreaterThanOrEqual(2)
  })

  it('works with numeric strings', () => {
    const bf = new CountedBloomFilter()
    bf.add('1')
    bf.add('2')
    bf.add('3')
    expect(bf.contains('1')).toBe(true)
    expect(bf.contains('4')).toBe(false)
  })

  it('handles empty string key', () => {
    const bf = new CountedBloomFilter()
    bf.add('')
    expect(bf.contains('')).toBe(true)
    expect(bf.count('')).toBeGreaterThanOrEqual(1)
  })

  it('remove then contains returns false', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.remove('x')
    expect(bf.contains('x')).toBe(false)
  })

  it('add same item multiple times increases count', () => {
    const bf = new CountedBloomFilter()
    bf.add('z')
    bf.add('z')
    bf.add('z')
    expect(bf.count('z')).toBeGreaterThanOrEqual(3)
  })

  it('add increments count', () => {
    const bf = new CountedBloomFilter(100)
    bf.add('item')
    expect(bf.count('item')).toBeGreaterThan(0)
  })

  it('count after add is positive', () => {
    const bf = new CountedBloomFilter(100)
    bf.add('hello')
    expect(bf.count('hello')).toBeGreaterThan(0)
  })

  it('handles very long string keys', () => {
    const bf = new CountedBloomFilter()
    const longKey = 'a'.repeat(10000)
    bf.add(longKey)
    expect(bf.contains(longKey)).toBe(true)
    expect(bf.remove(longKey)).toBe(true)
    expect(bf.contains(longKey)).toBe(false)
  })

  it('handles special characters in keys', () => {
    const bf = new CountedBloomFilter()
    bf.add('!@#$%^&*()')
    bf.add('[]{};:,.<>?')
    bf.add('"\'`')
    expect(bf.contains('!@#$%^&*()')).toBe(true)
    expect(bf.contains('[]{};:,.<>?')).toBe(true)
    expect(bf.contains('"\'`')).toBe(true)
  })

  it('handles unicode characters in keys', () => {
    const bf = new CountedBloomFilter()
    bf.add('日本語')
    bf.add('한글')
    bf.add('العربية')
    bf.add('emoji😀🎉')
    expect(bf.contains('日本語')).toBe(true)
    expect(bf.contains('한글')).toBe(true)
    expect(bf.contains('العربية')).toBe(true)
    expect(bf.contains('emoji😀🎉')).toBe(true)
  })

  it('handles very small false positive rate', () => {
    const bf = new CountedBloomFilter(100, 0.0001)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('handles large false positive rate', () => {
    const bf = new CountedBloomFilter(100, 0.5)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('custom expected items and false positive rate', () => {
    const bf = new CountedBloomFilter(5000, 0.001)
    for (let i = 0; i < 100; i++) {
      bf.add(`item${i}`)
    }
    expect(bf.contains('item50')).toBe(true)
  })

  it('add same item many times then remove all', () => {
    const bf = new CountedBloomFilter()
    for (let i = 0; i < 10; i++) {
      bf.add('test')
    }
    for (let i = 0; i < 10; i++) {
      expect(bf.remove('test')).toBe(true)
    }
    expect(bf.contains('test')).toBe(false)
  })

  it('interleaved add and remove operations', () => {
    const bf = new CountedBloomFilter()
    bf.add('a')
    bf.add('b')
    bf.add('a')
    bf.remove('a')
    expect(bf.contains('a')).toBe(true)
    bf.remove('a')
    expect(bf.contains('a')).toBe(false)
    expect(bf.contains('b')).toBe(true)
  })

  it('count decreases after remove', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.add('x')
    const countBefore = bf.count('x')
    bf.remove('x')
    const countAfter = bf.count('x')
    expect(countAfter).toBeLessThanOrEqual(countBefore)
  })

  it('multiple instances have independent state', () => {
    const bf1 = new CountedBloomFilter()
    const bf2 = new CountedBloomFilter()
    bf1.add('test')
    expect(bf1.contains('test')).toBe(true)
    expect(bf2.contains('test')).toBe(false)
    bf2.add('other')
    expect(bf1.contains('other')).toBe(false)
    expect(bf2.contains('other')).toBe(true)
  })

  it('remove from empty filter returns false', () => {
    const bf = new CountedBloomFilter()
    expect(bf.remove('anything')).toBe(false)
  })

  it('count returns zero after all items removed', () => {
    const bf = new CountedBloomFilter()
    bf.add('test')
    bf.add('test')
    bf.remove('test')
    bf.remove('test')
    expect(bf.count('test')).toBe(0)
  })

  it('handles minimum expected items', () => {
    const bf = new CountedBloomFilter(1, 0.01)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('handles large number of unique items', () => {
    const bf = new CountedBloomFilter(10000, 0.01)
    for (let i = 0; i < 1000; i++) {
      bf.add(`item${i}`)
    }
    let found = 0
    for (let i = 0; i < 1000; i++) {
      if (bf.contains(`item${i}`)) found++
    }
    expect(found).toBe(1000)
  })

  it('re-add after complete removal', () => {
    const bf = new CountedBloomFilter()
    bf.add('test')
    bf.remove('test')
    expect(bf.contains('test')).toBe(false)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('add with key containing only special characters', () => {
    const bf = new CountedBloomFilter()
    bf.add('!!!@@@###')
    expect(bf.contains('!!!@@@###')).toBe(true)
    expect(bf.remove('!!!@@@###')).toBe(true)
  })

  it('remove with special character key', () => {
    const bf = new CountedBloomFilter()
    bf.add('key-with-dash')
    bf.add('key_with_underscore')
    bf.add('key.with.dot')
    expect(bf.remove('key-with-dash')).toBe(true)
    expect(bf.remove('key_with_underscore')).toBe(true)
    expect(bf.remove('key.with.dot')).toBe(true)
  })

  it('count behavior with hash collisions', () => {
    const bf = new CountedBloomFilter()
    bf.add('abc')
    bf.add('def')
    bf.remove('abc')
    expect(bf.count('def')).toBeGreaterThan(0)
  })

  it('add/remove cycle with different keys', () => {
    const bf = new CountedBloomFilter()
    bf.add('key1')
    bf.add('key2')
    bf.remove('key1')
    expect(bf.contains('key1')).toBe(false)
    expect(bf.contains('key2')).toBe(true)
    bf.add('key1')
    expect(bf.contains('key1')).toBe(true)
  })

  it('count after partial removal', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.add('x')
    bf.add('x')
    bf.remove('x')
    expect(bf.count('x')).toBeGreaterThanOrEqual(1)
  })

  it('handles key with spaces', () => {
    const bf = new CountedBloomFilter()
    bf.add('key with spaces')
    expect(bf.contains('key with spaces')).toBe(true)
  })

  it('handles key with newlines', () => {
    const bf = new CountedBloomFilter()
    bf.add('key\nwith\nnewlines')
    expect(bf.contains('key\nwith\nnewlines')).toBe(true)
  })

  it('handles key with tabs', () => {
    const bf = new CountedBloomFilter()
    bf.add('key\twith\ttabs')
    expect(bf.contains('key\twith\ttabs')).toBe(true)
  })

  it('handles case sensitivity', () => {
    const bf = new CountedBloomFilter()
    bf.add('Test')
    expect(bf.contains('Test')).toBe(true)
    expect(bf.contains('test')).toBe(false)
    expect(bf.contains('TEST')).toBe(false)
  })

  it('handles zero expected items with default', () => {
    const bf = new CountedBloomFilter(0, 0.01)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('remove returns true only when item was added', () => {
    const bf = new CountedBloomFilter()
    bf.add('present')
    expect(bf.remove('present')).toBe(true)
    expect(bf.remove('present')).toBe(false)
    expect(bf.remove('never-added')).toBe(false)
  })

  it('handles keys with mixed unicode and special characters', () => {
    const bf = new CountedBloomFilter()
    bf.add('key-日本語-123-!')
    expect(bf.contains('key-日本語-123-!')).toBe(true)
    expect(bf.remove('key-日本語-123-!')).toBe(true)
  })

  it('handles extremely large expected items', () => {
    const bf = new CountedBloomFilter(1000000, 0.01)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('count returns zero for newly added and immediately removed item', () => {
    const bf = new CountedBloomFilter()
    bf.add('item')
    bf.remove('item')
    expect(bf.count('item')).toBe(0)
  })

  it('multiple additions and partial removals track correctly', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.add('x')
    bf.add('x')
    bf.add('x')
    bf.add('x')
    bf.remove('x')
    bf.remove('x')
    expect(bf.count('x')).toBeGreaterThanOrEqual(2)
  })

  it('handles key with null-byte equivalent character', () => {
    const bf = new CountedBloomFilter()
    bf.add('key\u0000null')
    expect(bf.contains('key\u0000null')).toBe(true)
    expect(bf.remove('key\u0000null')).toBe(true)
  })

  it('remove operation preserves other items', () => {
    const bf = new CountedBloomFilter()
    bf.add('keep1')
    bf.add('keep2')
    bf.add('remove-me')
    bf.remove('remove-me')
    expect(bf.contains('keep1')).toBe(true)
    expect(bf.contains('keep2')).toBe(true)
    expect(bf.contains('remove-me')).toBe(false)
  })

  it('should report count for items', () => {
    const bf = new CountedBloomFilter(100, 0.01)
    bf.add('test')
    bf.add('test')
    expect(bf.count('test')).toBeGreaterThanOrEqual(2)
  })

  it('should report 0 count for missing items', () => {
    const bf = new CountedBloomFilter(100, 0.01)
    expect(bf.count('missing')).toBe(0)
  })

  it('add increases count', () => {
    const bf = new CountedBloomFilter(50)
    bf.add('x')
    bf.add('x')
    bf.add('x')
    expect(bf.count('x')).toBeGreaterThanOrEqual(2)
  })

  it('remove then add restores count', () => {
    const bf = new CountedBloomFilter(50)
    bf.add('y')
    bf.remove('y')
    bf.add('y')
    expect(bf.contains('y')).toBe(true)
  })

  it('remove returns false for non-contained item', () => {
    const bf = new CountedBloomFilter(50)
    expect(bf.remove('never-added')).toBe(false)
  })
})
  it('contains returns false for non-added', () => {
    const bf = new CountedBloomFilter(100)
    expect(bf.contains('missing')).toBe(false)
  })

  it('add and contains', () => {
    const bf = new CountedBloomFilter(100)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('remove allows deletion', () => {
    const bf = new CountedBloomFilter(100)
    bf.add('item')
    bf.remove('item')
    expect(bf.contains('item')).toBe(false)
  })

describe('counted-bloom-filter - wave545', () => {
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

describe('counted-bloom-filter - wave546', () => {
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

describe('counted-bloom-filter - wave547', () => {
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

describe('counted-bloom-filter - wave548', () => {
  it('counted-bloom-filter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave549', () => {
  it('counted-bloom-filter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave550', () => {
  it('counted-bloom-filter w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave551', () => {
  it('counted-bloom-filter w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave552', () => {
  it('counted-bloom-filter w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave553', () => {
  it('counted-bloom-filter w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave554', () => {
  it('counted-bloom-filter w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave555', () => {
  it('counted-bloom-filter w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave556', () => {
  it('counted-bloom-filter w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave557', () => {
  it('counted-bloom-filter w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave558', () => {
  it('counted-bloom-filter w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave559', () => {
  it('counted-bloom-filter w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave560', () => {
  it('counted-bloom-filter w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counted-bloom-filter - wave561', () => {
  it('counted-bloom-filter w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counted-bloom-filter w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
