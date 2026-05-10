export type LinearProbeMapOptions = {
  capacity?: number
  loadFactorThreshold?: number
}

export type LinearProbeMapStatistics = {
  inserts: number
  deletes: number
  lookups: number
  probes: number
  rehashes: number
  maxProbeLength: number
  collisions: number
}

export const DEFAULT_LINEAR_PROBE_MAP_OPTIONS: Required<LinearProbeMapOptions> = {
  capacity: 16,
  loadFactorThreshold: 0.75,
}
