export interface MultimapOptions {
  allowDuplicates: boolean
}

export interface MultimapStats {
  keyCount: number
  valueCount: number
  isEmpty: boolean
  avgValuesPerKey: number
  maxValuesPerKey: number
  minValuesPerKey: number
}

export const DEFAULT_MULTIMAP_OPTIONS: MultimapOptions = {
  allowDuplicates: false,
}
