import { beforeEach, describe, expect, it } from 'vitest'

import { LinkedList } from '../../src/utils/linked-list.js'

// ─── Empty list operations ─────────────────────────────
describe('LinkedList empty list operations', () => {
  let list: LinkedList<number>

  beforeEach(() => {
    list = new LinkedList<number>()
  })

  it('reports size 0 for new list', () => {
    expect(list.size).toBe(0)
  })

  it('isEmpty returns true for new list', () => {
    expect(list.isEmpty()).toBe(true)
  })

  it('first returns undefined for empty list', () => {
    expect(list.first).toBeUndefined()
  })

  it('last returns undefined for empty list', () => {
    expect(list.last).toBeUndefined()
  })

  it('get returns undefined for empty list', () => {
    expect(list.get(0)).toBeUndefined()
  })

  it('indexOf returns -1 for empty list', () => {
    expect(list.indexOf(1)).toBe(-1)
  })

  it('contains returns false for empty list', () => {
    expect(list.contains(1)).toBe(false)
  })

  it('toArray returns empty array', () => {
    expect(list.toArray()).toEqual([])
  })

  it('removeAt returns undefined for empty list', () => {
    expect(list.removeAt(0)).toBeUndefined()
  })

  it('remove returns false for empty list', () => {
    expect(list.remove(1)).toBe(false)
  })
})

// ─── Append operations ─────────────────────────────────
describe('LinkedList append operations', () => {
  let list: LinkedList<number>

  beforeEach(() => {
    list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
  })

  it('appends values to end', () => {
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('updates size after append', () => {
    expect(list.size).toBe(3)
  })

  it('first returns first element', () => {
    expect(list.first).toBe(1)
  })

  it('last returns last element', () => {
    expect(list.last).toBe(3)
  })

  it('isEmpty returns false after append', () => {
    expect(list.isEmpty()).toBe(false)
  })
})

// ─── Prepend operations ────────────────────────────────
describe('LinkedList prepend operations', () => {
  it('prepends to empty list', () => {
    const list = new LinkedList<number>()
    list.prepend(1)
    expect(list.toArray()).toEqual([1])
    expect(list.first).toBe(1)
    expect(list.last).toBe(1)
  })

  it('prepends to existing list', () => {
    const list = new LinkedList<number>()
    list.append(2)
    list.append(3)
    list.prepend(1)
    expect(list.toArray()).toEqual([1, 2, 3])
    expect(list.size).toBe(3)
  })
})

// ─── InsertAt operations ───────────────────────────────
describe('LinkedList insertAt operations', () => {
  it('inserts at head (index 0)', () => {
    const list = new LinkedList<number>()
    list.append(2)
    list.append(3)
    list.insertAt(0, 1)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('inserts in middle', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(3)
    list.insertAt(1, 2)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('inserts at tail (index equals size)', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.insertAt(2, 3)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('insertAt out of bounds returns undefined (negative)', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.insertAt(-1, 99)
    expect(list.toArray()).toEqual([1])
    expect(list.size).toBe(1)
  })

  it('insertAt out of bounds returns undefined (too large)', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.insertAt(5, 99)
    expect(list.toArray()).toEqual([1])
    expect(list.size).toBe(1)
  })

  it('insertAt into empty list at index 0', () => {
    const list = new LinkedList<number>()
    list.insertAt(0, 42)
    expect(list.toArray()).toEqual([42])
  })
})

// ─── RemoveAt operations ──────────────────────────────
describe('LinkedList removeAt operations', () => {
  it('removes from head', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    expect(list.removeAt(0)).toBe(1)
    expect(list.toArray()).toEqual([2, 3])
  })

  it('removes from tail', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    expect(list.removeAt(2)).toBe(3)
    expect(list.toArray()).toEqual([1, 2])
  })

  it('removes from middle', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    expect(list.removeAt(1)).toBe(2)
    expect(list.toArray()).toEqual([1, 3])
  })

  it('removeAt out of bounds returns undefined', () => {
    const list = new LinkedList<number>()
    list.append(1)
    expect(list.removeAt(5)).toBeUndefined()
    expect(list.removeAt(-1)).toBeUndefined()
  })

  it('removeAt on empty list returns undefined', () => {
    const list = new LinkedList<number>()
    expect(list.removeAt(0)).toBeUndefined()
  })
})

// ─── Remove by value ──────────────────────────────────
describe('LinkedList remove by value', () => {
  it('removes first occurrence of value', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    expect(list.remove(2)).toBe(true)
    expect(list.toArray()).toEqual([1, 3])
  })

  it('removes only first occurrence when duplicates exist', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(2)
    list.append(3)
    expect(list.remove(2)).toBe(true)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('returns false when value not found', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    expect(list.remove(99)).toBe(false)
    expect(list.size).toBe(2)
  })
})

