export interface SegmentTreeLazyOptions {
  identity: number
  combine: (a: number, b: number) => number
}

export const SUM_OPTIONS: SegmentTreeLazyOptions = {
  identity: 0,
  combine: (a: number, b: number): number => a + b,
}

export const MIN_OPTIONS: SegmentTreeLazyOptions = {
  identity: Infinity,
  combine: (a: number, b: number): number => Math.min(a, b),
}

export const MAX_OPTIONS: SegmentTreeLazyOptions = {
  identity: -Infinity,
  combine: (a: number, b: number): number => Math.max(a, b),
}

export const DEFAULT_SEGMENT_TREE_LAZY_OPTIONS: SegmentTreeLazyOptions = SUM_OPTIONS
