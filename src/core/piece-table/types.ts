export interface Piece {
  buffer: 'original' | 'add'
  offset: number
  length: number
}

export interface PieceTableOptions {
  initialText?: string
}
