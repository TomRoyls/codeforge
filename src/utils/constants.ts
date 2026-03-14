/**
 * Configuration constants for CodeForge CLI
 *
 * This module contains all magic numbers and default values used throughout the application.
 * Using named constants improves code maintainability and makes it easier to understand
 * the purpose of each value.
 */

/**
 * Default debounce time in milliseconds for file watching
 *
 * This prevents rapid successive file change events from triggering excessive
 * analysis runs when a file is being edited.
 */
export const DEFAULT_DEBOUNCE_MS = 300

/**
 * Default maximum number of lines per file for the max-lines rule
 *
 * Files exceeding this limit will trigger a warning suggesting they be
 * split into smaller, focused modules for better maintainability.
 */
export const DEFAULT_MAX_LINES = 300

/**
 * Default maximum number of lines per file for the max-file-size rule
 *
 * This is a more lenient limit than DEFAULT_MAX_LINES, used specifically
 * for the file size pattern rule to identify very large files.
 */
export const DEFAULT_MAX_FILE_SIZE_LINES = 500

/**
 * File count threshold for the doctor command
 *
 * When a project has more than this many files, the doctor command will
 * issue a warning about potentially needing to use .codeforgeignore to
 * exclude unnecessary files from analysis.
 */
export const FILE_COUNT_THRESHOLD = 1000
