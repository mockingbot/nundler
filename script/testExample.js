import { resolve } from 'path'
import { execSync } from 'child_process'

import { setTimeoutAsync } from 'dr-js/module/common/time'
import { strictEqual } from 'dr-js/module/common/verify'
import { visibleAsync } from 'dr-js/module/node/file/function'
import { run } from 'dr-js/module/node/system/Run'
import { getProcessList, getProcessPidMap, getProcessTree, findProcessTreeNode, checkProcessExist, tryKillProcessTreeNode } from 'dr-js/module/node/system/ProcessStatus'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const verifyExampleFileExist = async (examplePath) => strictEqual(
  await visibleAsync(fromRoot('example', examplePath)),
  true,
  `should file exist: ${examplePath}`
)

runMain(async (logger) => {
  const { padLog } = logger

  padLog('reset example')
  execSync('npm run example-reset', execOptionRoot)

  padLog('start example-server')
  const { subProcess, promise } = run({ command: 'npm run start-example-server', option: { ...execOptionRoot, stdio: 'ignore' } })
  const exitPromise = promise.catch((error) => __DEV__ && console.log(`example-server exit: ${error}`))
  await setTimeoutAsync(1000) // wait for npm
  if (!await checkProcessExist({ pid: subProcess.pid })) throw new Error('failed to start example server')
  const processList = await getProcessList()
  const subProcessInfo = (await getProcessPidMap(processList))[ subProcess.pid ]
  const { pid, command, subTree } = await findProcessTreeNode(subProcessInfo, await getProcessTree(processList)) // drops ppid since sub tree may get chopped
  __DEV__ && console.log({ pid, command, subTree })

  padLog('start test')
  execSync('npm run test-list', execOptionRoot)

  execSync('npm run test-upload', execOptionRoot)
  await verifyExampleFileExist('server-root/test-upload-gitignore/test-file')

  execSync('npm run test-download', execOptionRoot)
  await verifyExampleFileExist('server-root/test-download-gitignore/test-file')

  execSync('npm run test-package-download', execOptionRoot)
  await verifyExampleFileExist('sample-package/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
  await verifyExampleFileExist('sample-package/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')
  await verifyExampleFileExist('sample-package/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')

  padLog('stop example-server')
  await tryKillProcessTreeNode({ pid, command, subTree })
  await exitPromise
}, getLogger([ 'test-example', ...process.argv.slice(2) ].join('+'), argvFlag('quiet')))
