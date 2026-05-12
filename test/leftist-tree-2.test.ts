import { describe, it, expect } from 'vitest'
import { LeftistTree2 } from '../src/core/leftist-tree-2/index.js'

describe('LeftistTree2 - Empty Tree', () => {
  it('should create empty tree', () => {
    const tree = new LeftistTree2<number>()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
  })

  it('should throw on peek when empty', () => {
    const tree = new LeftistTree2<number>()
    expect(() => tree.peek()).toThrow('peek called on empty tree')
  })

  it('should throw on extractMin when empty', () => {
    const tree = new LeftistTree2<number>()
    expect(() => tree.extractMin()).toThrow('extractMin called on empty tree')
  })

  it('should clear empty tree', () => {
    const tree = new LeftistTree2<number>()
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
  })

  it('should convert empty tree to array', () => {
    const tree = new LeftistTree2<number>()
    expect(tree.toArray()).toEqual([])
  })
})

describe('LeftistTree2 - Single Element', () => {
  it('should insert single element', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.size).toBe(1)
    expect(tree.peek()).toBe(5)
  })

  it('should extract single element', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    const extracted = tree.extractMin()
    expect(extracted).toBe(5)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
  })

  it('should peek single element', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    expect(tree.peek()).toBe(5)
    expect(tree.size).toBe(1)
  })

  it('should clear single element', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
  })

  it('should convert single element to array', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    expect(tree.toArray()).toEqual([5])
  })
})

describe('LeftistTree2 - Insert and Extract', () => {
  it('should insert multiple elements in any order', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)
    expect(tree.peek()).toBe(1)
    expect(tree.size).toBe(5)
  })

  it('should extract elements in ascending order', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)

    const extracted: number[] = []
    while (!tree.isEmpty()) {
      extracted.push(tree.extractMin())
    }
    expect(extracted).toEqual([1, 3, 5, 7, 9])
  })

  it('should handle duplicate elements', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(5)
    tree.insert(3)
    tree.insert(1)

    const extracted: number[] = []
    while (!tree.isEmpty()) {
      extracted.push(tree.extractMin())
    }
    expect(extracted).toEqual([1, 3, 3, 5, 5])
  })

  it('should handle negative numbers', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(-5)
    tree.insert(3)
    tree.insert(-10)
    tree.insert(0)
    tree.insert(7)

    expect(tree.peek()).toBe(-10)
    const extracted: number[] = []
    while (!tree.isEmpty()) {
      extracted.push(tree.extractMin())
    }
    expect(extracted).toEqual([-10, -5, 0, 3, 7])
  })

  it('should handle zero', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(0)
    tree.insert(5)
    tree.insert(-3)
    tree.insert(0)

    const extracted: number[] = []
    while (!tree.isEmpty()) {
      extracted.push(tree.extractMin())
    }
    expect(extracted).toEqual([-3, 0, 0, 5])
  })
})

describe('LeftistTree2 - Peek', () => {
  it('should peek without removing', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.peek()).toBe(3)
    expect(tree.size).toBe(3)
    expect(tree.peek()).toBe(3)
  })

  it('should peek after multiple inserts', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    expect(tree.peek()).toBe(5)
    tree.insert(3)
    expect(tree.peek()).toBe(3)
    tree.insert(1)
    expect(tree.peek()).toBe(1)
    tree.insert(7)
    expect(tree.peek()).toBe(1)
  })

  it('should peek after extract', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)

    tree.extractMin()
    expect(tree.peek()).toBe(3)
    tree.extractMin()
    expect(tree.peek()).toBe(5)
  })
})

describe('LeftistTree2 - Clear', () => {
  it('should clear multiple elements', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)

    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(() => tree.peek()).toThrow('peek called on empty tree')
  })

  it('should be reusable after clear', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.clear()
    tree.insert(7)
    tree.insert(1)

    expect(tree.isEmpty()).toBe(false)
    expect(tree.size).toBe(2)
    expect(tree.peek()).toBe(1)
  })
})

