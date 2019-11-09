import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary as formatBinary } from '@dr-js/core/module/common/format'

import { getScriptFileListFromPathList } from '@dr-js/dev/module/node/file'
import { runMain, argvFlag } from '@dr-js/dev/module/main'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from '@dr-js/dev/module/output'
import { processFileList, fileProcessorBabel, fileProcessorWebpack } from '@dr-js/dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

runMain(async (logger) => {
  const { padLog } = logger

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  if (!argvFlag('pack')) return
  if (argvFlag('test', 'publish', 'publish-dev')) {
    padLog('lint source')
    execShell('npm run lint')
  }

  padLog('generate spec')
  execShell('npm run script-generate-spec')

  padLog('build library')
  execShell('npm run build-library')

  padLog('build bin')
  execShell('npm run build-bin')

  padLog('delete temp build file')
  execShell('npm run script-delete-temp-build-file')

  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)

  padLog('process output')
  let sizeReduce = 0
  sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorWebpack, rootPath: PATH_OUTPUT, logger })
  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  // again
  sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorWebpack, rootPath: PATH_OUTPUT, logger })
  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  padLog(`library-babel size reduce: ${formatBinary(sizeReduce)}B`)

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  if (argvFlag('test', 'publish', 'publish-dev')) {
    padLog('test example')
    execShell('npm run test-example')
  }

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
})
