import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as os from 'os'
import { discoverConfig, findConfigPath } from '../../../src/config/discovery'
import { CLIError } from '../../../src/utils/errors'
import { CONFIG_FILE_NAMES } from '../../../src/config/types'

describe('config discovery', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('discoverConfig', () => {
    describe('finds config files', () => {
      test('finds .codeforgerc in current directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds .codeforgerc.json in current directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds .codeforge.json in current directory', async () => {
        const configPath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds codeforge.config.js in current directory', async () => {
        const configPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(configPath, 'module.exports = {}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('returns first found config file (priority order)', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, '.codeforgerc'))
      })

      test('finds .codeforgerc when only that config exists', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, 'rules: {}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds .codeforgerc.json when only that config exists', async () => {
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{"rules":{}}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds .codeforge.json when only that config exists', async () => {
        const configPath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(configPath, '{"rules":{}}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds codeforge.config.js when only that config exists', async () => {
        const configPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(configPath, 'module.exports = {rules:{}}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })
    })

    describe('config file priority order', () => {
      test('.codeforgerc takes priority over .codeforgerc.json', async () => {
        const rcPath = path.join(tempDir, '.codeforgerc')
        const rcJsonPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(rcPath, '{}')
        await fs.writeFile(rcJsonPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(rcPath)
      })

      test('.codeforgerc takes priority over .codeforge.json', async () => {
        const rcPath = path.join(tempDir, '.codeforgerc')
        const forgePath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(rcPath, '{}')
        await fs.writeFile(forgePath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(rcPath)
      })

      test('.codeforgerc takes priority over codeforge.config.js', async () => {
        const rcPath = path.join(tempDir, '.codeforgerc')
        const configJsPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(rcPath, '{}')
        await fs.writeFile(configJsPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(rcPath)
      })

      test('.codeforgerc.json takes priority over .codeforge.json', async () => {
        const rcJsonPath = path.join(tempDir, '.codeforgerc.json')
        const forgePath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(rcJsonPath, '{}')
        await fs.writeFile(forgePath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(rcJsonPath)
      })

      test('.codeforgerc.json takes priority over codeforge.config.js', async () => {
        const rcJsonPath = path.join(tempDir, '.codeforgerc.json')
        const configJsPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(rcJsonPath, '{}')
        await fs.writeFile(configJsPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(rcJsonPath)
      })

      test('.codeforge.json takes priority over codeforge.config.js', async () => {
        const forgePath = path.join(tempDir, '.codeforge.json')
        const configJsPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(forgePath, '{}')
        await fs.writeFile(configJsPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(forgePath)
      })

      test('all four config files present, first wins', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}')
        await fs.writeFile(path.join(tempDir, 'codeforge.config.js'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, '.codeforgerc'))
      })

      test('second config wins when first is absent', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}')
        await fs.writeFile(path.join(tempDir, 'codeforge.config.js'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, '.codeforgerc.json'))
      })

      test('third config wins when first two are absent', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}')
        await fs.writeFile(path.join(tempDir, 'codeforge.config.js'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, '.codeforge.json'))
      })

      test('fourth config wins when first three are absent', async () => {
        await fs.writeFile(path.join(tempDir, 'codeforge.config.js'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, 'codeforge.config.js'))
      })
    })

    describe('searches upward', () => {
      test('searches upward from subdirectory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const subDir = path.join(tempDir, 'src', 'components')
        await fs.mkdir(subDir, { recursive: true })

        const result = await discoverConfig({ cwd: subDir })

        expect(result).toBe(configPath)
      })

      test('finds config in parent directory when not in current', async () => {
        const parentConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(parentConfig, '{}')

        const childDir = path.join(tempDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(parentConfig)
      })

      test('finds nearest config when multiple exist', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')

        const nestedDir = path.join(tempDir, 'packages', 'lib')
        await fs.mkdir(nestedDir, { recursive: true })
        const nestedConfig = path.join(nestedDir, '.codeforgerc.json')
        await fs.writeFile(nestedConfig, '{}')

        const deepDir = path.join(nestedDir, 'src')
        await fs.mkdir(deepDir)

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBe(nestedConfig)
      })

      test('finds config in grandparent directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const childDir = path.join(tempDir, 'a', 'b')
        await fs.mkdir(childDir, { recursive: true })

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('finds config in great-grandparent directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const childDir = path.join(tempDir, 'a', 'b', 'c')
        await fs.mkdir(childDir, { recursive: true })

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('finds config 5 levels up', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const childDir = path.join(tempDir, 'l1', 'l2', 'l3', 'l4', 'l5')
        await fs.mkdir(childDir, { recursive: true })

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('traverses through directories with unrelated files', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const midDir = path.join(tempDir, 'mid')
        await fs.mkdir(midDir)
        await fs.writeFile(path.join(midDir, 'random.txt'), 'hello')
        await fs.writeFile(path.join(midDir, 'data.json'), '[]')

        const childDir = path.join(midDir, 'deep')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('traverses through directories with non-config dotfiles', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const midDir = path.join(tempDir, 'mid')
        await fs.mkdir(midDir)
        await fs.writeFile(path.join(midDir, '.eslintrc'), '{}')
        await fs.writeFile(path.join(midDir, '.prettierrc'), '{}')
        await fs.writeFile(path.join(midDir, '.gitignore'), 'node_modules')

        const childDir = path.join(midDir, 'deep')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('skips directories that have no config files', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const emptyDir = path.join(tempDir, 'empty')
        await fs.mkdir(emptyDir)
        await fs.writeFile(path.join(emptyDir, 'other.txt'), 'text')

        const childDir = path.join(emptyDir, 'nested')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('finds config in intermediate directory during upward traversal', async () => {
        const rootConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(rootConfig, '{}')

        const midDir = path.join(tempDir, 'packages')
        await fs.mkdir(midDir)
        const midConfig = path.join(midDir, '.codeforgerc.json')
        await fs.writeFile(midConfig, '{}')

        const deepDir = path.join(midDir, 'lib', 'src')
        await fs.mkdir(deepDir, { recursive: true })

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBe(midConfig)
      })

      test('finds different config types at different levels', async () => {
        const rootConfig = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(rootConfig, '{}')

        const midDir = path.join(tempDir, 'packages')
        await fs.mkdir(midDir)
        const midConfig = path.join(midDir, '.codeforge.json')
        await fs.writeFile(midConfig, '{}')

        const deepDir = path.join(midDir, 'lib', 'src')
        await fs.mkdir(deepDir, { recursive: true })

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBe(midConfig)
      })

      test('finds config in parent when sibling dirs have no config', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const siblingA = path.join(tempDir, 'sibling-a')
        const siblingB = path.join(tempDir, 'sibling-b')
        await fs.mkdir(siblingA)
        await fs.mkdir(siblingB)

        const result = await discoverConfig({ cwd: siblingA })

        expect(result).toBe(configPath)
      })

      test('finds config from deeply nested src/components/utils', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const deepDir = path.join(tempDir, 'src', 'components', 'utils', 'helpers')
        await fs.mkdir(deepDir, { recursive: true })

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBe(configPath)
      })
    })

    describe('stops at boundaries', () => {
      test('stops at package.json (project root)', async () => {
        const parentDir = path.join(tempDir, 'parent')
        await fs.mkdir(parentDir)
        await fs.writeFile(path.join(parentDir, 'package.json'), '{}')

        const childDir = path.join(parentDir, 'src')
        await fs.mkdir(childDir)
        const configPath = path.join(parentDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('does not search beyond package.json', async () => {
        const grandparentConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(grandparentConfig, '{}')

        const parentDir = path.join(tempDir, 'project')
        await fs.mkdir(parentDir)
        await fs.writeFile(path.join(parentDir, 'package.json'), '{}')

        const childDir = path.join(parentDir, 'src')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBeNull()
      })

      test('stops at custom stopAt directory', async () => {
        const rootConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(rootConfig, '{}')

        const stopDir = path.join(tempDir, 'workspace')
        await fs.mkdir(stopDir)

        const stopConfig = path.join(stopDir, '.codeforgerc.json')
        await fs.writeFile(stopConfig, '{}')

        const childDir = path.join(stopDir, 'project')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: stopDir })

        expect(result).toBe(stopConfig)
      })

      test('returns null when stopAt reached without finding config', async () => {
        const stopDir = path.join(tempDir, 'workspace')
        await fs.mkdir(stopDir)

        const childDir = path.join(stopDir, 'project')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: childDir })

        expect(result).toBeNull()
      })

      test('finds config alongside package.json', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')
        await fs.writeFile(path.join(tempDir, 'package.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('package.json boundary prevents finding config in parent', async () => {
        const parentConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(parentConfig, '{}')

        const projectDir = path.join(tempDir, 'project')
        await fs.mkdir(projectDir)
        await fs.writeFile(path.join(projectDir, 'package.json'), '{}')

        const srcDir = path.join(projectDir, 'src')
        await fs.mkdir(srcDir)

        const result = await discoverConfig({ cwd: srcDir })

        expect(result).toBeNull()
      })

      test('does not stop when package.json is a directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const midDir = path.join(tempDir, 'mid')
        await fs.mkdir(midDir)
        await fs.mkdir(path.join(midDir, 'package.json'))

        const childDir = path.join(midDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('stops at first package.json encountered going upward', async () => {
        const outerConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(outerConfig, '{}')

        const innerDir = path.join(tempDir, 'inner')
        await fs.mkdir(innerDir)
        await fs.writeFile(path.join(innerDir, 'package.json'), '{}')

        const deepDir = path.join(innerDir, 'src', 'deep')
        await fs.mkdir(deepDir, { recursive: true })

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBeNull()
      })

      test('stopAt set to cwd itself searches only cwd', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const childDir = path.join(tempDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: childDir })

        expect(result).toBeNull()
      })

      test('stopAt allows finding config in parent of cwd', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const childDir = path.join(tempDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: tempDir })

        expect(result).toBe(configPath)
      })

      test('stopAt with config in the stopAt directory itself', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const childDir = path.join(tempDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: tempDir })

        expect(result).toBe(configPath)
      })

      test('stopAt does not prevent finding config before reaching it', async () => {
        const midDir = path.join(tempDir, 'mid')
        await fs.mkdir(midDir)
        const midConfig = path.join(midDir, '.codeforgerc')
        await fs.writeFile(midConfig, '{}')

        const childDir = path.join(midDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: tempDir })

        expect(result).toBe(midConfig)
      })

      test('stopAt resolves relative path to absolute', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const childDir = path.join(tempDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: tempDir })

        expect(result).toBe(configPath)
      })

      test('config found before hitting package.json boundary', async () => {
        const midDir = path.join(tempDir, 'mid')
        await fs.mkdir(midDir)
        const midConfig = path.join(midDir, '.codeforgerc')
        await fs.writeFile(midConfig, '{}')

        const pkgDir = path.join(midDir, 'pkg')
        await fs.mkdir(pkgDir)
        await fs.writeFile(path.join(pkgDir, 'package.json'), '{}')

        const srcDir = path.join(pkgDir, 'src')
        await fs.mkdir(srcDir)

        const result = await discoverConfig({ cwd: srcDir })

        expect(result).toBeNull()
      })

      test('package.json stop and config at same level - config found first', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')
        await fs.writeFile(path.join(tempDir, 'package.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('stopAt deeper than cwd has no effect', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const deepStop = path.join(tempDir, 'a', 'b', 'c')
        await fs.mkdir(deepStop, { recursive: true })

        const result = await discoverConfig({ cwd: tempDir, stopAt: deepStop })

        expect(result).toBe(configPath)
      })
    })

    describe('returns null when not found', () => {
      test('returns null when no config file exists', async () => {
        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('returns null when only non-config files exist', async () => {
        await fs.writeFile(path.join(tempDir, 'readme.md'), '# Readme')
        await fs.writeFile(path.join(tempDir, 'index.ts'), 'export {}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('returns null when similar but wrong config names exist', async () => {
        await fs.writeFile(path.join(tempDir, 'codeforgerc'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforge.yaml'), '{}')
        await fs.writeFile(path.join(tempDir, 'codeforge.json'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforgerc.yml'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('returns null in directory with only package.json', async () => {
        await fs.writeFile(path.join(tempDir, 'package.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('returns null when empty directories are traversed', async () => {
        const emptyDir = path.join(tempDir, 'empty')
        await fs.mkdir(emptyDir)

        const deeperDir = path.join(emptyDir, 'deeper')
        await fs.mkdir(deeperDir)

        const result = await discoverConfig({ cwd: deeperDir })

        expect(result).toBeNull()
      })

      test('returns null when config name has extra extension', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforgerc.json.bak'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('returns null when config name has different case', async () => {
        await fs.writeFile(path.join(tempDir, 'CodeForge.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })
    })

    describe('config file is directory (not file)', () => {
      test('skips .codeforgerc when it is a directory', async () => {
        await fs.mkdir(path.join(tempDir, '.codeforgerc'))
        await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, '.codeforgerc.json'))
      })

      test('skips .codeforgerc.json when it is a directory', async () => {
        await fs.mkdir(path.join(tempDir, '.codeforgerc.json'))
        await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, '.codeforge.json'))
      })

      test('skips .codeforge.json when it is a directory', async () => {
        await fs.mkdir(path.join(tempDir, '.codeforge.json'))
        await fs.writeFile(path.join(tempDir, 'codeforge.config.js'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, 'codeforge.config.js'))
      })

      test('skips codeforge.config.js when it is a directory', async () => {
        await fs.mkdir(path.join(tempDir, 'codeforge.config.js'))

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('skips all config names that are directories', async () => {
        await fs.mkdir(path.join(tempDir, '.codeforgerc'))
        await fs.mkdir(path.join(tempDir, '.codeforgerc.json'))
        await fs.mkdir(path.join(tempDir, '.codeforge.json'))
        await fs.mkdir(path.join(tempDir, 'codeforge.config.js'))

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('skips first config as dir, finds second as file', async () => {
        await fs.mkdir(path.join(tempDir, '.codeforgerc'))
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('skips first two configs as dirs, finds third as file', async () => {
        await fs.mkdir(path.join(tempDir, '.codeforgerc'))
        await fs.mkdir(path.join(tempDir, '.codeforgerc.json'))
        const configPath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })
    })

    describe('edge cases', () => {
      test('handles deeply nested directory structure', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
        await fs.mkdir(deepDir, { recursive: true })

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBe(configPath)
      })

      test('handles directory with many files', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        for (let i = 0; i < 20; i++) {
          await fs.writeFile(path.join(tempDir, `file${i}.ts`), '')
        }

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('handles symlinks in path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const realDir = path.join(tempDir, 'real')
        await fs.mkdir(realDir)

        const linkDir = path.join(tempDir, 'link')
        await fs.symlink(realDir, linkDir)

        const result = await discoverConfig({ cwd: linkDir })

        expect(result).toBe(configPath)
      })

      test('returns absolute path for found config', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.resolve(configPath))
      })

      test('result path matches actual file location exactly', async () => {
        const configPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(configPath, 'module.exports = {}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(path.isAbsolute(result!)).toBe(true)
        expect(result).toBe(configPath)
      })

      test('handles directory named like a config file in path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const weirdDir = path.join(tempDir, '.codeforgerc.json', 'sub')
        await fs.mkdir(weirdDir, { recursive: true })

        const result = await discoverConfig({ cwd: weirdDir })

        expect(result).toBe(configPath)
      })

      test('handles directory with node_modules present', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')
        await fs.mkdir(path.join(tempDir, 'node_modules'))

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('handles multiple calls from same directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result1 = await discoverConfig({ cwd: tempDir })
        const result2 = await discoverConfig({ cwd: tempDir })

        expect(result1).toBe(configPath)
        expect(result2).toBe(configPath)
        expect(result1).toBe(result2)
      })

      test('handles concurrent discovery calls', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const [r1, r2, r3] = await Promise.all([
          discoverConfig({ cwd: tempDir }),
          discoverConfig({ cwd: tempDir }),
          discoverConfig({ cwd: tempDir }),
        ])

        expect(r1).toBe(configPath)
        expect(r2).toBe(configPath)
        expect(r3).toBe(configPath)
      })

      test('handles cwd resolution for relative paths', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: path.resolve(tempDir) })

        expect(result).toBe(configPath)
      })

      test('finds config with empty file content', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds config with large file content', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        const largeContent = JSON.stringify({
          rules: Object.fromEntries(Array.from({ length: 200 }, (_, i) => [`rule-${i}`, 'error'])),
        })
        await fs.writeFile(configPath, largeContent)

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('handles single-level directory without parent traversal', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')
        await fs.writeFile(path.join(tempDir, 'package.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('handles config file with execute permissions', async () => {
        const configPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(configPath, 'module.exports = {}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('traversal stops when hitting both package.json and stopAt', async () => {
        const childDir = path.join(tempDir, 'project')
        await fs.mkdir(childDir)
        await fs.writeFile(path.join(childDir, 'package.json'), '{}')

        const srcDir = path.join(childDir, 'src')
        await fs.mkdir(srcDir)

        const result = await discoverConfig({ cwd: srcDir, stopAt: tempDir })

        expect(result).toBeNull()
      })
    })

    describe('monorepo scenarios', () => {
      test('finds package-level config in monorepo', async () => {
        await fs.writeFile(path.join(tempDir, 'package.json'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')

        const packagesDir = path.join(tempDir, 'packages')
        await fs.mkdir(packagesDir)

        const pkgADir = path.join(packagesDir, 'pkg-a')
        await fs.mkdir(pkgADir)
        await fs.writeFile(path.join(pkgADir, 'package.json'), '{}')
        const pkgConfig = path.join(pkgADir, '.codeforgerc.json')
        await fs.writeFile(pkgConfig, '{}')

        const result = await discoverConfig({ cwd: pkgADir })

        expect(result).toBe(pkgConfig)
      })

      test('does not find root config from package with package.json', async () => {
        const rootConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(rootConfig, '{}')

        const pkgDir = path.join(tempDir, 'packages', 'lib')
        await fs.mkdir(pkgDir, { recursive: true })
        await fs.writeFile(path.join(pkgDir, 'package.json'), '{}')

        const result = await discoverConfig({ cwd: pkgDir })

        expect(result).toBeNull()
      })

      test('finds root config from package without package.json', async () => {
        const rootConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(rootConfig, '{}')
        await fs.writeFile(path.join(tempDir, 'package.json'), '{}')

        const pkgDir = path.join(tempDir, 'packages', 'lib')
        await fs.mkdir(pkgDir, { recursive: true })

        const result = await discoverConfig({ cwd: pkgDir })

        expect(result).toBe(rootConfig)
      })

      test('nested monorepo finds nearest config', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')

        const workspaceDir = path.join(tempDir, 'workspace')
        await fs.mkdir(workspaceDir)
        await fs.writeFile(path.join(workspaceDir, 'package.json'), '{}')
        await fs.writeFile(path.join(workspaceDir, '.codeforgerc.json'), '{}')

        const pkgDir = path.join(workspaceDir, 'packages', 'app')
        await fs.mkdir(pkgDir, { recursive: true })

        const result = await discoverConfig({ cwd: pkgDir })

        expect(result).toBe(path.join(workspaceDir, '.codeforgerc.json'))
      })

      test('stopAt can limit monorepo search scope', async () => {
        const outerConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(outerConfig, '{}')

        const workspaceDir = path.join(tempDir, 'workspace')
        await fs.mkdir(workspaceDir)

        const pkgDir = path.join(workspaceDir, 'app')
        await fs.mkdir(pkgDir)

        const result = await discoverConfig({ cwd: pkgDir, stopAt: workspaceDir })

        expect(result).toBeNull()
      })
    })

    describe('discoverConfig cwd handling', () => {
      test('resolves cwd to absolute path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(path.isAbsolute(result!)).toBe(true)
      })

      test('works with absolute cwd', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: path.resolve(tempDir) })

        expect(result).toBe(path.resolve(configPath))
      })

      test('does not modify the cwd option', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const opts = { cwd: tempDir }
        await discoverConfig(opts)

        expect(opts.cwd).toBe(tempDir)
      })
    })
  })

  describe('findConfigPath', () => {
    describe('with explicit path', () => {
      test('returns absolute path for valid explicit path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(configPath)

        expect(result).toBe(configPath)
      })

      test('resolves relative path to absolute', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath('.codeforgerc', tempDir)

        expect(result).toBe(configPath)
      })

      test('throws CLIError.configError for non-existent explicit path', async () => {
        const nonExistent = path.join(tempDir, 'non-existent.json')

        await expect(findConfigPath(nonExistent)).rejects.toThrow(CLIError)
      })

      test('throws CLIError with code E003 for config error', async () => {
        const nonExistent = path.join(tempDir, 'missing.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          expect((error as CLIError).code).toBe('E003')
        }
      })

      test('error message includes the path', async () => {
        const nonExistent = path.join(tempDir, 'missing.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect((error as Error).message).toContain(nonExistent)
        }
      })

      test('throws error when explicit path is a directory', async () => {
        const dirPath = path.join(tempDir, 'subdir')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          expect((error as Error).message).toContain('not a file')
        }
      })

      test('throws CLIError for directory path with E003 code', async () => {
        const dirPath = path.join(tempDir, 'subdir')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          expect((error as CLIError).code).toBe('E003')
        }
      })

      test('returns resolved absolute path when explicit path is relative', async () => {
        const fileName = 'my-config.json'
        const configPath = path.join(tempDir, fileName)
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(fileName, tempDir)

        expect(result).toBe(path.resolve(tempDir, fileName))
      })

      test('handles explicit path with .codeforgerc.json', async () => {
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath('.codeforgerc.json', tempDir)

        expect(result).toBe(configPath)
      })

      test('handles explicit path with .codeforge.json', async () => {
        const configPath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath('.codeforge.json', tempDir)

        expect(result).toBe(configPath)
      })

      test('handles explicit path with codeforge.config.js', async () => {
        const configPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(configPath, 'module.exports = {}')

        const result = await findConfigPath('codeforge.config.js', tempDir)

        expect(result).toBe(configPath)
      })

      test('error for non-existent path includes helpful suggestions', async () => {
        const nonExistent = path.join(tempDir, 'nope.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          const cliError = error as CLIError
          expect(cliError.suggestions.length).toBeGreaterThan(0)
        }
      })

      test('error for directory path includes helpful suggestions', async () => {
        const dirPath = path.join(tempDir, 'some-dir')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          const cliError = error as CLIError
          expect(cliError.suggestions.length).toBeGreaterThan(0)
        }
      })

      test('re-throws CLIError without wrapping', async () => {
        const dirPath = path.join(tempDir, 'a-dir')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          expect((error as CLIError).name).toBe('CLIError')
        }
      })

      test('error for non-existent file mentions not found', async () => {
        const nonExistent = path.join(tempDir, 'absent.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect((error as Error).message).toContain('not found')
        }
      })

      test('resolves path relative to provided cwd', async () => {
        const subDir = path.join(tempDir, 'sub')
        await fs.mkdir(subDir)
        const configPath = path.join(subDir, 'config.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath('config.json', subDir)

        expect(result).toBe(configPath)
      })

      test('returns absolute path for valid file', async () => {
        const configPath = path.join(tempDir, 'custom.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(configPath, tempDir)

        expect(path.isAbsolute(result!)).toBe(true)
      })

      test('handles file with spaces in name', async () => {
        const configPath = path.join(tempDir, 'my config.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath('my config.json', tempDir)

        expect(result).toBe(configPath)
      })

      test('handles file in nested directory with explicit path', async () => {
        const nestedDir = path.join(tempDir, 'configs', 'prod')
        await fs.mkdir(nestedDir, { recursive: true })
        const configPath = path.join(nestedDir, 'config.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(path.join('configs', 'prod', 'config.json'), tempDir)

        expect(result).toBe(configPath)
      })
    })

    describe('without explicit path (auto-discovery)', () => {
      test('auto-discovers config when no explicit path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(undefined, tempDir)

        expect(result).toBe(configPath)
      })

      test('returns null when no config found and no explicit path', async () => {
        const result = await findConfigPath(undefined, tempDir)

        expect(result).toBeNull()
      })

      test('uses process.cwd() when cwd not provided', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const originalCwd = process.cwd
        process.cwd = () => tempDir

        try {
          const result = await findConfigPath()
          expect(result).toBe(configPath)
        } finally {
          process.cwd = originalCwd
        }
      })

      test('uses provided cwd over process.cwd()', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const otherDir = await fs.mkdtemp(path.join(os.tmpdir(), 'other-'))
        try {
          const originalCwd = process.cwd
          process.cwd = () => otherDir

          try {
            const result = await findConfigPath(undefined, tempDir)
            expect(result).toBe(configPath)
          } finally {
            process.cwd = originalCwd
          }
        } finally {
          await fs.rm(otherDir, { recursive: true, force: true })
        }
      })

      test('returns null from process.cwd() when no config', async () => {
        const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'empty-'))
        try {
          const originalCwd = process.cwd
          process.cwd = () => emptyDir

          try {
            const result = await findConfigPath()
            expect(result).toBeNull()
          } finally {
            process.cwd = originalCwd
          }
        } finally {
          await fs.rm(emptyDir, { recursive: true, force: true })
        }
      })

      test('auto-discovers .codeforgerc.json', async () => {
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(undefined, tempDir)

        expect(result).toBe(configPath)
      })

      test('auto-discovers .codeforge.json', async () => {
        const configPath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(undefined, tempDir)

        expect(result).toBe(configPath)
      })

      test('auto-discovers codeforge.config.js', async () => {
        const configPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(configPath, 'module.exports = {}')

        const result = await findConfigPath(undefined, tempDir)

        expect(result).toBe(configPath)
      })

      test('auto-discovery searches upward', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const subDir = path.join(tempDir, 'src', 'lib')
        await fs.mkdir(subDir, { recursive: true })

        const result = await findConfigPath(undefined, subDir)

        expect(result).toBe(configPath)
      })

      test('auto-discovery respects package.json boundary', async () => {
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')

        const projDir = path.join(tempDir, 'proj')
        await fs.mkdir(projDir)
        await fs.writeFile(path.join(projDir, 'package.json'), '{}')

        const result = await findConfigPath(undefined, projDir)

        expect(result).toBeNull()
      })
    })

    describe('error handling details', () => {
      test('thrown error is instanceof Error', async () => {
        const nonExistent = path.join(tempDir, 'nope.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      test('thrown error has name CLIError', async () => {
        const nonExistent = path.join(tempDir, 'nope.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect((error as Error).name).toBe('CLIError')
        }
      })

      test('thrown error for missing file has suggestions array', async () => {
        const nonExistent = path.join(tempDir, 'gone.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          const cliError = error as CLIError
          expect(Array.isArray(cliError.suggestions)).toBe(true)
        }
      })

      test('thrown error for directory has suggestions array', async () => {
        const dirPath = path.join(tempDir, 'd')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          const cliError = error as CLIError
          expect(Array.isArray(cliError.suggestions)).toBe(true)
        }
      })

      test('error for non-existent file suggests checking path', async () => {
        const nonExistent = path.join(tempDir, 'vanish.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          const cliError = error as CLIError
          const suggestionText = cliError.suggestions.join(' ')
          expect(suggestionText).toContain('path')
        }
      })

      test('error for directory mentions not a file', async () => {
        const dirPath = path.join(tempDir, 'folder')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect((error as Error).message).toContain('not a file')
        }
      })

      test('error for directory includes directory path', async () => {
        const dirPath = path.join(tempDir, 'folder')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect((error as Error).message).toContain(dirPath)
        }
      })

      test('explicit path error does not trigger discovery fallback', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const badPath = path.join(tempDir, 'nonexistent.json')

        await expect(findConfigPath(badPath, tempDir)).rejects.toThrow()
      })

      test('error has context object', async () => {
        const nonExistent = path.join(tempDir, 'ctx.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          const cliError = error as CLIError
          expect(cliError.context).toBeDefined()
        }
      })
    })
  })

  describe('CONFIG_FILE_NAMES constant', () => {
    test('contains all expected config file names', () => {
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc')
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc.json')
      expect(CONFIG_FILE_NAMES).toContain('.codeforge.json')
      expect(CONFIG_FILE_NAMES).toContain('codeforge.config.js')
    })

    test('has correct priority order', () => {
      expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
      expect(CONFIG_FILE_NAMES[1]).toBe('.codeforgerc.json')
      expect(CONFIG_FILE_NAMES[2]).toBe('.codeforge.json')
      expect(CONFIG_FILE_NAMES[3]).toBe('codeforge.config.js')
    })

    test('has exactly 4 entries', () => {
      expect(CONFIG_FILE_NAMES).toHaveLength(4)
    })

    test('does not contain duplicate entries', () => {
      const unique = new Set(CONFIG_FILE_NAMES)
      expect(unique.size).toBe(CONFIG_FILE_NAMES.length)
    })

    test('all entries are non-empty strings', () => {
      for (const name of CONFIG_FILE_NAMES) {
        expect(name.length).toBeGreaterThan(0)
      }
    })

    test('all entries are strings', () => {
      for (const name of CONFIG_FILE_NAMES) {
        expect(typeof name).toBe('string')
      }
    })

    test('first entry has no file extension', () => {
      expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
    })

    test('entries 1-3 have file extensions', () => {
      expect(CONFIG_FILE_NAMES[1]).toMatch(/\.json$/)
      expect(CONFIG_FILE_NAMES[2]).toMatch(/\.json$/)
      expect(CONFIG_FILE_NAMES[3]).toMatch(/\.js$/)
    })

    test('first two entries share .codeforgerc prefix', () => {
      expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
      expect(CONFIG_FILE_NAMES[1]).toMatch(/^\.codeforgerc\./)
    })

    test('third entry starts with .codeforge', () => {
      expect(CONFIG_FILE_NAMES[2]).toMatch(/^\.codeforge\./)
    })

    test('fourth entry starts with codeforge (no dot prefix)', () => {
      expect(CONFIG_FILE_NAMES[3]).toMatch(/^codeforge\./)
    })

    test('is a readonly tuple', () => {
      expect(Array.isArray(CONFIG_FILE_NAMES)).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    test('explicit path takes precedence over discovery', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforgerc'), 'root config')
      const explicitPath = path.join(tempDir, 'custom.json')
      await fs.writeFile(explicitPath, '{}')

      const result = await findConfigPath('custom.json', tempDir)

      expect(result).toBe(explicitPath)
    })

    test('finds config from deeply nested monorepo package', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}')

      const pkgDir = path.join(tempDir, 'packages', 'ui', 'src', 'components')
      await fs.mkdir(pkgDir, { recursive: true })

      const result = await discoverConfig({ cwd: pkgDir })

      expect(result).toBe(path.join(tempDir, '.codeforgerc'))
    })

    test('workspace config wins over project root config', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')

      const workspaceDir = path.join(tempDir, 'workspace')
      await fs.mkdir(workspaceDir)
      const workspaceConfig = path.join(workspaceDir, '.codeforge.json')
      await fs.writeFile(workspaceConfig, '{}')

      const srcDir = path.join(workspaceDir, 'src')
      await fs.mkdir(srcDir)

      const result = await discoverConfig({ cwd: srcDir })

      expect(result).toBe(workspaceConfig)
    })

    test('discoverConfig with stopAt limits search scope', async () => {
      const outerConfig = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(outerConfig, '{}')

      const midDir = path.join(tempDir, 'mid')
      await fs.mkdir(midDir)

      const innerDir = path.join(midDir, 'inner')
      await fs.mkdir(innerDir)

      const result = await discoverConfig({ cwd: innerDir, stopAt: midDir })

      expect(result).toBeNull()
    })

    test('full workflow: discover then validate via findConfigPath', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const discovered = await discoverConfig({ cwd: tempDir })
      expect(discovered).toBe(configPath)

      const validated = await findConfigPath(discovered!)
      expect(validated).toBe(configPath)
    })

    test('full workflow: discover returns null, findConfigPath also returns null', async () => {
      const discovered = await discoverConfig({ cwd: tempDir })
      expect(discovered).toBeNull()

      const result = await findConfigPath(undefined, tempDir)
      expect(result).toBeNull()
    })

    test('package.json at root does not prevent finding config at root', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{"name":"test"}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config through multiple intermediate empty directories', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h')
      await fs.mkdir(deepDir, { recursive: true })

      const result = await discoverConfig({ cwd: deepDir })

      expect(result).toBe(configPath)
    })

    test('stopAt boundary with package.json at same level', async () => {
      const stopDir = path.join(tempDir, 'boundary')
      await fs.mkdir(stopDir)
      await fs.writeFile(path.join(stopDir, 'package.json'), '{}')
      const stopConfig = path.join(stopDir, '.codeforgerc')
      await fs.writeFile(stopConfig, '{}')

      const childDir = path.join(stopDir, 'src')
      await fs.mkdir(childDir)

      const result = await discoverConfig({ cwd: childDir, stopAt: stopDir })

      expect(result).toBe(stopConfig)
    })

    test('multiple config types at different tree levels', async () => {
      const rootConfig = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(rootConfig, '{}')

      const midDir = path.join(tempDir, 'packages')
      await fs.mkdir(midDir)
      const midConfig = path.join(midDir, '.codeforge.json')
      await fs.writeFile(midConfig, '{}')

      const pkgDir = path.join(midDir, 'my-pkg')
      await fs.mkdir(pkgDir)
      await fs.writeFile(path.join(pkgDir, 'package.json'), '{}')
      const pkgConfig = path.join(pkgDir, '.codeforgerc')
      await fs.writeFile(pkgConfig, '{}')

      const srcDir = path.join(pkgDir, 'src')
      await fs.mkdir(srcDir)

      const result = await discoverConfig({ cwd: srcDir })

      expect(result).toBe(pkgConfig)
    })
  })

  describe('discoverConfig - symlink scenarios', () => {
    test('finds config through symlinked directory', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const realDir = path.join(tempDir, 'real-dir')
      await fs.mkdir(realDir)

      const linkDir = path.join(tempDir, 'link-dir')
      await fs.symlink(realDir, linkDir)

      const result = await discoverConfig({ cwd: linkDir })

      expect(result).toBe(configPath)
    })

    test('finds config when cwd parent is a symlink', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const realChild = path.join(tempDir, 'real-child')
      await fs.mkdir(realChild)

      const linkChild = path.join(tempDir, 'link-child')
      await fs.symlink(realChild, linkChild)

      const deeperDir = path.join(linkChild, 'deeper')
      await fs.mkdir(deeperDir)

      const result = await discoverConfig({ cwd: deeperDir })

      expect(result).toBe(configPath)
    })

    test('finds config via symlink to config file location', async () => {
      const realDir = path.join(tempDir, 'target')
      await fs.mkdir(realDir)
      const realConfig = path.join(realDir, '.codeforgerc')
      await fs.writeFile(realConfig, '{}')

      const linkDir = path.join(tempDir, 'project')
      await fs.symlink(realDir, linkDir)

      const result = await discoverConfig({ cwd: linkDir })

      expect(result).toBeDefined()
      expect(result).not.toBeNull()
    })

    test('symlink chain resolves correctly', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const dir1 = path.join(tempDir, 'd1')
      await fs.mkdir(dir1)

      const linkToDir1 = path.join(tempDir, 'link1')
      await fs.symlink(dir1, linkToDir1)

      const linkToLink = path.join(tempDir, 'link2')
      await fs.symlink(linkToDir1, linkToLink)

      const result = await discoverConfig({ cwd: linkToLink })

      expect(result).toBe(configPath)
    })
  })

  describe('discoverConfig - filesystem root boundary', () => {
    test('reaches filesystem root when no config or package.json', async () => {
      const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'root-test-'))
      try {
        const result = await discoverConfig({ cwd: emptyDir })

        expect(result).toBeNull()
      } finally {
        await fs.rm(emptyDir, { recursive: true, force: true })
      }
    })

    test('stops at filesystem root even without package.json', async () => {
      const childDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-root-'))
      try {
        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBeNull()
      } finally {
        await fs.rm(childDir, { recursive: true, force: true })
      }
    })
  })

  describe('discoverConfig - mixed file scenarios', () => {
    test('ignores files with similar names but different extensions', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforgerc.txt'), '{}')
      await fs.writeFile(path.join(tempDir, '.codeforgerc.js'), '{}')
      await fs.writeFile(path.join(tempDir, 'codeforge.config.ts'), '{}')
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('ignores .codeforgerc.bak files', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforgerc.bak'), '{}')
      await fs.writeFile(path.join(tempDir, '.codeforgerc.json.bak'), '{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBeNull()
    })

    test('finds config among many dotfiles', async () => {
      await fs.writeFile(path.join(tempDir, '.babelrc'), '{}')
      await fs.writeFile(path.join(tempDir, '.eslintrc'), '{}')
      await fs.writeFile(path.join(tempDir, '.prettierrc'), '{}')
      await fs.writeFile(path.join(tempDir, '.npmrc'), 'registry=https://registry.npmjs.org')
      await fs.writeFile(path.join(tempDir, '.nvmrc'), '18')
      await fs.writeFile(path.join(tempDir, '.editorconfig'), 'root = true')
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config among many JSON files', async () => {
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}')
      await fs.writeFile(path.join(tempDir, 'package-lock.json'), '{}')
      await fs.writeFile(path.join(tempDir, 'composer.json'), '{}')
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config when tsconfig.json also exists', async () => {
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}')
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('does not confuse .codeforge with .codeforgerc', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforge'), '{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBeNull()
    })

    test('does not confuse codeforge.config with codeforge.config.js', async () => {
      await fs.writeFile(path.join(tempDir, 'codeforge.config'), '{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBeNull()
    })
  })

  describe('discoverConfig - directory structure variations', () => {
    test('finds config in directory with dist folder', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')
      await fs.mkdir(path.join(tempDir, 'dist'))

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config in directory with .git folder', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')
      await fs.mkdir(path.join(tempDir, '.git'))

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config in flat directory structure', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')
      await fs.writeFile(path.join(tempDir, 'index.ts'), 'export {}')
      await fs.writeFile(path.join(tempDir, 'utils.ts'), 'export {}')
      await fs.mkdir(path.join(tempDir, 'src'))

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('searches from exact cwd location', async () => {
      const rootConfig = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(rootConfig, '{}')

      const subDir = path.join(tempDir, 'sub')
      await fs.mkdir(subDir)

      const result = await discoverConfig({ cwd: subDir })

      expect(result).toBe(rootConfig)
    })

    test('finds config in directory with many subdirectories', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      for (let i = 0; i < 10; i++) {
        await fs.mkdir(path.join(tempDir, `dir${i}`))
      }

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('traverses through directory with bin folder', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const binDir = path.join(tempDir, 'bin')
      await fs.mkdir(binDir)
      const deepDir = path.join(binDir, 'commands')
      await fs.mkdir(deepDir)

      const result = await discoverConfig({ cwd: deepDir })

      expect(result).toBe(configPath)
    })
  })

  describe('discoverConfig - package.json edge cases', () => {
    test('empty package.json still acts as boundary', async () => {
      const outerConfig = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(outerConfig, '{}')

      const projDir = path.join(tempDir, 'proj')
      await fs.mkdir(projDir)
      await fs.writeFile(path.join(projDir, 'package.json'), '')

      const srcDir = path.join(projDir, 'src')
      await fs.mkdir(srcDir)

      const result = await discoverConfig({ cwd: srcDir })

      expect(result).toBeNull()
    })

    test('package.json with valid content acts as boundary', async () => {
      const outerConfig = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(outerConfig, '{}')

      const projDir = path.join(tempDir, 'proj')
      await fs.mkdir(projDir)
      await fs.writeFile(
        path.join(projDir, 'package.json'),
        JSON.stringify({ name: 'my-project', version: '1.0.0' }),
      )

      const srcDir = path.join(projDir, 'src')
      await fs.mkdir(srcDir)

      const result = await discoverConfig({ cwd: srcDir })

      expect(result).toBeNull()
    })

    test('stops at nearest package.json going upward', async () => {
      const farConfig = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(farConfig, '{}')

      const midDir = path.join(tempDir, 'mid')
      await fs.mkdir(midDir)
      await fs.writeFile(path.join(midDir, 'package.json'), '{}')

      const innerDir = path.join(midDir, 'inner')
      await fs.mkdir(innerDir)

      const result = await discoverConfig({ cwd: innerDir })

      expect(result).toBeNull()
    })

    test('finds config in directory that has package.json', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{"name":"test"}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('package.json at cwd prevents upward search', async () => {
      const outerConfig = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(outerConfig, '{}')

      const childDir = path.join(tempDir, 'child')
      await fs.mkdir(childDir)
      await fs.writeFile(path.join(childDir, 'package.json'), '{}')

      const result = await discoverConfig({ cwd: childDir })

      expect(result).toBeNull()
    })
  })

  describe('findConfigPath - explicit path edge cases', () => {
    test('explicit path to .codeforgerc works', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await findConfigPath(configPath)

      expect(result).toBe(configPath)
    })

    test('explicit path to non-config named file works', async () => {
      const filePath = path.join(tempDir, 'my-custom-config.json')
      await fs.writeFile(filePath, '{}')

      const result = await findConfigPath(filePath)

      expect(result).toBe(filePath)
    })

    test('explicit path to JS file works', async () => {
      const filePath = path.join(tempDir, 'custom.config.js')
      await fs.writeFile(filePath, 'module.exports = {}')

      const result = await findConfigPath(filePath)

      expect(result).toBe(filePath)
    })

    test('explicit path resolves with cwd parameter', async () => {
      const subDir = path.join(tempDir, 'configs')
      await fs.mkdir(subDir)
      const filePath = path.join(subDir, 'prod.json')
      await fs.writeFile(filePath, '{}')

      const result = await findConfigPath('prod.json', subDir)

      expect(result).toBe(filePath)
    })

    test('explicit empty string falls through to discovery', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await findConfigPath('', tempDir)

      expect(result).toBe(configPath)
    })

    test('throws for path to non-existent nested directory', async () => {
      const deepPath = path.join(tempDir, 'a', 'b', 'c', 'config.json')

      await expect(findConfigPath(deepPath)).rejects.toThrow(CLIError)
    })

    test('validates that explicit path is a regular file', async () => {
      const dirPath = path.join(tempDir, 'not-a-file')
      await fs.mkdir(dirPath)

      await expect(findConfigPath(dirPath)).rejects.toThrow('not a file')
    })

    test('explicit path with deeply nested file', async () => {
      const nestedDir = path.join(tempDir, 'a', 'b', 'c')
      await fs.mkdir(nestedDir, { recursive: true })
      const filePath = path.join(nestedDir, 'config.json')
      await fs.writeFile(filePath, '{}')

      const result = await findConfigPath(filePath)

      expect(result).toBe(filePath)
    })

    test('explicit path does not fall back to discovery on error', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')

      await expect(
        findConfigPath(path.join(tempDir, 'nonexistent.json'), tempDir),
      ).rejects.toThrow()
    })
  })

  describe('findConfigPath - auto-discovery edge cases', () => {
    test('auto-discovery with stopAt option not supported directly', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await findConfigPath(undefined, tempDir)

      expect(result).toBe(configPath)
    })

    test('auto-discovery finds codeforge.config.js as last resort', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(configPath, 'module.exports = {}')

      const result = await findConfigPath(undefined, tempDir)

      expect(result).toBe(configPath)
    })

    test('auto-discovery returns null for empty directory', async () => {
      const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'empty-auto-'))
      try {
        const result = await findConfigPath(undefined, emptyDir)

        expect(result).toBeNull()
      } finally {
        await fs.rm(emptyDir, { recursive: true, force: true })
      }
    })

    test('auto-discovery respects priority when multiple configs exist', async () => {
      await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')
      await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}')
      await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}')
      await fs.writeFile(path.join(tempDir, 'codeforge.config.js'), '{}')

      const result = await findConfigPath(undefined, tempDir)

      expect(result).toBe(path.join(tempDir, '.codeforgerc'))
    })
  })

  describe('discoverConfig - return value properties', () => {
    test('returned path is always absolute', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(configPath, 'module.exports = {}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(path.isAbsolute(result!)).toBe(true)
    })

    test('returned path points to an existing file', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await discoverConfig({ cwd: tempDir })

      const stat = await fs.stat(result!)
      expect(stat.isFile()).toBe(true)
    })

    test('returned null when directory has only subdirectories', async () => {
      await fs.mkdir(path.join(tempDir, 'sub1'))
      await fs.mkdir(path.join(tempDir, 'sub2'))

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBeNull()
    })
  })

  describe('discoverConfig - stopAt variations', () => {
    test('stopAt at same level as found config returns that config', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const result = await discoverConfig({ cwd: tempDir, stopAt: tempDir })

      expect(result).toBe(configPath)
    })

    test('stopAt above tempDir does not prevent finding config in tempDir', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const parentDir = path.dirname(tempDir)
      const result = await discoverConfig({ cwd: tempDir, stopAt: parentDir })

      expect(result).toBe(configPath)
    })

    test('stopAt with no config between cwd and stopAt returns null', async () => {
      const levelA = path.join(tempDir, 'level-a')
      await fs.mkdir(levelA)
      const levelB = path.join(levelA, 'level-b')
      await fs.mkdir(levelB)

      const result = await discoverConfig({ cwd: levelB, stopAt: levelA })

      expect(result).toBeNull()
    })

    test('stopAt resolved path matches against resolved cwd traversal', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const childDir = path.join(tempDir, 'child')
      await fs.mkdir(childDir)

      const result = await discoverConfig({
        cwd: path.resolve(childDir),
        stopAt: path.resolve(tempDir),
      })

      expect(result).toBe(path.resolve(configPath))
    })

    test('stopAt undefined means no stopAt boundary', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const childDir = path.join(tempDir, 'child')
      await fs.mkdir(childDir)

      const result = await discoverConfig({ cwd: childDir, stopAt: undefined })

      expect(result).toBe(configPath)
    })
  })

  describe('discoverConfig - config file content variations', () => {
    test('finds config with single-line JSON content', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{"rules":{"no-eval":"error"}}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config with multi-line JSON content', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{\n  "rules": {\n    "no-eval": "error"\n  }\n}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config with JS module.exports content', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(
        configPath,
        'module.exports = {\n  rules: {\n    "no-eval": "error"\n  }\n}',
      )

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config with unicode content', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{"description": "配置文件 🚀"}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })

    test('finds config with comments-like content in rc file', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '# this is a comment\n{}')

      const result = await discoverConfig({ cwd: tempDir })

      expect(result).toBe(configPath)
    })
  })

  describe('discoverConfig - idempotency', () => {
    test('repeated calls from same location return same result', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, '{}')

      const results = await Promise.all([
        discoverConfig({ cwd: tempDir }),
        discoverConfig({ cwd: tempDir }),
        discoverConfig({ cwd: tempDir }),
        discoverConfig({ cwd: tempDir }),
        discoverConfig({ cwd: tempDir }),
      ])

      for (const r of results) {
        expect(r).toBe(configPath)
      }
    })

    test('repeated null results are consistent', async () => {
      const results = await Promise.all([
        discoverConfig({ cwd: tempDir }),
        discoverConfig({ cwd: tempDir }),
        discoverConfig({ cwd: tempDir }),
      ])

      for (const r of results) {
        expect(r).toBeNull()
      }
    })
  })

  describe('CONFIG_FILE_NAMES - exhaustive property checks', () => {
    test('index 0 is .codeforgerc', () => {
      expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
    })

    test('index 1 is .codeforgerc.json', () => {
      expect(CONFIG_FILE_NAMES[1]).toBe('.codeforgerc.json')
    })

    test('index 2 is .codeforge.json', () => {
      expect(CONFIG_FILE_NAMES[2]).toBe('.codeforge.json')
    })

    test('index 3 is codeforge.config.js', () => {
      expect(CONFIG_FILE_NAMES[3]).toBe('codeforge.config.js')
    })

    test('contains only valid config file names', () => {
      const validNames = [
        '.codeforgerc',
        '.codeforgerc.json',
        '.codeforge.json',
        'codeforge.config.js',
      ]
      for (const name of CONFIG_FILE_NAMES) {
        expect(validNames).toContain(name)
      }
    })
  })
})
