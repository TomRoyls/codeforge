import type {
  BlameLine,
  FileOwnership,
  OwnershipConfig,
  OwnershipReport,
  OwnerShare,
  AuthorSummary,
  KnowledgeSilo,
} from './types.js'
import { DEFAULT_OWNERSHIP_CONFIG } from './types.js'

export class OwnershipCalculator {
  private config: OwnershipConfig

  constructor(config?: Partial<OwnershipConfig>) {
    this.config = { ...DEFAULT_OWNERSHIP_CONFIG, ...config }
  }

  calculateFileOwnership(
    blameLines: BlameLine[],
    filePath: string,
  ): FileOwnership {
    if (blameLines.length === 0) {
      return {
        filePath,
        totalLines: 0,
        owners: [],
        dominantOwner: '',
        ownershipConcentration: 0,
      }
    }

    const authorLines = new Map<string, { count: number; lastCommit: number }>()

    for (const line of blameLines) {
      const existing = authorLines.get(line.author)
      if (existing) {
        existing.count++
        if (line.timestamp > existing.lastCommit) {
          existing.lastCommit = line.timestamp
        }
      } else {
        authorLines.set(line.author, {
          count: 1,
          lastCommit: line.timestamp,
        })
      }
    }

    const totalLines = blameLines.length
    const owners: OwnerShare[] = []

    for (const [author, data] of authorLines) {
      owners.push({
        author,
        lines: data.count,
        percentage: data.count / totalLines,
        files: [filePath],
        lastCommitDate: data.lastCommit,
      })
    }

    owners.sort((a, b) => b.lines - a.lines)

    const dominantOwner = owners[0]?.author ?? ''
    const concentration = this.calculateOwnershipConcentration(owners)

    return {
      filePath,
      totalLines,
      owners,
      dominantOwner,
      ownershipConcentration: concentration,
    }
  }

  calculateReport(fileBlames: Map<string, BlameLine[]>): OwnershipReport {
    const files: FileOwnership[] = []

    for (const [filePath, blameLines] of fileBlames) {
      if (this.shouldExclude(filePath)) {
        continue
      }
      files.push(this.calculateFileOwnership(blameLines, filePath))
    }

    const authors = this.buildAuthorSummaries(files)
    const knowledgeSilos = this.identifyKnowledgeSilos(files)
    const busFactor = this.calculateBusFactorFromFiles(files)

    return {
      files,
      authors,
      busFactor,
      knowledgeSilos,
      reviewSuggestions: [],
    }
  }

  calculateBusFactor(report: OwnershipReport): number {
    return this.calculateBusFactorFromFiles(report.files)
  }

  identifyKnowledgeSilos(fileOwnerships: FileOwnership[]): KnowledgeSilo[] {
    const silos: KnowledgeSilo[] = []

    for (const file of fileOwnerships) {
      if (file.totalLines === 0) continue

      const dominant = file.owners[0]
      if (!dominant) continue

      if (dominant.percentage >= this.config.siloThreshold) {
        silos.push({
          filePath: file.filePath,
          owner: dominant.author,
          ownershipPercentage: dominant.percentage,
          risk: this.assessSiloRisk(dominant.percentage),
        })
      }
    }

    silos.sort((a, b) => b.ownershipPercentage - a.ownershipPercentage)
    return silos
  }

  calculateOwnershipConcentration(owners: OwnerShare[]): number {
    if (owners.length === 0) return 0
    let hhi = 0
    for (const owner of owners) {
      const pct = owner.percentage * 100
      hhi += pct * pct
    }
    return hhi / 10000
  }

  getDomainsForAuthor(author: string, files: FileOwnership[]): string[] {
    const domains = new Set<string>()

    for (const file of files) {
      const hasOwnership = file.owners.some((o) => o.author === author)
      if (hasOwnership) {
        const parts = file.filePath.split('/')
        if (parts.length > 1) {
          domains.add(parts[0]!)
        } else {
          domains.add('root')
        }
      }
    }

    return [...domains].sort()
  }

  isAuthorActive(lastCommitDate: number): boolean {
    const now = Date.now()
    const cutoff = now - this.config.recentCommitDays * 24 * 60 * 60 * 1000
    return lastCommitDate >= cutoff
  }

  groupAuthorsByEmail(authors: OwnerShare[]): Map<string, OwnerShare> {
    const grouped = new Map<string, OwnerShare>()

    for (const author of authors) {
      const key = author.author
      const existing = grouped.get(key)
      if (existing) {
        existing.lines += author.lines
        existing.percentage = 0
        existing.files = [...new Set([...existing.files, ...author.files])]
        if (author.lastCommitDate > existing.lastCommitDate) {
          existing.lastCommitDate = author.lastCommitDate
        }
      } else {
        grouped.set(key, { ...author, files: [...author.files] })
      }
    }

    return grouped
  }

  private calculateBusFactorFromFiles(files: FileOwnership[]): number {
    const authorTotals = new Map<string, number>()

    for (const file of files) {
      for (const owner of file.owners) {
        const current = authorTotals.get(owner.author) ?? 0
        authorTotals.set(owner.author, current + owner.lines)
      }
    }

    const sorted = [...authorTotals.values()].sort((a, b) => b - a)
    const totalLines = sorted.reduce((sum, v) => sum + v, 0)

    if (totalLines === 0) return 0

    let accumulated = 0
    let busFactor = 0

    for (const lines of sorted) {
      accumulated += lines
      busFactor++
      if (accumulated / totalLines > 0.5) {
        break
      }
    }

    return busFactor
  }

  private buildAuthorSummaries(files: FileOwnership[]): AuthorSummary[] {
    const authorData = new Map<
      string,
      {
        totalLines: number
        files: Set<string>
        ownerships: number[]
        lastCommit: number
        email: string
      }
    >()

    for (const file of files) {
      for (const owner of file.owners) {
        const existing = authorData.get(owner.author)
        if (existing) {
          existing.totalLines += owner.lines
          existing.files.add(file.filePath)
          existing.ownerships.push(owner.percentage)
          if (owner.lastCommitDate > existing.lastCommit) {
            existing.lastCommit = owner.lastCommitDate
          }
        } else {
          authorData.set(owner.author, {
            totalLines: owner.lines,
            files: new Set([file.filePath]),
            ownerships: [owner.percentage],
            lastCommit: owner.lastCommitDate,
            email: '',
          })
        }
      }
    }

    const summaries: AuthorSummary[] = []

    for (const [author, data] of authorData) {
      const avgOwnership =
        data.ownerships.reduce((sum, v) => sum + v, 0) /
        data.ownerships.length

      summaries.push({
        author,
        email: data.email,
        totalLines: data.totalLines,
        totalFiles: data.files.size,
        avgOwnership,
        domains: this.getDomainsForAuthor(
          author,
          files.filter((f) => data.files.has(f.filePath)),
        ),
        active: this.isAuthorActive(data.lastCommit),
      })
    }

    summaries.sort((a, b) => b.totalLines - a.totalLines)
    return summaries
  }

  private assessSiloRisk(
    percentage: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (percentage >= 0.95) return 'critical'
    if (percentage >= 0.9) return 'high'
    if (percentage >= 0.85) return 'medium'
    return 'low'
  }

  private shouldExclude(filePath: string): boolean {
    for (const pattern of this.config.excludePatterns) {
      if (filePath.includes(pattern)) return true
    }
    return false
  }
}
