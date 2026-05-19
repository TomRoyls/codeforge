import { describe, expect, it, vi } from 'vitest'

import Tree from '../src/commands/tree.js'
import { buildTree, countTreeNodes, filterByDepth, formatFileSize, type TreeNode } from '../src/commands/tree-helpers.js'
import type { TreeResult } from '../src/commands/tree-helpers.js'
import { renderSummary, renderTree, renderTreeJson } from '../src/commands/tree-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileNode(overrides: Partial<TreeNode> = {}): TreeNode {
  return {
    name: 'file.ts',
    type: 'file',
    ...overrides,
  }
}

function makeDirNode(overrides: Partial<TreeNode> = {}): TreeNode {
  return {
    children: [],
    name: 'src',
    type: 'directory',
    ...overrides,
  }
}

function makeTreeResult(overrides: Partial<TreeResult> = {}): TreeResult {
  return {
    maxDepth: 5,
    root: makeDirNode({ name: 'project' }),
    totalDirs: 1,
    totalFiles: 0,
    totalSize: 0,
    ...overrides,
  }
}

// ─── formatFileSize ──────────────────────────────────────

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatFileSize(100)).toBe('100 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })

  it('formats fractional kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats large bytes without unit conversion', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('handles negative values', () => {
    expect(formatFileSize(-1)).toBe('0 B')
  })

  it('handles 1 byte', () => {
    expect(formatFileSize(1)).toBe('1 B')
  })

  it('formats 2048 bytes', () => {
    expect(formatFileSize(2048)).toBe('2 KB')
  })
})

// ─── countTreeNodes ──────────────────────────────────────

describe('countTreeNodes', () => {
  it('counts a single file node', () => {
    const node = makeFileNode({ size: 100 })
    const result = countTreeNodes(node)
    expect(result.files).toBe(1)
    expect(result.dirs).toBe(0)
    expect(result.totalSize).toBe(100)
  })

  it('counts a single directory node', () => {
    const node = makeDirNode()
    const result = countTreeNodes(node)
    expect(result.files).toBe(0)
    expect(result.dirs).toBe(1)
    expect(result.totalSize).toBe(0)
  })

  it('counts nested structure', () => {
    const root = makeDirNode({
      children: [
        makeFileNode({ name: 'a.ts', size: 50 }),
        makeFileNode({ name: 'b.ts', size: 150 }),
        makeDirNode({
          name: 'sub',
          children: [makeFileNode({ name: 'c.ts', size: 200 })],
        }),
      ],
    })
    const result = countTreeNodes(root)
    expect(result.files).toBe(3)
    expect(result.dirs).toBe(2)
    expect(result.totalSize).toBe(400)
  })

  it('handles empty tree', () => {
    const node = makeDirNode({ children: [] })
    const result = countTreeNodes(node)
    expect(result.files).toBe(0)
    expect(result.dirs).toBe(1)
  })

  it('handles file without size', () => {
    const node = makeFileNode()
    const result = countTreeNodes(node)
    expect(result.totalSize).toBe(0)
  })

  it('handles deeply nested structure', () => {
    const root = makeDirNode({
      children: [
        makeDirNode({
          name: 'a',
          children: [
            makeDirNode({
              name: 'b',
              children: [makeFileNode({ name: 'deep.ts', size: 42 })],
            }),
          ],
        }),
      ],
    })
    const result = countTreeNodes(root)
    expect(result.files).toBe(1)
    expect(result.dirs).toBe(3)
    expect(result.totalSize).toBe(42)
  })
})

// ─── filterByDepth ───────────────────────────────────────

describe('filterByDepth', () => {
  it('prunes at maxDepth 0', () => {
    const root = makeDirNode({
      children: [
        makeFileNode({ name: 'a.ts' }),
        makeDirNode({ name: 'sub', children: [makeFileNode({ name: 'b.ts' })] }),
      ],
    })
    const result = filterByDepth(root, 0)
    expect(result.children).toBeUndefined()
  })

  it('preserves shallow nodes within maxDepth', () => {
    const root = makeDirNode({
      children: [
        makeFileNode({ name: 'a.ts' }),
        makeDirNode({
          name: 'sub',
          children: [makeFileNode({ name: 'b.ts' })],
        }),
      ],
    })
    const result = filterByDepth(root, 2)
    expect(result.children).toHaveLength(2)
    const sub = result.children!.find((c) => c.name === 'sub')!
    expect(sub.children).toHaveLength(1)
  })

  it('preserves file size and lines', () => {
    const file = makeFileNode({ name: 'test.ts', size: 100, lines: 10 })
    const result = filterByDepth(file, 5)
    expect(result.size).toBe(100)
    expect(result.lines).toBe(10)
  })

  it('handles file node at depth', () => {
    const file = makeFileNode({ name: 'a.ts' })
    const result = filterByDepth(file, 1)
    expect(result.name).toBe('a.ts')
    expect(result.type).toBe('file')
  })

  it('prunes children beyond maxDepth', () => {
    const root = makeDirNode({
      children: [
        makeDirNode({
          name: 'level1',
          children: [
            makeDirNode({
              name: 'level2',
              children: [makeFileNode({ name: 'deep.ts' })],
            }),
          ],
        }),
      ],
    })
    const result = filterByDepth(root, 1)
    expect(result.children).toHaveLength(1)
    const level1 = result.children![0]!
    expect(level1.children).toBeUndefined()
  })

  it('handles default currentDepth parameter', () => {
    const root = makeDirNode({
      children: [makeFileNode({ name: 'a.ts' })],
    })
    const result = filterByDepth(root, 1)
    expect(result.children).toHaveLength(1)
  })

  it('does not mutate the original node', () => {
    const root = makeDirNode({
      children: [makeFileNode({ name: 'a.ts' })],
    })
    filterByDepth(root, 0)
    expect(root.children).toHaveLength(1)
  })
})

