import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tsContent = readFileSync(join(__dirname, 'src/utils/glob.ts'), 'utf-8')

const globToRegexCode = tsContent.match(/export function globToRegex[\s\S]*?(?=\nexport function|\nfunction)/)?.[0]
console.log('globToRegex function:')
console.log(globToRegexCode)
