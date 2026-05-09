export interface BitmapIndexField {
  name: string
  cardinality: number
  bitmaps: Uint32Array[]
}

export interface BitmapIndexStats {
  numRecords: number
  fields: string[]
  cardinalities: Record<string, number>
  memoryUsage: number
}

export interface BitmapIndexData {
  numRecords: number
  fields: Record<string, BitmapIndexField>
}
