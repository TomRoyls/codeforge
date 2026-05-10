export interface LindyEffectOptions {
  halfLife?: number
  now?: () => number
}

export interface LindyItem {
  addedAt: number
  observations: number
  lastSeen: number
}
