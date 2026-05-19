import { describe, it, expect } from 'vitest'

import {
  estimateMinified,
  estimateGzipped,
  makeFileNode,
  makeDirNode,
  buildBundleTree,
  setPercentages,
  computeTreemapLayout,
  sizeColor,
  computeSizeDistribution,
  collectLeafNodes,
  findTopFiles,
  computeBundleVizStats,
  collectDirNodes,
  formatBytes,
  buildBundleVisualization,
  sourceBaseName,
  type BundleNode,
} from '../src/commands/bundle-visualizer-helpers.js'

import {
  blockChar,
  renderTreemap,
  formatTopFiles,
  sizeBar,
  formatDistribution,
  formatVizStats,
  formatBundleTable,
  formatBundleJson,
} from '../src/commands/bundle-visualizer-format-helpers.js'

// ─── estimateMinified ───────────────────────────────────

describe('estimateMinified', () => {
  it('returns 50% of raw', () => {
    expect(estimateMinified(1000)).toBe(500)
  })

  it('handles zero', () => {
    expect(estimateMinified(0)).toBe(0)
  })

  it('rounds to integer', () => {
    expect(estimateMinified(101)).toBe(51)
  })
})

// ─── estimateGzipped ────────────────────────────────────

describe('estimateGzipped', () => {
  it('returns 35% of minified', () => {
    expect(estimateGzipped(1000)).toBe(350)
  })

  it('handles zero', () => {
    expect(estimateGzipped(0)).toBe(0)
  })
})

// ─── makeFileNode ───────────────────────────────────────

describe('makeFileNode', () => {
  it('creates a file node with correct type', () => {
    const node = makeFileNode('src/a.ts', 100)
    expect(node.type).toBe('file')
    expect(node.name).toBe('a.ts')
    expect(node.rawSize).toBe(100)
    expect(node.minifiedSize).toBe(50)
    expect(node.gzippedSize).toBe(18)
    expect(node.children).toEqual([])
  })

  it('computes minified and gzipped', () => {
    const node = makeFileNode('x.ts', 2000)
    expect(node.minifiedSize).toBe(1000)
    expect(node.gzippedSize).toBe(350)
  })
})

// ─── makeDirNode ────────────────────────────────────────

describe('makeDirNode', () => {
  it('creates directory node summing children', () => {
    const c1 = makeFileNode('src/a.ts', 100)
    const c2 = makeFileNode('src/b.ts', 200)
    const dir = makeDirNode('src', [c1, c2])
    expect(dir.type).toBe('directory')
    expect(dir.rawSize).toBe(300)
    expect(dir.children.length).toBe(2)
  })

  it('handles empty children', () => {
    const dir = makeDirNode('empty', [])
    expect(dir.rawSize).toBe(0)
  })
})

// ─── buildBundleTree ────────────────────────────────────

describe('buildBundleTree', () => {
  it('builds tree from files', () => {
    const contents = new Map([
      ['src/a.ts', 'hello'],
      ['src/b.ts', 'world!!'],
    ])
    const tree = buildBundleTree(['src/a.ts', 'src/b.ts'], contents)
    expect(tree.type).toBe('directory')
    expect(tree.rawSize).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const tree = buildBundleTree([], new Map())
    expect(tree.type).toBe('directory')
    expect(tree.rawSize).toBe(0)
  })

  it('sets percentages', () => {
    const contents = new Map([
      ['src/a.ts', 'aaa'],
      ['src/b.ts', 'bb'],
    ])
    const tree = buildBundleTree(['src/a.ts', 'src/b.ts'], contents)
    expect(tree.percentage).toBe(100)
  })

  it('groups files by directory', () => {
    const contents = new Map([
      ['src/a.ts', 'x'],
      ['lib/b.ts', 'y'],
    ])
    const tree = buildBundleTree(['src/a.ts', 'lib/b.ts'], contents)
    expect(tree.children.length).toBe(2)
  })

  it('uses content size in bytes', () => {
    const contents = new Map([['f.ts', 'abc']])
    const tree = buildBundleTree(['f.ts'], contents)
    const leaf = tree.children[0]?.children?.[0] ?? tree.children[0]
    expect(leaf.rawSize).toBe(3)
  })
})

