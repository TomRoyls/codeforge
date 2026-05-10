export interface RankedEntry<K, V> {
  key: K
  value: V
  score: number
}

export type ScoreComparator = (a: number, b: number) => number

export interface RankedMapOptions {
  compareScores?: ScoreComparator
}

export interface InternalEntry<K, V> {
  key: K
  value: V
  score: number
  insertionOrder: number
}
