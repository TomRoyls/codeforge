export interface DependencyInfo {
  name: string
  version: string
  type: 'production' | 'dev' | 'peer' | 'optional'
  source: string
  licenses: string[]
}

export interface ScanResult {
  dependencies: DependencyInfo[]
  devDependencies: DependencyInfo[]
  peerDependencies: DependencyInfo[]
  optionalDependencies: DependencyInfo[]
  total: number
  stats: DependencyStats
}

export interface DependencyStats {
  total: number
  production: number
  dev: number
  peer: number
  optional: number
  uniqueLicenses: number
  licenseCounts: Record<string, number>
}

export interface VulnerabilityInfo {
  name: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  advisory: string
  patchedIn: string
}

export interface ScannerConfig {
  includeDev: boolean
  includePeer: boolean
  checkUnused: boolean
  maxDepth: number
}

export const DEFAULT_SCANNER_CONFIG: ScannerConfig = {
  includeDev: true,
  includePeer: true,
  checkUnused: true,
  maxDepth: 10,
}
