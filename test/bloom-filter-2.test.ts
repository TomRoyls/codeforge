import { BloomFilter2 } from '../src/core/bloom-filter-2/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BloomFilter2', () => {
  describe('constructor', () => {
    it('creates a bloom filter with valid parameters', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('creates a bloom filter with high expected items', () => {
      const bf = new BloomFilter2(1000000, 0.001)
      expect(bf.size).toBe(0)
    })

    it('creates a bloom filter with expected items 1', () => {
      const bf = new BloomFilter2(1, 0.5)
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('creates a bloom filter with a very low false positive rate', () => {
      const bf = new BloomFilter2(100, 0.0001)
      expect(bf.expectedBits).toBeGreaterThan(0)
    })

    it('creates a bloom filter with a high false positive rate', () => {
      const bf = new BloomFilter2(100, 0.5)
      expect(bf.expectedBits).toBeGreaterThan(0)
    })

    it('creates a bloom filter with false positive rate near 1', () => {
      const bf = new BloomFilter2(10, 0.99)
      expect(bf.expectedBits).toBeGreaterThan(0)
    })

    it('creates a bloom filter with large expected item count', () => {
      const bf = new BloomFilter2(10000000, 0.01)
      expect(bf.expectedBits).toBeGreaterThan(0)
    })

    it('allocates more bits for lower false positive rates', () => {
      const bf1 = new BloomFilter2(100, 0.1)
      const bf2 = new BloomFilter2(100, 0.001)
      expect(bf2.expectedBits).toBeGreaterThan(bf1.expectedBits)
    })

    it('allocates more bits for higher expected item counts', () => {
      const bf1 = new BloomFilter2(100, 0.01)
      const bf2 = new BloomFilter2(10000, 0.01)
      expect(bf2.expectedBits).toBeGreaterThan(bf1.expectedBits)
    })

    it('expectedBits is always at least 1', () => {
      const bf = new BloomFilter2(1, 0.99)
      expect(bf.expectedBits).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── add and has ─────────────────────────────────────────────────────

  describe('add and has', () => {
    it('reports added item as present', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('hello')
      expect(bf.has('hello')).toBe(true)
    })

    it('reports non-added item correctly', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('hello')
      expect(bf.has('world')).toBe(false)
    })

    it('reports empty filter as not containing any item', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.has('anything')).toBe(false)
    })

    it('handles multiple additions', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('a')
      bf.add('b')
      bf.add('c')
      expect(bf.has('a')).toBe(true)
      expect(bf.has('b')).toBe(true)
      expect(bf.has('c')).toBe(true)
    })

    it('handles adding the same item multiple times', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('duplicate')
      bf.add('duplicate')
      bf.add('duplicate')
      expect(bf.has('duplicate')).toBe(true)
      expect(bf.size).toBe(3)
    })

    it('handles empty string', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('')
      expect(bf.has('')).toBe(true)
    })

    it('handles single character strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('a')
      bf.add('b')
      bf.add('c')
      expect(bf.has('a')).toBe(true)
      expect(bf.has('d')).toBe(false)
    })

    it('handles long strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      const longStr = 'a'.repeat(10000)
      bf.add(longStr)
      expect(bf.has(longStr)).toBe(true)
    })

    it('handles strings with special characters', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('hello\nworld')
      bf.add('tab\there')
      bf.add('null\0char')
      expect(bf.has('hello\nworld')).toBe(true)
      expect(bf.has('tab\there')).toBe(true)
      expect(bf.has('null\0char')).toBe(true)
    })

    it('handles unicode strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('こんにちは')
      bf.add('مرحبا')
      bf.add('🎉🎊')
      expect(bf.has('こんにちは')).toBe(true)
      expect(bf.has('مرحبا')).toBe(true)
      expect(bf.has('🎉🎊')).toBe(true)
    })

    it('handles strings with spaces', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('hello world')
      bf.add(' ')
      bf.add('  ')
      expect(bf.has('hello world')).toBe(true)
      expect(bf.has(' ')).toBe(true)
      expect(bf.has('  ')).toBe(true)
    })

    it('handles numeric-like strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('123')
      bf.add('0')
      bf.add('-1')
      bf.add('3.14')
      expect(bf.has('123')).toBe(true)
      expect(bf.has('0')).toBe(true)
      expect(bf.has('-1')).toBe(true)
      expect(bf.has('3.14')).toBe(true)
    })

    it('handles case sensitivity', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('Hello')
      expect(bf.has('Hello')).toBe(true)
      expect(bf.has('hello')).toBe(false)
      expect(bf.has('HELLO')).toBe(false)
    })

    it('handles strings that differ by one character', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('abc')
      bf.add('abd')
      expect(bf.has('abc')).toBe(true)
      expect(bf.has('abd')).toBe(true)
      expect(bf.has('abe')).toBe(false)
    })

    it('handles URL strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('https://example.com/path?q=1&r=2')
      expect(bf.has('https://example.com/path?q=1&r=2')).toBe(true)
      expect(bf.has('https://example.com/path?q=1&r=3')).toBe(false)
    })

    it('handles file paths', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('/usr/local/bin/node')
      bf.add('C:\\Users\\test\\file.txt')
      expect(bf.has('/usr/local/bin/node')).toBe(true)
      expect(bf.has('C:\\Users\\test\\file.txt')).toBe(true)
    })
  })

  // ─── contains (alias) ────────────────────────────────────────────────

  describe('contains', () => {
    it('returns same result as has for present item', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('item')
      expect(bf.contains('item')).toBe(true)
      expect(bf.contains('item')).toBe(bf.has('item'))
    })

    it('returns same result as has for absent item', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.contains('absent')).toBe(false)
      expect(bf.contains('absent')).toBe(bf.has('absent'))
    })

    it('returns false on empty filter', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.contains('anything')).toBe(false)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for new filter', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.size).toBe(0)
    })

    it('returns 1 after adding one item', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('item')
      expect(bf.size).toBe(1)
    })

    it('increments for each add', () => {
      const bf = new BloomFilter2(100, 0.01)
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.size).toBe(50)
    })

    it('counts duplicate adds', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('x')
      bf.add('x')
      expect(bf.size).toBe(2)
    })

    it('reflects size after clear', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('a')
      bf.add('b')
      bf.clear()
      expect(bf.size).toBe(0)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new filter', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.isEmpty()).toBe(true)
    })

    it('returns false after adding an item', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('item')
      expect(bf.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('item')
      bf.clear()
      expect(bf.isEmpty()).toBe(true)
    })

    it('returns false after many additions', () => {
      const bf = new BloomFilter2(1000, 0.01)
      for (let i = 0; i < 500; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.isEmpty()).toBe(false)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('a')
      bf.add('b')
      bf.add('c')
      bf.clear()
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('makes has return false for previously added items', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('hello')
      expect(bf.has('hello')).toBe(true)
      bf.clear()
      expect(bf.has('hello')).toBe(false)
    })

    it('allows adding items after clearing', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('first')
      bf.clear()
      bf.add('second')
      expect(bf.has('second')).toBe(true)
      expect(bf.size).toBe(1)
    })

    it('clear on empty filter is a no-op', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.clear()
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('can add and clear multiple times', () => {
      const bf = new BloomFilter2(100, 0.01)
      for (let round = 0; round < 5; round++) {
        bf.add(`round-${round}`)
        expect(bf.size).toBe(1)
        bf.clear()
        expect(bf.size).toBe(0)
      }
    })
  })

  // ─── expectedBits ─────────────────────────────────────────────────────

  describe('expectedBits', () => {
    it('returns a positive integer', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.expectedBits).toBeGreaterThan(0)
      expect(Number.isInteger(bf.expectedBits)).toBe(true)
    })

    it('returns correct value for known parameters', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.expectedBits).toBe(959)
    })

    it('returns 1 for minimal parameters', () => {
      const bf = new BloomFilter2(1, 0.99)
      expect(bf.expectedBits).toBeGreaterThanOrEqual(1)
    })

    it('increases with more expected items at same FP rate', () => {
      const bf10 = new BloomFilter2(10, 0.01)
      const bf100 = new BloomFilter2(100, 0.01)
      const bf1000 = new BloomFilter2(1000, 0.01)
      expect(bf100.expectedBits).toBeGreaterThan(bf10.expectedBits)
      expect(bf1000.expectedBits).toBeGreaterThan(bf100.expectedBits)
    })

    it('does not change after adding items', () => {
      const bf = new BloomFilter2(100, 0.01)
      const before = bf.expectedBits
      bf.add('item1')
      bf.add('item2')
      expect(bf.expectedBits).toBe(before)
    })

    it('does not change after clear', () => {
      const bf = new BloomFilter2(100, 0.01)
      const before = bf.expectedBits
      bf.add('item')
      bf.clear()
      expect(bf.expectedBits).toBe(before)
    })
  })

  // ─── falsePositiveRate ────────────────────────────────────────────────

  describe('falsePositiveRate', () => {
    it('returns 0 for empty filter', () => {
      const bf = new BloomFilter2(100, 0.01)
      expect(bf.falsePositiveRate).toBe(0)
    })

    it('returns a small number after adding one item', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('item')
      expect(bf.falsePositiveRate).toBeGreaterThan(0)
      expect(bf.falsePositiveRate).toBeLessThan(1)
    })

    it('increases as more items are added', () => {
      const bf = new BloomFilter2(100, 0.01)
      const rates: number[] = []
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`)
        rates.push(bf.falsePositiveRate)
      }
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i]).toBeGreaterThanOrEqual(rates[i - 1])
      }
    })

    it('returns 0 after clear', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('item')
      bf.clear()
      expect(bf.falsePositiveRate).toBe(0)
    })

    it('stays within [0, 1] range', () => {
      const bf = new BloomFilter2(100, 0.01)
      for (let i = 0; i < 200; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.falsePositiveRate).toBeGreaterThanOrEqual(0)
      expect(bf.falsePositiveRate).toBeLessThanOrEqual(1)
    })

    it('stays below target when used within capacity', () => {
      const bf = new BloomFilter2(100, 0.01)
      for (let i = 0; i < 100; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.falsePositiveRate).toBeLessThanOrEqual(0.05)
    })
  })

  // ─── False Positive Behavior ──────────────────────────────────────────

  describe('false positive behavior', () => {
    it('correctly identifies all added items', () => {
      const bf = new BloomFilter2(1000, 0.001)
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        items.push(`item-${i}`)
        bf.add(`item-${i}`)
      }
      for (const item of items) {
        expect(bf.has(item)).toBe(true)
      }
    })

    it('never produces false negatives', () => {
      const bf = new BloomFilter2(500, 0.01)
      const items: string[] = []
      for (let i = 0; i < 200; i++) {
        items.push(`test-item-${i}`)
        bf.add(`test-item-${i}`)
      }
      for (const item of items) {
        expect(bf.has(item)).toBe(true)
      }
    })

    it('measures false positive rate within expected bounds for large test', () => {
      const capacity = 1000
      const bf = new BloomFilter2(capacity, 0.01)
      for (let i = 0; i < capacity; i++) {
        bf.add(`member-${i}`)
      }
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (bf.has(`nonmember-${i}`)) {
          falsePositives++
        }
      }
      const measuredRate = falsePositives / trials
      expect(measuredRate).toBeLessThan(0.1)
    })
  })

  // ─── Single Item ──────────────────────────────────────────────────────

  describe('single item', () => {
    it('adds and finds a single item', () => {
      const bf = new BloomFilter2(10, 0.01)
      bf.add('only-one')
      expect(bf.has('only-one')).toBe(true)
      expect(bf.size).toBe(1)
    })

    it('does not find other items with single item added', () => {
      const bf = new BloomFilter2(10, 0.01)
      bf.add('only-one')
      expect(bf.has('something-else')).toBe(false)
      expect(bf.has('')).toBe(false)
    })
  })

  // ─── Many Items ───────────────────────────────────────────────────────

  describe('many items', () => {
    it('handles adding up to expected capacity', () => {
      const bf = new BloomFilter2(500, 0.01)
      for (let i = 0; i < 500; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(bf.has(`item-${i}`)).toBe(true)
      }
    })

    it('handles exceeding expected capacity', () => {
      const bf = new BloomFilter2(100, 0.01)
      for (let i = 0; i < 500; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(bf.has(`item-${i}`)).toBe(true)
      }
    })

    it('handles sequential numeric strings', () => {
      const bf = new BloomFilter2(1000, 0.001)
      for (let i = 0; i < 1000; i++) {
        bf.add(String(i))
      }
      for (let i = 0; i < 1000; i++) {
        expect(bf.has(String(i))).toBe(true)
      }
    })

    it('handles UUID-like strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      const uuids: string[] = []
      for (let i = 0; i < 50; i++) {
        const uuid = `${i}-${i * 2}-${i * 3}-${i * 4}`
        uuids.push(uuid)
        bf.add(uuid)
      }
      for (const uuid of uuids) {
        expect(bf.has(uuid)).toBe(true)
      }
    })

    it('handles email-like strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      const emails = [
        'user@example.com',
        'admin@test.org',
        'test.user+tag@domain.co.uk',
        'x@y.z',
      ]
      for (const email of emails) {
        bf.add(email)
      }
      for (const email of emails) {
        expect(bf.has(email)).toBe(true)
      }
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles very low false positive rate', () => {
      const bf = new BloomFilter2(100, 0.00001)
      bf.add('test')
      expect(bf.has('test')).toBe(true)
      expect(bf.expectedBits).toBeGreaterThan(1000)
    })

    it('handles very high false positive rate', () => {
      const bf = new BloomFilter2(100, 0.9)
      bf.add('test')
      expect(bf.has('test')).toBe(true)
      expect(bf.expectedBits).toBeLessThan(100)
    })

    it('handles expected items of 1', () => {
      const bf = new BloomFilter2(1, 0.01)
      bf.add('single')
      expect(bf.has('single')).toBe(true)
      expect(bf.size).toBe(1)
    })

    it('handles consecutive add and check operations', () => {
      const bf = new BloomFilter2(100, 0.01)
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`)
        expect(bf.has(`item-${i}`)).toBe(true)
      }
    })

    it('handles adding after clearing repeatedly', () => {
      const bf = new BloomFilter2(100, 0.01)
      for (let i = 0; i < 10; i++) {
        bf.add(`round-${i}`)
        expect(bf.size).toBe(1)
        bf.clear()
        expect(bf.size).toBe(0)
      }
    })

    it('handles identical content in different filters', () => {
      const bf1 = new BloomFilter2(100, 0.01)
      const bf2 = new BloomFilter2(100, 0.01)
      bf1.add('same-item')
      bf2.add('same-item')
      expect(bf1.has('same-item')).toBe(true)
      expect(bf2.has('same-item')).toBe(true)
    })

    it('handles different parameters for same items', () => {
      const bf1 = new BloomFilter2(10, 0.1)
      const bf2 = new BloomFilter2(10, 0.001)
      bf1.add('item')
      bf2.add('item')
      expect(bf1.has('item')).toBe(true)
      expect(bf2.has('item')).toBe(true)
      expect(bf2.expectedBits).toBeGreaterThan(bf1.expectedBits)
    })

    it('handles strings with only whitespace', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('   ')
      bf.add('\t')
      bf.add('\n')
      expect(bf.has('   ')).toBe(true)
      expect(bf.has('\t')).toBe(true)
      expect(bf.has('\n')).toBe(true)
    })

    it('handles strings with mixed encoding-like characters', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('\xFF\xFE')
      bf.add('latin-1')
      bf.add('UTF-8™')
      expect(bf.has('\xFF\xFE')).toBe(true)
      expect(bf.has('latin-1')).toBe(true)
      expect(bf.has('UTF-8™')).toBe(true)
    })

    it('handles null-like strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('null')
      bf.add('undefined')
      bf.add('NaN')
      expect(bf.has('null')).toBe(true)
      expect(bf.has('undefined')).toBe(true)
      expect(bf.has('NaN')).toBe(true)
    })

    it('handles JSON-like strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('{"key":"value"}')
      bf.add('[1,2,3]')
      expect(bf.has('{"key":"value"}')).toBe(true)
      expect(bf.has('[1,2,3]')).toBe(true)
      expect(bf.has('{"key":"other"}')).toBe(false)
    })

    it('handles base64-like strings', () => {
      const bf = new BloomFilter2(100, 0.01)
      bf.add('SGVsbG8gV29ybGQ=')
      bf.add('aGVsbG8=')
      expect(bf.has('SGVsbG8gV29ybGQ=')).toBe(true)
      expect(bf.has('aGVsbG8=')).toBe(true)
    })

    it('handles repeated add/clear cycles with different items', () => {
      const bf = new BloomFilter2(50, 0.01)
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) {
          bf.add(`cycle-${cycle}-item-${i}`)
        }
        expect(bf.size).toBe(20)
        bf.clear()
        expect(bf.size).toBe(0)
      }
    })

    it('handles filter with minimal bits', () => {
      const bf = new BloomFilter2(1, 0.99)
      bf.add('test')
      expect(bf.has('test')).toBe(true)
    })

    it('two independent filters do not share state', () => {
      const bf1 = new BloomFilter2(100, 0.01)
      const bf2 = new BloomFilter2(100, 0.01)
      bf1.add('only-in-bf1')
      expect(bf1.has('only-in-bf1')).toBe(true)
      expect(bf2.has('only-in-bf1')).toBe(false)
    })
  })
})