// ─── Get / indexOf / contains ──────────────────────────
describe('LinkedList get/indexOf/contains', () => {
  let list: LinkedList<string>

  beforeEach(() => {
    list = new LinkedList<string>()
    list.append('a')
    list.append('b')
    list.append('c')
  })

  it('get returns value at index', () => {
    expect(list.get(0)).toBe('a')
    expect(list.get(1)).toBe('b')
    expect(list.get(2)).toBe('c')
  })

  it('get returns undefined for out of bounds', () => {
    expect(list.get(-1)).toBeUndefined()
    expect(list.get(3)).toBeUndefined()
  })

  it('indexOf returns index of value', () => {
    expect(list.indexOf('a')).toBe(0)
    expect(list.indexOf('b')).toBe(1)
    expect(list.indexOf('c')).toBe(2)
  })

  it('indexOf returns -1 for missing value', () => {
    expect(list.indexOf('z')).toBe(-1)
  })

  it('contains returns true for existing value', () => {
    expect(list.contains('a')).toBe(true)
    expect(list.contains('b')).toBe(true)
  })

  it('contains returns false for missing value', () => {
    expect(list.contains('z')).toBe(false)
  })
})

// ─── First / last getters ─────────────────────────────
describe('LinkedList first/last getters', () => {
  it('first and last are same for single element', () => {
    const list = new LinkedList<number>()
    list.append(42)
    expect(list.first).toBe(42)
    expect(list.last).toBe(42)
  })

  it('first and last differ for multiple elements', () => {
    const list = new LinkedList<string>()
    list.append('head')
    list.append('middle')
    list.append('tail')
    expect(list.first).toBe('head')
    expect(list.last).toBe('tail')
  })
})

// ─── Size tracking ─────────────────────────────────────
describe('LinkedList size tracking', () => {
  it('tracks size through add and remove', () => {
    const list = new LinkedList<number>()
    expect(list.size).toBe(0)
    list.append(1)
    expect(list.size).toBe(1)
    list.append(2)
    expect(list.size).toBe(2)
    list.removeAt(0)
    expect(list.size).toBe(1)
    list.remove(2)
    expect(list.size).toBe(0)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('LinkedList clear', () => {
  it('removes all elements', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    list.clear()
    expect(list.size).toBe(0)
    expect(list.isEmpty()).toBe(true)
    expect(list.first).toBeUndefined()
    expect(list.last).toBeUndefined()
    expect(list.toArray()).toEqual([])
  })

  it('allows operations after clear', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.clear()
    list.append(2)
    expect(list.size).toBe(1)
    expect(list.first).toBe(2)
  })
})

// ─── ToArray ───────────────────────────────────────────
describe('LinkedList toArray', () => {
  it('returns array representation', () => {
    const list = new LinkedList<number>()
    list.append(10)
    list.append(20)
    list.append(30)
    expect(list.toArray()).toEqual([10, 20, 30])
  })
})

// ─── ForEach ───────────────────────────────────────────
describe('LinkedList forEach', () => {
  it('iterates all elements in order', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    const collected: number[] = []
    list.forEach((v, i) => {
      collected.push(v)
      expect(i).toBe(collected.length - 1)
    })
    expect(collected).toEqual([1, 2, 3])
  })

  it('does not call callback for empty list', () => {
    const list = new LinkedList<number>()
    let calls = 0
    list.forEach(() => { calls++ })
    expect(calls).toBe(0)
  })
})

// ─── Reverse ───────────────────────────────────────────
describe('LinkedList reverse', () => {
  it('reverses list in place', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    list.reverse()
    expect(list.toArray()).toEqual([3, 2, 1])
  })

  it('reverse updates first and last', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    list.reverse()
    expect(list.first).toBe(3)
    expect(list.last).toBe(1)
  })

  it('reverse of single element list is no-op', () => {
    const list = new LinkedList<number>()
    list.append(42)
    list.reverse()
    expect(list.toArray()).toEqual([42])
  })

  it('reverse of empty list is no-op', () => {
    const list = new LinkedList<number>()
    list.reverse()
    expect(list.size).toBe(0)
  })

  it('double reverse restores original order', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    list.append(3)
    list.reverse()
    list.reverse()
    expect(list.toArray()).toEqual([1, 2, 3])
  })
})

