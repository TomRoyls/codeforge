import { describe, expect, it } from 'vitest'
import { ASTWalker } from '../../../src/core/ast-walker/ast-walker.js'
import type { ASTNode } from '../../../src/core/ast-walker/ast-walker.js'

describe('ASTWalker', () => {
  describe('constructor', () => {
    it('creates instance with default options', () => {
      const walker = new ASTWalker()
      expect(walker).toBeDefined()
    })

    it('creates instance with custom default options', () => {
      const walker = new ASTWalker({ order: 'post' })
      expect(walker).toBeDefined()
    })
  })

  describe('walk', () => {
    const simpleTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'child1', children: [] },
        { type: 'child2', children: [{ type: 'grandchild', children: [] }] },
      ],
    }

    it('walks tree in pre-order by default', () => {
      const walker = new ASTWalker()
      const visited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          visited.push(node.type)
        },
      })
      expect(visited).toEqual(['root', 'child1', 'child2', 'grandchild'])
    })

    it('walks tree in post-order', () => {
      const walker = new ASTWalker()
      const visited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          visited.push(node.type)
        },
      })
      const postOrderVisited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          postOrderVisited.push(node.type)
        },
      })
      expect(postOrderVisited).toEqual(['root', 'child1', 'child2', 'grandchild'])
    })

    it('walks tree in breadth-first order', () => {
      const walker = new ASTWalker()
      const visited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          visited.push(node.type)
        },
      })
      const bfsVisited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          bfsVisited.push(node.type)
        },
      })
      expect(bfsVisited).toEqual(['root', 'child1', 'child2', 'grandchild'])
    })

    it('respects maxDepth option', () => {
      const walker = new ASTWalker()
      const visited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          visited.push(node.type)
        },
      })
      const depthVisited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          depthVisited.push(node.type)
        },
      }, { maxDepth: 1 })
      expect(depthVisited).toEqual(['root', 'child1', 'child2'])
    })

    it('uses filter option to skip nodes', () => {
      const walker = new ASTWalker()
      const visited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          visited.push(node.type)
        },
      })
      const filterVisited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          filterVisited.push(node.type)
        },
      }, { filter: (node) => node.type !== 'child1' })
      expect(filterVisited).toEqual(['root', 'child2', 'grandchild'])
    })

    it('calls exit visitor in pre-order mode', () => {
      const walker = new ASTWalker()
      const entered: string[] = []
      const exited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          entered.push(node.type)
        },
        exit: (node) => {
          exited.push(node.type)
        },
      })
      expect(entered).toEqual(['root', 'child1', 'child2', 'grandchild'])
      expect(exited).toEqual(['child1', 'grandchild', 'child2', 'root'])
    })

    it('returns walk statistics', () => {
      const walker = new ASTWalker()
      const result = walker.walk(simpleTree, {
        enter: () => {},
      })
      expect(result.visited).toBe(4)
      expect(result.skipped).toBe(0)
      expect(result.depth).toBe(2)
    })

    it('skips children when visitor returns false', () => {
      const walker = new ASTWalker()
      const visited: string[] = []
      walker.walk(simpleTree, {
        enter: (node) => {
          visited.push(node.type)
          if (node.type === 'child2') {
            return false
          }
        },
      })
      expect(visited).toEqual(['root', 'child1', 'child2'])
    })
  })

  describe('walkWithDepth', () => {
    const deepTree: ASTNode = {
      type: 'root',
      children: [
        {
          type: 'level1',
          children: [
            {
              type: 'level2',
              children: [{ type: 'level3', children: [] }],
            },
          ],
        },
      ],
    }

    it('walks tree with specified max depth', () => {
      const walker = new ASTWalker()
      const visited: string[] = []
      walker.walkWithDepth(deepTree, 2, {
        enter: (node) => {
          visited.push(node.type)
        },
      })
      expect(visited).toEqual(['root', 'level1', 'level2'])
    })
  })

  describe('find', () => {
    const searchTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'target', children: [] },
        { type: 'other', children: [{ type: 'target', children: [] }] },
      ],
    }

    it('finds first matching node', () => {
      const walker = new ASTWalker()
      const found = walker.find(searchTree, (node) => node.type === 'target')
      expect(found?.type).toBe('target')
    })

    it('returns undefined when node not found', () => {
      const walker = new ASTWalker()
      const found = walker.find(searchTree, (node) => node.type === 'nonexistent')
      expect(found).toBeUndefined()
    })

    it('uses depth in predicate', () => {
      const walker = new ASTWalker()
      const found = walker.find(searchTree, (node, depth) => node.type === 'target' && depth === 1)
      expect(found?.type).toBe('target')
    })
  })

  describe('findAll', () => {
    const multiMatchTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'target', children: [] },
        { type: 'other', children: [{ type: 'target', children: [] }] },
        { type: 'target', children: [] },
      ],
    }

    it('finds all matching nodes', () => {
      const walker = new ASTWalker()
      const found = walker.findAll(multiMatchTree, (node) => node.type === 'target')
      expect(found).toHaveLength(3)
    })

    it('returns empty array when no matches', () => {
      const walker = new ASTWalker()
      const found = walker.findAll(multiMatchTree, (node) => node.type === 'nonexistent')
      expect(found).toEqual([])
    })
  })

  describe('map', () => {
    const mapTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'node1', value: 'a' },
        { type: 'node2', value: 'b' },
      ],
    }

    it('transforms nodes to values', () => {
      const walker = new ASTWalker()
      const mapped = walker.map(mapTree, (node) => node.type)
      expect(mapped).toEqual(['root', 'node1', 'node2'])
    })

    it('uses depth in callback', () => {
      const walker = new ASTWalker()
      const mapped = walker.map(mapTree, (node, depth) => `${node.type}:${depth}`)
      expect(mapped).toEqual(['root:0', 'node1:1', 'node2:1'])
    })
  })

  describe('filter', () => {
    const filterTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'keep', children: [] },
        { type: 'discard', children: [] },
        { type: 'keep', children: [] },
      ],
    }

    it('filters nodes matching predicate', () => {
      const walker = new ASTWalker()
      const filtered = walker.filter(filterTree, (node) => node.type === 'keep')
      expect(filtered).toHaveLength(2)
    })

    it('is alias for findAll', () => {
      const walker = new ASTWalker()
      const filtered = walker.filter(filterTree, (node) => node.type === 'keep')
      const foundAll = walker.findAll(filterTree, (node) => node.type === 'keep')
      expect(filtered).toEqual(foundAll)
    })
  })

  describe('reduce', () => {
    const reduceTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'node1', value: '1' },
        { type: 'node2', value: '2' },
      ],
    }

    it('accumulates values', () => {
      const walker = new ASTWalker()
      const result = walker.reduce(reduceTree, (acc, node) => acc + (node.value || node.type), '')
      expect(result).toBe('root12')
    })

    it('uses initial value', () => {
      const walker = new ASTWalker()
      const result = walker.reduce(reduceTree, (acc, node, depth) => acc + depth, 0)
      expect(result).toBe(2)
    })
  })

  describe('count', () => {
    const countTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'typeA', children: [] },
        { type: 'typeB', children: [{ type: 'typeA', children: [] }] },
        { type: 'typeA', children: [] },
      ],
    }

    it('counts all nodes without predicate', () => {
      const walker = new ASTWalker()
      const count = walker.count(countTree)
      expect(count).toBe(5)
    })

    it('counts nodes matching predicate', () => {
      const walker = new ASTWalker()
      const count = walker.count(countTree, (node) => node.type === 'typeA')
      expect(count).toBe(3)
    })
  })

  describe('getPath', () => {
    const pathTree: ASTNode = {
      type: 'root',
      children: [
        {
          type: 'level1',
          children: [{ type: 'target', children: [] }],
        },
      ],
    }

    it('returns path from root to target', () => {
      const walker = new ASTWalker()
      const target = pathTree.children?.[0]?.children?.[0]
      const path = walker.getPath(pathTree, target as ASTNode)
      expect(path).toHaveLength(3)
      expect(path?.[0].type).toBe('root')
      expect(path?.[2].type).toBe('target')
    })

    it('returns undefined when target not in tree', () => {
      const walker = new ASTWalker()
      const orphan: ASTNode = { type: 'orphan', children: [] }
      const path = walker.getPath(pathTree, orphan)
      expect(path).toBeUndefined()
    })

    it('returns single node path for root', () => {
      const walker = new ASTWalker()
      const path = walker.getPath(pathTree, pathTree)
      expect(path).toEqual([pathTree])
    })
  })

  describe('getDepth', () => {
    const depthTree: ASTNode = {
      type: 'root',
      children: [
        {
          type: 'level1',
          children: [{ type: 'level2', children: [] }],
        },
      ],
    }

    it('returns depth of target node', () => {
      const walker = new ASTWalker()
      const target = depthTree.children?.[0]?.children?.[0]
      const depth = walker.getDepth(depthTree, target as ASTNode)
      expect(depth).toBe(2)
    })

    it('returns 0 for root node', () => {
      const walker = new ASTWalker()
      const depth = walker.getDepth(depthTree, depthTree)
      expect(depth).toBe(0)
    })

    it('returns undefined when target not in tree', () => {
      const walker = new ASTWalker()
      const orphan: ASTNode = { type: 'orphan', children: [] }
      const depth = walker.getDepth(depthTree, orphan)
      expect(depth).toBeUndefined()
    })
  })

  describe('getAncestors', () => {
    const ancestorTree: ASTNode = {
      type: 'root',
      children: [
        {
          type: 'parent',
          children: [{ type: 'child', children: [] }],
        },
      ],
    }

    it('returns ancestor chain excluding target', () => {
      const walker = new ASTWalker()
      const target = ancestorTree.children?.[0]?.children?.[0]
      const ancestors = walker.getAncestors(ancestorTree, target as ASTNode)
      expect(ancestors).toHaveLength(2)
      expect(ancestors?.[0].type).toBe('root')
      expect(ancestors?.[1].type).toBe('parent')
    })

    it('returns empty array for root node', () => {
      const walker = new ASTWalker()
      const ancestors = walker.getAncestors(ancestorTree, ancestorTree)
      expect(ancestors).toEqual([])
    })

    it('returns undefined when target not in tree', () => {
      const walker = new ASTWalker()
      const orphan: ASTNode = { type: 'orphan', children: [] }
      const ancestors = walker.getAncestors(ancestorTree, orphan)
      expect(ancestors).toBeUndefined()
    })
  })

  describe('getStatistics', () => {
    const statsTree: ASTNode = {
      type: 'root',
      children: [
        { type: 'typeA', children: [] },
        {
          type: 'typeB',
          children: [
            { type: 'typeA', children: [] },
            { type: 'typeC', children: [] },
          ],
        },
      ],
    }

    it('calculates tree statistics', () => {
      const walker = new ASTWalker()
      const stats = walker.getStatistics(statsTree)
      expect(stats.totalNodes).toBe(5)
      expect(stats.maxDepth).toBe(2)
      expect(stats.typeCounts.root).toBe(1)
      expect(stats.typeCounts.typeA).toBe(2)
      expect(stats.typeCounts.typeB).toBe(1)
      expect(stats.typeCounts.typeC).toBe(1)
      expect(stats.leafNodes).toBe(3)
      expect(stats.branchNodes).toBe(2)
    })

    it('caches statistics for subsequent calls', () => {
      const walker = new ASTWalker()
      const stats1 = walker.getStatistics(statsTree)
      const stats2 = walker.getStatistics(statsTree)
      expect(stats1).toBe(stats2)
    })

    it('handles single node tree', () => {
      const walker = new ASTWalker()
      const singleNode: ASTNode = { type: 'root', children: [] }
      const stats = walker.getStatistics(singleNode)
      expect(stats.totalNodes).toBe(1)
      expect(stats.maxDepth).toBe(0)
      expect(stats.leafNodes).toBe(1)
      expect(stats.branchNodes).toBe(0)
    })
  })

  describe('clear', () => {
    const clearTree: ASTNode = {
      type: 'root',
      children: [{ type: 'child', children: [] }],
    }

    it('clears statistics cache', () => {
      const walker = new ASTWalker()
      walker.getStatistics(clearTree)
      walker.clear()
      const stats = walker.getStatistics(clearTree)
      expect(stats).toBeDefined()
      expect(stats.totalNodes).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles deeply nested tree', () => {
      const walker = new ASTWalker()
      let currentNode: ASTNode = { type: 'level10', children: [] }
      for (let i = 9; i >= 0; i--) {
        currentNode = { type: `level${i}`, children: [currentNode] }
      }
      const stats = walker.getStatistics(currentNode)
      expect(stats.totalNodes).toBe(11)
      expect(stats.maxDepth).toBe(10)
    })

    it('handles empty tree (single root with no children)', () => {
      const walker = new ASTWalker()
      const emptyTree: ASTNode = { type: 'root', children: [] }
      const stats = walker.getStatistics(emptyTree)
      expect(stats.totalNodes).toBe(1)
      expect(stats.leafNodes).toBe(1)
      expect(stats.branchNodes).toBe(0)
    })
  })
})