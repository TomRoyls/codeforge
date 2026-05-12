export interface BitSetOptions {
  readonly size: number
  readonly growable?: boolean
}

export const DEFAULT_BITSET_OPTIONS: BitSetOptions = {
  size: 64,
  growable: true,
}
