export type AssetType2 = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
export type AssetState2 = 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted'

export interface Asset2 {
  id: string
  name: string
  type: AssetType2
  state: AssetState2
  size: number
  mimeType: string
  checksum: string
  storageKey: string
  width: number | null
  height: number | null
  duration: number | null
  tags: string[]
  versions: Array<{ version: number; size: number; checksum: string; storageKey: string }>
  currentVersion: number
  createdAt: number
  updatedAt: number
  uploadedBy: string
  metadata: Record<string, unknown>
}

export class AssetManager2 {
  private assets: Map<string, Asset2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private maxVersions: number = 10
  private maxSize: number = Infinity

  setMaxVersions(n: number): this { this.maxVersions = n; return this }
  setMaxSize(bytes: number): this { this.maxSize = bytes; return this }

  upload(name: string, type: AssetType2, size: number, mimeType: string, uploadedBy: string, metadata: Record<string, unknown> = {}): string | null {
    if (size > this.maxSize) return null
    const id = `asset_${++this.idCounter}`
    const now = Date.now()
    const asset: Asset2 = {
      id, name, type,
      state: 'uploading',
      size, mimeType,
      checksum: '',
      storageKey: `${id}/v1`,
      width: null, height: null, duration: null,
      tags: [],
      versions: [],
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
      uploadedBy,
      metadata,
    }
    this.assets.set(id, asset)
    this.notify('asset-uploading', { id })
    return id
  }

  markProcessing(id: string): boolean {
    const asset = this.assets.get(id)
    if (!asset || asset.state !== 'uploading') return false
    asset.state = 'processing'
    this.notify('asset-processing', { id })
    return true
  }

  markReady(id: string, checksum: string, storageKey: string, dimensions: Partial<{ width: number; height: number; duration: number }> = {}): boolean {
    const asset = this.assets.get(id)
    if (!asset || asset.state !== 'processing') return false
    asset.state = 'ready'
    asset.checksum = checksum
    asset.storageKey = storageKey
    asset.width = dimensions.width ?? null
    asset.height = dimensions.height ?? null
    asset.duration = dimensions.duration ?? null
    this.notify('asset-ready', { id })
    return true
  }

  markFailed(id: string): boolean {
    const asset = this.assets.get(id)
    if (!asset) return false
    asset.state = 'failed'
    this.notify('asset-failed', { id })
    return true
  }

  delete(id: string): boolean {
    const asset = this.assets.get(id)
    if (!asset) return false
    asset.state = 'deleted'
    this.notify('asset-deleted', { id })
    return true
  }

  addVersion(id: string, size: number, checksum: string, storageKey: string): boolean {
    const asset = this.assets.get(id)
    if (!asset || asset.state !== 'ready') return false
    const oldVersion = { version: asset.currentVersion, size: asset.size, checksum: asset.checksum, storageKey: asset.storageKey }
    asset.versions.push(oldVersion)
    asset.currentVersion++
    asset.size = size
    asset.checksum = checksum
    asset.storageKey = storageKey
    asset.updatedAt = Date.now()
    if (asset.versions.length > this.maxVersions) asset.versions.shift()
    this.notify('version-added', { id, version: asset.currentVersion })
    return true
  }

  rollbackVersion(id: string, toVersion: number): boolean {
    const asset = this.assets.get(id)
    if (!asset) return false
    const version = asset.versions.find(v => v.version === toVersion)
    if (!version) return false
    asset.versions.push({ version: asset.currentVersion, size: asset.size, checksum: asset.checksum, storageKey: asset.storageKey })
    asset.currentVersion = toVersion
    asset.size = version.size
    asset.checksum = version.checksum
    asset.storageKey = version.storageKey
    asset.updatedAt = Date.now()
    this.notify('version-rolled-back', { id, toVersion })
    return true
  }

  addTag(id: string, tag: string): boolean {
    const asset = this.assets.get(id)
    if (!asset) return false
    if (!asset.tags.includes(tag)) asset.tags.push(tag)
    return true
  }

  removeTag(id: string, tag: string): boolean {
    const asset = this.assets.get(id)
    if (!asset) return false
    asset.tags = asset.tags.filter(t => t !== tag)
    return true
  }

  setMetadata(id: string, key: string, value: unknown): boolean {
    const asset = this.assets.get(id)
    if (!asset) return false
    asset.metadata[key] = value
    return true
  }

  get(id: string): Asset2 | undefined { return this.assets.get(id) }
  getByName(name: string): Asset2[] { return Array.from(this.assets.values()).filter(a => a.name === name) }
  getByType(type: AssetType2): Asset2[] { return Array.from(this.assets.values()).filter(a => a.type === type) }
  getByState(state: AssetState2): Asset2[] { return Array.from(this.assets.values()).filter(a => a.state === state) }
  getByTag(tag: string): Asset2[] { return Array.from(this.assets.values()).filter(a => a.tags.includes(tag)) }
  getByUploader(uploader: string): Asset2[] { return Array.from(this.assets.values()).filter(a => a.uploadedBy === uploader) }
  getVersionHistory(id: string): Asset2['versions'] { return this.assets.get(id)?.versions || [] }

  getTotalSize(): number { return Array.from(this.assets.values()).reduce((s, a) => s + a.size, 0) }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { total: number; ready: number; processing: number; failed: number; deleted: number; totalSize: number } {
    return {
      total: this.assets.size,
      ready: this.getByState('ready').length,
      processing: this.getByState('processing').length,
      failed: this.getByState('failed').length,
      deleted: this.getByState('deleted').length,
      totalSize: this.getTotalSize(),
    }
  }

  count(): number { return this.assets.size }

  toArray(): Asset2[] { return Array.from(this.assets.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): AssetManager2 {
    const am = new AssetManager2()
    am.idCounter = this.idCounter
    am.maxVersions = this.maxVersions
    am.maxSize = this.maxSize
    return am
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AssetManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.assets.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
