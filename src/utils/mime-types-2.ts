export class MimeTypes2 {
  private static extToMime: Map<string, string> = new Map([
    ['html', 'text/html'], ['htm', 'text/html'], ['css', 'text/css'],
    ['js', 'application/javascript'], ['mjs', 'application/javascript'],
    ['json', 'application/json'], ['xml', 'application/xml'],
    ['txt', 'text/plain'], ['md', 'text/markdown'], ['csv', 'text/csv'],
    ['png', 'image/png'], ['jpg', 'image/jpeg'], ['jpeg', 'image/jpeg'],
    ['gif', 'image/gif'], ['svg', 'image/svg+xml'], ['webp', 'image/webp'],
    ['ico', 'image/x-icon'], ['bmp', 'image/bmp'],
    ['mp3', 'audio/mpeg'], ['wav', 'audio/wav'], ['ogg', 'audio/ogg'],
    ['mp4', 'video/mp4'], ['webm', 'video/webm'], ['avi', 'video/x-msvideo'],
    ['pdf', 'application/pdf'], ['zip', 'application/zip'],
    ['gz', 'application/gzip'], ['tar', 'application/x-tar'],
    ['woff', 'font/woff'], ['woff2', 'font/woff2'], ['ttf', 'font/ttf'],
    ['otf', 'font/otf'], ['eot', 'application/vnd.ms-fontobject'],
  ])

  private static mimeToExt: Map<string, string> = new Map()

  static {
    MimeTypes2.extToMime.forEach((mime, ext) => {
      if (!MimeTypes2.mimeToExt.has(mime)) MimeTypes2.mimeToExt.set(mime, ext)
    })
  }

  static lookup(filename: string): string | undefined {
    const ext = filename.includes('.') ? filename.split('.').pop()!.toLowerCase() : filename.toLowerCase()
    return MimeTypes2.extToMime.get(ext)
  }

  static extension(mimeType: string): string | undefined {
    return MimeTypes2.mimeToExt.get(mimeType.toLowerCase())
  }

  static isText(filename: string): boolean {
    const mime = MimeTypes2.lookup(filename)
    return mime !== undefined && mime.startsWith('text/')
  }

  static isImage(filename: string): boolean {
    const mime = MimeTypes2.lookup(filename)
    return mime !== undefined && mime.startsWith('image/')
  }

  static isAudio(filename: string): boolean {
    const mime = MimeTypes2.lookup(filename)
    return mime !== undefined && mime.startsWith('audio/')
  }

  static isVideo(filename: string): boolean {
    const mime = MimeTypes2.lookup(filename)
    return mime !== undefined && mime.startsWith('video/')
  }

  static isApplication(filename: string): boolean {
    const mime = MimeTypes2.lookup(filename)
    return mime !== undefined && mime.startsWith('application/')
  }

  static register(ext: string, mime: string): void {
    MimeTypes2.extToMime.set(ext.toLowerCase(), mime)
    if (!MimeTypes2.mimeToExt.has(mime)) MimeTypes2.mimeToExt.set(mime, ext.toLowerCase())
  }

  static charset(mimeType: string): string {
    if (mimeType.startsWith('text/') || mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml')) {
      return 'utf-8'
    }
    return 'binary'
  }

  toArray(): string[] { return Array.from(MimeTypes2.extToMime.keys()) }
  toString(): string { return JSON.stringify(Object.fromEntries(MimeTypes2.extToMime)) }
  toJSON(): Record<string, string> { return Object.fromEntries(MimeTypes2.extToMime) }
  clone(): MimeTypes2 { return new MimeTypes2() }
  equals(other: unknown): boolean { return other instanceof MimeTypes2 }
}
