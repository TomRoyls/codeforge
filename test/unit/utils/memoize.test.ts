import { describe, expect, it, vi } from 'vitest'
import { memoize, clearMemoized } from '../../../src/utils/memoize.js'

describe('memoize', () => {
  it('returns cached result for same arguments', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn)
    
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
  })

  it('computes new result for different arguments', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn)
    
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
    expect(memoized(7)).toBe(14)
    expect(callCount).toBe(2)
  })

  it('handles multiple arguments', () => {
    let callCount = 0
    const fn = (a: number, b: number, c: number) => {
      callCount++
      return a + b + c
    }
    const memoized = memoize(fn)
    
    expect(memoized(1, 2, 3)).toBe(6)
    expect(callCount).toBe(1)
    expect(memoized(1, 2, 3)).toBe(6)
    expect(callCount).toBe(1)
    expect(memoized(1, 2, 4)).toBe(7)
    expect(callCount).toBe(2)
  })

  it('handles no arguments', () => {
    let callCount = 0
    const fn = () => {
      callCount++
      return 'result'
    }
    const memoized = memoize(fn)
    
    expect(memoized()).toBe('result')
    expect(callCount).toBe(1)
    expect(memoized()).toBe('result')
    expect(callCount).toBe(1)
  })

  it('handles single argument', () => {
    let callCount = 0
    const fn = (x: string) => {
      callCount++
      return x.toUpperCase()
    }
    const memoized = memoize(fn)
    
    expect(memoized('hello')).toBe('HELLO')
    expect(callCount).toBe(1)
    expect(memoized('hello')).toBe('HELLO')
    expect(callCount).toBe(1)
  })

  it('handles undefined arguments', () => {
    let callCount = 0
    const fn = (x: unknown) => {
      callCount++
      return String(x)
    }
    const memoized = memoize(fn)
    
    expect(memoized(undefined)).toBe('undefined')
    expect(callCount).toBe(1)
    expect(memoized(undefined)).toBe('undefined')
    expect(callCount).toBe(1)
  })

  it('handles null arguments', () => {
    let callCount = 0
    const fn = (x: unknown) => {
      callCount++
      return String(x)
    }
    const memoized = memoize(fn)
    
    expect(memoized(null)).toBe('null')
    expect(callCount).toBe(1)
    expect(memoized(null)).toBe('null')
    expect(callCount).toBe(1)
  })

  it('handles object arguments', () => {
    let callCount = 0
    const fn = (obj: { x: number }) => {
      callCount++
      return obj.x * 2
    }
    const memoized = memoize(fn)
    
    expect(memoized({ x: 5 })).toBe(10)
    expect(callCount).toBe(1)
    expect(memoized({ x: 5 })).toBe(10)
    expect(callCount).toBe(1)
  })

  it('handles array arguments', () => {
    let callCount = 0
    const fn = (arr: number[]) => {
      callCount++
      return arr.reduce((sum, x) => sum + x, 0)
    }
    const memoized = memoize(fn)
    
    expect(memoized([1, 2, 3])).toBe(6)
    expect(callCount).toBe(1)
    expect(memoized([1, 2, 3])).toBe(6)
    expect(callCount).toBe(1)
  })

  it('respects maxSize option', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn, { maxSize: 2 })
    
    expect(memoized(1)).toBe(2)
    expect(callCount).toBe(1)
    expect(memoized(2)).toBe(4)
    expect(callCount).toBe(2)
    expect(memoized(3)).toBe(6)
    expect(callCount).toBe(3)
    expect(memoized(1)).toBe(2)
    expect(callCount).toBe(4)
  })

  it('evicts oldest entry when cache is full', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn, { maxSize: 2 })
    
    memoized(1)
    memoized(2)
    memoized(3)
    memoized(1)
    expect(callCount).toBe(4)
  })

  it('respects ttlMs option', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn, { ttlMs: 10 })
    
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(memoized(5)).toBe(10)
        expect(callCount).toBe(2)
        resolve(null)
      }, 15)
    })
  })

  it('preserves this context', () => {
    const obj = {
      multiplier: 3,
      fn: function(this: { multiplier: number }, x: number) {
        return x * this.multiplier
      }
    }
    const memoized = memoize(obj.fn)
    
    expect(memoized.call(obj, 5)).toBe(15)
  })

  it('handles primitive arguments', () => {
    let callCount = 0
    const fn = (x: number, y: string, z: boolean) => {
      callCount++
      return `${x}-${y}-${z}`
    }
    const memoized = memoize(fn)
    
    expect(memoized(1, 'a', true)).toBe('1-a-true')
    expect(callCount).toBe(1)
    expect(memoized(1, 'a', true)).toBe('1-a-true')
    expect(callCount).toBe(1)
    expect(memoized(2, 'b', false)).toBe('2-b-false')
    expect(callCount).toBe(2)
  })

  it('handles many arguments', () => {
    let callCount = 0
    const fn = (...args: number[]) => {
      callCount++
      return args.reduce((sum, x) => sum + x, 0)
    }
    const memoized = memoize(fn)
    
    expect(memoized(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)).toBe(55)
    expect(callCount).toBe(1)
    expect(memoized(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)).toBe(55)
    expect(callCount).toBe(1)
  })

  it('returns different values for different calls with same args if function changes', () => {
    let multiplier = 2
    const fn = (x: number) => x * multiplier
    const memoized = memoize(fn)
    
    expect(memoized(5)).toBe(10)
    multiplier = 3
    expect(memoized(5)).toBe(10)
  })

  it('handles mixed primitive and object arguments', () => {
    let callCount = 0
    const fn = (x: number, obj: { y: number }, z: string) => {
      callCount++
      return x + obj.y + z.length
    }
    const memoized = memoize(fn)
    
    expect(memoized(1, { y: 2 }, 'hello')).toBe(8)
    expect(callCount).toBe(1)
    expect(memoized(1, { y: 2 }, 'hello')).toBe(8)
    expect(callCount).toBe(1)
    expect(memoized(1, { y: 3 }, 'hello')).toBe(9)
    expect(callCount).toBe(2)
  })

  it('handles nested objects', () => {
    let callCount = 0
    const fn = (obj: { nested: { value: number } }) => {
      callCount++
      return obj.nested.value * 2
    }
    const memoized = memoize(fn)
    
    expect(memoized({ nested: { value: 5 } })).toBe(10)
    expect(callCount).toBe(1)
    expect(memoized({ nested: { value: 5 } })).toBe(10)
    expect(callCount).toBe(1)
  })

  it('handles infinity ttl', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn, { ttlMs: Infinity })
    
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
  })

  it('uses default options when none provided', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn)
    
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
  })

  it('handles zero ttlMs', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn, { ttlMs: 0 })
    
    expect(memoized(5)).toBe(10)
    expect(callCount).toBe(1)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(memoized(5)).toBe(10)
        expect(callCount).toBe(2)
        resolve(null)
      }, 5)
    })
  })

  it('handles maxSize of 1', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn, { maxSize: 1 })
    
    expect(memoized(1)).toBe(2)
    expect(callCount).toBe(1)
    expect(memoized(2)).toBe(4)
    expect(callCount).toBe(2)
    expect(memoized(1)).toBe(2)
    expect(callCount).toBe(3)
  })

  it('handles very large number of unique calls', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }
    const memoized = memoize(fn, { maxSize: 50 })
    
    for (let i = 0; i < 100; i++) {
      memoized(i)
    }
    
    expect(callCount).toBe(100)
  })

  it('handles circular objects by falling back to string representation', () => {
    let callCount = 0
    const fn = (x: unknown) => {
      callCount++
      return String(x)
    }
    const memoized = memoize(fn)
    
    const circular: { self?: unknown } = {}
    circular.self = circular
    
    expect(memoized(circular)).toBe('[object Object]')
    expect(callCount).toBe(1)
  })
})

describe('clearMemoized', () => {
  it('does not throw on non-memoized function', () => {
    const fn = (x: number) => x * 2
    expect(() => clearMemoized(fn)).not.toThrow()
  })
})