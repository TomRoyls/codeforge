import { basename, dirname, normalize } from 'node:path'
import { formatBytesCompact as formatBytes } from '../utils/format-utils.js'

// ─── Types ──────────────────────────────────────────────

export interface BundleNode {
  name: string
  path: string
  rawSize: number
  minifiedSize: number
  gzippedSize: number
  percentage: number
  type: 'file' | 'directory'
  children: BundleNode[]
}

export interface TreemapBlock {
  x: number
  y: number
  width: number
  height: number
  node: BundleNode
  color: string
}

export interface TreemapLayout {
  blocks: TreemapBlock[]
  width: number
  height: number
  totalSize: number
}

export interface BundleVisualization {
  tree: BundleNode
  layout: TreemapLayout
  topFiles: BundleNode[]
  stats: BundleVizStats
}

export interface SizeBucket {
  range: string
  count: number
}

export interface BundleVizStats {
  totalSize: number
  totalMinified: number
  totalGzipped: number
  fileCount: number
  dirCount: number
  avgFileSize: number
  largestFile: BundleNode | null
  smallestFile: BundleNode | null
  sizeDistribution: SizeBucket[]
}

export interface BundleVizOptions {
  top: number
  verbose: boolean
}

// ─── estimateMinified ───────────────────────────────────

/**
 * @example
 * const min = estimateMinified(1000)
 * console.log(min)
 */
export function estimateMinified(raw: number): number {
  return Math.round(raw * 0.5)
}

// ─── estimateGzipped ────────────────────────────────────

/**
 * @example
 * const gz = estimateGzipped(500)
 * console.log(gz)
 */
export function estimateGzipped(minified: number): number {
  return Math.round(minified * 0.35)
}

// ─── makeFileNode ───────────────────────────────────────

/**
 * @example
 * const node = makeFileNode('src/a.ts', 100)
 * console.log(node.type)
 */
export function makeFileNode(filePath: string, rawSize: number): BundleNode {
  return {
    children: [],
    gzippedSize: estimateGzipped(estimateMinified(rawSize)),
    minifiedSize: estimateMinified(rawSize),
    name: basename(filePath),
    path: filePath,
    percentage: 0,
    rawSize,
    type: 'file',
  }
}

// ─── makeDirNode ────────────────────────────────────────

/**
 * @example
 * const dir = makeDirNode('src', [fileNode])
 * console.log(dir.type)
 */
export function makeDirNode(dirPath: string, children: BundleNode[]): BundleNode {
  const rawSize = children.reduce((s, c) => s + c.rawSize, 0)
  const minifiedSize = children.reduce((s, c) => s + c.minifiedSize, 0)
  const gzippedSize = children.reduce((s, c) => s + c.gzippedSize, 0)
  return {
    children,
    gzippedSize,
    minifiedSize,
    name: dirPath === '' ? '.' : basename(dirPath),
    path: dirPath,
    percentage: 0,
    rawSize,
    type: 'directory',
  }
}

// ─── buildBundleTree ────────────────────────────────────

/**
 * @example
 * const tree = buildBundleTree(['src/a.ts', 'src/b.ts'], contents)
 * console.log(tree.type)
 */
export function buildBundleTree(
  files: string[],
  contents: Map<string, string>,
): BundleNode {
  if (files.length === 0) {
    return {
      children: [],
      gzippedSize: 0,
      minifiedSize: 0,
      name: '.',
      path: '',
      percentage: 100,
      rawSize: 0,
      type: 'directory',
    }
  }

  const fileNodes: BundleNode[] = files.map((f) => {
    const content = contents.get(f) ?? ''
    return makeFileNode(f, Buffer.byteLength(content, 'utf8'))
  })

  const dirMap = new Map<string, BundleNode[]>()
  for (const node of fileNodes) {
    const dir = normalize(dirname(node.path))
    const existing = dirMap.get(dir) ?? []
    existing.push(node)
    dirMap.set(dir, existing)
  }

  const dirNodes: BundleNode[] = []
  for (const [dirPath, children] of Array.from(dirMap)) {
    dirNodes.push(makeDirNode(dirPath, children))
  }

  const firstDir = dirNodes[0]
  const rootChildren = dirNodes.length === 1 && firstDir !== undefined && firstDir.path === '.'
    ? firstDir.children
    : dirNodes

  const root = makeDirNode('', rootChildren)
  setPercentages(root, root.rawSize)
  return root
}

