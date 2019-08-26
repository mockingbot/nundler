import { getTimestamp } from '@dr-js/core/module/common/time'
import { configureAuthFile } from '@dr-js/node/module/module/Auth'
import { getGitBranch, getGitCommitHash } from '@dr-js/node/module/module/Software/git'

const cacheValue = (func, value) => () => {
  if (value === undefined) value = func() // TODO: NOTE: func should not return undefined
  return value
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

export {
  configureAuthFile,
  dispelMagicString
}
