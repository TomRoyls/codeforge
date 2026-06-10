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
})
