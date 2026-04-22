import type { Ora } from 'ora'

import { existsSync } from 'node:fs'
import path from 'node:path'

import { type DiscoveredFile, discoverFiles } from '../core/file-discovery.js'
import {
  getChangedFiles,
  getDefaultBranch,
  getGitRoot,
  getStagedFiles,
  isGitRepository,
} from '../utils/git-helpers.js'

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface DiscoverFilesOptions {
  changedMode: string | undefined
  cwd: string
  files: string[]
  ignore: string[]
  spinner: null | Ora
  stagedMode: boolean
}

// ============================================================================
// Git File Discovery Functions
// ============================================================================

export function getStagedFilesList(cwd: string): { error?: string; files: DiscoveredFile[] } {
  if (!isGitRepository(cwd)) {
    return { error: 'Not a git repository. --staged requires a git repository.', files: [] }
  }

  const gitRoot = getGitRoot(cwd)
  if (!gitRoot) {
    return { error: 'Could not determine git repository root.', files: [] }
  }

  const stagedFilePaths = getStagedFiles(gitRoot)
  if (stagedFilePaths.length === 0) {
    return { files: [] }
  }

  return { files: filterExistingGitFiles(gitRoot, stagedFilePaths) }
}

export function getGitChangedFiles(
  cwd: string,
  baseRef: string | undefined,
): { error?: string; files: DiscoveredFile[] } {
  if (!isGitRepository(cwd)) {
    return { error: 'Not a git repository. --changed requires a git repository.', files: [] }
  }

  const gitRoot = getGitRoot(cwd)
  if (!gitRoot) {
    return { error: 'Could not determine git repository root.', files: [] }
  }

  const ref = baseRef || getDefaultBranch(cwd)
  const changedFilePaths = getChangedFiles(ref, gitRoot)
  if (changedFilePaths.length === 0) {
    return { files: [] }
  }

  return { files: filterExistingGitFiles(gitRoot, changedFilePaths) }
}

function filterExistingGitFiles(gitRoot: string, filePaths: string[]): DiscoveredFile[] {
  return filePaths
    .filter((filePath) => existsSync(path.join(gitRoot, filePath)))
    .map((filePath) => ({
      absolutePath: path.join(gitRoot, filePath),
      path: filePath,
    }))
}

export async function resolveTargetFiles(
  options: DiscoverFilesOptions,
): Promise<{ error?: string; files: DiscoveredFile[] }> {
  const { changedMode, cwd, files, ignore, stagedMode } = options

  if (stagedMode) {
    return getStagedFilesList(cwd)
  }

  if (changedMode !== undefined) {
    return getGitChangedFiles(cwd, changedMode)
  }

  const discovered = await discoverFiles({ cwd, ignore, patterns: files })
  return { files: discovered }
}
