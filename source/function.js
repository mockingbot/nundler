import { execSync, spawnSync } from 'child_process'
import { sep } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { gzipSync } from 'zlib'

import { getTimestamp } from 'dr-js/module/common/time'

import { PATH_ACTION_TYPE } from 'dr-server/module/feature/Explorer/task/pathAction'
import { getAuthFetch, pathAction, fileUpload, fileDownload } from 'dr-server/module/featureNode/explorer'

const trimExec = (output) => String(output).replace(/\s/g, '')

const getGitBranch = () => {
  try {
    return trimExec(execSync('git symbolic-ref --short HEAD', { stdio: 'pipe' }))
  } catch (error) { return `detached-HEAD/${trimExec(execSync('git rev-parse --short HEAD'))}` }
}
const getGitCommitHash = () => trimExec(execSync('git log -1 --format="%H"'))

const cacheValue = (func) => {
  let value
  return () => {
    if (value === undefined) value = func()
    return value
  }
}
const getGitBranchCached = cacheValue(() => getGitBranch() || 'unknown-branch')
const getGitCommitHashCached = cacheValue(() => getGitCommitHash() || 'unknown-commit-hash')
const getTimestampCached = cacheValue(getTimestamp)
const getDateISOCached = cacheValue(() => new Date().toISOString())

const dispelMagicString = (string = '') => string
  .replace(/{git-branch}/g, getGitBranchCached)
  .replace(/{git-commit-hash}/g, getGitCommitHashCached)
  .replace(/{timestamp}/g, getTimestampCached)
  .replace(/{date-iso}/g, getDateISOCached)

const SPAWN_CONFIG = { stdio: 'inherit', env: { ...process.env, GZIP: '-9' } }

const tarCompress = (sourcePath, outputFileName) => spawnSync('tar', [
  '-zcf', outputFileName,
  '-C', sourcePath,
  '.'
], SPAWN_CONFIG)

const tarExtract = (sourceFileName, outputPath) => spawnSync('tar', [
  '--strip-components', '1',
  '-xf', sourceFileName, // use '-xf' for both gzip/xz
  '-C', outputPath
], SPAWN_CONFIG)

// require 7z@>=16.00 for `-bs` switch
const p7zCompress = (sourcePath, outputFileName) => spawnSync('7z', [
  'a', outputFileName,
  `${sourcePath}${sep}*`,
  '-bso0', '-bsp0'
], SPAWN_CONFIG)

const p7zExtract = (sourceFileName, outputPath) => spawnSync('7z', [
  'x', sourceFileName,
  `-o${outputPath}`,
  '-y', '-bso0', '-bsp0'
], SPAWN_CONFIG)

const p7zDetect = () => {
  try { // test for: `-bs{o|e|p}{0|1|2} : set output stream for output/error/progress line`
    if (String(execSync('7z')).includes(`-bs{o|e|p}{0|1|2}`)) return
  } catch (error) {}
  throw new Error(`[p7zDetect] expect "7z" with "-bs{o|e|p}{0|1|2}" support in PATH`)
}

const gzipFile = (sourceFile) => writeFileSync(
  `${sourceFile}.gz`,
  gzipSync(
    readFileSync(sourceFile),
    { level: 9 }
  )
)

export {
  PATH_ACTION_TYPE, getAuthFetch, pathAction, fileUpload, fileDownload,
  getGitBranch, getGitCommitHash,
  dispelMagicString,
  tarCompress, tarExtract,
  p7zCompress, p7zExtract, p7zDetect,
  gzipFile
}
