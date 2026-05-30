// ─── Interfaces ──────────────────────────────────────────

export interface CodeBlock {
  filePath: string
  startLine: number
  endLine: number
  content: string
  normalizedHash: string
  lineCount: number
}

export interface DuplicateGroup {
  blocks: CodeBlock[]
  similarity: number
  lines: number
}

export interface DupesResult {
  totalFiles: number
  totalBlocks: number
  duplicateGroups: DuplicateGroup[]
  duplicateLines: number
  duplicatePercentage: number
}

// ─── Normalization ───────────────────────────────────────

export function normalizeContent(content: string): string {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.toLowerCase())
    .join('\n')
}

// ─── Hashing ─────────────────────────────────────────────

export function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return (hash >>> 0).toString(36)
}

// ─── Block extraction ────────────────────────────────────

export function extractBlocks(content: string, filePath: string, minLines: number): CodeBlock[] {
  const lines = content.split('\n')
  const blocks: CodeBlock[] = []

  if (lines.length < minLines) {
    return blocks
  }

  for (let i = 0; i <= lines.length - minLines; i++) {
    const blockLines = lines.slice(i, i + minLines)
    const blockContent = blockLines.join('\n')
    const normalized = normalizeContent(blockContent)
    const normalizedHash = hashContent(normalized)

    blocks.push({
      content: blockContent,
      endLine: i + minLines,
      filePath,
      lineCount: minLines,
      normalizedHash,
      startLine: i + 1,
    })
  }

  return blocks
}

// ─── Duplicate detection ─────────────────────────────────

function contentSimilarity(a: string, b: string): number {
  const normA = normalizeContent(a)
  const normB = normalizeContent(b)

  if (normA === normB) return 1

  const linesA = Array.from(new Set(normA.split('\n')))
  const linesBSet = new Set(normB.split('\n'))

  let intersection = 0
  for (const line of linesA) {
    if (linesBSet.has(line)) {
      intersection++
    }
  }

  const unionSize = linesA.length + linesBSet.size - intersection
  return unionSize === 0 ? 0 : intersection / unionSize
}

export function findDuplicates(blocks: CodeBlock[], threshold: number): DuplicateGroup[] {
  const hashGroups = new Map<string, CodeBlock[]>()

  for (const block of blocks) {
    const existing = hashGroups.get(block.normalizedHash)
    if (existing) {
      existing.push(block)
    } else {
      hashGroups.set(block.normalizedHash, [block])
    }
  }

  const groups: DuplicateGroup[] = []
  const entries = Array.from(hashGroups.values())

  for (const groupBlocks of entries) {
    if (groupBlocks.length < 2) continue

    const similarity = threshold <= 0
      ? contentSimilarity(groupBlocks[0]!.content, (groupBlocks[1] ?? { content: '' }).content)
      : contentSimilarity(groupBlocks[0]!.content, (groupBlocks[1] ?? { content: '' }).content)

    if (similarity >= threshold) {
      groups.push({
        blocks: groupBlocks,
        lines: groupBlocks[0]!.lineCount,
        similarity,
      })
    }
  }

  return groups
}

// ─── Stats aggregation ──────────────────────────────────

export function calculateStats(
  groups: DuplicateGroup[],
  totalBlocks: number,
  totalFiles: number,
): DupesResult {
  let duplicateLines = 0

  for (const group of groups) {
    const blockCount = group.blocks.length
    duplicateLines += group.lines * (blockCount - 1)
  }

  const duplicatePercentage =
    totalBlocks > 0 ? (duplicateLines / totalBlocks) * 100 : 0

  return {
    duplicateGroups: groups,
    duplicateLines,
    duplicatePercentage,
    totalBlocks,
    totalFiles,
  }
}
