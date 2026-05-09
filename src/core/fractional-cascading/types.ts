export interface FractionalCascadingOptions {
  sorted: boolean
}

export const DEFAULT_FRACTIONAL_CASCADING_OPTIONS: FractionalCascadingOptions = {
  sorted: false,
}

export interface FractionalCascadingStats {
  arrayCount: number
  totalCount: number
  memoryUsage: number
}
