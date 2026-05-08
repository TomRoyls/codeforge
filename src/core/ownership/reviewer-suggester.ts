import type {
  FileOwnership,
  OwnershipReport,
  ReviewSuggestion,
} from './types.js'

export class ReviewerSuggester {
  suggestReviewers(
    filePath: string,
    report: OwnershipReport,
  ): ReviewSuggestion {
    const fileOwnership = report.files.find((f) => f.filePath === filePath)

    if (!fileOwnership || fileOwnership.owners.length === 0) {
      return {
        filePath,
        primaryReviewer: '',
        secondaryReviewers: [],
        reason: 'No ownership data available',
      }
    }

    const primaryReviewer = this.findCodeOwner(filePath, report)
    const secondaryReviewers = this.findSecondaryExperts(filePath, report)
    const reason = this.buildSuggestionReason(fileOwnership, secondaryReviewers)

    return {
      filePath,
      primaryReviewer,
      secondaryReviewers,
      reason,
    }
  }

  suggestForChange(
    changedFiles: string[],
    report: OwnershipReport,
  ): ReviewSuggestion[] {
    const suggestions: ReviewSuggestion[] = []
    const reviewerScores = new Map<string, number>()

    for (const file of changedFiles) {
      const suggestion = this.suggestReviewers(file, report)
      suggestions.push(suggestion)

      if (suggestion.primaryReviewer) {
        const current = reviewerScores.get(suggestion.primaryReviewer) ?? 0
        reviewerScores.set(suggestion.primaryReviewer, current + 3)
      }

      for (const reviewer of suggestion.secondaryReviewers) {
        const current = reviewerScores.get(reviewer) ?? 0
        reviewerScores.set(reviewer, current + 1)
      }
    }

    for (const suggestion of suggestions) {
      if (suggestion.primaryReviewer) {
        const score = this.scoreReviewer(
          suggestion.primaryReviewer,
          changedFiles,
          report,
        )
        suggestion.reason = this.enhanceReason(
          suggestion,
          changedFiles.length,
          reviewerScores,
          score,
        )
      } else {
        suggestion.reason = this.enhanceReason(
          suggestion,
          changedFiles.length,
          reviewerScores,
        )
      }
    }

    return suggestions
  }

  findCodeOwner(filePath: string, report: OwnershipReport): string {
    const fileOwnership = report.files.find((f) => f.filePath === filePath)
    return fileOwnership?.dominantOwner ?? ''
  }

  findSecondaryExperts(filePath: string, report: OwnershipReport): string[] {
    const fileOwnership = report.files.find((f) => f.filePath === filePath)
    if (!fileOwnership) return []

    return fileOwnership.owners
      .slice(1)
      .filter((o) => o.percentage >= 0.1)
      .map((o) => o.author)
  }

  checkBusFactorRisk(report: OwnershipReport): string[] {
    const riskyFiles: string[] = []
    const authorFileCounts = new Map<string, number>()

    for (const file of report.files) {
      if (file.owners.length <= 1 && file.totalLines > 0) {
        riskyFiles.push(file.filePath)
        continue
      }

      const dominant = file.owners[0]
      if (dominant && dominant.percentage >= 0.9) {
        riskyFiles.push(file.filePath)
      }

      for (const owner of file.owners) {
        const current = authorFileCounts.get(owner.author) ?? 0
        authorFileCounts.set(owner.author, current + 1)
      }
    }

    return riskyFiles
  }

  private scoreReviewer(
    reviewer: string,
    changedFiles: string[],
    report: OwnershipReport,
  ): number {
    let score = 0

    for (const filePath of changedFiles) {
      const fileOwnership = report.files.find((f) => f.filePath === filePath)
      if (!fileOwnership) continue

      const ownerEntry = fileOwnership.owners.find(
        (o) => o.author === reviewer,
      )
      if (ownerEntry) {
        score += ownerEntry.percentage * 10

        if (ownerEntry === fileOwnership.owners[0]) {
          score += 5
        }
      }
    }

    const authorSummary = report.authors.find((a) => a.author === reviewer)
    if (authorSummary) {
      if (authorSummary.active) {
        score += 2
      }
      score += Math.min(authorSummary.domains.length, 3)
    }

    return score
  }

  private buildSuggestionReason(
    fileOwnership: FileOwnership,
    secondaryReviewers: string[],
  ): string {
    const dominant = fileOwnership.owners[0]
    if (!dominant) {
      return 'No ownership data available'
    }

    const pctStr = (dominant.percentage * 100).toFixed(1)
    let reason = `${dominant.author} owns ${pctStr}% of this file`

    if (secondaryReviewers.length > 0) {
      reason += `. Secondary experts: ${secondaryReviewers.join(', ')}`
    } else {
      reason += '. No secondary experts available - potential knowledge silo'
    }

    return reason
  }

  private enhanceReason(
    suggestion: ReviewSuggestion,
    totalFiles: number,
    reviewerScores: Map<string, number>,
    reviewerScore?: number,
  ): string {
    const base = suggestion.reason

    if (totalFiles > 1 && suggestion.primaryReviewer) {
      const score = reviewerScores.get(suggestion.primaryReviewer) ?? 0
      if (score >= totalFiles * 2) {
        return `${base}. Recommended as overall reviewer across ${totalFiles} files (score: ${reviewerScore ?? score})`
      }
    }

    return base
  }
}
