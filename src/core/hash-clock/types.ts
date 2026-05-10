export interface HashClockOptions {
  seed: string
  hashFunction: (input: string) => string
}

export interface HashClockRecord {
  tick: number
  event: string
  hash: string
  prevHash: string
}

export const DEFAULT_HASH_CLOCK_OPTIONS: HashClockOptions = {
  seed: 'genesis',
  hashFunction: djb2Hash,
}

function djb2Hash(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
