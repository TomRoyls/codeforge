import { describe, it, expect } from 'vitest'
import { RopeArray } from '../../src/core/rope-array/rope-array.js'

describe('RopeArray', () => {
  describe('construction', () => {
    it('creates empty rope with no arguments', () => {
      const rope = new RopeArray()
      expect(rope.length).toBe(0)
      expect(rope.toString()).toBe('')
    })

    it('creates empty rope with empty string', () => {
      const rope = new RopeArray('')
      expect(rope.length).toBe(0)
      expect(rope.toString()).toBe('')
    })

    it('creates rope from single character', () => {
      const rope = new RopeArray('a')
      expect(rope.length).toBe(1)
      expect(rope.toString()).toBe('a')
    })

    it('creates rope from short string', () => {
      const rope = new RopeArray('hello')
      expect(rope.length).toBe(5)
      expect(rope.toString()).toBe('hello')
    })

    it('creates rope from longer string', () => {
      const text = 'The quick brown fox jumps over the lazy dog'
      const rope = new RopeArray(text)
      expect(rope.length).toBe(text.length)
      expect(rope.toString()).toBe(text)
    })

    it('creates rope with custom leaf size', () => {
      const text = 'abcdefghij'
      const rope = new RopeArray(text, { leafSize: 3 })
      expect(rope.toString()).toBe(text)
      expect(rope.length).toBe(10)
    })

    it('creates rope with leaf size of 1', () => {
      const rope = new RopeArray('abc', { leafSize: 1 })
      expect(rope.toString()).toBe('abc')
      expect(rope.length).toBe(3)
    })

    it('creates rope with leaf size larger than text', () => {
      const rope = new RopeArray('hi', { leafSize: 1000 })
      expect(rope.toString()).toBe('hi')
    })

    it('preserves exact string content', () => {
      const text = 'Hello, World! \n\t Special chars: @#$%^&*()'
      const rope = new RopeArray(text)
      expect(rope.toString()).toBe(text)
    })

    it('creates rope from unicode text', () => {
      const text = 'Hello 🌍 世界'
      const rope = new RopeArray(text)
      expect(rope.toString()).toBe(text)
      expect(rope.length).toBe(text.length)
    })
  })

  describe('length', () => {
    it('returns 0 for empty rope', () => {
      expect(new RopeArray().length).toBe(0)
    })

    it('returns correct length for single char', () => {
      expect(new RopeArray('x').length).toBe(1)
    })

    it('returns correct length for longer strings', () => {
      expect(new RopeArray('abcdef').length).toBe(6)
    })

    it('returns correct length after insert', () => {
      const rope = new RopeArray('abc')
      rope.insert(1, 'XY')
      expect(rope.length).toBe(5)
    })

    it('returns correct length after delete', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(1, 4)
      expect(rope.length).toBe(3)
    })
  })

  describe('toString', () => {
    it('returns empty string for empty rope', () => {
      expect(new RopeArray().toString()).toBe('')
    })

    it('returns the original text', () => {
      const text = 'Hello, World!'
      expect(new RopeArray(text).toString()).toBe(text)
    })

    it('returns modified text after operations', () => {
      const rope = new RopeArray('abcdef')
      rope.insert(3, 'XY')
      expect(rope.toString()).toBe('abcXYdef')
    })

    it('returns empty string after deleting all content', () => {
      const rope = new RopeArray('abc')
      rope.delete(0, 3)
      expect(rope.toString()).toBe('')
    })
  })

  describe('charAt', () => {
    it('returns character at index 0', () => {
      const rope = new RopeArray('abc')
      expect(rope.charAt(0)).toBe('a')
    })

    it('returns character at last index', () => {
      const rope = new RopeArray('abc')
      expect(rope.charAt(2)).toBe('c')
    })

    it('returns character at middle index', () => {
      const rope = new RopeArray('abcde')
      expect(rope.charAt(2)).toBe('c')
    })

    it('returns correct chars across leaf boundaries', () => {
      const rope = new RopeArray('abcdefgh', { leafSize: 4 })
      expect(rope.charAt(3)).toBe('d')
      expect(rope.charAt(4)).toBe('e')
    })

    it('throws on negative index', () => {
      const rope = new RopeArray('abc')
      expect(() => rope.charAt(-1)).toThrow(RangeError)
    })

    it('throws on index equal to length', () => {
      const rope = new RopeArray('abc')
      expect(() => rope.charAt(3)).toThrow(RangeError)
    })

    it('throws on index greater than length', () => {
      const rope = new RopeArray('abc')
      expect(() => rope.charAt(10)).toThrow(RangeError)
    })

    it('throws on empty rope', () => {
      const rope = new RopeArray()
      expect(() => rope.charAt(0)).toThrow(RangeError)
    })

    it('works after insert', () => {
      const rope = new RopeArray('abc')
      rope.insert(1, 'XY')
      expect(rope.charAt(0)).toBe('a')
      expect(rope.charAt(1)).toBe('X')
      expect(rope.charAt(2)).toBe('Y')
      expect(rope.charAt(3)).toBe('b')
    })
  })

  describe('substring', () => {
    it('returns full string with no arguments', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(0)).toBe('abcdef')
    })

    it('returns suffix from start', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(3)).toBe('def')
    })

    it('returns middle substring', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(1, 4)).toBe('bcd')
    })

    it('returns single character substring', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(2, 3)).toBe('c')
    })

    it('returns empty string for equal start and end', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(2, 2)).toBe('')
    })

    it('returns empty string for start >= end', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(4, 2)).toBe('')
    })

    it('clamps negative start to 0', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(-3, 3)).toBe('abc')
    })

    it('clamps end to length', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(3, 100)).toBe('def')
    })

    it('returns empty for empty rope', () => {
      const rope = new RopeArray()
      expect(rope.substring(0)).toBe('')
    })

    it('works across leaf boundaries', () => {
      const rope = new RopeArray('abcdefghij', { leafSize: 4 })
      expect(rope.substring(2, 7)).toBe('cdefg')
    })

    it('returns prefix', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(0, 3)).toBe('abc')
    })

    it('returns suffix with end', () => {
      const rope = new RopeArray('abcdef')
      expect(rope.substring(3, 6)).toBe('def')
    })
  })

  describe('insert', () => {
    it('inserts at the beginning', () => {
      const rope = new RopeArray('world')
      rope.insert(0, 'hello ')
      expect(rope.toString()).toBe('hello world')
    })

    it('inserts at the end', () => {
      const rope = new RopeArray('hello')
      rope.insert(5, ' world')
      expect(rope.toString()).toBe('hello world')
    })

    it('inserts in the middle', () => {
      const rope = new RopeArray('helo')
      rope.insert(2, 'l')
      expect(rope.toString()).toBe('hello')
    })

    it('inserts into empty rope', () => {
      const rope = new RopeArray()
      rope.insert(0, 'text')
      expect(rope.toString()).toBe('text')
    })

    it('inserts empty string does nothing', () => {
      const rope = new RopeArray('abc')
      rope.insert(1, '')
      expect(rope.toString()).toBe('abc')
      expect(rope.length).toBe(3)
    })

    it('inserts single character', () => {
      const rope = new RopeArray('ac')
      rope.insert(1, 'b')
      expect(rope.toString()).toBe('abc')
    })

    it('inserts long text requiring split', () => {
      const rope = new RopeArray('ab', { leafSize: 4 })
      rope.insert(1, 'XYZ')
      expect(rope.toString()).toBe('aXYZb')
    })

    it('throws on negative position', () => {
      const rope = new RopeArray('abc')
      expect(() => rope.insert(-1, 'x')).toThrow(RangeError)
    })

    it('throws on position beyond length', () => {
      const rope = new RopeArray('abc')
      expect(() => rope.insert(4, 'x')).toThrow(RangeError)
    })

    it('inserts at position 0 in non-empty rope', () => {
      const rope = new RopeArray('bc')
      rope.insert(0, 'a')
      expect(rope.toString()).toBe('abc')
    })

    it('inserts at position equal to length', () => {
      const rope = new RopeArray('ab')
      rope.insert(2, 'c')
      expect(rope.toString()).toBe('abc')
    })
  })

  describe('delete', () => {
    it('deletes from the beginning', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(0, 3)
      expect(rope.toString()).toBe('def')
    })

    it('deletes from the end', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(3, 6)
      expect(rope.toString()).toBe('abc')
    })

    it('deletes from the middle', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(2, 4)
      expect(rope.toString()).toBe('abef')
    })

    it('deletes entire content', () => {
      const rope = new RopeArray('abc')
      rope.delete(0, 3)
      expect(rope.toString()).toBe('')
      expect(rope.length).toBe(0)
    })

    it('deletes single character', () => {
      const rope = new RopeArray('abc')
      rope.delete(1, 2)
      expect(rope.toString()).toBe('ac')
    })

    it('does nothing when start >= end', () => {
      const rope = new RopeArray('abc')
      rope.delete(2, 1)
      expect(rope.toString()).toBe('abc')
    })

    it('does nothing when start === end', () => {
      const rope = new RopeArray('abc')
      rope.delete(1, 1)
      expect(rope.toString()).toBe('abc')
    })

    it('clamps range to valid bounds', () => {
      const rope = new RopeArray('abc')
      rope.delete(1, 100)
      expect(rope.toString()).toBe('a')
    })

    it('deletes across leaf boundaries', () => {
      const rope = new RopeArray('abcdefgh', { leafSize: 4 })
      rope.delete(2, 6)
      expect(rope.toString()).toBe('abgh')
    })
  })

  describe('concat', () => {
    it('concatenates two non-empty ropes', () => {
      const a = new RopeArray('hello ')
      const b = new RopeArray('world')
      const c = a.concat(b)
      expect(c.toString()).toBe('hello world')
    })

    it('does not modify original ropes', () => {
      const a = new RopeArray('hello ')
      const b = new RopeArray('world')
      a.concat(b)
      expect(a.toString()).toBe('hello ')
      expect(b.toString()).toBe('world')
    })

    it('concatenates empty left rope', () => {
      const a = new RopeArray()
      const b = new RopeArray('world')
      const c = a.concat(b)
      expect(c.toString()).toBe('world')
    })

    it('concatenates empty right rope', () => {
      const a = new RopeArray('hello')
      const b = new RopeArray()
      const c = a.concat(b)
      expect(c.toString()).toBe('hello')
    })

    it('concatenates two empty ropes', () => {
      const a = new RopeArray()
      const b = new RopeArray()
      const c = a.concat(b)
      expect(c.toString()).toBe('')
      expect(c.length).toBe(0)
    })

    it('returns correct length', () => {
      const a = new RopeArray('abc')
      const b = new RopeArray('def')
      const c = a.concat(b)
      expect(c.length).toBe(6)
    })

    it('can chain concats', () => {
      const a = new RopeArray('a')
      const b = new RopeArray('b')
      const c = new RopeArray('c')
      const d = a.concat(b).concat(c)
      expect(d.toString()).toBe('abc')
    })
  })

  describe('split', () => {
    it('splits at the beginning', () => {
      const rope = new RopeArray('abcdef')
      const [left, right] = rope.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('abcdef')
    })

    it('splits at the end', () => {
      const rope = new RopeArray('abcdef')
      const [left, right] = rope.split(6)
      expect(left.toString()).toBe('abcdef')
      expect(right.toString()).toBe('')
    })

    it('splits in the middle', () => {
      const rope = new RopeArray('abcdef')
      const [left, right] = rope.split(3)
      expect(left.toString()).toBe('abc')
      expect(right.toString()).toBe('def')
    })

    it('splits at position 1', () => {
      const rope = new RopeArray('abcdef')
      const [left, right] = rope.split(1)
      expect(left.toString()).toBe('a')
      expect(right.toString()).toBe('bcdef')
    })

    it('does not modify original rope', () => {
      const rope = new RopeArray('abcdef')
      rope.split(3)
      expect(rope.toString()).toBe('abcdef')
    })

    it('splits empty rope', () => {
      const rope = new RopeArray()
      const [left, right] = rope.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('')
    })

    it('splits single character', () => {
      const rope = new RopeArray('a')
      const [left, right] = rope.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('a')
      const [left2, right2] = rope.split(1)
      expect(left2.toString()).toBe('a')
      expect(right2.toString()).toBe('')
    })

    it('throws on negative position', () => {
      const rope = new RopeArray('abc')
      expect(() => rope.split(-1)).toThrow(RangeError)
    })

    it('throws on position beyond length', () => {
      const rope = new RopeArray('abc')
      expect(() => rope.split(4)).toThrow(RangeError)
    })

    it('produces correct lengths', () => {
      const rope = new RopeArray('abcdef')
      const [left, right] = rope.split(3)
      expect(left.length).toBe(3)
      expect(right.length).toBe(3)
    })
  })

  describe('rebalance', () => {
    it('does not change content', () => {
      const rope = new RopeArray('hello world')
      rope.rebalance()
      expect(rope.toString()).toBe('hello world')
    })

    it('reduces depth for degenerate tree', () => {
      let rope = new RopeArray('a')
      for (let i = 0; i < 20; i++) {
        rope = rope.concat(new RopeArray('a'))
      }
      const depthBefore = rope.depth()
      rope.rebalance()
      const depthAfter = rope.depth()
      expect(depthAfter).toBeLessThanOrEqual(depthBefore)
    })

    it('works on empty rope', () => {
      const rope = new RopeArray()
      rope.rebalance()
      expect(rope.toString()).toBe('')
    })

    it('works on balanced rope', () => {
      const rope = new RopeArray('hello')
      rope.rebalance()
      expect(rope.toString()).toBe('hello')
    })

    it('works after many sequential inserts', () => {
      const rope = new RopeArray('', { leafSize: 4 })
      for (let i = 0; i < 50; i++) {
        rope.insert(rope.length, 'x')
      }
      rope.rebalance()
      expect(rope.toString()).toBe('x'.repeat(50))
    })
  })

  describe('depth', () => {
    it('returns 0 for empty rope', () => {
      expect(new RopeArray().depth()).toBe(0)
    })

    it('returns 0 for single leaf', () => {
      expect(new RopeArray('abc').depth()).toBe(0)
    })

    it('returns greater depth for large text', () => {
      const rope = new RopeArray('a'.repeat(2048), { leafSize: 8 })
      expect(rope.depth()).toBeGreaterThan(0)
    })

    it('increases with concatenated ropes', () => {
      const a = new RopeArray('abc')
      const b = new RopeArray('def')
      const c = a.concat(b)
      expect(c.depth()).toBeGreaterThan(a.depth())
    })
  })

  describe('isBalanced', () => {
    it('returns true for empty rope', () => {
      expect(new RopeArray().isBalanced()).toBe(true)
    })

    it('returns true for single leaf', () => {
      expect(new RopeArray('abc').isBalanced()).toBe(true)
    })

    it('returns true for balanced tree', () => {
      const rope = new RopeArray('a'.repeat(1024), { leafSize: 64 })
      expect(rope.isBalanced()).toBe(true)
    })

    it('returns true after rebalance', () => {
      let rope = new RopeArray('a')
      for (let i = 0; i < 30; i++) {
        rope = rope.concat(new RopeArray('b'))
      }
      rope.rebalance()
      expect(rope.isBalanced()).toBe(true)
    })
  })

  describe('large text operations', () => {
    it('handles 10000+ character string', () => {
      const text = 'a'.repeat(10000)
      const rope = new RopeArray(text, { leafSize: 256 })
      expect(rope.length).toBe(10000)
      expect(rope.toString()).toBe(text)
    })

    it('inserts into large text', () => {
      const text = 'a'.repeat(10000)
      const rope = new RopeArray(text, { leafSize: 256 })
      rope.insert(5000, 'HELLO')
      expect(rope.toString()).toBe('a'.repeat(5000) + 'HELLO' + 'a'.repeat(5000))
    })

    it('deletes from large text', () => {
      const text = 'a'.repeat(10000)
      const rope = new RopeArray(text, { leafSize: 256 })
      rope.delete(4000, 6000)
      expect(rope.length).toBe(8000)
      expect(rope.toString()).toBe('a'.repeat(4000) + 'a'.repeat(4000))
    })

    it('splits large text', () => {
      const text = 'ab'.repeat(5000)
      const rope = new RopeArray(text, { leafSize: 256 })
      const [left, right] = rope.split(5000)
      expect(left.length).toBe(5000)
      expect(right.length).toBe(5000)
      expect(left.toString() + right.toString()).toBe(text)
    })

    it('charAt on large text', () => {
      const text = 'abcdefghij'.repeat(1000)
      const rope = new RopeArray(text, { leafSize: 256 })
      for (let i = 0; i < 100; i++) {
        expect(rope.charAt(i * 100)).toBe(text[i * 100])
      }
    })

    it('substring on large text', () => {
      const text = 'abcdefghij'.repeat(1000)
      const rope = new RopeArray(text, { leafSize: 256 })
      expect(rope.substring(100, 200)).toBe(text.slice(100, 200))
    })

    it('concat two large ropes', () => {
      const a = new RopeArray('x'.repeat(5000), { leafSize: 256 })
      const b = new RopeArray('y'.repeat(5000), { leafSize: 256 })
      const c = a.concat(b)
      expect(c.length).toBe(10000)
      expect(c.toString()).toBe('x'.repeat(5000) + 'y'.repeat(5000))
    })
  })

  describe('sequential inserts', () => {
    it('builds string with sequential inserts at end', () => {
      const rope = new RopeArray()
      rope.insert(0, 'a')
      rope.insert(1, 'b')
      rope.insert(2, 'c')
      expect(rope.toString()).toBe('abc')
    })

    it('builds string with sequential inserts at beginning', () => {
      const rope = new RopeArray()
      rope.insert(0, 'c')
      rope.insert(0, 'b')
      rope.insert(0, 'a')
      expect(rope.toString()).toBe('abc')
    })

    it('builds string with inserts at various positions', () => {
      const rope = new RopeArray('ace')
      rope.insert(1, 'b')
      rope.insert(3, 'd')
      expect(rope.toString()).toBe('abcde')
    })

    it('handles many sequential inserts', () => {
      const rope = new RopeArray('', { leafSize: 8 })
      const chars = 'abcdefghijklmnopqrstuvwxyz'
      for (let i = 0; i < chars.length; i++) {
        rope.insert(i, chars[i]!)
      }
      expect(rope.toString()).toBe(chars)
    })

    it('inserts 100 characters sequentially', () => {
      const rope = new RopeArray('', { leafSize: 16 })
      for (let i = 0; i < 100; i++) {
        rope.insert(rope.length, String.fromCharCode(48 + (i % 10)))
      }
      expect(rope.length).toBe(100)
    })
  })

  describe('sequential deletes', () => {
    it('deletes characters one by one from beginning', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(0, 1)
      expect(rope.toString()).toBe('bcdef')
      rope.delete(0, 1)
      expect(rope.toString()).toBe('cdef')
      rope.delete(0, 1)
      expect(rope.toString()).toBe('def')
    })

    it('deletes characters one by one from end', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(5, 6)
      expect(rope.toString()).toBe('abcde')
      rope.delete(4, 5)
      expect(rope.toString()).toBe('abcd')
    })

    it('deletes until empty', () => {
      const rope = new RopeArray('abc')
      rope.delete(0, 1)
      rope.delete(0, 1)
      rope.delete(0, 1)
      expect(rope.toString()).toBe('')
      expect(rope.length).toBe(0)
    })

    it('deletes alternating characters', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(1, 2)
      rope.delete(2, 3)
      rope.delete(3, 4)
      expect(rope.toString()).toBe('ace')
    })
  })

  describe('interleaved operations', () => {
    it('inserts and deletes alternately', () => {
      const rope = new RopeArray('abc')
      rope.insert(3, 'd')
      expect(rope.toString()).toBe('abcd')
      rope.delete(0, 1)
      expect(rope.toString()).toBe('bcd')
      rope.insert(0, 'a')
      expect(rope.toString()).toBe('abcd')
      rope.delete(3, 4)
      expect(rope.toString()).toBe('abc')
    })

    it('mixed operations produce correct result', () => {
      const rope = new RopeArray('hello')
      rope.insert(5, ' world')
      rope.delete(0, 5)
      rope.insert(0, 'goodbye')
      expect(rope.toString()).toBe('goodbye world')
    })

    it('insert, split, concat cycle', () => {
      const rope = new RopeArray('abcdef')
      rope.insert(3, 'XY')
      const [left, right] = rope.split(4)
      const merged = left.concat(right)
      expect(merged.toString()).toBe('abcXYdef')
    })

    it('delete after multiple inserts', () => {
      const rope = new RopeArray()
      rope.insert(0, 'abc')
      rope.insert(3, 'def')
      rope.insert(6, 'ghi')
      rope.delete(3, 6)
      expect(rope.toString()).toBe('abcghi')
    })

    it('insert after deleting to empty', () => {
      const rope = new RopeArray('abc')
      rope.delete(0, 3)
      expect(rope.toString()).toBe('')
      rope.insert(0, 'xyz')
      expect(rope.toString()).toBe('xyz')
    })
  })

  describe('empty rope edge cases', () => {
    it('charAt throws on empty rope', () => {
      expect(() => new RopeArray().charAt(0)).toThrow(RangeError)
    })

    it('substring returns empty on empty rope', () => {
      expect(new RopeArray().substring(0)).toBe('')
    })

    it('insert at 0 works on empty rope', () => {
      const rope = new RopeArray()
      rope.insert(0, 'a')
      expect(rope.toString()).toBe('a')
    })

    it('delete does nothing on empty rope', () => {
      const rope = new RopeArray()
      rope.delete(0, 0)
      expect(rope.toString()).toBe('')
    })

    it('concat empty with empty', () => {
      const result = new RopeArray().concat(new RopeArray())
      expect(result.toString()).toBe('')
      expect(result.length).toBe(0)
    })

    it('split empty rope at 0', () => {
      const [left, right] = new RopeArray().split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('')
    })

    it('rebalance empty rope', () => {
      const rope = new RopeArray()
      rope.rebalance()
      expect(rope.toString()).toBe('')
    })

    it('depth of empty rope is 0', () => {
      expect(new RopeArray().depth()).toBe(0)
    })

    it('isBalanced on empty rope', () => {
      expect(new RopeArray().isBalanced()).toBe(true)
    })
  })

  describe('single character edge cases', () => {
    it('charAt on single char', () => {
      expect(new RopeArray('a').charAt(0)).toBe('a')
    })

    it('substring of single char', () => {
      expect(new RopeArray('a').substring(0, 1)).toBe('a')
    })

    it('delete single char', () => {
      const rope = new RopeArray('a')
      rope.delete(0, 1)
      expect(rope.toString()).toBe('')
    })

    it('insert into single char rope', () => {
      const rope = new RopeArray('b')
      rope.insert(0, 'a')
      expect(rope.toString()).toBe('ab')
    })

    it('concat two single char ropes', () => {
      const result = new RopeArray('a').concat(new RopeArray('b'))
      expect(result.toString()).toBe('ab')
    })

    it('split single char', () => {
      const [left, right] = new RopeArray('a').split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('a')
    })
  })

  describe('leaf size variations', () => {
    it('works with leafSize 1', () => {
      const rope = new RopeArray('abcdef', { leafSize: 1 })
      expect(rope.toString()).toBe('abcdef')
      rope.insert(3, 'XY')
      expect(rope.toString()).toBe('abcXYdef')
      rope.delete(2, 5)
      expect(rope.toString()).toBe('abdef')
    })

    it('works with leafSize 2', () => {
      const rope = new RopeArray('abcdefgh', { leafSize: 2 })
      expect(rope.toString()).toBe('abcdefgh')
      expect(rope.charAt(3)).toBe('d')
      expect(rope.substring(2, 6)).toBe('cdef')
    })

    it('works with leafSize 10', () => {
      const rope = new RopeArray('hello world test', { leafSize: 10 })
      expect(rope.toString()).toBe('hello world test')
    })

    it('works with leafSize 1000', () => {
      const text = 'x'.repeat(100)
      const rope = new RopeArray(text, { leafSize: 1000 })
      expect(rope.toString()).toBe(text)
      expect(rope.depth()).toBe(0)
    })

    it('handles operations correctly with small leafSize', () => {
      const rope = new RopeArray('abcdefghijklmnop', { leafSize: 3 })
      expect(rope.charAt(7)).toBe('h')
      expect(rope.substring(5, 11)).toBe('fghijk')
      rope.insert(8, 'ZZ')
      expect(rope.toString()).toBe('abcdefghZZijklmnop')
      rope.delete(6, 12)
      expect(rope.toString()).toBe('abcdefklmnop')
    })
  })

  describe('content integrity', () => {
    it('multiple operations preserve content', () => {
      const rope = new RopeArray('The quick brown fox')
      rope.insert(19, ' jumps')
      rope.insert(25, ' over')
      rope.insert(30, ' the lazy dog')
      expect(rope.toString()).toBe('The quick brown fox jumps over the lazy dog')
    })

    it('repeated insert-delete cycles', () => {
      const rope = new RopeArray('abc')
      for (let i = 0; i < 10; i++) {
        rope.insert(rope.length, 'XY')
        rope.delete(rope.length - 2, rope.length)
      }
      expect(rope.toString()).toBe('abc')
    })

    it('complex edit sequence', () => {
      const rope = new RopeArray('hello')
      rope.delete(0, 5)
      rope.insert(0, 'world')
      rope.insert(0, 'hello ')
      expect(rope.toString()).toBe('hello world')
    })

    it('split and rejoin', () => {
      const rope = new RopeArray('the quick brown fox')
      const [left, right] = rope.split(10)
      const rejoined = left.concat(right)
      expect(rejoined.toString()).toBe('the quick brown fox')
    })

    it('rebalance preserves through operations', () => {
      const rope = new RopeArray('', { leafSize: 4 })
      for (let i = 0; i < 20; i++) {
        rope.insert(rope.length, 'x')
      }
      rope.rebalance()
      expect(rope.toString()).toBe('x'.repeat(20))
      rope.insert(10, 'Y')
      expect(rope.toString()).toBe('x'.repeat(10) + 'Y' + 'x'.repeat(10))
    })
  })

  describe('position boundary checks', () => {
    it('insert at position 0 is valid', () => {
      const rope = new RopeArray('b')
      rope.insert(0, 'a')
      expect(rope.toString()).toBe('ab')
    })

    it('insert at position length is valid', () => {
      const rope = new RopeArray('a')
      rope.insert(1, 'b')
      expect(rope.toString()).toBe('ab')
    })

    it('delete entire range', () => {
      const rope = new RopeArray('abcdef')
      rope.delete(0, 6)
      expect(rope.toString()).toBe('')
    })

    it('delete single char at end', () => {
      const rope = new RopeArray('abc')
      rope.delete(2, 3)
      expect(rope.toString()).toBe('ab')
    })

    it('delete single char at start', () => {
      const rope = new RopeArray('abc')
      rope.delete(0, 1)
      expect(rope.toString()).toBe('bc')
    })

    it('split at exact leaf boundary', () => {
      const rope = new RopeArray('abcdefgh', { leafSize: 4 })
      const [left, right] = rope.split(4)
      expect(left.toString()).toBe('abcd')
      expect(right.toString()).toBe('efgh')
    })
  })
})
