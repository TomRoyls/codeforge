/**
 * @stable
 */
export type StabilityLevel = 'stable' | 'experimental' | 'deprecated' | 'internal'

/**
 * @stable
 */
export type APISymbolKind = 'class' | 'interface' | 'type' | 'function' | 'const' | 'enum'

/**
 * @stable
 */
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

/**
 * @stable
 */
export interface APISnapshot {
  version: string
  timestamp: number
  signatures: APISignature[]
}

/**
 * @stable
 */
export interface DeprecationNotice {
  signature: APISignature
  message: string
  severity: 'low' | 'medium' | 'high'
}

/**
 * @stable
 */
export interface APIVersion {
  major: number
  minor: number
  patch: number
  prerelease?: string
}

/**
 * @stable
 */
export interface BreakingChange {
  signature: APISignature
  changeType: 'removed' | 'type-changed' | 'signature-changed' | 'renamed'
  previousSignature?: APISignature
  description: string
}

/**
 * @stable
 */
export interface APIContractResult {
  compatible: boolean
  breakingChanges: BreakingChange[]
  newApis: APISignature[]
  deprecatedApis: APISignature[]
}

/**
 * @stable
 */
export interface StabilityPolicy {
  minimumStability: StabilityLevel
  allowedBreakingChangesPerMajor: number
  deprecationGraceVersions: number
}

/**
 * @stable
 */
export const DEFAULT_STABILITY_POLICY: StabilityPolicy = {
  minimumStability: 'stable',
  allowedBreakingChangesPerMajor: 10,
  deprecationGraceVersions: 2,
}

/**
 * @stable
 */
export const STABILITY_ORDER: StabilityLevel[] = ['internal', 'experimental', 'stable', 'deprecated']

/**
 * @stable
 */
export function stabilityOrder(level: StabilityLevel): number {
  return STABILITY_ORDER.indexOf(level)
}

/**
 * @stable
 */
export function compareStability(a: StabilityLevel, b: StabilityLevel): number {
  return stabilityOrder(a) - stabilityOrder(b)
}

/**
 * @stable
 */
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

/**
 * @stable
 */
export function formatAPIVersion(v: APIVersion): string {
  const base = `${v.major}.${v.minor}.${v.patch}`
  if (v.prerelease) {
    return `${base}-${v.prerelease}`
  }
  return base
}

/**
 * @stable
 */
export function isPrerelease(v: APIVersion): boolean {
  return v.prerelease !== undefined && v.prerelease !== ''
}
