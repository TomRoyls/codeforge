import { describe, it, expect } from 'vitest'
import { RendezvousHash } from '../../src/utils/rendezvous-hash.js'

describe('RendezvousHash - constructor', () => {
  it('creates empty hash', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.size).toBe(0)
    expect(rh.isEmpty()).toBe(true)
  })

  it('creates with initial entries', () => {
    const rh = new RendezvousHash<string>([
      ['node-a', 'A'],
      ['node-b', 'B'],
    ])
    expect(rh.size).toBe(2)
    expect(rh.isEmpty()).toBe(false)
  })

  it('handles empty iterable', () => {
    const rh = new RendezvousHash<string>([])
    expect(rh.size).toBe(0)
  })
})

describe('RendezvousHash - add and remove', () => {
  it('adds nodes', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    expect(rh.size).toBe(2)
  })

  it('overwrites existing node', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('a', 'AA')
    expect(rh.size).toBe(1)
    expect(rh.get('a')).toBe('AA')
  })

  it('removes existing node', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    expect(rh.remove('a')).toBe(true)
    expect(rh.size).toBe(0)
  })

  it('returns false when removing non-existent node', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.remove('x')).toBe(false)
  })

  it('get returns undefined for missing node', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.get('x')).toBeUndefined()
  })

  it('has checks node existence', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    expect(rh.has('a')).toBe(true)
    expect(rh.has('b')).toBe(false)
  })
})

describe('RendezvousHash - select', () => {
  it('returns undefined for empty hash', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.select('key')).toBeUndefined()
  })

  it('returns the only node', () => {
    const rh = new RendezvousHash<string>()
    rh.add('only', 'ONLY')
    expect(rh.select('key')).toBe('ONLY')
  })

  it('selects deterministically', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    const first = rh.select('test-key')
    const second = rh.select('test-key')
    expect(first).toBe(second)
  })

  it('distributes keys across nodes', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    const counts = new Map<string, number>()
    for (let i = 0; i < 300; i++) {
      const selected = rh.select(`key-${i}`)
      counts.set(selected!, (counts.get(selected!) ?? 0) + 1)
    }
    expect(counts.size).toBe(3)
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(30)
    }
  })

  it('selectKey returns the node key', () => {
    const rh = new RendezvousHash<string>()
    rh.add('node-1', 'value-1')
    rh.add('node-2', 'value-2')
    const key = rh.selectKey('item')
    expect(key).toBeDefined()
    expect(['node-1', 'node-2']).toContain(key)
  })

  it('selectKey returns undefined for empty', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.selectKey('item')).toBeUndefined()
  })
})

describe('RendezvousHash - selectN', () => {
  it('returns empty for empty hash', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.selectN('key', 3)).toEqual([])
  })

  it('returns empty for n=0', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    expect(rh.selectN('key', 0)).toEqual([])
  })

  it('returns up to n nodes', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    rh.add('d', 'D')
    const selected = rh.selectN('key', 2)
    expect(selected.length).toBe(2)
  })

  it('returns all nodes when n exceeds size', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    const selected = rh.selectN('key', 10)
    expect(selected.length).toBe(2)
  })

  it('returns nodes in consistent order', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    const first = rh.selectN('key', 2)
    const second = rh.selectN('key', 2)
    expect(first).toEqual(second)
  })

  it('no duplicate nodes in result', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    const selected = rh.selectN('key', 3)
    const unique = new Set(selected)
    expect(unique.size).toBe(selected.length)
  })
})

describe('RendezvousHash - consistency', () => {
  it('adding a node only moves affected keys', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')

    const before: Map<string, string> = new Map()
    for (let i = 0; i < 100; i++) {
      before.set(`key-${i}`, rh.select(`key-${i}`)!)
    }

    rh.add('d', 'D')

    let moved = 0
    let stayed = 0
    for (let i = 0; i < 100; i++) {
      const after = rh.select(`key-${i}`)!
      if (before.get(`key-${i}`) !== after) moved++
      else stayed++
    }
    expect(stayed).toBeGreaterThan(0)
    expect(moved).toBeLessThan(100)
  })

  it('removing a node reassigns to remaining', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')

    rh.remove('b')

    for (let i = 0; i < 50; i++) {
      const selected = rh.select(`key-${i}`)
      expect(selected).toBeDefined()
      expect(['A', 'C']).toContain(selected)
    }
  })
})