// ─── setPercentages ─────────────────────────────────────

/**
 * @example
 * setPercentages(root, root.rawSize)
 * console.log(root.children[0].percentage)
 */
export function setPercentages(node: BundleNode, totalSize: number): void {
  node.percentage = totalSize > 0 ? Math.round((node.rawSize / totalSize) * 10000) / 100 : 0
  for (const child of node.children) {
    setPercentages(child, totalSize)
  }
}

// ─── computeTreemapLayout ───────────────────────────────

const BLOCK_COLORS = ['green', 'cyan', 'yellow', 'magenta', 'blue', 'red']

/**
 * @example
 * const layout = computeTreemapLayout(tree, 0, 0, 80, 20)
 * console.log(layout.blocks.length)
 */
export function computeTreemapLayout(
  node: BundleNode,
  x: number,
  y: number,
  width: number,
  height: number,
): TreemapLayout {
  const blocks: TreemapBlock[] = []
  const totalSize = node.rawSize

  if (totalSize === 0 || width < 2 || height < 1) {
    return { blocks, height, totalSize, width }
  }

  const children = [...node.children].sort((a, b) => b.rawSize - a.rawSize)
  if (children.length === 0) {
    blocks.push({
      color: sizeColor(node.rawSize, totalSize),
      height,
      node,
      width,
      x,
      y,
    })
    return { blocks, height, totalSize, width }
  }

  layoutChildren(children, x, y, width, height, totalSize, blocks, 0)

  return { blocks, height, totalSize, width }
}

function layoutChildren(
  children: BundleNode[],
  x: number,
  y: number,
  width: number,
  height: number,
  totalSize: number,
  blocks: TreemapBlock[],
  depth: number,
): void {
  if (children.length === 0) return

  const childTotal = children.reduce((s, c) => s + c.rawSize, 0)
  if (childTotal === 0) return

  if (children.length === 1) {
    const child = children[0]!
    if (child === undefined) return
    if (child.children.length > 0 && depth < 2) {
      layoutChildren(child.children, x, y, width, height, totalSize, blocks, depth + 1)
    } else {
      blocks.push({
        color: sizeColor(child.rawSize, totalSize),
        height,
        node: child,
        width,
        x,
        y,
      })
    }
    return
  }

  const horizontal = width >= height
  let offset = 0

  for (let i = 0; i < children.length; i++) {
    const child = children[i]!
    if (child === undefined) continue
    const ratio = child.rawSize / childTotal
    const color = BLOCK_COLORS[i % BLOCK_COLORS.length]!

    if (horizontal) {
      const segW = Math.max(1, Math.round(width * ratio))
      if (child.children.length > 0 && depth < 2) {
        layoutChildren(child.children, x + offset, y, segW, height, totalSize, blocks, depth + 1)
      } else {
        blocks.push({
          color: color ?? 'gray',
          height,
          node: child,
          width: segW,
          x: x + offset,
          y,
        })
      }
      offset += segW
    } else {
      const segH = Math.max(1, Math.round(height * ratio))
      if (child.children.length > 0 && depth < 2) {
        layoutChildren(child.children, x, y + offset, width, segH, totalSize, blocks, depth + 1)
      } else {
        blocks.push({
          color: color ?? 'gray',
          height: segH,
          node: child,
          width,
          x,
          y: y + offset,
        })
      }
      offset += segH
    }
  }
}

// ─── sizeColor ──────────────────────────────────────────

/**
 * @example
 * const c = sizeColor(5000, 10000)
 * console.log(c)
 */
export function sizeColor(size: number, totalSize: number): string {
  if (totalSize === 0) return 'gray'
  const pct = size / totalSize
  if (pct > 0.3) return 'red'
  if (pct > 0.15) return 'yellow'
  if (pct > 0.05) return 'cyan'
  return 'green'
}

