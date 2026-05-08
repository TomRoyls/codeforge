export type ModuleState = 'registered' | 'resolved' | 'loaded' | 'error'

export interface ModuleManifest {
  id: string
  name: string
  version: string
  description: string
  dependencies: string[]
  exports: string[]
  author: string
  license: string
  main: string
}

export interface RegistryEntry {
  manifest: ModuleManifest
  registeredAt: Date
  state: ModuleState
  error?: string
}

export interface ResolveResult {
  resolved: boolean
  missingDeps: string[]
  resolvedOrder: string[]
}

export interface RegistryConfig {
  validateOnRegister: boolean
  strictSemver: boolean
  maxModules: number
}

export const DEFAULT_REGISTRY_CONFIG: RegistryConfig = {
  validateOnRegister: true,
  strictSemver: false,
  maxModules: 1000,
}
