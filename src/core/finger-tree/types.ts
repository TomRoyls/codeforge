export interface FingerTreeOptions {
  maxDigitSize: number
}

export interface FingerTreeStats {
  size: number
  depth: number
}

export const DEFAULT_FINGERTREE_OPTIONS: FingerTreeOptions = {
  maxDigitSize: 4,
}
