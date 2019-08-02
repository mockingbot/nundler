import { resolve } from 'path'

import { indentLine } from 'dr-js/module/common/string'
import { strictEqual, stringifyEqual, notStrictEqual } from 'dr-js/module/common/verify'
import { visibleAsync, statAsync } from 'dr-js/module/node/file/function'
import { modifyDelete } from 'dr-js/module/node/file/Modify'
import { runQuiet } from 'dr-js/module/node/system/Run'

import { withRunBackground } from 'dr-dev/module/node/run'
import { runMain, argvFlag } from 'dr-dev/module/main'

import { getGitBranch, getGitCommitHash } from '../output-gitignore/library'

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

    const runTest = async (title, task) => {
      padLog(`[test] ${title}`)
      await task(title)
    }

    await runTest('file-list', async () => {
      const listOutputString = await runWithOutputString('npm run example-file-list')
      stringifyEqual([
        listOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ], [ true, true, true ], '[file-list] should list expected file')
    })
    await runTest('file-upload', async () => {
      await runWithOutputString('npm run example-file-upload')
      await verifyExampleFileExist('upload', 'server-root-gitignore/test-upload/test-file')
    })
    await runTest('file-upload (should rewrite)', async () => {
      const statUpload = await getExampleFileStat('server-root-gitignore/test-upload/test-file')
      await runWithOutputString('npm run example-file-upload')
      const statUploadAgain = await getExampleFileStat('server-root-gitignore/test-upload/test-file')
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[file-upload] should upload file mtimeMs')
    })
    await runTest('file-download', async () => {
      await runWithOutputString('npm run example-file-download')
      await verifyExampleFileExist('download', 'server-root-gitignore/test-download/test-file')
    })
    await runTest('file-download (should rewrite)', async () => {
      const statDownload = await getExampleFileStat('server-root-gitignore/test-download/test-file')
      await runWithOutputString('npm run example-file-download')
      const statDownloadAgain = await getExampleFileStat('server-root-gitignore/test-download/test-file')
      notStrictEqual(statDownload.mtimeMs, statDownloadAgain.mtimeMs, '[file-download] should update file mtimeMs')
    })

    await runTest('package-download', async () => {
      await runWithOutputString('npm run example-package-download')
      await verifyExampleFileExist('package-download', 'sample-package-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      await verifyExampleFileExist('package-download', 'sample-package-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')
      await verifyExampleFileExist('package-download', 'sample-package-gitignore/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
    })
    await runTest('package-download (should skip)', async () => {
      const statPackageDownloadList = [
        await getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        await getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        await getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ]
      await runWithOutputString('npm run example-package-download')
      const statPackageDownloadAgainList = [
        await getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        await getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        await getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ]
      stringifyEqual(
        statPackageDownloadList.map(({ mtimeMs }) => mtimeMs),
        statPackageDownloadAgainList.map(({ mtimeMs }) => mtimeMs),
        '[package-download] should keep file mtimeMs'
      )
    })
    await runTest('package-upload', async () => {
      await modifyDelete(fromRoot('example/server-root-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'))
      await modifyDelete(fromRoot('example/server-root-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'))
      await runWithOutputString('npm run example-package-upload')
      await verifyExampleFileExist('package-download', 'server-root-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      await verifyExampleFileExist('package-download', 'server-root-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')
    })
    await runTest('package-upload (should skip)', async () => {
      const statUpload = await getExampleFileStat('server-root-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      await runWithOutputString('npm run example-package-upload')
      const statUploadAgain = await getExampleFileStat('server-root-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      strictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[file-upload] should upload file mtimeMs')
    })
    await runTest('package-list', async () => {
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
    })

    await runTest('file-list (should update)', async () => {
      const listUpdateOutputString = await runWithOutputString('npm run example-file-list')
      stringifyEqual([
        listUpdateOutputString.includes('test-download/test-file'),
        listUpdateOutputString.includes('test-upload/test-file'),
        listUpdateOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        listUpdateOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        listUpdateOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ], [ true, true, true, true, true ], '[file-list] should list expected file')
    })
    await runTest('file-list (should prefix filter)', async () => {
      const listPrefixOutputString = await runWithOutputString('npm run example-file-list -- --list-key-prefix .nundler-gitignore')
      stringifyEqual([
        listPrefixOutputString.includes('test-download/test-file'),
        listPrefixOutputString.includes('test-upload/test-file'),
        listPrefixOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        listPrefixOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        listPrefixOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ], [ false, false, true, true, true ], '[file-list] should list expected file')
    })

    const directoryPackFile = `test-directory-${getGitBranch()}-${getGitCommitHash()}.tgz`
    await runTest('directory-list', async () => {
      const listOutputString = await runWithOutputString('npm run example-directory-list')
      stringifyEqual([
        listOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ], [ true, true, true ], '[directory-list] should list expected path')
    })
    await runTest('directory-upload', async () => {
      await runWithOutputString('npm run example-directory-upload')
      await verifyExampleFileExist('upload', `server-root-gitignore/test-upload/${directoryPackFile}`)
    })
    await runTest('directory-upload (should rewrite)', async () => {
      const statUpload = await getExampleFileStat(`server-root-gitignore/test-upload/${directoryPackFile}`)
      await runWithOutputString('npm run example-directory-upload')
      const statUploadAgain = await getExampleFileStat(`server-root-gitignore/test-upload/${directoryPackFile}`)
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[directory-upload] should upload directory mtimeMs')
    })
    await runTest('directory-download', async () => {
      await runWithOutputString('npm run example-directory-download')
      await verifyExampleFileExist('download', `server-root-gitignore/test-download/test-directory`)
    })
    await runTest('directory-download (should rewrite)', async () => {
      const statDownload = await getExampleFileStat(`server-root-gitignore/test-download/test-directory`)
      await runWithOutputString('npm run example-directory-download')
      const statDownloadAgain = await getExampleFileStat(`server-root-gitignore/test-download/test-directory`)
      notStrictEqual(statDownload.mtimeMs, statDownloadAgain.mtimeMs, '[directory-download] should update directory mtimeMs')
    })

    const gzDirectoryPackFile = `test-gz-directory-${getGitBranch()}-${getGitCommitHash()}.tgz`
    await runTest('gz-directory-list', async () => {
      const listOutputString = await runWithOutputString('npm run example-gz-directory-list')
      stringifyEqual([
        listOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ], [ true, true, true ], '[gz-directory-list] should list expected path')
    })
    await runTest('gz-directory-upload', async () => {
      await runWithOutputString('npm run example-gz-directory-upload')
      await verifyExampleFileExist('upload', `server-root-gitignore/test-upload/${gzDirectoryPackFile}`)
    })
    await runTest('gz-directory-upload (should rewrite)', async () => {
      const statUpload = await getExampleFileStat(`server-root-gitignore/test-upload/${gzDirectoryPackFile}`)
      await runWithOutputString('npm run example-gz-directory-upload')
      const statUploadAgain = await getExampleFileStat(`server-root-gitignore/test-upload/${gzDirectoryPackFile}`)
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[gz-directory-upload] should upload directory mtimeMs')
    })
    await runTest('gz-directory-download', async () => {
      await runWithOutputString('npm run example-gz-directory-download')
      await verifyExampleFileExist('download', `server-root-gitignore/test-gz-download/test-directory`)
      await verifyExampleFileExist('download', `server-root-gitignore/test-gz-download/test-directory/PACK_TRIM_GZ`)
      await verifyExampleFileExist('download', `server-root-gitignore/test-gz-download/test-directory/package.json.gz`)
    })
    await runTest('gz-directory-download (should rewrite)', async () => {
      const statDownload = await getExampleFileStat(`server-root-gitignore/test-gz-download/test-directory`)
      await runWithOutputString('npm run example-gz-directory-download')
      const statDownloadAgain = await getExampleFileStat(`server-root-gitignore/test-gz-download/test-directory`)
      notStrictEqual(statDownload.mtimeMs, statDownloadAgain.mtimeMs, '[gz-directory-download] should update directory mtimeMs')
    })

    const p7zDirectoryPackFile = `test-7z-directory-${getGitBranch()}-${getGitCommitHash()}.7z`
    await runTest('7z-directory-list', async () => {
      const listOutputString = await runWithOutputString('npm run example-7z-directory-list')
      stringifyEqual([
        listOutputString.includes('.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        listOutputString.includes('.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ], [ true, true, true ], '[7z-directory-list] should list expected path')
    })
    await runTest('7z-directory-upload', async () => {
      await runWithOutputString('npm run example-7z-directory-upload')
      await verifyExampleFileExist('upload', `server-root-gitignore/test-upload/${p7zDirectoryPackFile}`)
    })
    await runTest('7z-directory-upload (should rewrite)', async () => {
      const statUpload = await getExampleFileStat(`server-root-gitignore/test-upload/${p7zDirectoryPackFile}`)
      await runWithOutputString('npm run example-7z-directory-upload')
      const statUploadAgain = await getExampleFileStat(`server-root-gitignore/test-upload/${p7zDirectoryPackFile}`)
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[7z-directory-upload] should upload directory mtimeMs')
    })
    await runTest('7z-directory-download', async () => {
      await runWithOutputString('npm run example-7z-directory-download')
      await verifyExampleFileExist('download', `server-root-gitignore/test-7z-download/test-directory`)
    })
    await runTest('7z-directory-download (should rewrite)', async () => {
      const statDownload = await getExampleFileStat(`server-root-gitignore/test-7z-download/test-directory`)
      await runWithOutputString('npm run example-7z-directory-download')
      const statDownloadAgain = await getExampleFileStat(`server-root-gitignore/test-7z-download/test-directory`)
      notStrictEqual(statDownload.mtimeMs, statDownloadAgain.mtimeMs, '[7z-directory-download] should update directory mtimeMs')
    })

    padLog('stop example server')
  })
  stepLog('stop example server done')
}, 'test-example')
