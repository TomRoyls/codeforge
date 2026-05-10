export interface SegmentMapEntry<V> {
  start: number
  end: number
  value: V
}

export interface SegmentMapOptions {
  allowOverlaps?: boolean
}

export interface SegmentMapStats {
  segmentCount: number
  totalCovered: number
  minStart: number | undefined
  maxEnd: number | undefined
  averageSpan: number
  overlapCount: number
}
