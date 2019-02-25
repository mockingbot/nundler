import { execSync, spawnSync } from 'child_process'

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

const tarCompress = (sourcePath, outputFileName, stdio = 'inherit') => spawnSync('tar', [
  '-czf', outputFileName,
  '-C', sourcePath,
  '.'
], { stdio, env: { ...process.env, GZIP: '-9' } })
const tarExtract = (sourceFileName, outputPath, stdio = 'inherit') => spawnSync('tar', [
  '--strip-components', '1',
  '-xzf', sourceFileName,
  '-C', outputPath
], { stdio })

export {
  PATH_ACTION_TYPE, getAuthFetch, pathAction, fileUpload, fileDownload,
  getGitBranch, getGitCommitHash,
  dispelMagicString,
  tarCompress, tarExtract
}
