import { describe, expect, it } from 'vitest'
import { TaggedUnion2 } from '../../src/core/tagged-union-2/index.js'

// ─── Static Factories ───

describe('TaggedUnion2', () => {
  describe('static factories', () => {
    it('of creates a tagged union with given tag and value', () => {
      const tu = TaggedUnion2.of('foo', 42)
      expect(tu.getTag()).toBe('foo')
      expect(tu.getValue()).toBe(42)
    })

    it('just creates a just-tagged union', () => {
      const tu = TaggedUnion2.just('hello')
      expect(tu.getTag()).toBe('just')
      expect(tu.getValue()).toBe('hello')
    })

    it('nothing creates a nothing-tagged union', () => {
      const tu = TaggedUnion2.nothing<string>()
      expect(tu.getTag()).toBe('nothing')
      expect(tu.getValue()).toBeUndefined()
    })

    it('left creates a left-tagged union', () => {
      const tu = TaggedUnion2.left('error msg')
      expect(tu.getTag()).toBe('left')
      expect(tu.getValue()).toBe('error msg')
    })

    it('right creates a right-tagged union', () => {
      const tu = TaggedUnion2.right(100)
      expect(tu.getTag()).toBe('right')
      expect(tu.getValue()).toBe(100)
    })


  })

  // ─── getTag ───

  describe('getTag', () => {
    it('returns the tag string', () => {
      const tu = TaggedUnion2.of('myTag', 1)
      expect(tu.getTag()).toBe('myTag')
    })
  })

  // ─── getValue ───

  describe('getValue', () => {
    it('returns the value for a just union', () => {
      const tu = TaggedUnion2.just(42)
      expect(tu.getValue()).toBe(42)
    })

    it('returns undefined for a nothing union', () => {
      const tu = TaggedUnion2.nothing()
      expect(tu.getValue()).toBeUndefined()
    })

    it('returns the value for custom-tagged unions', () => {
      const tu = TaggedUnion2.of('custom', { x: 1 })
      expect(tu.getValue()).toEqual({ x: 1 })
    })
  })

  // ─── is ───

  describe('is', () => {
    it('returns true for matching tag', () => {
      const tu = TaggedUnion2.just(1)
      expect(tu.is('just')).toBe(true)
    })

    it('returns false for non-matching tag', () => {
      const tu = TaggedUnion2.just(1)
      expect(tu.is('nothing')).toBe(false)
    })

    it('is case-sensitive', () => {
      const tu = TaggedUnion2.of('Foo', 1)
      expect(tu.is('foo')).toBe(false)
      expect(tu.is('Foo')).toBe(true)
    })
  })

  // ─── match ───

  describe('match', () => {
    it('invokes the handler matching the tag', () => {
      const tu = TaggedUnion2.just(10)
      const result = tu.match({
        just: (v) => `value is ${v as number}`,
        nothing: () => 'no value',
      })
      expect(result).toBe('value is 10')
    })

    it('throws when no handler for the tag exists', () => {
      const tu = TaggedUnion2.of('unknown', 1)
      expect(() =>
        tu.match({
          just: (v) => v,
          nothing: () => null,
        })
      ).toThrow('No handler for tag: unknown')
    })

    it('can match left and right', () => {
      const left = TaggedUnion2.left('err')
      const right = TaggedUnion2.right(42)
      expect(
        left.match({
          left: (v) => `left: ${v as string}`,
          right: (v) => `right: ${v as number}`,
        })
      ).toBe('left: err')
      expect(
        right.match({
          left: (v) => `left: ${v as string}`,
          right: (v) => `right: ${v as number}`,
        })
      ).toBe('right: 42')
    })
  })

  // ─── map ───

  describe('map', () => {
    it('transforms the value when present', () => {
      const tu = TaggedUnion2.just(5)
      const mapped = tu.map((v) => (v as number) * 2)
      expect(mapped.getValue()).toBe(10)
      expect(mapped.getTag()).toBe('just')
    })

    it('returns nothing with same tag when value is undefined', () => {
      const tu = TaggedUnion2.nothing<number>()
      const mapped = tu.map((v) => (v as number) * 2)
      expect(mapped.getTag()).toBe('nothing')
      expect(mapped.getValue()).toBeUndefined()
    })

    it('preserves the original tag through map', () => {
      const tu = TaggedUnion2.of('custom', 10)
      const mapped = tu.map((v) => (v as number) + 1)
      expect(mapped.getTag()).toBe('custom')
    })
  })

  // ─── flatMap ───

  describe('flatMap', () => {
    it('transforms and flattens when value is present', () => {
      const tu = TaggedUnion2.just(5)
      const result = tu.flatMap((v) => TaggedUnion2.just((v as number) * 10))
      expect(result.getValue()).toBe(50)
      expect(result.getTag()).toBe('just')
    })

    it('returns nothing with same tag when value is undefined', () => {
      const tu = TaggedUnion2.nothing<number>()
      const result = tu.flatMap((v) => TaggedUnion2.just((v as number) * 10))
      expect(result.getTag()).toBe('nothing')
      expect(result.getValue()).toBeUndefined()
    })

    it('can change the tag through flatMap', () => {
      const tu = TaggedUnion2.just('success')
      const result = tu.flatMap((_v) => TaggedUnion2.right('done'))
      expect(result.getTag()).toBe('right')
      expect(result.getValue()).toBe('done')
    })
  })

  // ─── getOrElse ───

  describe('getOrElse', () => {
    it('returns the value when present', () => {
      const tu = TaggedUnion2.just(42)
      expect(tu.getOrElse(0)).toBe(42)
    })

    it('returns the default when value is undefined', () => {
      const tu = TaggedUnion2.nothing<number>()
      expect(tu.getOrElse(99)).toBe(99)
    })

    it('returns the default for nothing without type parameter', () => {
      const tu = TaggedUnion2.nothing()
      expect(tu.getOrElse('fallback')).toBe('fallback')
    })
  })

  // ─── equals ───

  describe('equals', () => {
    it('returns true for same tag and value', () => {
      const a = TaggedUnion2.just(42)
      const b = TaggedUnion2.just(42)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different tags', () => {
      const a = TaggedUnion2.just(42)
      const b = TaggedUnion2.right(42)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different values', () => {
      const a = TaggedUnion2.just(1)
      const b = TaggedUnion2.just(2)
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for two nothing unions', () => {
      const a = TaggedUnion2.nothing<number>()
      const b = TaggedUnion2.nothing<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for just vs nothing with same tag but different values', () => {
      const a = TaggedUnion2.of('test', 1)
      const b = TaggedUnion2.of('test', 2)
      expect(a.equals(b)).toBe(false)
    })
  })
})