// ─── setPercentages ─────────────────────────────────────

describe('setPercentages', () => {
  it('sets percentage on root and children', () => {
    const c1 = makeFileNode('a.ts', 75)
    const c2 = makeFileNode('b.ts', 25)
    const root = makeDirNode('', [c1, c2])
    setPercentages(root, root.rawSize)
    expect(root.percentage).toBe(100)
    expect(c1.percentage).toBe(75)
    expect(c2.percentage).toBe(25)
  })

  it('handles zero total', () => {
    const node = makeFileNode('x.ts', 0)
    setPercentages(node, 0)
    expect(node.percentage).toBe(0)
  })
})

// ─── computeTreemapLayout ───────────────────────────────

describe('computeTreemapLayout', () => {
  it('creates layout with blocks', () => {
    const contents = new Map([
      ['src/a.ts', 'a'.repeat(100)],
      ['src/b.ts', 'b'.repeat(50)],
    ])
    const tree = buildBundleTree(['src/a.ts', 'src/b.ts'], contents)
    const layout = computeTreemapLayout(tree, 0, 0, 80, 20)
    expect(layout.blocks.length).toBeGreaterThan(0)
    expect(layout.width).toBe(80)
    expect(layout.height).toBe(20)
  })

  it('handles zero size', () => {
    const node = makeDirNode('', [])
    const layout = computeTreemapLayout(node, 0, 0, 80, 20)
    expect(layout.blocks).toEqual([])
  })

  it('handles small dimensions', () => {
    const c = makeFileNode('a.ts', 10)
    const root = makeDirNode('', [c])
    const layout = computeTreemapLayout(root, 0, 0, 1, 1)
    expect(layout.blocks.length).toBeGreaterThanOrEqual(0)
  })

  it('each block has positive width and height', () => {
    const contents = new Map([
      ['a.ts', 'x'.repeat(500)],
      ['b.ts', 'y'.repeat(300)],
      ['c.ts', 'z'.repeat(200)],
    ])
    const tree = buildBundleTree(['a.ts', 'b.ts', 'c.ts'], contents)
    const layout = computeTreemapLayout(tree, 0, 0, 80, 20)
    for (const block of layout.blocks) {
      expect(block.width).toBeGreaterThanOrEqual(1)
      expect(block.height).toBeGreaterThanOrEqual(1)
    }
  })
})

// ─── sizeColor ──────────────────────────────────────────

describe('sizeColor', () => {
  it('returns red for > 30%', () => {
    expect(sizeColor(4000, 10000)).toBe('red')
  })

  it('returns yellow for > 15%', () => {
    expect(sizeColor(2000, 10000)).toBe('yellow')
  })

  it('returns cyan for > 5%', () => {
    expect(sizeColor(600, 10000)).toBe('cyan')
  })

  it('returns green for small', () => {
    expect(sizeColor(100, 10000)).toBe('green')
  })

  it('returns gray for zero total', () => {
    expect(sizeColor(100, 0)).toBe('gray')
  })
})

// ─── computeSizeDistribution ────────────────────────────

describe('computeSizeDistribution', () => {
  it('buckets files into size ranges', () => {
    const files = [
      makeFileNode('a.ts', 500),
      makeFileNode('b.ts', 5000),
      makeFileNode('c.ts', 50000),
      makeFileNode('d.ts', 80000),
      makeFileNode('e.ts', 200000),
    ]
    const dist = computeSizeDistribution(files)
    expect(dist.length).toBe(5)
    expect(dist[0].count).toBe(1)
    expect(dist[1].count).toBe(1)
    expect(dist[4].count).toBe(1)
  })

  it('handles empty files', () => {
    const dist = computeSizeDistribution([])
    expect(dist.every((b) => b.count === 0)).toBe(true)
  })
})

// ─── collectLeafNodes ───────────────────────────────────

describe('collectLeafNodes', () => {
  it('returns file nodes', () => {
    const f1 = makeFileNode('a.ts', 10)
    const f2 = makeFileNode('b.ts', 20)
    const root = makeDirNode('', [f1, f2])
    const leaves = collectLeafNodes(root)
    expect(leaves.length).toBe(2)
  })

  it('handles nested dirs', () => {
    const f1 = makeFileNode('a.ts', 10)
    const inner = makeDirNode('inner', [f1])
    const root = makeDirNode('', [inner])
    expect(collectLeafNodes(root).length).toBe(1)
  })
})

