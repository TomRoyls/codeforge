export type { PolyHash } from './index.js'

export type PolyHashOptions = {
  base?: number
  mod?: number
}

export type ForEachCallback = (char: string, index: number) => void
