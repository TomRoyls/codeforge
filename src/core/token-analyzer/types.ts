export type TokenCategory =
  | 'keyword'
  | 'identifier'
  | 'operator'
  | 'literal'
  | 'punctuation'
  | 'whitespace'
  | 'comment'

export interface Token {
  value: string
  category: TokenCategory
  position: number
  line: number
  column: number
}

export interface TokenFrequency {
  token: string
  count: number
  category: TokenCategory
}

export interface TokenDistribution {
  keyword: number
  identifier: number
  operator: number
  literal: number
  punctuation: number
  whitespace: number
  comment: number
}

export interface NamingPatternResult {
  camelCase: string[]
  snake_case: string[]
  PascalCase: string[]
  UPPER_CASE: string[]
}

export interface TokenStatistics {
  totalTokens: number
  uniqueTokens: number
  entropy: number
  diversity: number
  averageTokenLength: number
  maxLength: number
  minLength: number
}

export interface TokenAnalysisResult {
  tokens: Token[]
  frequency: TokenFrequency[]
  distribution: TokenDistribution
  namingPatterns: NamingPatternResult
  statistics: TokenStatistics
}

export interface TokenAnalyzerConfig {
  includeWhitespace: boolean
  includeComments: boolean
  maxTopTokens: number
  customKeywords: string[]
}

export const DEFAULT_TOKEN_ANALYZER_CONFIG: TokenAnalyzerConfig = {
  includeWhitespace: false,
  includeComments: true,
  maxTopTokens: 10,
  customKeywords: [],
}
