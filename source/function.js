import { execSync, spawnSync } from 'child_process'

import { PATH_ACTION_TYPE } from 'dr-server/module/feature/Explorer/task/pathAction'
import { getAuthFetch, pathAction, fileUpload, fileDownload } from 'dr-server/module/featureNode/explorer'

const getGitBranch = () => String(execSync('git symbolic-ref --short HEAD')).replace(/\s/g, '')
const getGitCommitHash = () => String(execSync('git log -1 --format="%H"')).replace(/\s/g, '')

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
  tarCompress, tarExtract
}