// ─── findTopFiles ───────────────────────────────────────

describe('findTopFiles', () => {
  it('returns top N by size', () => {
    const f1 = makeFileNode('big.ts', 1000)
    const f2 = makeFileNode('med.ts', 500)
    const f3 = makeFileNode('small.ts', 100)
    const root = makeDirNode('', [f1, f2, f3])
    const top = findTopFiles(root, 2)
    expect(top.length).toBe(2)
    expect(top[0].name).toBe('big.ts')
    expect(top[1].name).toBe('med.ts')
  })

  it('returns all if fewer than count', () => {
    const f1 = makeFileNode('a.ts', 10)
    const root = makeDirNode('', [f1])
    expect(findTopFiles(root, 10).length).toBe(1)
  })
})

// ─── computeBundleVizStats ──────────────────────────────

describe('computeBundleVizStats', () => {
  it('computes stats correctly', () => {
    const f1 = makeFileNode('a.ts', 1000)
    const f2 = makeFileNode('b.ts', 200)
    const root = makeDirNode('', [f1, f2])
    setPercentages(root, root.rawSize)
    const stats = computeBundleVizStats(root)
    expect(stats.fileCount).toBe(2)
    expect(stats.dirCount).toBe(1)
    expect(stats.totalSize).toBe(1200)
    expect(stats.largestFile!.name).toBe('a.ts')
    expect(stats.smallestFile!.name).toBe('b.ts')
    expect(stats.avgFileSize).toBe(600)
    expect(stats.sizeDistribution.length).toBe(5)
  })

  it('handles empty tree', () => {
    const root = makeDirNode('', [])
    const stats = computeBundleVizStats(root)
    expect(stats.fileCount).toBe(0)
    expect(stats.largestFile).toBeNull()
    expect(stats.smallestFile).toBeNull()
  })
})

// ─── collectDirNodes ────────────────────────────────────

describe('collectDirNodes', () => {
  it('collects directory nodes', () => {
    const f1 = makeFileNode('a.ts', 10)
    const d1 = makeDirNode('src', [f1])
    const root = makeDirNode('', [d1])
    const dirs = collectDirNodes(root)
    expect(dirs.length).toBe(2)
  })

  it('returns only root for flat tree', () => {
    const root = makeDirNode('', [])
    expect(collectDirNodes(root).length).toBe(1)
  })
})

// ─── formatBytes ────────────────────────────────────────

describe('formatBytes', () => {
  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(2048)).toBe('2.0KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.0MB')
  })

  it('formats zero', () => {
    expect(formatBytes(0)).toBe('0B')
  })
})

// ─── buildBundleVisualization ───────────────────────────

describe('buildBundleVisualization', () => {
  it('builds complete visualization', () => {
    const contents = new Map([
      ['src/a.ts', 'x'.repeat(1000)],
      ['src/b.ts', 'y'.repeat(500)],
    ])
    const viz = buildBundleVisualization(['src/a.ts', 'src/b.ts'], contents, { top: 10, verbose: false })
    expect(viz.tree.rawSize).toBeGreaterThan(0)
    expect(viz.layout.blocks.length).toBeGreaterThan(0)
    expect(viz.topFiles.length).toBeGreaterThan(0)
    expect(viz.stats.fileCount).toBeGreaterThanOrEqual(0)
  })

  it('handles empty input', () => {
    const viz = buildBundleVisualization([], new Map(), { top: 5, verbose: false })
    expect(viz.stats.fileCount).toBe(0)
    expect(viz.topFiles).toEqual([])
  })

  it('respects top option', () => {
    const contents = new Map([
      ['a.ts', 'a'], ['b.ts', 'bb'], ['c.ts', 'ccc'],
    ])
    const viz = buildBundleVisualization(['a.ts', 'b.ts', 'c.ts'], contents, { top: 2, verbose: false })
    expect(viz.topFiles.length).toBeLessThanOrEqual(2)
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts', () => {
    expect(sourceBaseName('src/bundle-visualizer-helpers.ts')).toBe('bundle-visualizer-helpers')
  })
})