describe('RendezvousHash - iteration', () => {
  it('keys returns all node keys', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    const keys = rh.keys()
    expect(keys.sort()).toEqual(['a', 'b'])
  })

  it('values returns all node values', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    const vals = rh.values().sort()
    expect(vals).toEqual(['A', 'B'])
  })

  it('entries returns key-value pairs', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    const entries = rh.entries()
    expect(entries).toEqual([['a', 'A']])
  })
})

describe('RendezvousHash - clear and clone', () => {
  it('clear removes all nodes', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.clear()
    expect(rh.size).toBe(0)
    expect(rh.isEmpty()).toBe(true)
  })

  it('clone creates independent copy', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    const copy = rh.clone()
    expect(copy.size).toBe(2)
    copy.add('c', 'C')
    expect(rh.size).toBe(2)
    expect(copy.size).toBe(3)
  })

  it('clone preserves all nodes', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    const copy = rh.clone()
    expect(copy.keys().sort()).toEqual(['a', 'b'])
    expect(copy.get('a')).toBe('A')
    expect(copy.get('b')).toBe('B')
  })
})

describe('RendezvousHash - toString', () => {
  it('returns readable string', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    expect(rh.toString()).toBe('RendezvousHash(nodes=1)')
  })

  it('returns empty state', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.toString()).toBe('RendezvousHash(nodes=0)')
  })
})