// ─── computeSizeDistribution ────────────────────────────

/**
 * @example
 * const dist = computeSizeDistribution(fileNodes)
 * console.log(dist[0].range)
 */
export function computeSizeDistribution(files: BundleNode[]): SizeBucket[] {
  const buckets: SizeBucket[] = [
    { count: 0, range: '<1KB' },
    { count: 0, range: '1-10KB' },
    { count: 0, range: '10-50KB' },
    { count: 0, range: '50-100KB' },
    { count: 0, range: '>100KB' },
  ]

  for (const f of files) {
    const kb = f.rawSize / 1024
    if (kb < 1) { const b = buckets[0]; if (b) b.count++ }
    else if (kb < 10) { const b = buckets[1]; if (b) b.count++ }
    else if (kb < 50) { const b = buckets[2]; if (b) b.count++ }
    else if (kb < 100) { const b = buckets[3]; if (b) b.count++ }
    else { const b = buckets[4]; if (b) b.count++ }
  }

  return buckets
}

// ─── collectLeafNodes ───────────────────────────────────

/**
 * @example
 * const leaves = collectLeafNodes(tree)
 * console.log(leaves.length)
 */
export function collectLeafNodes(node: BundleNode): BundleNode[] {
  if (node.type === 'file') return [node]
  return node.children.flatMap(collectLeafNodes)
}

// ─── findTopFiles ───────────────────────────────────────

/**
 * @example
 * const top = findTopFiles(tree, 5)
 * console.log(top[0].name)
 */
export function findTopFiles(tree: BundleNode, count: number): BundleNode[] {
  const leaves = collectLeafNodes(tree)
  return [...leaves].sort((a, b) => b.rawSize - a.rawSize).slice(0, count)
}

// ─── computeBundleVizStats ──────────────────────────────

/**
 * @example
 * const stats = computeBundleVizStats(tree)
 * console.log(stats.fileCount)
 */
export function computeBundleVizStats(tree: BundleNode): BundleVizStats {
  const leaves = collectLeafNodes(tree)
  const dirs = collectDirNodes(tree)
  const totalSize = tree.rawSize
  const totalMinified = tree.minifiedSize
  const totalGzipped = tree.gzippedSize
  const fileCount = leaves.length
  const dirCount = dirs.length

  const sorted = [...leaves].sort((a, b) => b.rawSize - a.rawSize)
  const largestFile = sorted[0] ?? null
  const smallestFile = sorted.length > 0 ? (sorted[sorted.length - 1] ?? null) : null
  const avgFileSize = fileCount > 0 ? Math.round(totalSize / fileCount) : 0

  return {
    avgFileSize,
    dirCount,
    fileCount,
    largestFile,
    sizeDistribution: computeSizeDistribution(leaves),
    smallestFile,
    totalGzipped,
    totalMinified,
    totalSize,
  }
}

// ─── collectDirNodes ────────────────────────────────────

/**
 * @example
 * const dirs = collectDirNodes(tree)
 * console.log(dirs.length)
 */
export function collectDirNodes(node: BundleNode): BundleNode[] {
  if (node.type === 'file') return []
  return [node, ...node.children.flatMap(collectDirNodes)]
}

// ─── buildBundleVisualization ───────────────────────────

/**
 * @example
 * const viz = buildBundleVisualization(['src/a.ts'], contents, { top: 10, verbose: false })
 * console.log(viz.stats.fileCount)
 */
export function buildBundleVisualization(
  files: string[],
  contents: Map<string, string>,
  options: BundleVizOptions,
): BundleVisualization {
  const tree = buildBundleTree(files, contents)
  const layout = computeTreemapLayout(tree, 0, 0, 80, 20)
  const topFiles = findTopFiles(tree, options.top)
  const stats = computeBundleVizStats(tree)

  return { layout, stats, topFiles, tree }
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/bundle-visualizer-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  return basename(filePath).replace(/\.ts$/, '')
}

export { formatBytes }