describe('LeftistTree2 - To Array', () => {
  it('should convert to sorted array', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)

    expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
  })

  it('should preserve original tree after toArray', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)

    const array = tree.toArray()
    expect(array).toEqual([3, 5, 7])
    expect(tree.isEmpty()).toBe(false)
    expect(tree.size).toBe(3)
  })

  it('should convert large tree to array', () => {
    const tree = new LeftistTree2<number>()
    for (let i = 0; i < 100; i++) {
      tree.insert(Math.floor(Math.random() * 1000))
    }

    const array = tree.toArray()
    expect(array.length).toBe(100)
    for (let i = 1; i < array.length; i++) {
      expect(array[i]! >= array[i - 1]!).toBe(true)
    }
  })
})

describe('LeftistTree2 - Merge', () => {
  it('should merge two empty trees', () => {
    const tree1 = new LeftistTree2<number>()
    const tree2 = new LeftistTree2<number>()
    const merged = tree1.merge(tree2)

    expect(merged.isEmpty()).toBe(true)
    expect(merged.size).toBe(0)
    expect(tree1.isEmpty()).toBe(true)
    expect(tree2.isEmpty()).toBe(true)
  })

  it('should merge empty tree with non-empty tree', () => {
    const tree1 = new LeftistTree2<number>()
    const tree2 = new LeftistTree2<number>()
    tree2.insert(5)
    tree2.insert(3)
    tree2.insert(7)

    const merged = tree1.merge(tree2)

    expect(merged.size).toBe(3)
    expect(merged.toArray()).toEqual([3, 5, 7])
  })

  it('should merge non-empty tree with empty tree', () => {
    const tree1 = new LeftistTree2<number>()
    tree1.insert(5)
    tree1.insert(3)
    tree1.insert(7)
    const tree2 = new LeftistTree2<number>()

    const merged = tree1.merge(tree2)

    expect(merged.size).toBe(3)
    expect(merged.toArray()).toEqual([3, 5, 7])
  })

  it('should merge two non-empty trees', () => {
    const tree1 = new LeftistTree2<number>()
    tree1.insert(1)
    tree1.insert(3)
    tree1.insert(5)

    const tree2 = new LeftistTree2<number>()
    tree2.insert(2)
    tree2.insert(4)
    tree2.insert(6)

    const merged = tree1.merge(tree2)

    expect(merged.size).toBe(6)
    expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should merge trees with overlapping elements', () => {
    const tree1 = new LeftistTree2<number>()
    tree1.insert(1)
    tree1.insert(3)
    tree1.insert(5)

    const tree2 = new LeftistTree2<number>()
    tree2.insert(3)
    tree2.insert(5)
    tree2.insert(7)

    const merged = tree1.merge(tree2)

    expect(merged.size).toBe(6)
    expect(merged.toArray()).toEqual([1, 3, 3, 5, 5, 7])
  })

  it('should preserve original trees after merge', () => {
    const tree1 = new LeftistTree2<number>()
    tree1.insert(1)
    tree1.insert(3)
    tree1.insert(5)

    const tree2 = new LeftistTree2<number>()
    tree2.insert(2)
    tree2.insert(4)
    tree2.insert(6)

    const merged = tree1.merge(tree2)

    expect(tree1.size).toBe(3)
    expect(tree2.size).toBe(3)
    expect(merged.size).toBe(6)
    expect(tree1.toArray()).toEqual([1, 3, 5])
    expect(tree2.toArray()).toEqual([2, 4, 6])
  })
})

