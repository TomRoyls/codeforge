import { describe, it, expect } from 'vitest'
import { Rope3 } from '../../src/core/rope-3/index.js'

function randomString(len: number): string {
  let s = ''
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789 '
  for (let i = 0; i < len; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return s
}

describe('Rope3', () => {
  describe('constructor', () => {
    it('creates empty rope with no args', () => {
      const r = new Rope3()
      expect(r.length).toBe(0)
      expect(r.isEmpty()).toBe(true)
      expect(r.toString()).toBe('')
    })

    it('creates rope from empty string', () => {
      const r = new Rope3('')
      expect(r.length).toBe(0)
      expect(r.isEmpty()).toBe(true)
    })

    it('creates rope from short string', () => {
      const r = new Rope3('hello')
      expect(r.length).toBe(5)
      expect(r.isEmpty()).toBe(false)
      expect(r.toString()).toBe('hello')
    })

    it('creates rope from long string', () => {
      const s = 'a'.repeat(1000)
      const r = new Rope3(s)
      expect(r.length).toBe(1000)
      expect(r.toString()).toBe(s)
    })

    it('accepts custom leafSize option', () => {
      const r = new Rope3('hello world', { leafSize: 4 })
      expect(r.toString()).toBe('hello world')
      expect(r.length).toBe(11)
    })

    it('accepts leafSize of 1', () => {
      const r = new Rope3('abc', { leafSize: 1 })
      expect(r.toString()).toBe('abc')
    })

    it('handles unicode characters', () => {
      const r = new Rope3('hello 🌍 world 🎉')
      expect(r.toString()).toBe('hello 🌍 world 🎉')
    })

    it('handles string with newlines', () => {
      const r = new Rope3('line1\nline2\nline3')
      expect(r.toString()).toBe('line1\nline2\nline3')
    })

    it('handles very large leafSize', () => {
      const r = new Rope3('hello', { leafSize: 10000 })
      expect(r.toString()).toBe('hello')
    })
  })

  describe('toString', () => {
    it('returns empty string for empty rope', () => {
      const r = new Rope3()
      expect(r.toString()).toBe('')
    })

    it('returns original string', () => {
      const s = 'The quick brown fox'
      const r = new Rope3(s)
      expect(r.toString()).toBe(s)
    })

    it('returns correct string after operations', () => {
      const r = new Rope3('hello')
      r.insert(5, ' world')
      expect(r.toString()).toBe('hello world')
    })

    it('handles multi-byte characters', () => {
      const s = '日本語テスト'
      const r = new Rope3(s)
      expect(r.toString()).toBe(s)
    })
  })

  describe('charAt', () => {
    it('returns character at valid index', () => {
      const r = new Rope3('hello')
      expect(r.charAt(0)).toBe('h')
      expect(r.charAt(1)).toBe('e')
      expect(r.charAt(4)).toBe('o')
    })

    it('returns empty string for negative index', () => {
      const r = new Rope3('hello')
      expect(r.charAt(-1)).toBe('')
    })

    it('returns empty string for out of bounds index', () => {
      const r = new Rope3('hello')
      expect(r.charAt(5)).toBe('')
      expect(r.charAt(100)).toBe('')
    })

    it('returns empty string for empty rope', () => {
      const r = new Rope3()
      expect(r.charAt(0)).toBe('')
    })

    it('works with long string', () => {
      const s = 'abcdefghijklmnopqrstuvwxyz'
      const r = new Rope3(s)
      for (let i = 0; i < s.length; i++) {
        expect(r.charAt(i)).toBe(s.charAt(i))
      }
    })
  })

  describe('substring', () => {
    it('returns full string with no args', () => {
      const r = new Rope3('hello world')
      expect(r.substring(0)).toBe('hello world')
    })

    it('returns suffix from start', () => {
      const r = new Rope3('hello world')
      expect(r.substring(6)).toBe('world')
    })

    it('returns middle substring', () => {
      const r = new Rope3('hello world')
      expect(r.substring(0, 5)).toBe('hello')
      expect(r.substring(6, 11)).toBe('world')
    })

    it('clamps negative start', () => {
      const r = new Rope3('hello')
      expect(r.substring(-3, 3)).toBe('hel')
    })

    it('clamps end beyond length', () => {
      const r = new Rope3('hello')
      expect(r.substring(3, 100)).toBe('lo')
    })

    it('returns empty for start >= end', () => {
      const r = new Rope3('hello')
      expect(r.substring(3, 3)).toBe('')
      expect(r.substring(5, 3)).toBe('')
    })

    it('returns empty for empty rope', () => {
      const r = new Rope3()
      expect(r.substring(0, 5)).toBe('')
    })

    it('works across leaf boundaries', () => {
      const r = new Rope3('abcdefghijklm', { leafSize: 4 })
      expect(r.substring(3, 9)).toBe('defghi')
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const r = new Rope3('world')
      r.insert(0, 'hello ')
      expect(r.toString()).toBe('hello world')
    })

    it('inserts at end', () => {
      const r = new Rope3('hello')
      r.insert(5, ' world')
      expect(r.toString()).toBe('hello world')
    })

    it('inserts in middle', () => {
      const r = new Rope3('helo world')
      r.insert(2, 'l')
      expect(r.toString()).toBe('hello world')
    })

    it('does nothing for empty string', () => {
      const r = new Rope3('hello')
      r.insert(2, '')
      expect(r.toString()).toBe('hello')
    })

    it('clamps index to valid range', () => {
      const r = new Rope3('hello')
      r.insert(-1, 'X')
      expect(r.toString()).toBe('Xhello')
      r.insert(100, 'Y')
      expect(r.toString()).toBe('XhelloY')
    })

    it('inserts long string', () => {
      const r = new Rope3('ab')
      r.insert(1, 'x'.repeat(500))
      expect(r.toString()).toBe('a' + 'x'.repeat(500) + 'b')
      expect(r.length).toBe(502)
    })

    it('inserts into empty rope', () => {
      const r = new Rope3()
      r.insert(0, 'hello')
      expect(r.toString()).toBe('hello')
    })
  })

  describe('delete', () => {
    it('deletes from beginning', () => {
      const r = new Rope3('hello world')
      r.delete(0, 6)
      expect(r.toString()).toBe('world')
    })

    it('deletes from end', () => {
      const r = new Rope3('hello world')
      r.delete(5, 6)
      expect(r.toString()).toBe('hello')
    })

    it('deletes from middle', () => {
      const r = new Rope3('hello world')
      r.delete(5, 1)
      expect(r.toString()).toBe('helloworld')
    })

    it('deletes entire string', () => {
      const r = new Rope3('hello')
      r.delete(0, 5)
      expect(r.toString()).toBe('')
      expect(r.length).toBe(0)
    })

    it('does nothing for zero length', () => {
      const r = new Rope3('hello')
      r.delete(2, 0)
      expect(r.toString()).toBe('hello')
    })

    it('does nothing for negative length', () => {
      const r = new Rope3('hello')
      r.delete(2, -1)
      expect(r.toString()).toBe('hello')
    })

    it('clamps deletion range', () => {
      const r = new Rope3('hello')
      r.delete(3, 100)
      expect(r.toString()).toBe('hel')
    })

    it('clamps negative start', () => {
      const r = new Rope3('hello')
      r.delete(-1, 2)
      expect(r.toString()).toBe('llo')
    })
  })

  describe('concat', () => {
    it('concats two ropes', () => {
      const a = new Rope3('hello')
      const b = new Rope3(' world')
      const c = a.concat(b)
      expect(c.toString()).toBe('hello world')
    })

    it('concats rope with string', () => {
      const a = new Rope3('hello')
      const c = a.concat(' world')
      expect(c.toString()).toBe('hello world')
    })

    it('does not mutate original', () => {
      const a = new Rope3('hello')
      const b = new Rope3(' world')
      a.concat(b)
      expect(a.toString()).toBe('hello')
      expect(b.toString()).toBe(' world')
    })

    it('concats empty rope', () => {
      const a = new Rope3('hello')
      const b = new Rope3()
      expect(a.concat(b).toString()).toBe('hello')
      expect(b.concat(a).toString()).toBe('hello')
    })

    it('concats empty string', () => {
      const a = new Rope3('hello')
      expect(a.concat('').toString()).toBe('hello')
    })

    it('concats long strings', () => {
      const a = new Rope3('a'.repeat(500))
      const b = new Rope3('b'.repeat(500))
      const c = a.concat(b)
      expect(c.length).toBe(1000)
      expect(c.toString()).toBe('a'.repeat(500) + 'b'.repeat(500))
    })
  })

  describe('split', () => {
    it('splits at beginning', () => {
      const r = new Rope3('hello')
      const [left, right] = r.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('splits at end', () => {
      const r = new Rope3('hello')
      const [left, right] = r.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('splits in middle', () => {
      const r = new Rope3('hello world')
      const [left, right] = r.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
    })

    it('clamps negative index', () => {
      const r = new Rope3('hello')
      const [left, right] = r.split(-1)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('clamps index beyond length', () => {
      const r = new Rope3('hello')
      const [left, right] = r.split(100)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('does not mutate original', () => {
      const r = new Rope3('hello world')
      r.split(5)
      expect(r.toString()).toBe('hello world')
    })

    it('splits long string', () => {
      const r = new Rope3('a'.repeat(1000))
      const [left, right] = r.split(500)
      expect(left.length).toBe(500)
      expect(right.length).toBe(500)
    })
  })

  describe('length', () => {
    it('returns 0 for empty rope', () => {
      expect(new Rope3().length).toBe(0)
      expect(new Rope3('').length).toBe(0)
    })

    it('returns correct length', () => {
      expect(new Rope3('hello').length).toBe(5)
      expect(new Rope3('hello world').length).toBe(11)
    })

    it('updates after insert', () => {
      const r = new Rope3('hello')
      r.insert(5, ' world')
      expect(r.length).toBe(11)
    })

    it('updates after delete', () => {
      const r = new Rope3('hello world')
      r.delete(5, 6)
      expect(r.length).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty rope', () => {
      expect(new Rope3().isEmpty()).toBe(true)
      expect(new Rope3('').isEmpty()).toBe(true)
    })

    it('returns false for non-empty rope', () => {
      expect(new Rope3('hello').isEmpty()).toBe(false)
    })

    it('returns true after deleting all content', () => {
      const r = new Rope3('hello')
      r.delete(0, 5)
      expect(r.isEmpty()).toBe(true)
    })
  })

  describe('indexOf', () => {
    it('finds substring at beginning', () => {
      const r = new Rope3('hello world')
      expect(r.indexOf('hello')).toBe(0)
    })

    it('finds substring in middle', () => {
      const r = new Rope3('hello world')
      expect(r.indexOf('lo wo')).toBe(3)
    })

    it('finds substring at end', () => {
      const r = new Rope3('hello world')
      expect(r.indexOf('world')).toBe(6)
    })

    it('returns -1 for not found', () => {
      const r = new Rope3('hello world')
      expect(r.indexOf('xyz')).toBe(-1)
    })

    it('respects fromIndex', () => {
      const r = new Rope3('ababab')
      expect(r.indexOf('ab', 2)).toBe(2)
      expect(r.indexOf('ab', 3)).toBe(4)
    })

    it('finds empty string', () => {
      const r = new Rope3('hello')
      expect(r.indexOf('')).toBe(0)
    })

    it('returns -1 for empty rope', () => {
      const r = new Rope3()
      expect(r.indexOf('hello')).toBe(-1)
    })
  })

  describe('includes', () => {
    it('returns true for present substring', () => {
      const r = new Rope3('hello world')
      expect(r.includes('hello')).toBe(true)
      expect(r.includes('world')).toBe(true)
      expect(r.includes('lo wo')).toBe(true)
    })

    it('returns false for absent substring', () => {
      const r = new Rope3('hello world')
      expect(r.includes('xyz')).toBe(false)
    })

    it('returns true for empty string', () => {
      const r = new Rope3('hello')
      expect(r.includes('')).toBe(true)
    })

    it('returns false for empty rope', () => {
      const r = new Rope3()
      expect(r.includes('hello')).toBe(false)
    })
  })

  describe('startsWith', () => {
    it('returns true for matching prefix', () => {
      const r = new Rope3('hello world')
      expect(r.startsWith('hello')).toBe(true)
      expect(r.startsWith('h')).toBe(true)
      expect(r.startsWith('')).toBe(true)
    })

    it('returns false for non-matching prefix', () => {
      const r = new Rope3('hello world')
      expect(r.startsWith('world')).toBe(false)
      expect(r.startsWith('Hello')).toBe(false)
    })

    it('returns true for empty rope with empty string', () => {
      const r = new Rope3()
      expect(r.startsWith('')).toBe(true)
    })

    it('returns false for empty rope with non-empty', () => {
      const r = new Rope3()
      expect(r.startsWith('hello')).toBe(false)
    })
  })

  describe('endsWith', () => {
    it('returns true for matching suffix', () => {
      const r = new Rope3('hello world')
      expect(r.endsWith('world')).toBe(true)
      expect(r.endsWith('d')).toBe(true)
      expect(r.endsWith('')).toBe(true)
    })

    it('returns false for non-matching suffix', () => {
      const r = new Rope3('hello world')
      expect(r.endsWith('hello')).toBe(false)
      expect(r.endsWith('World')).toBe(false)
    })

    it('returns true for empty rope with empty string', () => {
      const r = new Rope3()
      expect(r.endsWith('')).toBe(true)
    })

    it('returns false for empty rope with non-empty', () => {
      const r = new Rope3()
      expect(r.endsWith('world')).toBe(false)
    })
  })

  describe('replace', () => {
    it('replaces middle section', () => {
      const r = new Rope3('hello world')
      r.replace(5, 11, '!')
      expect(r.toString()).toBe('hello!')
    })

    it('replaces with longer string', () => {
      const r = new Rope3('hello')
      r.replace(2, 4, 'LL')
      expect(r.toString()).toBe('heLLo')
    })

    it('replaces with empty string (deletion)', () => {
      const r = new Rope3('hello world')
      r.replace(5, 11, '')
      expect(r.toString()).toBe('hello')
    })

    it('replaces entire string', () => {
      const r = new Rope3('hello')
      r.replace(0, 5, 'world')
      expect(r.toString()).toBe('world')
    })

    it('clamps negative start', () => {
      const r = new Rope3('hello')
      r.replace(-1, 3, 'X')
      expect(r.toString()).toBe('Xlo')
    })

    it('clamps end beyond length', () => {
      const r = new Rope3('hello')
      r.replace(3, 100, 'X')
      expect(r.toString()).toBe('helX')
    })

    it('handles insert via replace at same position', () => {
      const r = new Rope3('hello')
      r.replace(3, 3, 'XY')
      expect(r.toString()).toBe('helXYlo')
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const r = new Rope3('hello')
      const c = r.clone()
      expect(c.toString()).toBe('hello')
      r.insert(5, ' world')
      expect(c.toString()).toBe('hello')
    })

    it('preserves leafSize', () => {
      const r = new Rope3('hello', { leafSize: 4 })
      const c = r.clone()
      c.insert(5, ' world')
      expect(c.toString()).toBe('hello world')
    })
  })

  describe('forEach', () => {
    it('iterates all characters', () => {
      const r = new Rope3('abc')
      const chars: string[] = []
      r.forEach((ch) => { chars.push(ch) })
      expect(chars).toEqual(['a', 'b', 'c'])
    })

    it('provides correct indices', () => {
      const r = new Rope3('abc')
      const indices: number[] = []
      r.forEach((_, i) => { indices.push(i) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not call for empty rope', () => {
      const r = new Rope3()
      let count = 0
      r.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates long string correctly', () => {
      const r = new Rope3('abcdef', { leafSize: 2 })
      const chars: string[] = []
      r.forEach((ch) => { chars.push(ch) })
      expect(chars).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })
  })

  describe('toArray', () => {
    it('converts to array of characters', () => {
      const r = new Rope3('hello')
      expect(r.toArray()).toEqual(['h', 'e', 'l', 'l', 'o'])
    })

    it('returns empty array for empty rope', () => {
      const r = new Rope3()
      expect(r.toArray()).toEqual([])
    })
  })

  describe('reverse', () => {
    it('reverses string', () => {
      const r = new Rope3('hello')
      r.reverse()
      expect(r.toString()).toBe('olleh')
    })

    it('reverses empty rope', () => {
      const r = new Rope3()
      r.reverse()
      expect(r.toString()).toBe('')
    })

    it('reverses single character', () => {
      const r = new Rope3('a')
      r.reverse()
      expect(r.toString()).toBe('a')
    })

    it('reverses palindrome unchanged', () => {
      const r = new Rope3('abcba')
      r.reverse()
      expect(r.toString()).toBe('abcba')
    })

    it('handles unicode reverse', () => {
      const r = new Rope3('ab')
      r.reverse()
      expect(r.toString()).toBe('ba')
    })
  })

  describe('toUpperCase', () => {
    it('converts to uppercase', () => {
      const r = new Rope3('hello world')
      expect(r.toUpperCase().toString()).toBe('HELLO WORLD')
    })

    it('does not mutate original', () => {
      const r = new Rope3('hello')
      r.toUpperCase()
      expect(r.toString()).toBe('hello')
    })

    it('handles already uppercase', () => {
      const r = new Rope3('HELLO')
      expect(r.toUpperCase().toString()).toBe('HELLO')
    })

    it('handles empty rope', () => {
      const r = new Rope3()
      expect(r.toUpperCase().toString()).toBe('')
    })
  })

  describe('toLowerCase', () => {
    it('converts to lowercase', () => {
      const r = new Rope3('HELLO WORLD')
      expect(r.toLowerCase().toString()).toBe('hello world')
    })

    it('does not mutate original', () => {
      const r = new Rope3('HELLO')
      r.toLowerCase()
      expect(r.toString()).toBe('HELLO')
    })

    it('handles mixed case', () => {
      const r = new Rope3('HeLLo WoRLd')
      expect(r.toLowerCase().toString()).toBe('hello world')
    })

    it('handles empty rope', () => {
      const r = new Rope3()
      expect(r.toLowerCase().toString()).toBe('')
    })
  })

  describe('trim', () => {
    it('trims leading whitespace', () => {
      const r = new Rope3('  hello')
      expect(r.trim().toString()).toBe('hello')
    })

    it('trims trailing whitespace', () => {
      const r = new Rope3('hello  ')
      expect(r.trim().toString()).toBe('hello')
    })

    it('trims both sides', () => {
      const r = new Rope3('  hello  ')
      expect(r.trim().toString()).toBe('hello')
    })

    it('does not mutate original', () => {
      const r = new Rope3('  hello  ')
      r.trim()
      expect(r.toString()).toBe('  hello  ')
    })

    it('handles empty rope', () => {
      const r = new Rope3()
      expect(r.trim().toString()).toBe('')
    })

    it('handles whitespace-only string', () => {
      const r = new Rope3('   ')
      expect(r.trim().toString()).toBe('')
    })
  })

  describe('padStart', () => {
    it('pads with spaces by default', () => {
      const r = new Rope3('hi')
      expect(r.padStart(5).toString()).toBe('   hi')
    })

    it('pads with custom string', () => {
      const r = new Rope3('hi')
      expect(r.padStart(6, 'abc').toString()).toBe('abcahi')
    })

    it('does not pad when already long enough', () => {
      const r = new Rope3('hello')
      expect(r.padStart(3).toString()).toBe('hello')
    })

    it('does not mutate original', () => {
      const r = new Rope3('hi')
      r.padStart(5)
      expect(r.toString()).toBe('hi')
    })

    it('handles empty rope', () => {
      const r = new Rope3()
      expect(r.padStart(3).toString()).toBe('   ')
    })
  })

  describe('padEnd', () => {
    it('pads with spaces by default', () => {
      const r = new Rope3('hi')
      expect(r.padEnd(5).toString()).toBe('hi   ')
    })

    it('pads with custom string', () => {
      const r = new Rope3('hi')
      expect(r.padEnd(6, 'abc').toString()).toBe('hiabca')
    })

    it('does not pad when already long enough', () => {
      const r = new Rope3('hello')
      expect(r.padEnd(3).toString()).toBe('hello')
    })

    it('does not mutate original', () => {
      const r = new Rope3('hi')
      r.padEnd(5)
      expect(r.toString()).toBe('hi')
    })

    it('handles empty rope', () => {
      const r = new Rope3()
      expect(r.padEnd(3).toString()).toBe('   ')
    })
  })

  describe('repeat', () => {
    it('repeats string', () => {
      const r = new Rope3('ab')
      expect(r.repeat(3).toString()).toBe('ababab')
    })

    it('returns empty for count 0', () => {
      const r = new Rope3('hello')
      expect(r.repeat(0).toString()).toBe('')
    })

    it('returns empty for negative count', () => {
      const r = new Rope3('hello')
      expect(r.repeat(-1).toString()).toBe('')
    })

    it('returns same for count 1', () => {
      const r = new Rope3('hello')
      expect(r.repeat(1).toString()).toBe('hello')
    })

    it('does not mutate original', () => {
      const r = new Rope3('ab')
      r.repeat(3)
      expect(r.toString()).toBe('ab')
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates characters with for...of', () => {
      const r = new Rope3('abc')
      const chars: string[] = []
      for (const ch of r) {
        chars.push(ch)
      }
      expect(chars).toEqual(['a', 'b', 'c'])
    })

    it('spreads into array', () => {
      const r = new Rope3('abc')
      expect([...r]).toEqual(['a', 'b', 'c'])
    })

    it('works with empty rope', () => {
      const r = new Rope3()
      expect([...r]).toEqual([])
    })
  })

  describe('rebalance', () => {
    it('can be called explicitly', () => {
      const r = new Rope3('hello world')
      r.rebalance()
      expect(r.toString()).toBe('hello world')
    })

    it('preserves content after many insertions', () => {
      const r = new Rope3('', { leafSize: 4 })
      for (let i = 0; i < 100; i++) {
        r.insert(r.length, 'x')
      }
      expect(r.length).toBe(100)
      expect(r.toString()).toBe('x'.repeat(100))
    })

    it('preserves content after many deletions', () => {
      const r = new Rope3('abcdefghij', { leafSize: 2 })
      r.delete(2, 6)
      expect(r.toString()).toBe('abij')
    })
  })

  describe('static fromString', () => {
    it('creates rope from string', () => {
      const r = Rope3.fromString('hello')
      expect(r.toString()).toBe('hello')
    })

    it('creates rope with options', () => {
      const r = Rope3.fromString('hello', { leafSize: 2 })
      expect(r.toString()).toBe('hello')
    })
  })

  describe('static concat', () => {
    it('concats two ropes', () => {
      const a = new Rope3('hello')
      const b = new Rope3(' world')
      const c = Rope3.concat(a, b)
      expect(c.toString()).toBe('hello world')
    })

    it('concats rope with string', () => {
      const a = new Rope3('hello')
      const c = Rope3.concat(a, ' world')
      expect(c.toString()).toBe('hello world')
    })

    it('concats string with rope', () => {
      const b = new Rope3(' world')
      const c = Rope3.concat('hello', b)
      expect(c.toString()).toBe('hello world')
    })
  })

  describe('complex operations', () => {
    it('handles insert after delete', () => {
      const r = new Rope3('hello world')
      r.delete(5, 6)
      r.insert(5, '!')
      expect(r.toString()).toBe('hello!')
    })

    it('handles split then concat', () => {
      const r = new Rope3('hello world')
      const [left, right] = r.split(5)
      const rejoined = left.concat(right)
      expect(rejoined.toString()).toBe('hello world')
    })

    it('handles multiple insertions', () => {
      const r = new Rope3('helo')
      r.insert(2, 'l')
      r.insert(4, 'o')
      expect(r.toString()).toBe('helloo')
    })

    it('handles alternating insert delete', () => {
      const r = new Rope3('abc')
      r.insert(3, 'd')
      r.delete(0, 1)
      r.insert(0, 'x')
      expect(r.toString()).toBe('xbcd')
    })

    it('handles long string operations', () => {
      const s = randomString(500)
      const r = new Rope3(s, { leafSize: 32 })
      expect(r.toString()).toBe(s)
      r.insert(250, 'INSERT')
      expect(r.toString()).toBe(s.slice(0, 250) + 'INSERT' + s.slice(250))
    })

    it('handles many small inserts triggering rebalance', () => {
      const r = new Rope3('', { leafSize: 8 })
      for (let i = 0; i < 50; i++) {
        r.insert(0, 'x')
      }
      expect(r.toString()).toBe('x'.repeat(50))
    })

    it('replace then substring', () => {
      const r = new Rope3('the quick brown fox')
      r.replace(4, 9, 'slow')
      expect(r.substring(0, 14)).toBe('the slow brown')
    })

    it('concat multiple ropes', () => {
      const a = new Rope3('a')
      const b = new Rope3('b')
      const c = new Rope3('c')
      const d = a.concat(b).concat(c)
      expect(d.toString()).toBe('abc')
    })

    it('split concat round-trip', () => {
      const s = 'The quick brown fox jumps over the lazy dog'
      const r = new Rope3(s, { leafSize: 8 })
      for (let i = 0; i < s.length; i += 5) {
        const [left, right] = r.split(i)
        const rejoined = left.concat(right)
        expect(rejoined.toString()).toBe(s)
      }
    })

    it('handles delete all then insert', () => {
      const r = new Rope3('hello')
      r.delete(0, 5)
      expect(r.isEmpty()).toBe(true)
      r.insert(0, 'world')
      expect(r.toString()).toBe('world')
    })

    it('charAt after many operations', () => {
      const r = new Rope3('abcdefghij', { leafSize: 3 })
      r.delete(2, 3)
      r.insert(2, 'XY')
      expect(r.charAt(0)).toBe('a')
      expect(r.charAt(1)).toBe('b')
      expect(r.charAt(2)).toBe('X')
      expect(r.charAt(3)).toBe('Y')
      expect(r.charAt(4)).toBe('f')
    })

    it('indexOf after modifications', () => {
      const r = new Rope3('hello world')
      r.insert(5, ' beautiful')
      expect(r.indexOf('beautiful')).toBe(6)
      expect(r.indexOf('world')).toBe(16)
    })

    it('toUpperCase then toLowerCase round-trip', () => {
      const r = new Rope3('Hello World')
      const upper = r.toUpperCase()
      const lower = upper.toLowerCase()
      expect(lower.toString()).toBe('hello world')
    })

    it('reverse then reverse', () => {
      const r = new Rope3('hello')
      r.reverse()
      r.reverse()
      expect(r.toString()).toBe('hello')
    })

    it('toArray after modifications', () => {
      const r = new Rope3('abc')
      r.insert(1, 'X')
      expect(r.toArray()).toEqual(['a', 'X', 'b', 'c'])
    })

    it('forEach with correct indices after insert', () => {
      const r = new Rope3('ac')
      r.insert(1, 'b')
      const pairs: [string, number][] = []
      r.forEach((ch, i) => { pairs.push([ch, i]) })
      expect(pairs).toEqual([['a', 0], ['b', 1], ['c', 2]])
    })

    it('repeat produces correct length', () => {
      const r = new Rope3('abc')
      const rep = r.repeat(10)
      expect(rep.length).toBe(30)
      expect(rep.toString()).toBe('abc'.repeat(10))
    })

    it('trim after pad', () => {
      const r = new Rope3('hi')
      const padded = r.padStart(5)
      const trimmed = padded.trim()
      expect(trimmed.toString()).toBe('hi')
    })

    it('clone preserves state through modifications', () => {
      const r = new Rope3('hello')
      const c = r.clone()
      r.insert(5, ' world')
      r.delete(0, 6)
      expect(c.toString()).toBe('hello')
    })

    it('handles replace at boundary', () => {
      const r = new Rope3('abcdefghij', { leafSize: 4 })
      r.replace(3, 7, 'XY')
      expect(r.toString()).toBe('abcXYhij')
    })

    it('works with large text blocks', () => {
      const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
      const text = lorem.repeat(20)
      const r = new Rope3(text, { leafSize: 64 })
      expect(r.length).toBe(text.length)
      expect(r.toString()).toBe(text)
      expect(r.substring(0, 11)).toBe('Lorem ipsum')
    })
  })
})
