import * as fs from 'fs'
import * as path from 'path'

export function writeToFile(outputPath: string, content: string): void {
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(outputPath, content, 'utf8')
}
