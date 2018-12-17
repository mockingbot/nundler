import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary as formatBinary } from 'dr-js/module/common/format'
import { modify } from 'dr-js/module/node/file/Modify'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'
import { getScriptFileListFromPathList } from 'dr-dev/module/fileList'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from 'dr-dev/module/commonOutput'
import { processFileList, fileProcessorBabel } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog } = logger

  padLog('generate spec')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  padLog(`copy bin`)
  await modify.copy(fromRoot('source-bin/index.js'), fromOutput('bin/index.js'))

  if (!argvFlag('pack')) return

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)

  padLog(`process output`)
  let sizeReduce = 0
  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  padLog(`library-babel size reduce: ${formatBinary(sizeReduce)}B`)

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
