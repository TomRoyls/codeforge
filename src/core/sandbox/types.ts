export interface FSPermission {
  read: string[]
  write: string[]
  execute: string[]
}

export interface PermissionSet {
  fs: FSPermission
  network: boolean
  childProcess: boolean
  globals: string[]
}

export interface SandboxConfig {
  maxExecutionTime: number
  maxMemory: number
  maxCpuPercent: number
  allowedModules: string[]
  deniedModules: string[]
  permissions: PermissionSet
  env: Record<string, string>
}

export interface SecurityViolation {
  type:
    | 'module-access'
    | 'fs-access'
    | 'network-access'
    | 'time-limit'
    | 'memory-limit'
    | 'global-access'
    | 'child-process'
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface SandboxResult {
  success: boolean
  result: unknown
  error?: string
  executionTime: number
  memoryUsed: number
  violations: SecurityViolation[]
}

export interface PluginManifest {
  name: string
  version: string
  permissions: PermissionSet
  entryPoint: string
  description: string
}

export interface ResourceUsage {
  startTime: number
  endTime: number
  memoryPeak: number
  cpuTime: number
}

export type ModuleAccessPolicy = 'allow' | 'deny' | 'ask'
