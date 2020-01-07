import { getTimestamp } from '@dr-js/core/module/common/time'
import { createMarkReplacer } from '@dr-js/core/module/common/string'
import { configureAuthFile } from '@dr-js/node/module/module/Auth'
import { pingRaceUrlList, pingStatUrlList } from '@dr-js/node/module/module/PingRace'
import { getGitBranch, getGitCommitHash } from '@dr-js/node/module/module/Software/git'

const generateMarkMap = ({
  dateObject = new Date(),
  timeISO = dateObject.toISOString(),
  timeBase36 = dateObject.getTime().toString(36),
  isEnableGit = true,
  ...extraMark
} = {}) => ({
  // time
  'timestamp': String(getTimestamp()),
  'time-iso': timeISO,
  'date-iso': timeISO,
  'time-b36': timeBase36,
  'time-base36': timeBase36,
  // random
  'random': Math.random().toString(36).slice(2, 10),
  // git
  'git-branch': (isEnableGit && getGitBranch()) || 'unknown-branch',
  'git-commit-hash': (isEnableGit && getGitCommitHash()) || 'unknown-commit-hash',
  ...extraMark
})

export {
  createMarkReplacer, generateMarkMap,
  configureAuthFile,
  pingRaceUrlList, pingStatUrlList
}
