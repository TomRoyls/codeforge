export interface StripeLockedMapOptions {
  stripeCount?: number
  hashFunction?: (key: string) => number
}

export interface StripeLockedMapStatistics {
  sets: number
  gets: number
  deletes: number
  lockAcquisitions: number
  lockContentions: number
  stripeUsage: number[]
}

export const DEFAULT_STRIPE_LOCKED_MAP_OPTIONS: StripeLockedMapOptions = {
  stripeCount: 16,
}
