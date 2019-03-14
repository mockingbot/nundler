import { execSync, spawnSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { gzipSync } from 'zlib'

import { getTimestamp } from 'dr-js/module/common/time'

import { PATH_ACTION_TYPE } from 'dr-server/module/feature/Explorer/task/pathAction'
import { getAuthFetch, pathAction, fileUpload, fileDownload } from 'dr-server/module/featureNode/explorer'

const getGitBranch = () => String(execSync('git symbolic-ref --short HEAD')).replace(/\s/g, '')
const getGitCommitHash = () => String(execSync('git log -1 --format="%H"')).replace(/\s/g, '')

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
  '-zcf', outputFileName, // TODO: use '-Jcf' for xz
  '-C', sourcePath,
  '.'
], SPAWN_CONFIG)

const tarExtract = (sourceFileName, outputPath) => spawnSync('tar', [
  '--strip-components', '1',
  '-xf', sourceFileName, // use '-xf' for both gzip/xz
  '-C', outputPath
], SPAWN_CONFIG)

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
  tarCompress, tarExtract, gzipFile
}