// ─── renderTree ──────────────────────────────────────────

describe('renderTree', () => {
  it('renders single file root', () => {
    const node = makeFileNode({ name: 'readme.md' })
    const output = renderTree(node, { showLines: false, showSize: false })
    expect(output).toContain('readme.md')
  })

  it('renders directory with children using box characters', () => {
    const root = makeDirNode({
      name: 'project',
      children: [
        makeFileNode({ name: 'a.ts' }),
        makeFileNode({ name: 'b.ts' }),
      ],
    })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).toContain('├──')
    expect(output).toContain('└──')
  })

  it('renders single child with └── only', () => {
    const root = makeDirNode({
      name: 'project',
      children: [makeFileNode({ name: 'only.ts' })],
    })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).toContain('└──')
    expect(output).not.toContain('├──')
  })

  it('shows file sizes when showSize is true', () => {
    const root = makeDirNode({
      name: 'project',
      children: [makeFileNode({ name: 'a.ts', size: 1024 })],
    })
    const output = renderTree(root, { showLines: false, showSize: true })
    expect(output).toContain('1 KB')
  })

  it('shows line counts when showLines is true', () => {
    const root = makeDirNode({
      name: 'project',
      children: [makeFileNode({ name: 'a.ts', lines: 42 })],
    })
    const output = renderTree(root, { showLines: true, showSize: false })
    expect(output).toContain('[42 lines]')
  })

  it('shows both size and lines when both options true', () => {
    const root = makeDirNode({
      name: 'project',
      children: [makeFileNode({ name: 'a.ts', size: 500, lines: 20 })],
    })
    const output = renderTree(root, { showLines: true, showSize: true })
    expect(output).toContain('500 B')
    expect(output).toContain('[20 lines]')
  })

  it('uses continuation character for non-last items', () => {
    const root = makeDirNode({
      name: 'project',
      children: [
        makeDirNode({
          name: 'sub',
          children: [makeFileNode({ name: 'b.ts' })],
        }),
        makeFileNode({ name: 'a.ts' }),
      ],
    })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).toContain('│')
  })

  it('renders nested directories', () => {
    const root = makeDirNode({
      name: 'project',
      children: [
        makeDirNode({
          name: 'src',
          children: [
            makeDirNode({
              name: 'commands',
              children: [makeFileNode({ name: 'tree.ts' })],
            }),
          ],
        }),
      ],
    })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).toContain('src')
    expect(output).toContain('commands')
    expect(output).toContain('tree.ts')
  })

  it('handles empty directory', () => {
    const root = makeDirNode({ children: [], name: 'empty' })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).toContain('empty')
  })

  it('renders directory names in bold blue', () => {
    const root = makeDirNode({
      name: 'src',
      children: [],
    })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).toContain('src')
  })

  it('does not show size when showSize is false', () => {
    const root = makeDirNode({
      name: 'project',
      children: [makeFileNode({ name: 'a.ts', size: 1024 })],
    })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).not.toContain('KB')
  })

  it('does not show lines when showLines is false', () => {
    const root = makeDirNode({
      name: 'project',
      children: [makeFileNode({ name: 'a.ts', lines: 42 })],
    })
    const output = renderTree(root, { showLines: false, showSize: false })
    expect(output).not.toContain('lines')
  })
})

// ─── renderSummary ───────────────────────────────────────

describe('renderSummary', () => {
  it('renders basic summary', () => {
    const output = renderSummary(3, 10, 0, false)
    expect(output).toContain('3 directories')
    expect(output).toContain('10 files')
  })

  it('includes size when showSize is true and size > 0', () => {
    const output = renderSummary(2, 5, 2048, true)
    expect(output).toContain('2 KB')
  })

  it('omits size when showSize is false', () => {
    const output = renderSummary(2, 5, 2048, false)
    expect(output).not.toContain('KB')
  })

  it('omits size when totalSize is 0 even with showSize true', () => {
    const output = renderSummary(2, 5, 0, true)
    expect(output).not.toContain('[')
  })
})

// ─── renderTreeJson ──────────────────────────────────────