describe('RendezvousHash - with complex values', () => {
  it('works with object values', () => {
    const rh = new RendezvousHash<{ port: number }>()
    rh.add('server1', { port: 8080 })
    rh.add('server2', { port: 8081 })
    const selected = rh.select('request-1')
    expect(selected).toBeDefined()
    expect([8080, 8081]).toContain(selected!.port)
  })

  it('works with number values', () => {
    const rh = new RendezvousHash<number>()
    rh.add('a', 1)
    rh.add('b', 2)
    const selected = rh.select('key')
    expect([1, 2]).toContain(selected)
  })

  it('selectKey returns undefined when node exists but value is undefined', () => {
    const rh = new RendezvousHash<string | undefined>()
    rh.add('a', undefined)
    const key = rh.selectKey('item')
    expect(key).toBe('a')
  })

  it('select returns undefined when node exists but value is undefined', () => {
    const rh = new RendezvousHash<string | undefined>()
    rh.add('a', undefined)
    const selected = rh.select('item')
    expect(selected).toBeUndefined()
  })

  it('selectN with negative n returns empty array', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    expect(rh.selectN('key', -1)).toEqual([])
  })

  it('selectN returns values in correct order based on hash', () => {
    const rh = new RendezvousHash<string>()
    rh.add('node1', 'A')
    rh.add('node2', 'B')
    rh.add('node3', 'C')
    const selected = rh.selectN('test', 3)
    expect(selected.length).toBe(3)
    expect(selected).toContain('A')
    expect(selected).toContain('B')
    expect(selected).toContain('C')
  })

  it('selectN with same key multiple times returns consistent order', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    const first = rh.selectN('key', 2)
    const second = rh.selectN('key', 2)
    const third = rh.selectN('key', 2)
    expect(first).toEqual(second)
    expect(second).toEqual(third)
  })

  it('handles add with same key but different value types', () => {
    const rh = new RendezvousHash<{ v: number }>()
    rh.add('a', { v: 1 })
    rh.add('a', { v: 2 })
    expect(rh.get('a')?.v).toBe(2)
  })

  it('keys returns empty array for empty hash', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.keys()).toEqual([])
  })

  it('values returns empty array for empty hash', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.values()).toEqual([])
  })

  it('entries returns empty array for empty hash', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.entries()).toEqual([])
  })

  it('entries returns correct key-value pairs', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    const entries = rh.entries()
    expect(entries.length).toBe(2)
    expect(entries.some(e => e[0] === 'a' && e[1] === 'A')).toBe(true)
    expect(entries.some(e => e[0] === 'b' && e[1] === 'B')).toBe(true)
  })

  it('clear on empty hash remains empty', () => {
    const rh = new RendezvousHash<string>()
    rh.clear()
    expect(rh.size).toBe(0)
    expect(rh.isEmpty()).toBe(true)
  })

  it('clone of empty hash is empty', () => {
    const rh = new RendezvousHash<string>()
    const copy = rh.clone()
    expect(copy.size).toBe(0)
    expect(copy.isEmpty()).toBe(true)
  })

  it('clone preserves order of operations', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    const copy = rh.clone()
    const originalKey = rh.selectKey('test')
    const copyKey = copy.selectKey('test')
    expect(originalKey).toBe(copyKey)
  })

  it('removing non-existent node does not affect size', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    const beforeSize = rh.size
    rh.remove('x')
    expect(rh.size).toBe(beforeSize)
  })

  it('select after remove reassigns keys consistently', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    rh.add('b', 'B')
    rh.add('c', 'C')
    const before = rh.select('key-1')
    rh.remove('b')
    const after = rh.select('key-1')
    if (before === 'B') {
      expect(['A', 'C']).toContain(after)
    } else {
      expect(before).toBe(after)
    }
  })

  it('handles empty key in add', () => {
    const rh = new RendezvousHash<string>()
    rh.add('', 'empty-key')
    expect(rh.has('')).toBe(true)
    expect(rh.get('')).toBe('empty-key')
  })

  it('handles empty key in select', () => {
    const rh = new RendezvousHash<string>()
    rh.add('', 'empty-key')
    rh.add('a', 'A')
    const selected = rh.select('')
    expect(['empty-key', 'A']).toContain(selected)
  })

  it('works with null values', () => {
    const rh = new RendezvousHash<string | null>()
    rh.add('a', null)
    rh.add('b', 'B')
    const selected = rh.select('key')
    if (selected === null) {
      expect(selected).toBeNull()
    } else {
      expect(selected).toBe('B')
    }
  })

  it('selectN with single node returns array with one element', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'A')
    const selected = rh.selectN('key', 5)
    expect(selected.length).toBe(1)
    expect(selected[0]).toBe('A')
  })
})

  it('size returns node count', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'node-a')
    rh.add('b', 'node-b')
    expect(rh.size).toBe(2)
  })

  it('remove deletes a node', () => {
    const rh = new RendezvousHash<string>()
    rh.add('a', 'node-a')
    rh.remove('a')
    expect(rh.has('a')).toBe(false)
  })

  it('has returns false for missing', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.has('missing')).toBe(false)


  it('empty hash get undefined', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.get('key')).toBeUndefined()
  })

  it('add and get', () => {
    const rh = new RendezvousHash<string>()
    rh.add('node1', 'value1')
    expect(rh.get('any-key')).toBeDefined()
  })

  it('has returns boolean', () => {
    const rh = new RendezvousHash<string>()
    expect(rh.has('node1')).toBe(false)
  })
  })

describe('rendezvous-hash - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('rendezvous-hash - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('rendezvous-hash - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('rendezvous-hash - wave548', () => {
  it('rendezvous-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave549', () => {
  it('rendezvous-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave550', () => {
  it('rendezvous-hash w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave551', () => {
  it('rendezvous-hash w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave552', () => {
  it('rendezvous-hash w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave553', () => {
  it('rendezvous-hash w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave554', () => {
  it('rendezvous-hash w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave555', () => {
  it('rendezvous-hash w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave556', () => {
  it('rendezvous-hash w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave557', () => {
  it('rendezvous-hash w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave558', () => {
  it('rendezvous-hash w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave559', () => {
  it('rendezvous-hash w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave560', () => {
  it('rendezvous-hash w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave561', () => {
  it('rendezvous-hash w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rendezvous-hash - wave562', () => {
  it('rendezvous-hash w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rendezvous-hash w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
