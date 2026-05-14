import { describe, it, expect } from 'vitest'
import { TaggedUnion2 } from '../src/core/tagged-union-2/index.js'

describe('TaggedUnion2', () => {
  describe('static of', () => {
    it('creates a tagged union with custom tag and value', () => {
      const result = TaggedUnion2.of('custom', 42)
      expect(result.getTag()).toBe('custom')
      expect(result.getValue()).toBe(42)
    })

    it('creates a tagged union with undefined value', () => {
      const result = TaggedUnion2.of('maybe', undefined)
      expect(result.getTag()).toBe('maybe')
      expect(result.getValue()).toBeUndefined()
    })
  })

  describe('static just', () => {
    it('creates a just variant', () => {
      const result = TaggedUnion2.just(42)
      expect(result.getTag()).toBe('just')
      expect(result.getValue()).toBe(42)
    })

    it('creates a just with null value', () => {
      const result = TaggedUnion2.just(null)
      expect(result.getTag()).toBe('just')
      expect(result.getValue()).toBe(null)
    })
  })

  describe('static nothing', () => {
    it('creates a nothing variant', () => {
      const result = TaggedUnion2.nothing<number>()
      expect(result.getTag()).toBe('nothing')
      expect(result.getValue()).toBeUndefined()
    })
  })

  describe('static left', () => {
    it('creates a left variant', () => {
      const result = TaggedUnion2.left('error')
      expect(result.getTag()).toBe('left')
      expect(result.getValue()).toBe('error')
    })
  })

  describe('static right', () => {
    it('creates a right variant', () => {
      const result = TaggedUnion2.right(42)
      expect(result.getTag()).toBe('right')
      expect(result.getValue()).toBe(42)
    })
  })

  describe('getTag', () => {
    it('returns the tag for just', () => {
      const result = TaggedUnion2.just(1)
      expect(result.getTag()).toBe('just')
    })

    it('returns the tag for nothing', () => {
      const result = TaggedUnion2.nothing<number>()
      expect(result.getTag()).toBe('nothing')
    })

    it('returns the tag for left', () => {
      const result = TaggedUnion2.left(1)
      expect(result.getTag()).toBe('left')
    })

    it('returns the tag for right', () => {
      const result = TaggedUnion2.right(1)
      expect(result.getTag()).toBe('right')
    })
  })

  describe('getValue', () => {
    it('returns the value for just', () => {
      const result = TaggedUnion2.just(42)
      expect(result.getValue()).toBe(42)
    })

    it('returns undefined for nothing', () => {
      const result = TaggedUnion2.nothing<number>()
      expect(result.getValue()).toBeUndefined()
    })

    it('returns the value for left', () => {
      const result = TaggedUnion2.left('error')
      expect(result.getValue()).toBe('error')
    })

    it('returns the value for right', () => {
      const result = TaggedUnion2.right('success')
      expect(result.getValue()).toBe('success')
    })

    it('handles null value', () => {
      const result = TaggedUnion2.just(null)
      expect(result.getValue()).toBe(null)
    })
  })

  describe('is', () => {
    it('returns true for matching tag', () => {
      const result = TaggedUnion2.just(42)
      expect(result.is('just')).toBe(true)
    })

    it('returns false for non-matching tag', () => {
      const result = TaggedUnion2.just(42)
      expect(result.is('nothing')).toBe(false)
    })
  })

  describe('match', () => {
    it('calls correct handler for just', () => {
      const result = TaggedUnion2.just(42)
      const value = result.match({
        just: (v) => v as number * 2,
        nothing: () => 0
      })
      expect(value).toBe(84)
    })

    it('calls correct handler for nothing', () => {
      const result = TaggedUnion2.nothing<number>()
      const value = result.match({
        just: (v) => v as number * 2,
        nothing: () => 0
      })
      expect(value).toBe(0)
    })

    it('calls correct handler for left', () => {
      const result = TaggedUnion2.left('error')
      const value = result.match({
        left: (v) => `Error: ${v as string}`,
        right: (v) => `Success: ${v as number}`
      })
      expect(value).toBe('Error: error')
    })

    it('calls correct handler for right', () => {
      const result = TaggedUnion2.right(42)
      const value = result.match({
        left: (v) => `Error: ${v as string}`,
        right: (v) => `Success: ${v as number}`
      })
      expect(value).toBe('Success: 42')
    })

    it('throws error for missing handler', () => {
      const result = TaggedUnion2.of('custom', 42)
      expect(() => {
        result.match({
          just: () => 1,
          nothing: () => 0
        })
      }).toThrow('No handler for tag: custom')
    })
  })

  describe('map', () => {
    it('maps value for just', () => {
      const result = TaggedUnion2.just(42).map((x) => x * 2)
      expect(result.getTag()).toBe('just')
      expect(result.getValue()).toBe(84)
    })

    it('preserves nothing variant', () => {
      const result = TaggedUnion2.nothing<number>().map((x) => x * 2)
      expect(result.getTag()).toBe('nothing')
      expect(result.getValue()).toBeUndefined()
    })

    it('maps value for left', () => {
      const result = TaggedUnion2.left('error').map((x) => x.toUpperCase())
      expect(result.getTag()).toBe('left')
      expect(result.getValue()).toBe('ERROR')
    })

    it('maps value for right', () => {
      const result = TaggedUnion2.right(42).map((x) => x * 2)
      expect(result.getTag()).toBe('right')
      expect(result.getValue()).toBe(84)
    })

    it('preserves tag for custom tags', () => {
      const result = TaggedUnion2.of('custom', 42).map((x) => x * 2)
      expect(result.getTag()).toBe('custom')
      expect(result.getValue()).toBe(84)
    })
  })

  describe('flatMap', () => {
    it('flatMaps value for just', () => {
      const result = TaggedUnion2.just(42).flatMap((x) => TaggedUnion2.just(x * 2))
      expect(result.getTag()).toBe('just')
      expect(result.getValue()).toBe(84)
    })

    it('flatMaps to different tag for just', () => {
      const result = TaggedUnion2.just(42).flatMap((x) => TaggedUnion2.right(x * 2))
      expect(result.getTag()).toBe('right')
      expect(result.getValue()).toBe(84)
    })

    it('preserves nothing variant', () => {
      const result = TaggedUnion2.nothing<number>().flatMap((x) => TaggedUnion2.just(x * 2))
      expect(result.getTag()).toBe('nothing')
      expect(result.getValue()).toBeUndefined()
    })

    it('flatMaps value for left', () => {
      const result = TaggedUnion2.left(42).flatMap((x) => TaggedUnion2.right(x * 2))
      expect(result.getTag()).toBe('right')
      expect(result.getValue()).toBe(84)
    })

    it('flatMaps value for right', () => {
      const result = TaggedUnion2.right(42).flatMap((x) => TaggedUnion2.just(x * 2))
      expect(result.getTag()).toBe('just')
      expect(result.getValue()).toBe(84)
    })
  })

  describe('getOrElse', () => {
    it('returns value for just', () => {
      const result = TaggedUnion2.just(42).getOrElse(0)
      expect(result).toBe(42)
    })

    it('returns default for nothing', () => {
      const result = TaggedUnion2.nothing<number>().getOrElse(0)
      expect(result).toBe(0)
    })

    it('returns value for left', () => {
      const result = TaggedUnion2.left('error').getOrElse('default')
      expect(result).toBe('error')
    })

    it('returns value for right', () => {
      const result = TaggedUnion2.right(42).getOrElse(0)
      expect(result).toBe(42)
    })

    it('handles null value', () => {
      const result = TaggedUnion2.just<string | null>(null).getOrElse('default')
      expect(result).toBe(null)
    })
  })

  describe('equals', () => {
    it('returns true for identical just values', () => {
      const a = TaggedUnion2.just(42)
      const b = TaggedUnion2.just(42)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different just values', () => {
      const a = TaggedUnion2.just(42)
      const b = TaggedUnion2.just(43)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different tags with same value', () => {
      const a = TaggedUnion2.just(42)
      const b = TaggedUnion2.right(42)
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for identical nothing values', () => {
      const a = TaggedUnion2.nothing<number>()
      const b = TaggedUnion2.nothing<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('returns true for identical left values', () => {
      const a = TaggedUnion2.left('error')
      const b = TaggedUnion2.left('error')
      expect(a.equals(b)).toBe(true)
    })

    it('returns true for identical right values', () => {
      const a = TaggedUnion2.right(42)
      const b = TaggedUnion2.right(42)
      expect(a.equals(b)).toBe(true)
    })

    it('returns true for identical custom tags', () => {
      const a = TaggedUnion2.of('custom', 42)
      const b = TaggedUnion2.of('custom', 42)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different custom tag values', () => {
      const a = TaggedUnion2.of('custom', 42)
      const b = TaggedUnion2.of('custom', 43)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles chaining map operations', () => {
      const result = TaggedUnion2.just(2)
        .map((x) => x * 2)
        .map((x) => x + 10)
        .map((x) => x.toString())
      expect(result.getTag()).toBe('just')
      expect(result.getValue()).toBe('14')
    })

    it('handles chaining flatMap operations', () => {
      const result = TaggedUnion2.just(2)
        .flatMap((x) => TaggedUnion2.just(x * 2))
        .flatMap((x) => TaggedUnion2.right(x + 10))
        .flatMap((x) => TaggedUnion2.just(x as number * 2))
      expect(result.getTag()).toBe('just')
      expect(result.getValue()).toBe(28)
    })

    it('handles chaining mixed map and flatMap', () => {
      const result = TaggedUnion2.just(2)
        .map((x) => x * 2)
        .flatMap((x) => TaggedUnion2.right(x + 10))
        .map((x) => x * 2)
      expect(result.getTag()).toBe('right')
      expect(result.getValue()).toBe(28)
    })

    it('preserves nothing through chaining', () => {
      const result = TaggedUnion2.nothing<number>()
        .map((x) => x * 2)
        .flatMap((x) => TaggedUnion2.just(x + 10))
        .map((x) => x.toString())
      expect(result.getTag()).toBe('nothing')
      expect(result.getValue()).toBeUndefined()
    })

    it('handles undefined in getValue for nothing', () => {
      const result = TaggedUnion2.nothing<number>()
      expect(result.getValue()).toBeUndefined()
    })

    it('handles match with complex return types', () => {
      const result = TaggedUnion2.just(42).match({
        just: (v) => ({ value: v as number, doubled: (v as number) * 2 }),
        nothing: () => ({ value: 0, doubled: 0 })
      })
      expect(result).toEqual({ value: 42, doubled: 84 })
    })

    it('handles match with nested tagged unions', () => {
      const result = TaggedUnion2.just(TaggedUnion2.just(42))
      const value = result.match({
        just: (v) => (v as TaggedUnion2<number>).getValue(),
        nothing: () => 0
      })
      expect(value).toBe(42)
    })
  })
})