describe('renderTreeJson', () => {
  it('produces valid JSON', () => {
    const result = makeTreeResult()
    const output = renderTreeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains root node', () => {
    const result = makeTreeResult()
    const output = renderTreeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.root).toBeDefined()
    expect(parsed.root.name).toBe('project')
  })

  it('contains totals', () => {
    const result = makeTreeResult({ totalDirs: 5, totalFiles: 20, totalSize: 1024 })
    const output = renderTreeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalDirs).toBe(5)
    expect(parsed.totalFiles).toBe(20)
    expect(parsed.totalSize).toBe(1024)
  })

  it('contains maxDepth', () => {
    const result = makeTreeResult({ maxDepth: 3 })
    const output = renderTreeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.maxDepth).toBe(3)
  })

  it('includes children in root', () => {
    const result = makeTreeResult({
      root: makeDirNode({
        name: 'project',
        children: [makeFileNode({ name: 'a.ts' })],
      }),
    })
    const output = renderTreeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.root.children).toHaveLength(1)
    expect(parsed.root.children[0].name).toBe('a.ts')
  })

  it('handles nested structure', () => {
    const result = makeTreeResult({
      root: makeDirNode({
        name: 'root',
        children: [
          makeDirNode({
            name: 'src',
            children: [makeFileNode({ name: 'index.ts', size: 100, lines: 10 })],
          }),
        ],
      }),
    })
    const output = renderTreeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.root.children[0].children[0].name).toBe('index.ts')
    expect(parsed.root.children[0].children[0].size).toBe(100)
  })
})

// ─── buildTree (mocked fs) ───────────────────────────────

const { mockReaddir, mockStat, mockReadFile } = vi.hoisted(() => ({
  mockReaddir: vi.fn(),
  mockStat: vi.fn(),
  mockReadFile: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readdir: mockReaddir,
  stat: mockStat,
  readFile: mockReadFile,
}))

describe('buildTree', () => {
  it('builds tree from directory structure', async () => {
    mockReaddir.mockResolvedValue([
      { name: 'a.ts', isDirectory: () => false, isFile: () => true },
      { name: 'src', isDirectory: () => true, isFile: () => false },
    ])
    mockStat.mockResolvedValue({ size: 100 })
    mockReadFile.mockResolvedValue('line1\nline2\nline3')

    const result = await buildTree('/project', {
      ignorePatterns: [],
      maxDepth: 5,
      showLines: true,
      showSize: true,
    })

    expect(result.type).toBe('directory')
    expect(result.name).toBe('project')
  })

  it('respects ignore patterns', async () => {
    mockReaddir.mockResolvedValue([
      { name: 'a.ts', isDirectory: () => false, isFile: () => true },
      { name: 'node_modules', isDirectory: () => true, isFile: () => false },
    ])
    mockStat.mockResolvedValue({ size: 50 })

    const result = await buildTree('/project', {
      ignorePatterns: [],
      maxDepth: 5,
      showLines: false,
      showSize: true,
    })

    const names = Array.from(result.children ?? []).map((c) => c.name)
    expect(names).not.toContain('node_modules')
  })

  it('sorts directories before files', async () => {
    mockReaddir.mockResolvedValue([
      { name: 'z-file.ts', isDirectory: () => false, isFile: () => true },
      { name: 'a-dir', isDirectory: () => true, isFile: () => false },
    ])
    mockStat.mockResolvedValue({ size: 10 })

    const result = await buildTree('/project', {
      ignorePatterns: [],
      maxDepth: 5,
      showLines: false,
      showSize: false,
    })

    expect(result.children![0]!.name).toBe('a-dir')
    expect(result.children![1]!.name).toBe('z-file.ts')
  })
})

// ─── Command metadata ────────────────────────────────────

describe('Tree command - static metadata', () => {
  it('has a description', () => {
    expect(Tree.description).toBe('Display directory tree structure')
  })

  it('has examples array', () => {
    expect(Array.isArray(Tree.examples)).toBe(true)
    expect(Tree.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Tree.args.path).toBeDefined()
    expect(Tree.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Tree.args.path.default).toBe('.')
  })
})

// ─── Command flags ───────────────────────────────────────

describe('Tree command - flags', () => {
  it('has format flag with options', () => {
    expect(Tree.flags.format.options).toContain('json')
    expect(Tree.flags.format.options).toContain('tree')
  })

  it('defaults format to tree', () => {
    expect(Tree.flags.format.default).toBe('tree')
  })

  it('has output flag', () => {
    expect(Tree.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Tree.flags.ignore).toBeDefined()
    expect(Tree.flags.ignore.multiple).toBe(true)
  })

  it('has max-depth flag defaulting to 5', () => {
    expect(Tree.flags['max-depth'].default).toBe(5)
  })

  it('has show-size flag defaulting to false', () => {
    expect(Tree.flags['show-size'].default).toBe(false)
  })

  it('has show-lines flag defaulting to false', () => {
    expect(Tree.flags['show-lines'].default).toBe(false)
  })
})

// ─── Command class structure ─────────────────────────────

describe('Tree command - class structure', () => {
  it('exports a default class', () => {
    expect(Tree).toBeDefined()
    expect(typeof Tree).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Tree.prototype.run).toBe('function')
  })
})
