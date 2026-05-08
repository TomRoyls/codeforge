export interface BlameLine {
  lineNumber: number
  commit: string
  author: string
  authorMail: string
  timestamp: number
  content: string
}

export interface OwnerShare {
  author: string
  lines: number
  percentage: number
  files: string[]
  lastCommitDate: number
}

export interface FileOwnership {
  filePath: string
  totalLines: number
  owners: OwnerShare[]
  dominantOwner: string
  ownershipConcentration: number
}

export interface AuthorSummary {
  author: string
  email: string
  totalLines: number
  totalFiles: number
  avgOwnership: number
  domains: string[]
  active: boolean
}

export interface KnowledgeSilo {
  filePath: string
  owner: string
  ownershipPercentage: number
  risk: 'low' | 'medium' | 'high' | 'critical'
}

export interface ReviewSuggestion {
  filePath: string
  primaryReviewer: string
  secondaryReviewers: string[]
  reason: string
}

export interface OwnershipReport {
  files: FileOwnership[]
  authors: AuthorSummary[]
  busFactor: number
  knowledgeSilos: KnowledgeSilo[]
  reviewSuggestions: ReviewSuggestion[]
}

export interface OwnershipConfig {
  minOwnershipPercent: number
  siloThreshold: number
  recentCommitDays: number
  excludePatterns: string[]
}

export const DEFAULT_OWNERSHIP_CONFIG: OwnershipConfig = {
  minOwnershipPercent: 0.6,
  siloThreshold: 0.8,
  recentCommitDays: 90,
  excludePatterns: [],
}
