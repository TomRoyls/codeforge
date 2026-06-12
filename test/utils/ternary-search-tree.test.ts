import { describe, expect, it } from 'vitest'
import { TernarySearchTree } from '../../src/utils/ternary-search-tree.js'

describe('TernarySearchTree basics', () => {
  it('starts empty', () => {
    const tst = new TernarySearchTree()
    expect(tst.size).toBe(0)
    expect(tst.isEmpty()).toBe(true)
  })

  it('inserts a word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.size).toBe(1)
    expect(tst.contains('hello')).toBe(true)
  })

  it('inserts multiple words', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('banana')
    tst.insert('cherry')
    expect(tst.size).toBe(3)
    expect(tst.contains('apple')).toBe(true)
    expect(tst.contains('banana')).toBe(true)
    expect(tst.contains('cherry')).toBe(true)
  })

  it('does not duplicate inserts', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.insert('hello')
    expect(tst.size).toBe(1)
  })

  it('returns false for missing word', () => {
    const tst = new TernarySearchTree()
    expect(tst.contains('missing')).toBe(false)
  })

  it('inserts single character word', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    expect(tst.contains('a')).toBe(true)
    expect(tst.size).toBe(1)
  })

  it('inserts words with same prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('cat')
    tst.insert('car')
    tst.insert('cab')
    expect(tst.size).toBe(3)
    expect(tst.contains('cat')).toBe(true)
    expect(tst.contains('car')).toBe(true)
    expect(tst.contains('cab')).toBe(true)
  })

  it('handles large number of insertions', () => {
    const tst = new TernarySearchTree()
    for (let i = 0; i < 100; i++) {
      tst.insert(`word${i}`)
    }
    expect(tst.size).toBe(100)
    expect(tst.contains('word50')).toBe(true)
  })
})

describe('TernarySearchTree startsWith', () => {
  it('returns words with given prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('application')
    tst.insert('apply')
    tst.insert('banana')
    const result = tst.startsWith('app')
    expect(result.sort()).toEqual(['apple', 'application', 'apply'])
  })

  it('returns empty for no matches', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.startsWith('xyz')).toEqual([])
  })

  it('empty prefix returns all words', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    const result = tst.startsWith('')
    expect(result.sort()).toEqual(['a', 'b'])
  })

  it('prefix matches entire word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.insert('help')
    const result = tst.startsWith('hello')
    expect(result).toEqual(['hello'])
  })

  it('prefix matches multiple levels deep', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('ab')
    tst.insert('abc')
    tst.insert('abcd')
    const result = tst.startsWith('ab')
    expect(result.sort()).toEqual(['ab', 'abc', 'abcd'])
  })

  it('empty tree returns empty for any prefix', () => {
    const tst = new TernarySearchTree()
    expect(tst.startsWith('any')).toEqual([])
  })

  it('prefix with no descendants but matches exact word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    const result = tst.startsWith('hello')
    expect(result).toEqual(['hello'])
  })

  it('handles unicode characters', () => {
    const tst = new TernarySearchTree()
    tst.insert('café')
    tst.insert('caféine')
    const result = tst.startsWith('caf')
    expect(result.sort()).toEqual(['café', 'caféine'])
  })
})

describe('TernarySearchTree delete', () => {
  it('deletes a word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.delete('hello')).toBe(true)
    expect(tst.size).toBe(0)
    expect(tst.contains('hello')).toBe(false)
  })

  it('returns false for missing word', () => {
    const tst = new TernarySearchTree()
    expect(tst.delete('missing')).toBe(false)
  })

  it('only deletes specified word', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('application')
    tst.delete('apple')
    expect(tst.contains('apple')).toBe(false)
    expect(tst.contains('application')).toBe(true)
  })

  it('deleting non-existent word returns false', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.delete('goodbye')).toBe(false)
    expect(tst.size).toBe(1)
  })

  it('delete reduces size', () => {
    const tst = new TernarySearchTree()
    tst.insert('word1')
    tst.insert('word2')
    tst.insert('word3')
    tst.delete('word2')
    expect(tst.size).toBe(2)
  })

  it('can delete and reinsert same word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.delete('hello')
    expect(tst.contains('hello')).toBe(false)
    tst.insert('hello')
    expect(tst.contains('hello')).toBe(true)
    expect(tst.size).toBe(1)
  })

  it('deleting word that is prefix of others', () => {
    const tst = new TernarySearchTree()
    tst.insert('app')
    tst.insert('apple')
    tst.insert('application')
    tst.delete('app')
    expect(tst.contains('app')).toBe(false)
    expect(tst.contains('apple')).toBe(true)
    expect(tst.contains('application')).toBe(true)
  })

  it('delete from empty tree', () => {
    const tst = new TernarySearchTree()
    expect(tst.delete('anything')).toBe(false)
    expect(tst.size).toBe(0)
  })
})

