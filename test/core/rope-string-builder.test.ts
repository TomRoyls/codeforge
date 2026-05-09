import { describe, it, expect } from 'vitest'
import { RopeStringBuilder } from '../../src/core/rope-string-builder/rope-string-builder.js'
import { DEFAULT_LEAF_SIZE } from '../../src/core/rope-string-builder/types.js'

describe('RopeStringBuilder', () => {
  describe('constructor', () => {
    it('creates empty builder with no arguments', () => {
      const builder = new RopeStringBuilder()
      expect(builder.length).toBe(0)
      expect(builder.toString()).toBe('')
    })

    it('creates builder from string', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.length).toBe(5)
      expect(builder.toString()).toBe('hello')
    })

    it('creates builder from empty string', () => {
      const builder = new RopeStringBuilder('')
      expect(builder.length).toBe(0)
      expect(builder.toString()).toBe('')
    })

    it('respects custom leafSize option', () => {
      const builder = new RopeStringBuilder('test', { leafSize: 2 })
      const stats = builder.stats()
      expect(stats.leafCount).toBeGreaterThanOrEqual(2)
    })

    it('uses DEFAULT_LEAF_SIZE when no options provided', () => {
      expect(DEFAULT_LEAF_SIZE).toBe(64)
    })

    it('handles single character string', () => {
      const builder = new RopeStringBuilder('a')
      expect(builder.length).toBe(1)
      expect(builder.toString()).toBe('a')
    })

    it('handles string exactly leafSize', () => {
      const str = 'a'.repeat(64)
      const builder = new RopeStringBuilder(str)
      expect(builder.length).toBe(64)
      expect(builder.toString()).toBe(str)
    })

    it('handles string larger than leafSize', () => {
      const str = 'a'.repeat(200)
      const builder = new RopeStringBuilder(str)
      expect(builder.length).toBe(200)
      expect(builder.toString()).toBe(str)
    })
  })

  describe('static from', () => {
    it('creates builder from string', () => {
      const builder = RopeStringBuilder.from('hello world')
      expect(builder.toString()).toBe('hello world')
    })

    it('creates builder with options', () => {
      const builder = RopeStringBuilder.from('test', { leafSize: 4 })
      expect(builder.toString()).toBe('test')
    })

    it('creates empty builder from empty string', () => {
      const builder = RopeStringBuilder.from('')
      expect(builder.length).toBe(0)
    })
  })

  describe('append', () => {
    it('appends string to empty builder', () => {
      const builder = new RopeStringBuilder()
      builder.append('hello')
      expect(builder.toString()).toBe('hello')
    })

    it('appends string to existing content', () => {
      const builder = new RopeStringBuilder('hello')
      builder.append(' world')
      expect(builder.toString()).toBe('hello world')
    })

    it('appends empty string does nothing', () => {
      const builder = new RopeStringBuilder('hello')
      builder.append('')
      expect(builder.toString()).toBe('hello')
      expect(builder.length).toBe(5)
    })

    it('updates length after append', () => {
      const builder = new RopeStringBuilder('abc')
      builder.append('def')
      expect(builder.length).toBe(6)
    })

    it('appends multiple strings sequentially', () => {
      const builder = new RopeStringBuilder()
      builder.append('a')
      builder.append('b')
      builder.append('c')
      expect(builder.toString()).toBe('abc')
    })

    it('appends long string that exceeds leafSize', () => {
      const builder = new RopeStringBuilder('start')
      builder.append('x'.repeat(200))
      expect(builder.length).toBe(205)
      expect(builder.toString()).toBe('start' + 'x'.repeat(200))
    })

    it('appends unicode characters', () => {
      const builder = new RopeStringBuilder('hello')
      builder.append(' 🌍')
      expect(builder.toString()).toBe('hello 🌍')
    })

    it('appends single character', () => {
      const builder = new RopeStringBuilder('ab')
      builder.append('c')
      expect(builder.toString()).toBe('abc')
    })
  })

  describe('prepend', () => {
    it('prepends to empty builder', () => {
      const builder = new RopeStringBuilder()
      builder.prepend('hello')
      expect(builder.toString()).toBe('hello')
    })

    it('prepends to existing content', () => {
      const builder = new RopeStringBuilder('world')
      builder.prepend('hello ')
      expect(builder.toString()).toBe('hello world')
    })

    it('prepends empty string does nothing', () => {
      const builder = new RopeStringBuilder('hello')
      builder.prepend('')
      expect(builder.toString()).toBe('hello')
      expect(builder.length).toBe(5)
    })

    it('updates length after prepend', () => {
      const builder = new RopeStringBuilder('def')
      builder.prepend('abc')
      expect(builder.length).toBe(6)
    })

    it('prepends multiple strings sequentially', () => {
      const builder = new RopeStringBuilder()
      builder.prepend('c')
      builder.prepend('b')
      builder.prepend('a')
      expect(builder.toString()).toBe('abc')
    })

    it('prepends long string', () => {
      const builder = new RopeStringBuilder('end')
      builder.prepend('x'.repeat(200))
      expect(builder.toString()).toBe('x'.repeat(200) + 'end')
    })

    it('prepends unicode characters', () => {
      const builder = new RopeStringBuilder('world')
      builder.prepend('🌍 ')
      expect(builder.toString()).toBe('🌍 world')
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const builder = new RopeStringBuilder('world')
      builder.insert(0, 'hello ')
      expect(builder.toString()).toBe('hello world')
    })

    it('inserts at end', () => {
      const builder = new RopeStringBuilder('hello')
      builder.insert(5, ' world')
      expect(builder.toString()).toBe('hello world')
    })

    it('inserts in middle', () => {
      const builder = new RopeStringBuilder('helloworld')
      builder.insert(5, ' ')
      expect(builder.toString()).toBe('hello world')
    })

    it('inserts empty string does nothing', () => {
      const builder = new RopeStringBuilder('hello')
      builder.insert(3, '')
      expect(builder.toString()).toBe('hello')
    })

    it('clamps negative index to 0', () => {
      const builder = new RopeStringBuilder('world')
      builder.insert(-1, 'hello ')
      expect(builder.toString()).toBe('hello world')
    })

    it('clamps index beyond length to length', () => {
      const builder = new RopeStringBuilder('hello')
      builder.insert(100, ' world')
      expect(builder.toString()).toBe('hello world')
    })

    it('updates length after insert', () => {
      const builder = new RopeStringBuilder('abc')
      builder.insert(1, 'X')
      expect(builder.length).toBe(4)
    })

    it('inserts unicode at position', () => {
      const builder = new RopeStringBuilder('hl')
      builder.insert(1, 'é')
      expect(builder.toString()).toBe('hél')
    })
  })

  describe('delete', () => {
    it('deletes from start', () => {
      const builder = new RopeStringBuilder('hello world')
      builder.delete(0, 6)
      expect(builder.toString()).toBe('world')
    })

    it('deletes from end', () => {
      const builder = new RopeStringBuilder('hello world')
      builder.delete(5, 11)
      expect(builder.toString()).toBe('hello')
    })

    it('deletes from middle', () => {
      const builder = new RopeStringBuilder('hello world')
      builder.delete(5, 6)
      expect(builder.toString()).toBe('helloworld')
    })

    it('deletes entire content', () => {
      const builder = new RopeStringBuilder('hello')
      builder.delete(0, 5)
      expect(builder.toString()).toBe('')
      expect(builder.length).toBe(0)
    })

    it('handles start equal to end (no-op)', () => {
      const builder = new RopeStringBuilder('hello')
      builder.delete(3, 3)
      expect(builder.toString()).toBe('hello')
    })

    it('handles start greater than end (no-op)', () => {
      const builder = new RopeStringBuilder('hello')
      builder.delete(4, 2)
      expect(builder.toString()).toBe('hello')
    })

    it('clamps negative start to 0', () => {
      const builder = new RopeStringBuilder('hello')
      builder.delete(-1, 2)
      expect(builder.toString()).toBe('llo')
    })

    it('clamps end beyond length', () => {
      const builder = new RopeStringBuilder('hello')
      builder.delete(3, 100)
      expect(builder.toString()).toBe('hel')
    })

    it('updates length after delete', () => {
      const builder = new RopeStringBuilder('abcdef')
      builder.delete(2, 4)
      expect(builder.length).toBe(4)
    })
  })

  describe('substring', () => {
    it('returns substring from start to end', () => {
      const builder = new RopeStringBuilder('hello world')
      expect(builder.substring(0, 5)).toBe('hello')
    })

    it('returns single character substring', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(0, 1)).toBe('h')
    })

    it('returns entire string', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(0, 5)).toBe('hello')
    })

    it('handles start equal to end', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(2, 2)).toBe('')
    })

    it('handles start greater than end (swaps)', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(4, 1)).toBe('ell')
    })

    it('handles negative start clamped to 0', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(-1, 3)).toBe('hel')
    })

    it('handles negative end clamped to 0', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(0, -1)).toBe('')
    })

    it('handles end beyond length', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(2, 100)).toBe('llo')
    })

    it('handles start beyond length', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.substring(100, 200)).toBe('')
    })

    it('does not modify original builder', () => {
      const builder = new RopeStringBuilder('hello world')
      builder.substring(0, 5)
      expect(builder.toString()).toBe('hello world')
    })
  })

  describe('charAt', () => {
    it('returns character at valid index', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.charAt(0)).toBe('h')
      expect(builder.charAt(4)).toBe('o')
    })

    it('returns empty string for negative index', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.charAt(-1)).toBe('')
    })

    it('returns empty string for index beyond length', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.charAt(5)).toBe('')
    })

    it('returns middle character', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.charAt(2)).toBe('l')
    })

    it('handles unicode characters', () => {
      const builder = new RopeStringBuilder('héllo')
      expect(builder.charAt(1)).toBe('é')
    })

    it('returns each character of abc', () => {
      const builder = new RopeStringBuilder('abc')
      expect(builder.charAt(0)).toBe('a')
      expect(builder.charAt(1)).toBe('b')
      expect(builder.charAt(2)).toBe('c')
    })
  })

  describe('length', () => {
    it('returns 0 for empty builder', () => {
      const builder = new RopeStringBuilder()
      expect(builder.length).toBe(0)
    })

    it('returns correct length after construction', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.length).toBe(5)
    })

    it('updates after append', () => {
      const builder = new RopeStringBuilder('abc')
      builder.append('def')
      expect(builder.length).toBe(6)
    })

    it('updates after prepend', () => {
      const builder = new RopeStringBuilder('def')
      builder.prepend('abc')
      expect(builder.length).toBe(6)
    })

    it('updates after delete', () => {
      const builder = new RopeStringBuilder('abcdef')
      builder.delete(2, 4)
      expect(builder.length).toBe(4)
    })

    it('updates after insert', () => {
      const builder = new RopeStringBuilder('ac')
      builder.insert(1, 'b')
      expect(builder.length).toBe(3)
    })

    it('handles unicode string length', () => {
      const builder = new RopeStringBuilder('héllo wörld')
      expect(builder.length).toBe(11)
    })
  })

  describe('toString', () => {
    it('returns empty string for empty builder', () => {
      const builder = new RopeStringBuilder()
      expect(builder.toString()).toBe('')
    })

    it('returns the constructed string', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.toString()).toBe('hello')
    })

    it('returns full string after multiple operations', () => {
      const builder = new RopeStringBuilder()
      builder.append('hello')
      builder.append(' ')
      builder.append('world')
      expect(builder.toString()).toBe('hello world')
    })

    it('returns correct string after mixed operations', () => {
      const builder = new RopeStringBuilder('world')
      builder.prepend('hello ')
      builder.delete(5, 6)
      expect(builder.toString()).toBe('helloworld')
    })
  })

  describe('indexOf', () => {
    it('finds substring at beginning', () => {
      const builder = new RopeStringBuilder('hello world')
      expect(builder.indexOf('hello')).toBe(0)
    })

    it('finds substring in middle', () => {
      const builder = new RopeStringBuilder('hello world')
      expect(builder.indexOf('o w')).toBe(4)
    })

    it('finds substring at end', () => {
      const builder = new RopeStringBuilder('hello world')
      expect(builder.indexOf('world')).toBe(6)
    })

    it('returns -1 for not found', () => {
      const builder = new RopeStringBuilder('hello world')
      expect(builder.indexOf('xyz')).toBe(-1)
    })

    it('respects fromIndex parameter', () => {
      const builder = new RopeStringBuilder('hello hello')
      expect(builder.indexOf('hello', 1)).toBe(6)
    })

    it('finds single character', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.indexOf('e')).toBe(1)
    })

    it('returns -1 for empty builder', () => {
      const builder = new RopeStringBuilder()
      expect(builder.indexOf('a')).toBe(-1)
    })

    it('finds empty string at start', () => {
      const builder = new RopeStringBuilder('hello')
      expect(builder.indexOf('')).toBe(0)
    })
  })

  describe('split', () => {
    it('splits at beginning', () => {
      const builder = new RopeStringBuilder('hello')
      const [left, right] = builder.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('splits at end', () => {
      const builder = new RopeStringBuilder('hello')
      const [left, right] = builder.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('splits in middle', () => {
      const builder = new RopeStringBuilder('hello world')
      const [left, right] = builder.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
    })

    it('clamps negative index to 0', () => {
      const builder = new RopeStringBuilder('hello')
      const [left, right] = builder.split(-1)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('clamps index beyond length', () => {
      const builder = new RopeStringBuilder('hello')
      const [left, right] = builder.split(100)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('returns correct lengths', () => {
      const builder = new RopeStringBuilder('hello world')
      const [left, right] = builder.split(5)
      expect(left.length).toBe(5)
      expect(right.length).toBe(6)
    })

    it('does not modify original builder', () => {
      const builder = new RopeStringBuilder('hello world')
      builder.split(5)
      expect(builder.toString()).toBe('hello world')
    })

    it('result builders are independent', () => {
      const builder = new RopeStringBuilder('hello world')
      const [left, right] = builder.split(5)
      left.append('!')
      right.prepend('!')
      expect(builder.toString()).toBe('hello world')
      expect(left.toString()).toBe('hello!')
      expect(right.toString()).toBe('! world')
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const builder = new RopeStringBuilder('hello')
      const cloned = builder.clone()
      expect(cloned.toString()).toBe('hello')
      expect(cloned.length).toBe(5)
    })

    it('clone is independent from original', () => {
      const builder = new RopeStringBuilder('hello')
      const cloned = builder.clone()
      cloned.append(' world')
      expect(builder.toString()).toBe('hello')
      expect(cloned.toString()).toBe('hello world')
    })

    it('preserves leafSize option', () => {
      const builder = new RopeStringBuilder('test', { leafSize: 4 })
      const cloned = builder.clone()
      cloned.append('more text here')
      expect(cloned.toString()).toBe('testmore text here')
    })

    it('clone of empty builder', () => {
      const builder = new RopeStringBuilder()
      const cloned = builder.clone()
      expect(cloned.toString()).toBe('')
      expect(cloned.length).toBe(0)
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty builder', () => {
      const builder = new RopeStringBuilder()
      const stats = builder.stats()
      expect(stats.length).toBe(0)
      expect(stats.leafCount).toBe(1)
      expect(stats.nodeCount).toBe(1)
      expect(stats.depth).toBe(0)
    })

    it('returns correct stats for small string', () => {
      const builder = new RopeStringBuilder('hello')
      const stats = builder.stats()
      expect(stats.length).toBe(5)
      expect(stats.leafCount).toBeGreaterThanOrEqual(1)
      expect(stats.nodeCount).toBeGreaterThanOrEqual(1)
    })

    it('returns increased node count for large string', () => {
      const builder = new RopeStringBuilder('a'.repeat(200))
      const stats = builder.stats()
      expect(stats.leafCount).toBeGreaterThan(1)
      expect(stats.depth).toBeGreaterThan(0)
    })

    it('nodeCount equals leafCount plus internalCount', () => {
      const builder = new RopeStringBuilder('a'.repeat(200))
      const stats = builder.stats()
      expect(stats.nodeCount).toBeGreaterThanOrEqual(stats.leafCount)
    })
  })

  describe('edge cases - empty string', () => {
    it('append to empty builder', () => {
      const builder = new RopeStringBuilder()
      builder.append('hello')
      expect(builder.toString()).toBe('hello')
    })

    it('prepend to empty builder', () => {
      const builder = new RopeStringBuilder()
      builder.prepend('hello')
      expect(builder.toString()).toBe('hello')
    })

    it('insert into empty builder', () => {
      const builder = new RopeStringBuilder()
      builder.insert(0, 'hello')
      expect(builder.toString()).toBe('hello')
    })

    it('charAt on empty builder', () => {
      const builder = new RopeStringBuilder()
      expect(builder.charAt(0)).toBe('')
    })

    it('indexOf on empty builder', () => {
      const builder = new RopeStringBuilder()
      expect(builder.indexOf('a')).toBe(-1)
    })

    it('substring on empty builder', () => {
      const builder = new RopeStringBuilder()
      expect(builder.substring(0, 5)).toBe('')
    })

    it('delete on empty builder', () => {
      const builder = new RopeStringBuilder()
      builder.delete(0, 5)
      expect(builder.toString()).toBe('')
    })

    it('split empty builder', () => {
      const builder = new RopeStringBuilder()
      const [left, right] = builder.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('')
    })
  })

  describe('edge cases - single character', () => {
    it('all operations on single char', () => {
      const builder = new RopeStringBuilder('a')
      expect(builder.length).toBe(1)
      expect(builder.charAt(0)).toBe('a')
      expect(builder.substring(0, 1)).toBe('a')
      expect(builder.indexOf('a')).toBe(0)
      builder.append('b')
      expect(builder.toString()).toBe('ab')
      builder.prepend('z')
      expect(builder.toString()).toBe('zab')
      builder.insert(2, 'X')
      expect(builder.toString()).toBe('zaXb')
      builder.delete(1, 3)
      expect(builder.toString()).toBe('zb')
    })
  })

  describe('edge cases - long strings (10000+ chars)', () => {
    it('handles 10000 char string', () => {
      const str = 'abcdefghij'.repeat(1000)
      const builder = new RopeStringBuilder(str)
      expect(builder.length).toBe(10000)
      expect(builder.toString()).toBe(str)
    })

    it('append to long string', () => {
      const str = 'x'.repeat(10000)
      const builder = new RopeStringBuilder(str)
      builder.append('END')
      expect(builder.toString()).toBe(str + 'END')
      expect(builder.length).toBe(10003)
    })

    it('prepend to long string', () => {
      const str = 'x'.repeat(10000)
      const builder = new RopeStringBuilder(str)
      builder.prepend('START')
      expect(builder.toString()).toBe('START' + str)
      expect(builder.length).toBe(10005)
    })

    it('substring from long string', () => {
      const str = 'abcdefghij'.repeat(1000)
      const builder = new RopeStringBuilder(str)
      expect(builder.substring(100, 110)).toBe('abcdefghij')
    })

    it('charAt on long string', () => {
      const str = 'abcdefghij'.repeat(1000)
      const builder = new RopeStringBuilder(str)
      expect(builder.charAt(0)).toBe('a')
      expect(builder.charAt(9)).toBe('j')
      expect(builder.charAt(10)).toBe('a')
    })

    it('indexOf on long string', () => {
      const str = 'abcdefghij'.repeat(1000)
      const builder = new RopeStringBuilder(str)
      expect(builder.indexOf('fgh')).toBe(5)
      expect(builder.indexOf('fgh', 10)).toBe(15)
    })

    it('insert into long string', () => {
      const str = 'x'.repeat(10000)
      const builder = new RopeStringBuilder(str)
      builder.insert(5000, 'INSERT')
      expect(builder.length).toBe(10006)
      const result = builder.toString()
      expect(result.slice(4998, 5008)).toBe('xxINSERTxx')
    })

    it('delete from long string', () => {
      const str = 'x'.repeat(10000)
      const builder = new RopeStringBuilder(str)
      builder.delete(4000, 6000)
      expect(builder.length).toBe(8000)
      expect(builder.toString()).toBe('x'.repeat(8000))
    })

    it('split long string', () => {
      const str = 'x'.repeat(10000)
      const builder = new RopeStringBuilder(str)
      const [left, right] = builder.split(5000)
      expect(left.length).toBe(5000)
      expect(right.length).toBe(5000)
    })

    it('handles 50000 char string', () => {
      const str = 'a'.repeat(50000)
      const builder = new RopeStringBuilder(str)
      expect(builder.length).toBe(50000)
      expect(builder.toString()).toBe(str)
    })
  })

  describe('edge cases - unicode and multi-byte', () => {
    it('handles emoji characters', () => {
      const builder = new RopeStringBuilder('😀😎')
      expect(builder.toString()).toBe('😀😎')
    })

    it('handles mixed ascii and emoji', () => {
      const builder = new RopeStringBuilder('hello 😀 world')
      expect(builder.toString()).toBe('hello 😀 world')
    })

    it('handles chinese characters', () => {
      const builder = new RopeStringBuilder('你好世界')
      expect(builder.toString()).toBe('你好世界')
    })

    it('handles accented characters', () => {
      const builder = new RopeStringBuilder('café résumé')
      expect(builder.toString()).toBe('café résumé')
    })

    it('append unicode', () => {
      const builder = new RopeStringBuilder('hello')
      builder.append(' 🌍🎉')
      expect(builder.toString()).toBe('hello 🌍🎉')
    })

    it('indexOf with unicode', () => {
      const builder = new RopeStringBuilder('hello 🌍 world')
      expect(builder.indexOf('🌍')).toBe(6)
    })

    it('charAt with unicode', () => {
      const builder = new RopeStringBuilder('héllo')
      expect(builder.charAt(1)).toBe('é')
    })

    it('substring with unicode', () => {
      const builder = new RopeStringBuilder('héllo wörld')
      expect(builder.substring(0, 5)).toBe('héllo')
    })

    it('handles repeated emoji in long string', () => {
      const str = '😀'.repeat(1000)
      const builder = new RopeStringBuilder(str)
      expect(builder.toString()).toBe(str)
    })
  })

  describe('complex operations', () => {
    it('multiple append operations', () => {
      const builder = new RopeStringBuilder()
      for (let i = 0; i < 100; i++) {
        builder.append(`line${i}\n`)
      }
      const result = builder.toString()
      expect(result).toContain('line0\n')
      expect(result).toContain('line99\n')
      expect(result.split('\n').length).toBe(101)
    })

    it('mixed append and prepend', () => {
      const builder = new RopeStringBuilder('middle')
      builder.prepend('begin-')
      builder.append('-end')
      expect(builder.toString()).toBe('begin-middle-end')
    })

    it('insert then delete', () => {
      const builder = new RopeStringBuilder('hello world')
      builder.insert(5, '!')
      builder.delete(5, 6)
      expect(builder.toString()).toBe('hello world')
    })

    it('multiple inserts', () => {
      const builder = new RopeStringBuilder()
      builder.insert(0, 'c')
      builder.insert(0, 'a')
      builder.insert(1, 'b')
      expect(builder.toString()).toBe('abc')
    })

    it('delete then append', () => {
      const builder = new RopeStringBuilder('hello')
      builder.delete(0, 5)
      builder.append('world')
      expect(builder.toString()).toBe('world')
    })

    it('clone after modifications', () => {
      const builder = new RopeStringBuilder('hello')
      builder.append(' world')
      const cloned = builder.clone()
      builder.delete(0, 6)
      expect(cloned.toString()).toBe('hello world')
      expect(builder.toString()).toBe('world')
    })

    it('split then modify both halves', () => {
      const builder = new RopeStringBuilder('hello world')
      const [left, right] = builder.split(5)
      left.append('!')
      right.prepend('!')
      expect(left.toString()).toBe('hello!')
      expect(right.toString()).toBe('! world')
      expect(builder.toString()).toBe('hello world')
    })

    it('build large string with repeated appends', () => {
      const builder = new RopeStringBuilder()
      const parts: string[] = []
      for (let i = 0; i < 200; i++) {
        const part = `part${i};`
        builder.append(part)
        parts.push(part)
      }
      expect(builder.toString()).toBe(parts.join(''))
    })

    it('substring preserves original for large strings', () => {
      const builder = new RopeStringBuilder('x'.repeat(1000) + 'TARGET' + 'y'.repeat(1000))
      const sub = builder.substring(1000, 1006)
      expect(sub).toBe('TARGET')
      expect(builder.length).toBe(2006)
    })
  })
})
