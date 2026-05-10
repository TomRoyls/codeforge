export interface ScoreEntry {
  player: string
  score: number
}

export interface ScoreBoardOptions {
  orderBy?: 'desc' | 'asc'
}

export interface InternalEntry {
  player: string
  score: number
  insertionOrder: number
}
