export interface HyperLogLogOptions {
  precision: number
}

export const DEFAULT_HYPERLOGLOG_OPTIONS: HyperLogLogOptions = {
  precision: 14,
}
