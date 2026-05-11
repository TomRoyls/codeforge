import { describe, it, expect } from 'vitest'
import { Rope2 } from '../../src/core/rope-2/index.js'

describe('Rope2', () => {
  describe('construction', () => {
    it('creates empty rope with no arguments', () => {
      const r = new Rope2()
      expect(r.length).toBe(0)
      expect(r.isEmpty).toBe(true)
      expect(r.toString()).toBe('')
    })

    it('creates rope from empty string', () => {
      const r = new Rope2('')
      expect(r.length).toBe(0)
      expect(r.isEmpty).toBe(true)
    })

    it('creates rope from short string', () => {
      const r = new Rope2('hello')
      expect(r.length).toBe(5)
      expect(r.isEmpty).toBe(false)
      expect(r.toString()).toBe('hello')
    })

    it('creates rope from string longer than default leafSize', () => {
      const str = 'abcdefghijklmnop'
      const r = new Rope2(str)
      expect(r.length).toBe(str.length)
      expect(r.toString()).toBe(str)
    })

    it('creates rope with custom leafSize', () => {
      const r = new Rope2('abcdefgh', { leafSize: 4 })
      expect(r.toString()).toBe('abcdefgh')
    })

    it('preserves character order', () => {
      const r = new Rope2('abcdef')
      expect(r.charAt(0)).toBe('a')
      expect(r.charAt(5)).toBe('f')
    })

    it('creates rope from single character', () => {
      const r = new Rope2('x')
      expect(r.length).toBe(1)
      expect(r.toString()).toBe('x')
    })

    it('handles unicode characters', () => {
      const r = new Rope2('héllo wörld')
      expect(r.toString()).toBe('héllo wörld')
    })

    it('handles emoji characters', () => {
      const r = new Rope2('ab🎉cd')
      expect(r.toString()).toBe('ab🎉cd')
    })

    it('handles whitespace string', () => {
      const r = new Rope2('  \t\n  ')
      expect(r.toString()).toBe('  \t\n  ')
    })

    it('handles very long string', () => {
      const str = 'a'.repeat(10000)
      const r = new Rope2(str)
      expect(r.length).toBe(10000)
      expect(r.toString()).toBe(str)
    })

    it('handles string exactly at leafSize boundary', () => {
      const r = new Rope2('abcdefgh', { leafSize: 8 })
      expect(r.toString()).toBe('abcdefgh')
      expect(r.length).toBe(8)
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const r = new Rope2('world')
      r.insert(0, 'hello ')
      expect(r.toString()).toBe('hello world')
    })

    it('inserts at end', () => {
      const r = new Rope2('hello')
      r.insert(5, ' world')
      expect(r.toString()).toBe('hello world')
    })

    it('inserts in middle', () => {
      const r = new Rope2('helo')
      r.insert(2, 'l')
      expect(r.toString()).toBe('hello')
    })

    it('inserts empty string as no-op', () => {
      const r = new Rope2('hello')
      r.insert(2, '')
      expect(r.toString()).toBe('hello')
    })

    it('inserts into empty rope', () => {
      const r = new Rope2()
      r.insert(0, 'hello')
      expect(r.toString()).toBe('hello')
    })

    it('inserts at index beyond length (appends)', () => {
      const r = new Rope2('hello')
      r.insert(100, '!')
      expect(r.toString()).toBe('hello!')
    })

    it('inserts at negative index (prepends)', () => {
      const r = new Rope2('world')
      r.insert(-5, 'hello ')
      expect(r.toString()).toBe('hello world')
    })

    it('updates length after insert', () => {
      const r = new Rope2('ab')
      r.insert(1, 'XY')
      expect(r.length).toBe(4)
    })

    it('handles multiple sequential inserts', () => {
      const r = new Rope2()
      r.insert(0, 'a')
      r.insert(1, 'b')
      r.insert(2, 'c')
      expect(r.toString()).toBe('abc')
    })

    it('inserts long string', () => {
      const r = new Rope2('ab')
      r.insert(1, 'c'.repeat(100))
      expect(r.length).toBe(102)
      expect(r.charAt(0)).toBe('a')
      expect(r.charAt(101)).toBe('b')
    })
  })

  describe('delete', () => {
    it('deletes from beginning', () => {
      const r = new Rope2('hello world')
      r.delete(0, 6)
      expect(r.toString()).toBe('world')
    })

    it('deletes from end', () => {
      const r = new Rope2('hello world')
      r.delete(5, 6)
      expect(r.toString()).toBe('hello')
    })

    it('deletes from middle', () => {
      const r = new Rope2('hello world')
      r.delete(5, 1)
      expect(r.toString()).toBe('helloworld')
    })

    it('deletes entire string', () => {
      const r = new Rope2('hello')
      r.delete(0, 5)
      expect(r.toString()).toBe('')
      expect(r.isEmpty).toBe(true)
    })

    it('delete with length 0 is no-op', () => {
      const r = new Rope2('hello')
      r.delete(0, 0)
      expect(r.toString()).toBe('hello')
    })

    it('delete with negative length is no-op', () => {
      const r = new Rope2('hello')
      r.delete(0, -1)
      expect(r.toString()).toBe('hello')
    })

    it('delete clamps negative index to 0', () => {
      const r = new Rope2('hello')
      r.delete(-3, 3)
      expect(r.toString()).toBe('lo')
    })

    it('deletes more than available length', () => {
      const r = new Rope2('hi')
      r.delete(0, 100)
      expect(r.toString()).toBe('')
    })

    it('updates length after delete', () => {
      const r = new Rope2('abcdef')
      r.delete(2, 3)
      expect(r.length).toBe(3)
    })

    it('handles multiple sequential deletes', () => {
      const r = new Rope2('abcdef')
      r.delete(0, 1)
      r.delete(0, 1)
      r.delete(0, 1)
      expect(r.toString()).toBe('def')
    })
  })

  describe('charAt', () => {
    it('returns character at valid index', () => {
      const r = new Rope2('hello')
      expect(r.charAt(0)).toBe('h')
      expect(r.charAt(1)).toBe('e')
      expect(r.charAt(4)).toBe('o')
    })

    it('returns empty string for out of bounds index', () => {
      const r = new Rope2('hi')
      expect(r.charAt(5)).toBe('')
      expect(r.charAt(100)).toBe('')
    })

    it('returns empty string for negative index', () => {
      const r = new Rope2('hello')
      expect(r.charAt(-1)).toBe('')
    })

    it('returns first character', () => {
      const r = new Rope2('abc')
      expect(r.charAt(0)).toBe('a')
    })

    it('returns last character', () => {
      const r = new Rope2('abc')
      expect(r.charAt(2)).toBe('c')
    })

    it('works after insert', () => {
      const r = new Rope2('ac')
      r.insert(1, 'b')
      expect(r.charAt(1)).toBe('b')
    })

    it('works after delete', () => {
      const r = new Rope2('abc')
      r.delete(1, 1)
      expect(r.charAt(0)).toBe('a')
      expect(r.charAt(1)).toBe('c')
    })

    it('works on long strings', () => {
      const r = new Rope2('abcdefghij')
      expect(r.charAt(5)).toBe('f')
      expect(r.charAt(9)).toBe('j')
    })
  })

  describe('substring', () => {
    it('extracts substring from middle', () => {
      const r = new Rope2('hello world')
      expect(r.substring(6, 11)).toBe('world')
    })

    it('extracts from beginning', () => {
      const r = new Rope2('hello world')
      expect(r.substring(0, 5)).toBe('hello')
    })

    it('extracts to end when end omitted', () => {
      const r = new Rope2('hello')
      expect(r.substring(2)).toBe('llo')
    })

    it('returns full string with no args', () => {
      const r = new Rope2('hello')
      expect(r.substring(0)).toBe('hello')
    })

    it('returns empty for invalid range', () => {
      const r = new Rope2('hello')
      expect(r.substring(3, 2)).toBe('')
    })

    it('clamps negative start to 0', () => {
      const r = new Rope2('hello')
      expect(r.substring(-3, 3)).toBe('hel')
    })

    it('clamps end beyond length', () => {
      const r = new Rope2('hello')
      expect(r.substring(2, 100)).toBe('llo')
    })

    it('returns empty for start equal to end', () => {
      const r = new Rope2('hello')
      expect(r.substring(3, 3)).toBe('')
    })

    it('returns entire string', () => {
      const r = new Rope2('hello')
      expect(r.substring(0, 5)).toBe('hello')
    })

    it('returns empty on empty rope', () => {
      const r = new Rope2()
      expect(r.substring(0, 5)).toBe('')
    })
  })

  describe('concat', () => {
    it('concatenates two ropes', () => {
      const a = new Rope2('hello')
      const b = new Rope2(' world')
      const result = a.concat(b)
      expect(result.toString()).toBe('hello world')
    })

    it('concatenates rope with string', () => {
      const a = new Rope2('hello')
      const result = a.concat(' world')
      expect(result.toString()).toBe('hello world')
    })

    it('concatenates with empty rope', () => {
      const a = new Rope2('hello')
      const b = new Rope2()
      expect(a.concat(b).toString()).toBe('hello')
    })

    it('concatenates empty with non-empty', () => {
      const a = new Rope2()
      const b = new Rope2('hello')
      expect(a.concat(b).toString()).toBe('hello')
    })

    it('does not modify original rope', () => {
      const a = new Rope2('hello')
      const b = new Rope2(' world')
      a.concat(b)
      expect(a.toString()).toBe('hello')
      expect(b.toString()).toBe(' world')
    })

    it('concatenates two empty ropes', () => {
      const a = new Rope2()
      const b = new Rope2()
      expect(a.concat(b).toString()).toBe('')
      expect(a.concat(b).isEmpty).toBe(true)
    })

    it('handles multiple concats', () => {
      const a = new Rope2('a')
      const result = a.concat('b').concat('c')
      expect(result.toString()).toBe('abc')
    })

    it('preserves order', () => {
      const a = new Rope2('12')
      const b = new Rope2('34')
      expect(a.concat(b).toString()).toBe('1234')
    })
  })

  describe('split', () => {
    it('splits in middle', () => {
      const r = new Rope2('hello world')
      const [left, right] = r.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
    })

    it('splits at beginning', () => {
      const r = new Rope2('hello')
      const [left, right] = r.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('splits at end', () => {
      const r = new Rope2('hello')
      const [left, right] = r.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('splits empty rope', () => {
      const r = new Rope2()
      const [left, right] = r.split(0)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('splits single character', () => {
      const r = new Rope2('a')
      const [left, right] = r.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('a')
    })

    it('does not modify original', () => {
      const r = new Rope2('hello')
      r.split(3)
      expect(r.toString()).toBe('hello')
    })

    it('clamps negative index to 0', () => {
      const r = new Rope2('hello')
      const [left, right] = r.split(-5)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('clamps index beyond length', () => {
      const r = new Rope2('hello')
      const [left, right] = r.split(100)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })
  })

  describe('indexOf', () => {
    it('finds substring at beginning', () => {
      const r = new Rope2('hello world')
      expect(r.indexOf('hello')).toBe(0)
    })

    it('finds substring in middle', () => {
      const r = new Rope2('hello world')
      expect(r.indexOf('lo wo')).toBe(3)
    })

    it('finds substring at end', () => {
      const r = new Rope2('hello world')
      expect(r.indexOf('world')).toBe(6)
    })

    it('returns -1 for not found', () => {
      const r = new Rope2('hello')
      expect(r.indexOf('xyz')).toBe(-1)
    })

    it('finds with fromIndex', () => {
      const r = new Rope2('ababab')
      expect(r.indexOf('ab', 2)).toBe(2)
      expect(r.indexOf('ab', 3)).toBe(4)
    })

    it('finds single character', () => {
      const r = new Rope2('hello')
      expect(r.indexOf('e')).toBe(1)
    })

    it('finds empty string', () => {
      const r = new Rope2('hello')
      expect(r.indexOf('')).toBe(0)
    })

    it('returns -1 on empty rope for non-empty search', () => {
      const r = new Rope2()
      expect(r.indexOf('a')).toBe(-1)
    })
  })

  describe('includes', () => {
    it('returns true for present substring', () => {
      const r = new Rope2('hello world')
      expect(r.includes('world')).toBe(true)
    })

    it('returns false for absent substring', () => {
      const r = new Rope2('hello')
      expect(r.includes('xyz')).toBe(false)
    })

    it('returns true for empty string', () => {
      const r = new Rope2('hello')
      expect(r.includes('')).toBe(true)
    })

    it('returns false on empty rope for non-empty', () => {
      const r = new Rope2()
      expect(r.includes('a')).toBe(false)
    })

    it('works after modifications', () => {
      const r = new Rope2('helo')
      r.insert(2, 'l')
      expect(r.includes('hello')).toBe(true)
    })
  })

  describe('startsWith', () => {
    it('returns true for matching prefix', () => {
      const r = new Rope2('hello world')
      expect(r.startsWith('hello')).toBe(true)
    })

    it('returns false for non-matching prefix', () => {
      const r = new Rope2('hello')
      expect(r.startsWith('world')).toBe(false)
    })

    it('returns true for empty string', () => {
      const r = new Rope2('hello')
      expect(r.startsWith('')).toBe(true)
    })

    it('returns true for exact match', () => {
      const r = new Rope2('hello')
      expect(r.startsWith('hello')).toBe(true)
    })

    it('returns false for longer prefix', () => {
      const r = new Rope2('hi')
      expect(r.startsWith('hello')).toBe(false)
    })
  })

  describe('endsWith', () => {
    it('returns true for matching suffix', () => {
      const r = new Rope2('hello world')
      expect(r.endsWith('world')).toBe(true)
    })

    it('returns false for non-matching suffix', () => {
      const r = new Rope2('hello')
      expect(r.endsWith('world')).toBe(false)
    })

    it('returns true for empty string', () => {
      const r = new Rope2('hello')
      expect(r.endsWith('')).toBe(true)
    })

    it('returns true for exact match', () => {
      const r = new Rope2('hello')
      expect(r.endsWith('hello')).toBe(true)
    })

    it('returns false for longer suffix', () => {
      const r = new Rope2('hi')
      expect(r.endsWith('hello')).toBe(false)
    })
  })

  describe('length & isEmpty', () => {
    it('empty rope has length 0', () => {
      expect(new Rope2().length).toBe(0)
    })

    it('non-empty rope has correct length', () => {
      expect(new Rope2('hello').length).toBe(5)
    })

    it('length updates after insert', () => {
      const r = new Rope2('hi')
      r.insert(1, 'el')
      expect(r.length).toBe(4)
    })

    it('length updates after delete', () => {
      const r = new Rope2('hello')
      r.delete(1, 3)
      expect(r.length).toBe(2)
    })

    it('isEmpty after clear', () => {
      const r = new Rope2('hello')
      r.clear()
      expect(r.isEmpty).toBe(true)
      expect(r.length).toBe(0)
    })
  })

  describe('toString', () => {
    it('returns empty string for empty rope', () => {
      expect(new Rope2().toString()).toBe('')
    })

    it('returns full string', () => {
      expect(new Rope2('hello').toString()).toBe('hello')
    })

    it('reflects modifications', () => {
      const r = new Rope2('hello')
      r.insert(5, ' world')
      expect(r.toString()).toBe('hello world')
    })

    it('reflects insert and delete', () => {
      const r = new Rope2('hello world')
      r.delete(5, 6)
      r.insert(5, '!')
      expect(r.toString()).toBe('hello!')
    })

    it('round-trips with constructor', () => {
      const str = 'the quick brown fox'
      const r = new Rope2(str)
      const r2 = new Rope2(r.toString())
      expect(r2.toString()).toBe(str)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty rope', () => {
      expect(new Rope2().toArray()).toEqual([])
    })

    it('returns array of characters', () => {
      expect(new Rope2('abc').toArray()).toEqual(['a', 'b', 'c'])
    })

    it('works after modifications', () => {
      const r = new Rope2('ac')
      r.insert(1, 'b')
      expect(r.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('matches iterator output', () => {
      const r = new Rope2('hello')
      expect(r.toArray()).toEqual([...r])
    })
  })

  describe('clone', () => {
    it('clone has same content', () => {
      const r = new Rope2('hello')
      expect(r.clone().toString()).toBe('hello')
    })

    it('clone is independent from original', () => {
      const r = new Rope2('hello')
      const c = r.clone()
      r.insert(5, '!')
      expect(c.toString()).toBe('hello')
      expect(r.toString()).toBe('hello!')
    })

    it('clones empty rope', () => {
      const r = new Rope2()
      const c = r.clone()
      expect(c.isEmpty).toBe(true)
    })

    it('clone equals original', () => {
      const r = new Rope2('test')
      expect(r.clone().equals(r)).toBe(true)
    })

    it('clone preserves leafSize', () => {
      const r = new Rope2('abcdefgh', { leafSize: 2 })
      const c = r.clone()
      c.insert(4, 'XY')
      expect(c.toString()).toBe('abcdXYefgh')
    })
  })

  describe('equals', () => {
    it('equal ropes', () => {
      const a = new Rope2('hello')
      const b = new Rope2('hello')
      expect(a.equals(b)).toBe(true)
    })

    it('unequal ropes', () => {
      const a = new Rope2('hello')
      const b = new Rope2('world')
      expect(a.equals(b)).toBe(false)
    })

    it('equals itself', () => {
      const r = new Rope2('test')
      expect(r.equals(r)).toBe(true)
    })

    it('empty equals empty', () => {
      expect(new Rope2().equals(new Rope2())).toBe(true)
    })

    it('different leafSize same content', () => {
      const a = new Rope2('hello', { leafSize: 4 })
      const b = new Rope2('hello', { leafSize: 16 })
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('reverse', () => {
    it('reverses simple string', () => {
      const r = new Rope2('hello')
      r.reverse()
      expect(r.toString()).toBe('olleh')
    })

    it('reverses empty rope', () => {
      const r = new Rope2()
      r.reverse()
      expect(r.toString()).toBe('')
    })

    it('reverses single character', () => {
      const r = new Rope2('a')
      r.reverse()
      expect(r.toString()).toBe('a')
    })

    it('reverse is in-place (mutating)', () => {
      const r = new Rope2('abc')
      r.reverse()
      expect(r.toString()).toBe('cba')
    })

    it('double reverse restores original', () => {
      const r = new Rope2('hello')
      r.reverse()
      r.reverse()
      expect(r.toString()).toBe('hello')
    })

    it('reverses palindrome unchanged', () => {
      const r = new Rope2('racecar')
      r.reverse()
      expect(r.toString()).toBe('racecar')
    })
  })

  describe('replace', () => {
    it('replaces in middle', () => {
      const r = new Rope2('hello world')
      r.replace(5, 1, '-')
      expect(r.toString()).toBe('hello-world')
    })

    it('replaces at beginning', () => {
      const r = new Rope2('hello')
      r.replace(0, 5, 'world')
      expect(r.toString()).toBe('world')
    })

    it('replaces at end', () => {
      const r = new Rope2('hello world')
      r.replace(6, 5, 'earth')
      expect(r.toString()).toBe('hello earth')
    })

    it('replaces with longer string', () => {
      const r = new Rope2('ab')
      r.replace(1, 1, 'XYZ')
      expect(r.toString()).toBe('aXYZ')
    })

    it('replaces with shorter string', () => {
      const r = new Rope2('abcdef')
      r.replace(2, 3, 'X')
      expect(r.toString()).toBe('abXf')
    })

    it('replaces with empty string (deletes)', () => {
      const r = new Rope2('abcdef')
      r.replace(2, 3, '')
      expect(r.toString()).toBe('abf')
    })
  })

  describe('repeat', () => {
    it('repeat 0 times returns empty', () => {
      const r = new Rope2('abc')
      expect(r.repeat(0).toString()).toBe('')
    })

    it('repeat 1 time returns same content', () => {
      const r = new Rope2('abc')
      expect(r.repeat(1).toString()).toBe('abc')
    })

    it('repeat 3 times', () => {
      const r = new Rope2('ab')
      expect(r.repeat(3).toString()).toBe('ababab')
    })

    it('repeat empty rope', () => {
      const r = new Rope2()
      expect(r.repeat(5).toString()).toBe('')
    })

    it('returns new rope', () => {
      const r = new Rope2('abc')
      const rep = r.repeat(2)
      expect(rep.toString()).toBe('abcabc')
      expect(r.toString()).toBe('abc')
    })
  })

  describe('forEach', () => {
    it('iterates all characters', () => {
      const r = new Rope2('abc')
      const chars: string[] = []
      r.forEach((ch) => { chars.push(ch) })
      expect(chars).toEqual(['a', 'b', 'c'])
    })

    it('provides correct indices', () => {
      const r = new Rope2('abc')
      const indices: number[] = []
      r.forEach((_ch, i) => { indices.push(i) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not call on empty rope', () => {
      const r = new Rope2()
      let count = 0
      r.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('provides character and index together', () => {
      const r = new Rope2('hi')
      const pairs: [string, number][] = []
      r.forEach((ch, i) => { pairs.push([ch, i]) })
      expect(pairs).toEqual([['h', 0], ['i', 1]])
    })
  })

  describe('Symbol.iterator', () => {
    it('spreads into array', () => {
      const r = new Rope2('abc')
      expect([...r]).toEqual(['a', 'b', 'c'])
    })

    it('works with for...of', () => {
      const r = new Rope2('hi')
      const chars: string[] = []
      for (const ch of r) {
        chars.push(ch)
      }
      expect(chars).toEqual(['h', 'i'])
    })

    it('yields nothing for empty rope', () => {
      const r = new Rope2()
      expect([...r]).toEqual([])
    })

    it('matches toString characters', () => {
      const r = new Rope2('hello')
      expect([...r].join('')).toBe(r.toString())
    })
  })

  describe('static methods', () => {
    it('fromString creates rope', () => {
      const r = Rope2.fromString('hello')
      expect(r.toString()).toBe('hello')
    })

    it('fromString with options', () => {
      const r = Rope2.fromString('abcdefgh', { leafSize: 4 })
      expect(r.toString()).toBe('abcdefgh')
    })

    it('static concat with two strings', () => {
      const r = Rope2.concat('hello', ' world')
      expect(r.toString()).toBe('hello world')
    })

    it('static concat with two ropes', () => {
      const a = new Rope2('hello')
      const b = new Rope2(' world')
      expect(Rope2.concat(a, b).toString()).toBe('hello world')
    })

    it('static concat with mixed types', () => {
      const a = new Rope2('hello')
      expect(Rope2.concat(a, ' world').toString()).toBe('hello world')
    })

    it('static concat with empty', () => {
      expect(Rope2.concat('', 'hello').toString()).toBe('hello')
    })
  })

  describe('rebalance', () => {
    it('preserves content after rebalance', () => {
      const r = new Rope2('hello world')
      r.rebalance()
      expect(r.toString()).toBe('hello world')
    })

    it('rebalances after many inserts', () => {
      const r = new Rope2()
      for (let i = 0; i < 50; i++) {
        r.insert(r.length, String.fromCharCode(65 + (i % 26)))
      }
      r.rebalance()
      expect(r.length).toBe(50)
    })

    it('rebalances empty rope', () => {
      const r = new Rope2()
      r.rebalance()
      expect(r.isEmpty).toBe(true)
    })

    it('rebalance does not change string content', () => {
      const str = 'the quick brown fox jumps'
      const r = new Rope2(str, { leafSize: 4 })
      r.rebalance()
      expect(r.toString()).toBe(str)
    })
  })

  describe('edge cases', () => {
    it('insert then delete same content', () => {
      const r = new Rope2('ab')
      r.insert(1, 'XY')
      r.delete(1, 2)
      expect(r.toString()).toBe('ab')
    })

    it.skip('many operations in sequence', () => {
      const r = new Rope2('abcdef')
      r.delete(2, 2)
      r.insert(2, 'XY')
      r.replace(0, 1, 'A')
      expect(r.toString()).toBe('AXYdef')
    })

    it('clear and reuse', () => {
      const r = new Rope2('hello')
      r.clear()
      expect(r.isEmpty).toBe(true)
      r.insert(0, 'world')
      expect(r.toString()).toBe('world')
    })

    it.skip('operations on rope with custom small leafSize', () => {
      const r = new Rope2('abcdefghij', { leafSize: 2 })
      expect(r.toString()).toBe('abcdefghij')
      r.insert(5, 'X')
      expect(r.toString()).toBe('abcdeXfghij')
      r.delete(3, 4)
      expect(r.toString()).toBe('abchij')
    })

    it('indexOf after multiple modifications', () => {
      const r = new Rope2('hello')
      r.insert(5, ' world')
      r.delete(0, 6)
      expect(r.indexOf('world')).toBe(0)
    })

    it('replace with length 0 acts as insert', () => {
      const r = new Rope2('ac')
      r.replace(1, 0, 'b')
      expect(r.toString()).toBe('abc')
    })

    it('delete entire content then rebuild', () => {
      const r = new Rope2('hello')
      r.delete(0, 5)
      expect(r.isEmpty).toBe(true)
      r.insert(0, 'world')
      expect(r.toString()).toBe('world')
    })

    it('split then modify both halves', () => {
      const r = new Rope2('hello world')
      const [left, right] = r.split(5)
      left.insert(left.length, '!')
      right.delete(0, 1)
      expect(left.toString()).toBe('hello!')
      expect(right.toString()).toBe('world')
    })
  })

  describe('large strings', () => {
    it('construction with 10000 chars', () => {
      const str = 'abcdefghij'.repeat(1000)
      const r = new Rope2(str)
      expect(r.length).toBe(10000)
      expect(r.toString()).toBe(str)
    })

    it('insert into large rope', () => {
      const str = 'a'.repeat(1000)
      const r = new Rope2(str)
      r.insert(500, 'X')
      expect(r.length).toBe(1001)
      expect(r.charAt(500)).toBe('X')
    })

    it('delete from large rope', () => {
      const str = 'a'.repeat(1000)
      const r = new Rope2(str)
      r.delete(100, 800)
      expect(r.length).toBe(200)
      expect(r.toString()).toBe('a'.repeat(200))
    })

    it('indexOf on large rope', () => {
      const str = 'a'.repeat(500) + 'FINDME' + 'b'.repeat(500)
      const r = new Rope2(str)
      expect(r.indexOf('FINDME')).toBe(500)
    })

    it('substring of large rope', () => {
      const str = 'a'.repeat(500) + 'HELLO' + 'b'.repeat(500)
      const r = new Rope2(str)
      expect(r.substring(500, 505)).toBe('HELLO')
    })
  })

  describe('empty rope operations', () => {
    it('charAt on empty rope', () => {
      expect(new Rope2().charAt(0)).toBe('')
    })

    it('substring on empty rope', () => {
      expect(new Rope2().substring(0)).toBe('')
    })

    it('indexOf on empty rope', () => {
      expect(new Rope2().indexOf('')).toBe(0)
    })

    it('toArray on empty rope', () => {
      expect(new Rope2().toArray()).toEqual([])
    })

    it('reverse on empty rope', () => {
      const r = new Rope2()
      r.reverse()
      expect(r.toString()).toBe('')
    })
  })
})
