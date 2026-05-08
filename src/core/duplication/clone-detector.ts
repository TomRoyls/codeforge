import { createHash } from 'node:crypto'
import type { CloneGroup, CloneInstance, DuplicationConfig, DuplicationReport, DuplicationSummary } from './types.js'
import { DuplicationType, DEFAULT_DUPLICATION_CONFIG } from './types.js'
import { HashGenerator } from './hash-generator.js'

let groupCounter = 0

function nextGroupId(): string {
  groupCounter++
  return `cg_${groupCounter.toString(36).padStart(6, '0')}`
}

export class CloneDetector {
  private config: DuplicationConfig
  private hasher: HashGenerator

  constructor(config?: Partial<DuplicationConfig>) {
    this.config = { ...DEFAULT_DUPLICATION_CONFIG, ...config }
    this.hasher = new HashGenerator()
  }

  analyzeFile(filePath: string, content: string): CloneInstance[] {
    const lines = content.split('\n')
    if (lines.length < this.config.minLines) return []

    const windows = this.extractSlidingWindows(lines, this.config.minLines)
    const instances: CloneInstance[] = []

    for (let i = 0; i < windows.length; i++) {
      const windowLines = windows[i]!
      const startLine = i + 1
      const endLine = i + windowLines.length
      const instance = this.createInstance(filePath, windowLines, startLine, endLine)
      if (instance.tokens.length >= this.config.minTokens) {
        instances.push(instance)
      }
    }

    return instances
  }

  analyzeFiles(files: Map<string, string>): DuplicationReport {
    const allInstances: CloneInstance[] = []
    let totalLines = 0
    let filesAnalyzed = 0

    for (const [filePath, content] of files) {
      if (!this.shouldAnalyzeFile(filePath)) continue
      filesAnalyzed++
      totalLines += content.split('\n').length
      const instances = this.analyzeFile(filePath, content)
      allInstances.push(...instances)
    }

    const exactGroups = this.findExactClones(allInstances)
    const structuralGroups = this.findStructuralClones(allInstances)
    const semanticGroups = this.findSemanticClones(allInstances)

    const allGroups = [...exactGroups, ...structuralGroups, ...semanticGroups]
    const deduped = this.deduplicateGroups(allGroups)

    const limited = deduped.slice(0, this.config.maxResults)
    const summary = this.buildSummary(limited, filesAnalyzed, totalLines)
    const totalDuplicatedLines = this.countDuplicatedLines(limited)
    const duplicationPercentage = totalLines > 0 ? (totalDuplicatedLines / totalLines) * 100 : 0

    return {
      totalDuplicates: limited.reduce((sum, g) => sum + g.clones.length, 0),
      totalDuplicatedLines,
      duplicationPercentage: Math.round(duplicationPercentage * 100) / 100,
      cloneGroups: limited,
      summary,
    }
  }

  findExactClones(instances: CloneInstance[]): CloneGroup[] {
    const hashGroups = new Map<string, CloneInstance[]>()

    for (const instance of instances) {
      const key = instance.hash
      const existing = hashGroups.get(key)
      if (existing) {
        existing.push(instance)
      } else {
        hashGroups.set(key, [instance])
      }
    }

    const groups: CloneGroup[] = []
    for (const [hash, clones] of hashGroups) {
      if (clones.length < 2) continue
      groups.push({
        id: nextGroupId(),
        clones,
        similarity: 1.0,
        type: DuplicationType.EXACT,
        fingerprint: hash,
      })
    }

    return groups
  }

  findStructuralClones(instances: CloneInstance[]): CloneGroup[] {
    const structuralGroups = new Map<string, CloneInstance[]>()

    for (const instance of instances) {
      const structuralHash = this.hasher.generateStructuralHash(instance.content)
      const existing = structuralGroups.get(structuralHash)
      if (existing) {
        existing.push(instance)
      } else {
        structuralGroups.set(structuralHash, [instance])
      }
    }

    const groups: CloneGroup[] = []
    for (const [hash, clones] of structuralGroups) {
      if (clones.length < 2) continue
      const alreadyExact = new Set(clones.map(c => c.hash))
      if (alreadyExact.size === 1) continue

      groups.push({
        id: nextGroupId(),
        clones,
        similarity: this.computeGroupSimilarity(clones),
        type: DuplicationType.STRUCTURAL,
        fingerprint: hash,
      })
    }

    return groups
  }

  findSemanticClones(instances: CloneInstance[]): CloneGroup[] {
    const groups: CloneGroup[] = []
    const used = new Set<number>()

    for (let i = 0; i < instances.length; i++) {
      if (used.has(i)) continue
      const instance1 = instances[i]!
      const groupClones: CloneInstance[] = [instance1]
      used.add(i)

      for (let j = i + 1; j < instances.length; j++) {
        if (used.has(j)) continue
        const instance2 = instances[j]!
        if (instance1.hash === instance2.hash) continue

        const similarity = this.hasher.computeSimilarity(instance1.tokens, instance2.tokens)
        if (similarity >= this.config.similarityThreshold) {
          groupClones.push(instance2)
          used.add(j)
        }
      }

      if (groupClones.length >= 2) {
        const fingerprint = createHash('sha256')
          .update(groupClones.map(c => c.hash).sort().join(','))
          .digest('hex')

        groups.push({
          id: nextGroupId(),
          clones: groupClones,
          similarity: this.computeGroupSimilarity(groupClones),
          type: DuplicationType.SEMANTIC,
          fingerprint,
        })
      }
    }

    return groups
  }

