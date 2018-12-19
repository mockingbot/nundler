import { resolve } from 'path'

import { setTimeoutAsync } from 'dr-js/module/common/time'
import { stringIndentLine } from 'dr-js/module/common/format'
import { strictEqual, stringifyEqual, notStrictEqual } from 'dr-js/module/common/verify'
import { visibleAsync, statAsync } from 'dr-js/module/node/file/function'
import { run, runQuiet } from 'dr-js/module/node/system/Run'
import { getProcessList, getProcessPidMap, getProcessTree, findProcessTreeNode, checkProcessExist, tryKillProcessTreeNode } from 'dr-js/module/node/system/ProcessStatus'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const getExampleFileStat = async (examplePath) => statAsync(fromRoot('example', examplePath))
const verifyExampleFileExist = async (title, examplePath) => strictEqual(
  await visibleAsync(fromRoot('example', examplePath)),
  true,
  `[${title}] should file exist: ${examplePath}`
)
const runWithOutputString = async (command) => {
  const { promise, stdoutBufferPromise } = runQuiet({ command, option: { ...execOptionRoot, stdio: [ 'ignore', 'pipe', 'pipe' ] } })
  await promise
  const outputString = String(await stdoutBufferPromise)
  console.log(stringIndentLine(outputString, '  > '))
  return outputString
}

runMain(async ({ padLog, stepLog }) => {
  padLog('reset example')
  await runWithOutputString('npm run example-reset')

  padLog('start example-server')
  const { subProcess, promise } = run({ command: 'npm run start-example-server', option: { ...execOptionRoot, stdio: 'ignore' } })
  const exitPromise = promise.catch((error) => __DEV__ && console.log(`example-server exit: ${error}`))
  await setTimeoutAsync(1000) // wait for npm
  if (!await checkProcessExist({ pid: subProcess.pid })) throw new Error('failed to start example server')
  const processList = await getProcessList()
  const subProcessInfo = (await getProcessPidMap(processList))[ subProcess.pid ]
  const { pid, command, subTree } = await findProcessTreeNode(subProcessInfo, await getProcessTree(processList)) // drops ppid since sub tree may get chopped
  __DEV__ && console.log({ pid, command, subTree })
  stepLog('start example-server done')

  padLog('[test] list')
  const listOutputString = await runWithOutputString('npm run test-list')
  stringifyEqual([
    listOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
    listOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
    listOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
  ], [ true, true, true ], '[list] should list expected file')

  padLog('[test] upload')
  await runWithOutputString('npm run test-upload')
  await verifyExampleFileExist('upload', 'server-root/test-upload-gitignore/test-file')

  padLog('[test] upload (should rewrite)')
  const statUpload = await getExampleFileStat('server-root/test-upload-gitignore/test-file')
  await runWithOutputString('npm run test-upload')
  const statUploadAgain = await getExampleFileStat('server-root/test-upload-gitignore/test-file')
  notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[upload] should upload file mtimeMs')

  padLog('[test] download')
  await runWithOutputString('npm run test-download')
  await verifyExampleFileExist('download', 'server-root/test-download-gitignore/test-file')

  padLog('[test] download (should rewrite)')
  const statDownload = await getExampleFileStat('server-root/test-download-gitignore/test-file')
  await runWithOutputString('npm run test-download')
  const statDownloadAgain = await getExampleFileStat('server-root/test-download-gitignore/test-file')
  notStrictEqual(statDownload.mtimeMs, statDownloadAgain.mtimeMs, '[download] should update file mtimeMs')

  padLog('[test] package-download')
  await runWithOutputString('npm run test-package-download')
  await verifyExampleFileExist('package-download', 'sample-package/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
  await verifyExampleFileExist('package-download', 'sample-package/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')
  await verifyExampleFileExist('package-download', 'sample-package/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')

  padLog('[test] package-download (should skip)')
  const statPackageDownloadList = [
    await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
    await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
    await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
  ]
  await runWithOutputString('npm run test-package-download')
  const statPackageDownloadAgainList = [
    await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
    await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
    await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
  ]
  stringifyEqual(
    statPackageDownloadList.map(({ mtimeMs }) => mtimeMs),
    statPackageDownloadAgainList.map(({ mtimeMs }) => mtimeMs),
    '[package-download] should keep file mtimeMs'
  )

  padLog('[test] list (should update)')
  const listUpdateOutputString = await runWithOutputString('npm run test-list')
  stringifyEqual([
    listUpdateOutputString.includes('test-download-gitignore/test-file'),
    listUpdateOutputString.includes('test-upload-gitignore/test-file'),
    listUpdateOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
    listUpdateOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
    listUpdateOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
  ], [ true, true, true, true, true ], '[list] should list expected file')

  padLog('[test] list (should prefix filter)')
  const listPrefixOutputString = await runWithOutputString('npm run test-list -- --list-key-prefix .nundler-gitignore')
  stringifyEqual([
    listPrefixOutputString.includes('test-download-gitignore/test-file'),
    listPrefixOutputString.includes('test-upload-gitignore/test-file'),
    listPrefixOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
    listPrefixOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
    listPrefixOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
  ], [ false, false, true, true, true ], '[list] should list expected file')

  padLog('stop example-server')
  await tryKillProcessTreeNode({ pid, command, subTree })
  await exitPromise
  stepLog('stop example-server done')
}, getLogger([ 'test-example', ...process.argv.slice(2) ].join('+'), argvFlag('quiet')))
