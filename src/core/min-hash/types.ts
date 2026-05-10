export interface MinHashOptions {
  numHashes: number
  seed: number
}

export interface MinHashJSON {
  numHashes: number
  seed: number
  signature: number[]
  size: number
  hashA: number[]
  hashB: number[]
}

export const DEFAULT_MINHASH_OPTIONS: MinHashOptions = {
  numHashes: 128,
  seed: 0x12345678,
}