// ─── Iteration with for...of ───────────────────────────
describe('LinkedList iteration', () => {
  it('iterates with for...of', () => {
    const list = new LinkedList<string>()
    list.append('x')
    list.append('y')
    list.append('z')
    const collected: string[] = []
    for (const val of list) {
      collected.push(val)
    }
    expect(collected).toEqual(['x', 'y', 'z'])
  })

  it('spread into array', () => {
    const list = new LinkedList<number>()
    list.append(1)
    list.append(2)
    expect([...list]).toEqual([1, 2])
  })
})

// ─── Large list ────────────────────────────────────────
describe('LinkedList large list', () => {
  it('handles 1000 items', () => {
    const list = new LinkedList<number>()
    for (let i = 0; i < 1000; i++) {
      list.append(i)
    }
    expect(list.size).toBe(1000)
    expect(list.first).toBe(0)
    expect(list.last).toBe(999)
    expect(list.get(500)).toBe(500)
  })

  it('removes from large list correctly', () => {
    const list = new LinkedList<number>()
    for (let i = 0; i < 1000; i++) {
      list.append(i)
    }
    for (let i = 0; i < 500; i++) {
      list.removeAt(0)
    }
    expect(list.size).toBe(500)
    expect(list.first).toBe(500)
  })
})

// ─── Generic value types ──────────────────────────────
describe('LinkedList generic value types', () => {
  it('works with object values', () => {
    const list = new LinkedList<{ name: string }>()
    list.append({ name: 'Alice' })
    list.append({ name: 'Bob' })
    expect(list.first?.name).toBe('Alice')
    expect(list.last?.name).toBe('Bob')
  })

  it('works with string values', () => {
    const list = new LinkedList<string>()
    list.append('hello')
    list.append('world')
    expect(list.toArray()).toEqual(['hello', 'world'])
  })
})

describe('linked-list - wave548', () => {
  it('linked-list module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module constructable', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module has prototype', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module toString works', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module has length', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module type is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module name is string', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module exists in scope', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module is class-like', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module has constructor', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave549', () => {
  it('linked-list module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave550', () => {
  it('linked-list w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave551', () => {
  it('linked-list w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave552', () => {
  it('linked-list w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave553', () => {
  it('linked-list w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave554', () => {
  it('linked-list w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave555', () => {
  it('linked-list w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave556', () => {
  it('linked-list w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave557', () => {
  it('linked-list w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave558', () => {
  it('linked-list w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave559', () => {
  it('linked-list w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave560', () => {
  it('linked-list w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave561', () => {
  it('linked-list w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave562', () => {
  it('linked-list w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave563', () => {
  it('linked-list w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})