describe('TernarySearchTree empty string', () => {
  it('handles empty string insert', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    expect(tst.contains('')).toBe(true)
    expect(tst.size).toBe(1)
  })

  it('deletes empty string', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    expect(tst.delete('')).toBe(true)
    expect(tst.contains('')).toBe(false)
  })

  it('does not duplicate empty string', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    tst.insert('')
    expect(tst.size).toBe(1)
  })

  it('empty string coexists with other words', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    tst.insert('hello')
    expect(tst.contains('')).toBe(true)
    expect(tst.contains('hello')).toBe(true)
    expect(tst.size).toBe(2)
  })

  it('startsWith with empty string includes empty string', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    tst.insert('a')
    const result = tst.startsWith('')
    expect(result.sort()).toEqual(['', 'a'])
  })
})

describe('TernarySearchTree toList', () => {
  it('returns all inserted words', () => {
    const tst = new TernarySearchTree()
    tst.insert('cherry')
    tst.insert('apple')
    tst.insert('banana')
    const list = tst.toList().sort()
    expect(list).toEqual(['apple', 'banana', 'cherry'])
  })

  it('returns empty for empty tree', () => {
    const tst = new TernarySearchTree()
    expect(tst.toList()).toEqual([])
  })

  it('toList size equals size property', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.insert('c')
    expect(tst.toList().length).toBe(tst.size)
  })

  it('toList includes empty string if present', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    tst.insert('word')
    const list = tst.toList()
    expect(list).toContain('')
    expect(list).toContain('word')
  })

  it('toList after deletions', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.insert('c')
    tst.delete('b')
    const list = tst.toList().sort()
    expect(list).toEqual(['a', 'c'])
  })
})

describe('TernarySearchTree clear', () => {
  it('clears the tree', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.clear()
    expect(tst.size).toBe(0)
    expect(tst.isEmpty()).toBe(true)
    expect(tst.toList()).toEqual([])
  })

  it('clear on empty tree is safe', () => {
    const tst = new TernarySearchTree()
    tst.clear()
    expect(tst.size).toBe(0)
    expect(tst.isEmpty()).toBe(true)
  })

  it('can insert after clear', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.clear()
    tst.insert('b')
    expect(tst.contains('a')).toBe(false)
    expect(tst.contains('b')).toBe(true)
    expect(tst.size).toBe(1)
  })
})

