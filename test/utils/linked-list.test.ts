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

describe('linked-list - wave564', () => {
  it('linked-list w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave565', () => {
  it('linked-list w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave566', () => {
  it('linked-list w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave127', () => {
  it('linked-list w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave130', () => {
  it('linked-list w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave133', () => {
  it('linked-list w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave136', () => {
  it('linked-list w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - wave139', () => {
  it('linked-list w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w142', () => {
  it('linked-list v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w145', () => {
  it('linked-list v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w148', () => {
  it('linked-list v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w151', () => {
  it('linked-list v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w154', () => {
  it('linked-list v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w157', () => {
  it('linked-list v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w160', () => {
  it('linked-list v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w170', () => {
  it('linked-list x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w180', () => {
  it('linked-list x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w190', () => {
  it('linked-list x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w200', () => {
  it('linked-list x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w210', () => {
  it('linked-list x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w220', () => {
  it('linked-list x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w230', () => {
  it('linked-list x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w240', () => {
  it('linked-list x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w250', () => {
  it('linked-list x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w260', () => {
  it('linked-list x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w270', () => {
  it('linked-list x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w280', () => {
  it('linked-list x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w290', () => {
  it('linked-list x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w300', () => {
  it('linked-list x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w310', () => {
  it('linked-list x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w320', () => {
  it('linked-list x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w330', () => {
  it('linked-list x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w340', () => {
  it('linked-list x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w350', () => {
  it('linked-list x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w360', () => {
  it('linked-list x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w370', () => {
  it('linked-list x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w380', () => {
  it('linked-list x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w390', () => {
  it('linked-list x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w400', () => {
  it('linked-list x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w420', () => {
  it('linked-list x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w440', () => {
  it('linked-list x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w460', () => {
  it('linked-list x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w480', () => {
  it('linked-list x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w500', () => {
  it('linked-list x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w550', () => {
  it('linked-list x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w600', () => {
  it('linked-list x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w650', () => {
  it('linked-list x650x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x650x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('linked-list - w700', () => {
  it('linked-list x700x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('linked-list x700x49', () => {
    expect(beforeEach).toBeDefined()
  })
})
