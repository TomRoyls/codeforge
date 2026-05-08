export type StabilityLevel = 'stable' | 'experimental' | 'deprecated' | 'internal'

export type APISymbolKind = 'class' | 'interface' | 'type' | 'function' | 'const' | 'enum'

export interface APISignature {
  name: string
  kind: APISymbolKind
  module: string
  stability: StabilityLevel
  sinceVersion: string
  deprecatedSince?: string
  removedIn?: string
  replacement?: string
  reason?: string
}

export interface APISnapshot {
  version: string
  timestamp: number
  signatures: APISignature[]
}

export interface DeprecationNotice {
  signature: APISignature
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface APIVersion {
  major: number
  minor: number
  patch: number
  prerelease?: string
}

export interface BreakingChange {
  signature: APISignature
  changeType: 'removed' | 'type-changed' | 'signature-changed' | 'renamed'
  previousSignature?: APISignature
  description: string
}

export interface APIContractResult {
  compatible: boolean
  breakingChanges: BreakingChange[]
  newApis: APISignature[]
  deprecatedApis: APISignature[]
}

export interface StabilityPolicy {
  minimumStability: StabilityLevel
  allowedBreakingChangesPerMajor: number
  deprecationGraceVersions: number
}

export const DEFAULT_STABILITY_POLICY: StabilityPolicy = {
  minimumStability: 'stable',
  allowedBreakingChangesPerMajor: 10,
  deprecationGraceVersions: 2,
}

export const STABILITY_ORDER: StabilityLevel[] = ['internal', 'experimental', 'stable', 'deprecated']

export function stabilityOrder(level: StabilityLevel): number {
  return STABILITY_ORDER.indexOf(level)
}

export function compareStability(a: StabilityLevel, b: StabilityLevel): number {
  return stabilityOrder(a) - stabilityOrder(b)
}

export function parseAPIVersion(version: string): APIVersion {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/)
  if (!match) {
    throw new Error(`Invalid version format: ${version}`)
  }
  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
    prerelease: match[4],
  }
}

export function formatAPIVersion(v: APIVersion): string {
  const base = `${v.major}.${v.minor}.${v.patch}`
  if (v.prerelease) {
    return `${base}-${v.prerelease}`
  }
  return base
}

export function isPrerelease(v: APIVersion): boolean {
  return v.prerelease !== undefined && v.prerelease !== ''
}
