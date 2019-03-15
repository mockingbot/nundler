import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary as formatBinary } from 'dr-js/module/common/format'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/fileList'
import { runMain, argvFlag } from 'dr-dev/module/main'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from 'dr-dev/module/output'
import { processFileList, fileProcessorBabel, fileProcessorWebpack } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog } = logger

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  if (!argvFlag('pack')) return

  padLog('generate spec')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  padLog(`build bin`)
  execSync('npm run build-bin', execOptionRoot)

  padLog(`delete temp build file`)
  execSync('npm run script-delete-temp-build-file', execOptionRoot)

  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)

  padLog(`process output`)
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
    execSync('npm run test-example', execOptionRoot)
  }

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
})