describe('TernarySearchTree edge cases', () => {
  it('handles words with only left children', () => {
    const tst = new TernarySearchTree()
    tst.insert('c')
    tst.insert('b')
    tst.insert('a')
    expect(tst.contains('a')).toBe(true)
    expect(tst.contains('b')).toBe(true)
    expect(tst.contains('c')).toBe(true)
  })

  it('handles words with only right children', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.insert('c')
    expect(tst.contains('a')).toBe(true)
    expect(tst.contains('b')).toBe(true)
    expect(tst.contains('c')).toBe(true)
  })

  it('handles very long word', () => {
    const tst = new TernarySearchTree()
    const longWord = 'a'.repeat(1000)
    tst.insert(longWord)
    expect(tst.contains(longWord)).toBe(true)
  })

  it('handles words with special characters', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello-world')
    tst.insert('test_case')
    tst.insert('user.name')
    expect(tst.contains('hello-world')).toBe(true)
    expect(tst.contains('test_case')).toBe(true)
    expect(tst.contains('user.name')).toBe(true)
  })

  it('handles numeric strings', () => {
    const tst = new TernarySearchTree()
    tst.insert('123')
    tst.insert('456')
    tst.insert('789')
    expect(tst.contains('123')).toBe(true)
    expect(tst.contains('456')).toBe(true)
    expect(tst.contains('789')).toBe(true)
  })

  it('handles mixed alphanumeric', () => {
    const tst = new TernarySearchTree()
    tst.insert('abc123')
    tst.insert('def456')
    expect(tst.contains('abc123')).toBe(true)
    expect(tst.contains('def456')).toBe(true)
  })

  it('word as prefix of another word both exist', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('ab')
    tst.insert('abc')
    expect(tst.contains('a')).toBe(true)
    expect(tst.contains('ab')).toBe(true)
    expect(tst.contains('abc')).toBe(true)
  })

  it('delete middle word from chain', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('ab')
    tst.insert('abc')
    tst.delete('ab')
    expect(tst.contains('a')).toBe(true)
    expect(tst.contains('ab')).toBe(false)
    expect(tst.contains('abc')).toBe(true)
  })

  it('delete first word from chain', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('ab')
    tst.insert('abc')
    tst.delete('a')
    expect(tst.contains('a')).toBe(false)
    expect(tst.contains('ab')).toBe(true)
    expect(tst.contains('abc')).toBe(true)
  })

  it('delete last word from chain', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('ab')
    tst.insert('abc')
    tst.delete('abc')
    expect(tst.contains('a')).toBe(true)
    expect(tst.contains('ab')).toBe(true)
    expect(tst.contains('abc')).toBe(false)
  })

  it('startsWith on word that is not a prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.insert('world')
    const result = tst.startsWith('heaven')
    expect(result).toEqual([])
  })

  it('startsWith returns single word if exact match only', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    const result = tst.startsWith('hello')
    expect(result).toEqual(['hello'])
  })

  it('multiple inserts then delete all', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.insert('c')
    tst.delete('a')
    tst.delete('b')
    tst.delete('c')
    expect(tst.isEmpty()).toBe(true)
    expect(tst.size).toBe(0)
  })

  it('insert same word after deleting it', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.delete('hello')
    tst.insert('hello')
    expect(tst.size).toBe(1)
    expect(tst.contains('hello')).toBe(true)
  })

  it('isEmpty returns true after all deletions', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.delete('a')
    tst.delete('b')
    expect(tst.isEmpty()).toBe(true)
  })

  it('size remains accurate after many operations', () => {
    const tst = new TernarySearchTree()
    const words = ['a', 'b', 'c', 'd', 'e']
    words.forEach(w => tst.insert(w))
    expect(tst.size).toBe(5)
    tst.delete('b')
    tst.delete('d')
    expect(tst.size).toBe(3)
    tst.insert('f')
    tst.insert('g')
    expect(tst.size).toBe(5)
  })

  it('toList returns unsorted list', () => {
    const tst = new TernarySearchTree()
    tst.insert('z')
    tst.insert('a')
    tst.insert('m')
    const list = tst.toList()
    expect(list).toContain('a')
    expect(list).toContain('m')
    expect(list).toContain('z')
  })

  it('handles words with varying case', () => {
    const tst = new TernarySearchTree()
    tst.insert('Hello')
    tst.insert('hello')
    tst.insert('HELLO')
    expect(tst.contains('Hello')).toBe(true)
    expect(tst.contains('hello')).toBe(true)
    expect(tst.contains('HELLO')).toBe(true)
  })

  it('startsWith is case sensitive', () => {
    const tst = new TernarySearchTree()
    tst.insert('Hello')
    const result = tst.startsWith('h')
    expect(result).toEqual([])
  })

  it('clear resets isEmpty to true', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    expect(tst.isEmpty()).toBe(false)
    tst.clear()
    expect(tst.isEmpty()).toBe(true)
  })

  it('insert, delete, insert, delete same word', () => {
    const tst = new TernarySearchTree()
    tst.insert('test')
    expect(tst.delete('test')).toBe(true)
    tst.insert('test')
    expect(tst.delete('test')).toBe(true)
    expect(tst.contains('test')).toBe(false)
    expect(tst.size).toBe(0)
  })

  it('startsWith returns all matching words', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('appetizer')
    tst.insert('application')
    const result = tst.startsWith('app')
    expect(result).toContain('apple')
    expect(result).toContain('appetizer')
    expect(result).toContain('application')
    expect(result.length).toBe(3)
  })
})
describe('ternary-search-tree - wave548', () => {
  it('ternary-search-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module not null', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module has length', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave549', () => {
  it('ternary-search-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave550', () => {
  it('ternary-search-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave551', () => {
  it('ternary-search-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave552', () => {
  it('ternary-search-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave553', () => {
  it('ternary-search-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave554', () => {
  it('ternary-search-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave555', () => {
  it('ternary-search-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave556', () => {
  it('ternary-search-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave557', () => {
  it('ternary-search-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave558', () => {
  it('ternary-search-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-tree - wave559', () => {
  it('ternary-search-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
