export type ServiceLifetime = 'singleton' | 'transient' | 'scoped'

export interface ServiceRegistration<T> {
  token: string
  factory: (container: Container) => T
  lifetime: ServiceLifetime
  dependencies: string[]
}

export interface ServiceDescriptor {
  token: string
  lifetime: ServiceLifetime
  instance?: unknown
  created: boolean
}

export interface ContainerConfig {
  validateOnResolve: boolean
  allowOverride: boolean
  maxResolutionDepth: number
}

export const DEFAULT_CONTAINER_CONFIG: ContainerConfig = {
  validateOnResolve: true,
  allowOverride: false,
  maxResolutionDepth: 50,
}

export interface Container {
  resolve<T>(token: string): T
  has(token: string): boolean
}