describe('LeftistTree2 - Merge Sequences', () => {
  it('should merge multiple trees sequentially', () => {
    const tree1 = new LeftistTree2<number>()
    tree1.insert(1)
    tree1.insert(2)

    const tree2 = new LeftistTree2<number>()
    tree2.insert(3)
    tree2.insert(4)

    const tree3 = new LeftistTree2<number>()
    tree3.insert(5)
    tree3.insert(6)

    const merged = tree1.merge(tree2).merge(tree3)

    expect(merged.size).toBe(6)
    expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should merge trees of different sizes', () => {
    const tree1 = new LeftistTree2<number>()
    for (let i = 0; i < 10; i++) {
      tree1.insert(i)
    }

    const tree2 = new LeftistTree2<number>()
    for (let i = 10; i < 30; i++) {
      tree2.insert(i)
    }

    const merged = tree1.merge(tree2)

    expect(merged.size).toBe(30)
    expect(merged.toArray()).toEqual(Array.from({ length: 30 }, (_, i) => i))
  })
})

describe('LeftistTree2 - Custom Comparator', () => {
  it('should create max-heap with custom comparator', () => {
    const tree = new LeftistTree2<number>({
      comparator: (a, b) => (a < b ? 1 : a > b ? -1 : 0),
    })

    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)

    const extracted: number[] = []
    while (!tree.isEmpty()) {
      extracted.push(tree.extractMin())
    }
    expect(extracted).toEqual([9, 7, 5, 3, 1])
  })

  it('should merge trees with same comparator', () => {
    const tree1 = new LeftistTree2<string>({
      comparator: (a, b) => b.localeCompare(a),
    })
    tree1.insert('apple')
    tree1.insert('banana')

    const tree2 = new LeftistTree2<string>({
      comparator: (a, b) => b.localeCompare(a),
    })
    tree2.insert('cherry')
    tree2.insert('date')

    const merged = tree1.merge(tree2)

    expect(merged.toArray()).toEqual(['date', 'cherry', 'banana', 'apple'])
  })
})

describe('LeftistTree2 - String Type', () => {
  it('should handle strings', () => {
    const tree = new LeftistTree2<string>()
    tree.insert('zebra')
    tree.insert('apple')
    tree.insert('banana')
    tree.insert('cherry')

    expect(tree.peek()).toBe('apple')
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry', 'zebra'])
  })

  it('should handle empty strings', () => {
    const tree = new LeftistTree2<string>()
    tree.insert('a')
    tree.insert('')
    tree.insert('b')

    expect(tree.peek()).toBe('')
    expect(tree.toArray()).toEqual(['', 'a', 'b'])
  })
})

describe('LeftistTree2 - Object Type', () => {
  it('should handle objects with custom comparator', () => {
    interface Person {
      name: string
      age: number
    }

    const tree = new LeftistTree2<Person>({
      comparator: (a, b) => a.age - b.age,
    })

    tree.insert({ name: 'Alice', age: 30 })
    tree.insert({ name: 'Bob', age: 25 })
    tree.insert({ name: 'Charlie', age: 35 })
    tree.insert({ name: 'Diana', age: 28 })

    const extracted: Person[] = []
    while (!tree.isEmpty()) {
      extracted.push(tree.extractMin())
    }
    expect(extracted).toEqual([
      { name: 'Bob', age: 25 },
      { name: 'Diana', age: 28 },
      { name: 'Alice', age: 30 },
      { name: 'Charlie', age: 35 },
    ])
  })
})

describe('LeftistTree2 - Edge Cases', () => {
  it('should handle alternating insert and extract', () => {
    const tree = new LeftistTree2<number>()

    tree.insert(5)
    expect(tree.extractMin()).toBe(5)

    tree.insert(3)
    tree.insert(7)
    expect(tree.extractMin()).toBe(3)

    tree.insert(1)
    expect(tree.extractMin()).toBe(1)
    expect(tree.extractMin()).toBe(7)

    tree.insert(9)
    tree.insert(2)
    expect(tree.extractMin()).toBe(2)
    expect(tree.extractMin()).toBe(9)

    expect(tree.isEmpty()).toBe(true)
  })

  it('should handle insert then peek then extract', () => {
    const tree = new LeftistTree2<number>()

    tree.insert(5)
    expect(tree.peek()).toBe(5)
    expect(tree.extractMin()).toBe(5)

    tree.insert(3)
    expect(tree.peek()).toBe(3)
    expect(tree.extractMin()).toBe(3)

    expect(tree.isEmpty()).toBe(true)
  })

  it('should handle same value multiple times', () => {
    const tree = new LeftistTree2<number>()

    for (let i = 0; i < 10; i++) {
      tree.insert(5)
    }

    expect(tree.size).toBe(10)
    expect(tree.peek()).toBe(5)

    for (let i = 0; i < 10; i++) {
      expect(tree.extractMin()).toBe(5)
    }

    expect(tree.isEmpty()).toBe(true)
  })
})