  deduplicateGroups(groups: CloneGroup[]): CloneGroup[] {
    if (groups.length === 0) return []

    const filtered: CloneGroup[] = []
    const dominated = new Set<string>()

    for (let i = 0; i < groups.length; i++) {
      if (dominated.has(groups[i]!.id)) continue

      for (let j = i + 1; j < groups.length; j++) {
        if (dominated.has(groups[j]!.id)) continue
        const gi = groups[i]!
        const gj = groups[j]!

        const overlap = this.computeGroupOverlap(gi, gj)
        if (overlap > 0.7) {
          if (gi.clones.length >= gj.clones.length) {
            dominated.add(gj.id)
          } else {
            dominated.add(gi.id)
            break
          }
        }
      }

      if (!dominated.has(groups[i]!.id)) {
        filtered.push(groups[i]!)
      }
    }

    return filtered
  }

  private extractSlidingWindows(lines: string[], size: number): string[][] {
    if (lines.length < size) return []
    const windows: string[][] = []
    for (let i = 0; i <= lines.length - size; i++) {
      windows.push(lines.slice(i, i + size))
    }
    return windows
  }

  private createInstance(filePath: string, lines: string[], startLine: number, endLine: number): CloneInstance {
    const content = lines.join('\n')
    const tokens = this.hasher.tokenize(content)
    const hash = this.hasher.generateContentHash(content)

    return {
      filePath,
      startLine,
      endLine,
      startCol: 0,
      endCol: lines[lines.length - 1]?.length ?? 0,
      content,
      hash,
      tokens,
    }
  }

  private shouldAnalyzeFile(filePath: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      if (this.matchesGlob(filePath, pattern)) return false
    }
    if (this.config.filePatterns.length === 0) return true
    return this.config.filePatterns.some(pattern => this.matchesGlob(filePath, pattern))
  }

  private matchesGlob(filePath: string, pattern: string): boolean {
    const regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '§§')
      .replace(/\*/g, '[^/]*')
      .replace(/§§/g, '.*')
      .replace(/\?/g, '[^/]')
    try {
      return new RegExp(regexStr).test(filePath)
    } catch {
      return filePath.includes(pattern.replace(/\*\*/g, '').replace(/\*/g, ''))
    }
  }

  private computeGroupSimilarity(clones: CloneInstance[]): number {
    if (clones.length < 2) return 1.0
    let totalSim = 0
    let count = 0
    for (let i = 0; i < clones.length; i++) {
      for (let j = i + 1; j < clones.length; j++) {
        totalSim += this.hasher.computeSimilarity(clones[i]!.tokens, clones[j]!.tokens)
        count++
      }
    }
    return count > 0 ? Math.round((totalSim / count) * 1000) / 1000 : 1.0
  }

  private computeGroupOverlap(a: CloneGroup, b: CloneGroup): number {
    const setA = new Set(a.clones.map(c => `${c.filePath}:${c.startLine}:${c.endLine}`))
    const setB = new Set(b.clones.map(c => `${c.filePath}:${c.startLine}:${c.endLine}`))
    let overlap = 0
    for (const key of setA) {
      if (setB.has(key)) overlap++
    }
    return overlap / Math.min(setA.size, setB.size)
  }

  private countDuplicatedLines(groups: CloneGroup[]): number {
    const lines = new Set<string>()
    for (const group of groups) {
      for (const clone of group.clones) {
        for (let line = clone.startLine; line <= clone.endLine; line++) {
          lines.add(`${clone.filePath}:${line}`)
        }
      }
    }
    return lines.size
  }

  private buildSummary(groups: CloneGroup[], filesAnalyzed: number, _totalLines?: number): DuplicationSummary {
    const filesWithDups = new Set<string>()
    let totalCloneLines = 0
    let largestClone = 0

    for (const group of groups) {
      for (const clone of group.clones) {
        filesWithDups.add(clone.filePath)
        const size = clone.endLine - clone.startLine + 1
        totalCloneLines += size
        if (size > largestClone) largestClone = size
      }
    }

    const totalClones = groups.reduce((s, g) => s + g.clones.length, 0)
    const avgCloneSize = totalClones > 0 ? Math.round(totalCloneLines / totalClones) : 0

    const hotspotCounts = new Map<string, number>()
    for (const group of groups) {
      const filesInGroup = new Set(group.clones.map(c => c.filePath))
      for (const f of filesInGroup) {
        hotspotCounts.set(f, (hotspotCounts.get(f) ?? 0) + 1)
      }
    }

    const duplicateHotspots = [...hotspotCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([f]) => f)

    return {
      filesAnalyzed,
      filesWithDuplicates: filesWithDups.size,
      avgCloneSize,
      largestClone,
      duplicateHotspots,
    }
  }
}