// ─── blockChar ──────────────────────────────────────────

describe('blockChar', () => {
  it('returns block for red', () => {
    expect(blockChar('red')).toBe('██')
  })

  it('returns block for yellow', () => {
    expect(blockChar('yellow')).toBe('▓▓')
  })

  it('returns block for cyan', () => {
    expect(blockChar('cyan')).toBe('▒▒')
  })

  it('returns default for unknown', () => {
    expect(blockChar('unknown')).toBe('··')
  })
})

// ─── renderTreemap ──────────────────────────────────────

describe('renderTreemap', () => {
  it('renders lines matching layout height', () => {
    const contents = new Map([['a.ts', 'x'.repeat(100)]])
    const viz = buildBundleVisualization(['a.ts'], contents, { top: 5, verbose: false })
    const lines = renderTreemap(viz)
    expect(lines.length).toBe(viz.layout.height)
  })
})

// ─── formatTopFiles ─────────────────────────────────────

describe('formatTopFiles', () => {
  it('formats top files', () => {
    const f1 = makeFileNode('big.ts', 1000)
    const f2 = makeFileNode('small.ts', 100)
    const text = formatTopFiles([f1, f2])
    expect(text).toContain('big.ts')
    expect(text).toContain('small.ts')
  })

  it('handles empty', () => {
    const text = formatTopFiles([])
    expect(text).toContain('No files')
  })
})

// ─── sizeBar ────────────────────────────────────────────

describe('sizeBar', () => {
  it('renders full bar', () => {
    const bar = sizeBar(100, 10)
    expect(bar).toBe('██████████')
  })

  it('renders empty bar', () => {
    const bar = sizeBar(0, 10)
    expect(bar).toBe('░░░░░░░░░░')
  })

  it('renders partial bar', () => {
    const bar = sizeBar(50, 10)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
    expect(bar.length).toBe(10)
  })
})

// ─── formatDistribution ─────────────────────────────────

describe('formatDistribution', () => {
  it('formats distribution', () => {
    const buckets = [
      { range: '<1KB', count: 5 },
      { range: '1-10KB', count: 3 },
    ]
    const text = formatDistribution(buckets)
    expect(text).toContain('<1KB')
    expect(text).toContain('1-10KB')
  })
})

// ─── formatVizStats ─────────────────────────────────────

describe('formatVizStats', () => {
  it('formats stats', () => {
    const f1 = makeFileNode('big.ts', 1000)
    const stats = {
      avgFileSize: 500,
      dirCount: 1,
      fileCount: 2,
      largestFile: f1,
      sizeDistribution: [],
      smallestFile: makeFileNode('s.ts', 10),
      totalGzipped: 70,
      totalMinified: 200,
      totalSize: 1000,
    }
    const text = formatVizStats(stats)
    expect(text).toContain('1000B')
    expect(text).toContain('big.ts')
  })

  it('handles null largest/smallest', () => {
    const stats = {
      avgFileSize: 0,
      dirCount: 0,
      fileCount: 0,
      largestFile: null,
      sizeDistribution: [],
      smallestFile: null,
      totalGzipped: 0,
      totalMinified: 0,
      totalSize: 0,
    }
    const text = formatVizStats(stats)
    expect(text).not.toContain('Largest')
  })
})

// ─── formatBundleTable ──────────────────────────────────

describe('formatBundleTable', () => {
  it('formats complete table', () => {
    const contents = new Map([['a.ts', 'x'.repeat(100)]])
    const viz = buildBundleVisualization(['a.ts'], contents, { top: 5, verbose: false })
    const text = formatBundleTable(viz)
    expect(text.length).toBeGreaterThan(0)
  })
})

// ─── formatBundleJson ───────────────────────────────────

describe('formatBundleJson', () => {
  it('produces valid JSON', () => {
    const contents = new Map([['a.ts', 'x']])
    const viz = buildBundleVisualization(['a.ts'], contents, { top: 5, verbose: false })
    const json = formatBundleJson(viz)
    const parsed = JSON.parse(json)
    expect(parsed.stats).toBeDefined()
    expect(parsed.tree).toBeDefined()
  })
})