describe('LeftistTree2 - Stress Test', () => {
  it('should handle 1000 elements', () => {
    const tree = new LeftistTree2<number>()
    const elements: number[] = []

    for (let i = 0; i < 1000; i++) {
      const value = Math.floor(Math.random() * 10000)
      elements.push(value)
      tree.insert(value)
    }

    expect(tree.size).toBe(1000)

    const sorted = [...elements].sort((a, b) => a - b)
    expect(tree.toArray()).toEqual(sorted)
  })

  it('should handle 10000 elements', () => {
    const tree = new LeftistTree2<number>()
    const elements: number[] = []

    for (let i = 0; i < 10000; i++) {
      const value = Math.floor(Math.random() * 100000)
      elements.push(value)
      tree.insert(value)
    }

    expect(tree.size).toBe(10000)

    const sorted = [...elements].sort((a, b) => a - b)
    expect(tree.toArray()).toEqual(sorted)
  })

  it('should handle sequential insert and extract', () => {
    const tree = new LeftistTree2<number>()

    for (let i = 0; i < 1000; i++) {
      tree.insert(i)
    }

    for (let i = 0; i < 1000; i++) {
      expect(tree.extractMin()).toBe(i)
    }

    expect(tree.isEmpty()).toBe(true)
  })

  it('should handle reverse sequential insert', () => {
    const tree = new LeftistTree2<number>()

    for (let i = 999; i >= 0; i--) {
      tree.insert(i)
    }

    for (let i = 0; i < 1000; i++) {
      expect(tree.extractMin()).toBe(i)
    }

    expect(tree.isEmpty()).toBe(true)
  })
})

describe('LeftistTree2 - Size Property', () => {
  it('should track size correctly on insert', () => {
    const tree = new LeftistTree2<number>()

    expect(tree.size).toBe(0)

    tree.insert(1)
    expect(tree.size).toBe(1)

    tree.insert(2)
    expect(tree.size).toBe(2)

    tree.insert(3)
    expect(tree.size).toBe(3)
  })

  it('should track size correctly on extract', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)

    tree.extractMin()
    expect(tree.size).toBe(2)

    tree.extractMin()
    expect(tree.size).toBe(1)

    tree.extractMin()
    expect(tree.size).toBe(0)
  })

  it('should track size correctly on clear', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)

    expect(tree.size).toBe(3)

    tree.clear()
    expect(tree.size).toBe(0)
  })

  it('should track size correctly on merge', () => {
    const tree1 = new LeftistTree2<number>()
    tree1.insert(1)
    tree1.insert(2)
    tree1.insert(3)

    const tree2 = new LeftistTree2<number>()
    tree2.insert(4)
    tree2.insert(5)

    const merged = tree1.merge(tree2)

    expect(tree1.size).toBe(3)
    expect(tree2.size).toBe(2)
    expect(merged.size).toBe(5)
  })
})

describe('LeftistTree2 - IsEmpty', () => {
  it('should return true for empty tree', () => {
    const tree = new LeftistTree2<number>()
    expect(tree.isEmpty()).toBe(true)
  })

  it('should return false after insert', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(1)
    expect(tree.isEmpty()).toBe(false)
  })

  it('should return true after extracting all elements', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)

    tree.extractMin()
    tree.extractMin()
    tree.extractMin()

    expect(tree.isEmpty()).toBe(true)
  })

  it('should return true after clear', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(1)
    tree.insert(2)

    tree.clear()
    expect(tree.isEmpty()).toBe(true)
  })
})
