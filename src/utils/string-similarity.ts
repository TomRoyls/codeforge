import { sortedByDesc } from './array-helpers.js'

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length

  if (m === 0) return n
  if (n === 0) return m

  const prev = new Array<number>(n + 1).fill(0) as number[]
  const curr = new Array<number>(n + 1).fill(0) as number[]

  for (let j = 0; j <= n; j++) prev[j] = j

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const prevJ = prev[j]!
      const currJm1 = curr[j - 1]!
      const prevJm1 = prev[j - 1]!
      curr[j] = Math.min(
        prevJ + 1,
        currJm1 + 1,
        prevJm1 + cost,
      )
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j]!
  }

  return prev[n]!
}

export function similarityScore(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  const dist = levenshteinDistance(a, b)
  return 1 - dist / maxLen
}

export function findClosestMatch(
  input: string,
  candidates: string[],
  minScore: number = 0.3,
): string | null {
  if (candidates.length === 0) return null

  let bestMatch: string | null = null
  let bestScore = -1

  for (const candidate of candidates) {
    const score = similarityScore(input.toLowerCase(), candidate.toLowerCase())
    if (score > bestScore) {
      bestScore = score
      bestMatch = candidate
    }
  }

  return bestScore >= minScore ? bestMatch : null
}

export interface ScoredMatch {
  candidate: string
  score: number
}

export function findClosestMatches(
  input: string,
  candidates: string[],
  options: { limit?: number; minScore?: number } = {},
): ScoredMatch[] {
  const { limit = 5, minScore = 0.3 } = options
  if (candidates.length === 0) return []

  const lowerInput = input.toLowerCase()
  const scored: ScoredMatch[] = candidates.map((candidate) => ({
    candidate,
    score: similarityScore(lowerInput, candidate.toLowerCase()),
  }))

  return sortedByDesc(scored, m => m.score)
    .filter((m) => m.score >= minScore)
    .slice(0, limit)
}
