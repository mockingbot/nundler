import { resolve } from 'path'

import { indentLine } from 'dr-js/module/common/string'
import { strictEqual, stringifyEqual, notStrictEqual } from 'dr-js/module/common/verify'
import { visibleAsync, statAsync } from 'dr-js/module/node/file/function'
import { modify } from 'dr-js/module/node/file/Modify'
import { runQuiet } from 'dr-js/module/node/system/Run'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'
import { withRunBackground } from 'dr-dev/module/exec'

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
  console.log(indentLine(outputString, '  > '))
  return outputString
}

runMain(async ({ padLog, stepLog }) => {
  padLog('reset example')
  await runWithOutputString('npm run example-reset')

  padLog('start example server')
  await withRunBackground({
    command: 'npm run example-start-server',
    option: { ...execOptionRoot, stdio: 'ignore' }
  }, async () => {
    stepLog('start example server done')

    padLog('[test] file-list')
    const listOutputString = await runWithOutputString('npm run example-file-list')
    stringifyEqual([
      listOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
      listOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
      listOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
    ], [ true, true, true ], '[file-list] should list expected file')

    padLog('[test] file-upload')
    await runWithOutputString('npm run example-file-upload')
    await verifyExampleFileExist('upload', 'server-root/test-upload-gitignore/test-file')

    padLog('[test] file-upload (should rewrite)')
    const statUpload = await getExampleFileStat('server-root/test-upload-gitignore/test-file')
    await runWithOutputString('npm run example-file-upload')
    const statUploadAgain = await getExampleFileStat('server-root/test-upload-gitignore/test-file')
    notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[file-upload] should upload file mtimeMs')

    padLog('[test] file-download')
    await runWithOutputString('npm run example-file-download')
    await verifyExampleFileExist('download', 'server-root/test-download-gitignore/test-file')

    padLog('[test] file-download (should rewrite)')
    const statDownload = await getExampleFileStat('server-root/test-download-gitignore/test-file')
    await runWithOutputString('npm run example-file-download')
    const statDownloadAgain = await getExampleFileStat('server-root/test-download-gitignore/test-file')
    notStrictEqual(statDownload.mtimeMs, statDownloadAgain.mtimeMs, '[file-download] should update file mtimeMs')

    {
      padLog('[test] package-download')
      await runWithOutputString('npm run example-package-download')
      await verifyExampleFileExist('package-download', 'sample-package/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      await verifyExampleFileExist('package-download', 'sample-package/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')
      await verifyExampleFileExist('package-download', 'sample-package/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')

      padLog('[test] package-download (should skip)')
      const statPackageDownloadList = [
        await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        await getExampleFileStat('sample-package/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ]
      await runWithOutputString('npm run example-package-download')
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
    }

    {
      padLog('[test] package-upload')
      await modify.delete(fromRoot('example/server-root/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'))
      await modify.delete(fromRoot('example/server-root/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'))
      await runWithOutputString('npm run example-package-upload')
      await verifyExampleFileExist('package-download', 'server-root/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      await verifyExampleFileExist('package-download', 'server-root/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')

      padLog('[test] package-upload (should skip)')
      const statUpload = await getExampleFileStat('server-root/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      await runWithOutputString('npm run example-package-upload')
      const statUploadAgain = await getExampleFileStat('server-root/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      strictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[file-upload] should upload file mtimeMs')
    }

    {
      padLog('[test] package-list')
      const listOutputString = await runWithOutputString('npm run example-package-list')
      stringifyEqual([
        listOutputString.includes('@nundler/local-aaa'),
        listOutputString.includes('0.0.0'),
        listOutputString.includes('0.0.2'),
        listOutputString.includes('@nundler/local-bbb'),
        listOutputString.includes('1.1.1'),
        listOutputString.includes('@nundler/local-ccc'),
        listOutputString.includes('2.2.2')
      ], [ true, true, true, true, true, true, true ], '[package-list] should list expected text')
    }

    padLog('[test] file-list (should update)')
    const listUpdateOutputString = await runWithOutputString('npm run example-file-list')
    stringifyEqual([
      listUpdateOutputString.includes('test-download-gitignore/test-file'),
      listUpdateOutputString.includes('test-upload-gitignore/test-file'),
      listUpdateOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
      listUpdateOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
      listUpdateOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
    ], [ true, true, true, true, true ], '[file-list] should list expected file')

    padLog('[test] file-list (should prefix filter)')
    const listPrefixOutputString = await runWithOutputString('npm run example-file-list -- --list-key-prefix .nundler-gitignore')
    stringifyEqual([
      listPrefixOutputString.includes('test-download-gitignore/test-file'),
      listPrefixOutputString.includes('test-upload-gitignore/test-file'),
      listPrefixOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
      listPrefixOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
      listPrefixOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
    ], [ false, false, true, true, true ], '[file-list] should list expected file')

    padLog('stop example server')
  })
  stepLog('stop example server done')
}, getLogger([ 'test-example', ...process.argv.slice(2) ].join('+'), argvFlag('quiet')))
