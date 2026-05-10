export interface PhantomReferenceOptions {
  checkInterval?: number
}

export interface PhantomReferenceStatistics {
  registered: number
  enqueued: number
  cleared: number
  checks: number
}

export interface PhantomRef<T> {
  id: number
  value: T | null
  enqueued: boolean
  cleared: boolean
}

export const DEFAULT_PHANTOM_REFERENCE_OPTIONS: Required<PhantomReferenceOptions> = {
  checkInterval: 1000,
}
