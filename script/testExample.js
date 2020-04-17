import { resolve } from 'path'
import { existsSync, statSync, renameSync } from 'fs'

import { indentLine } from '@dr-js/core/module/common/string'
import { strictEqual, stringifyEqual, notStrictEqual } from '@dr-js/core/module/common/verify'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'
import { run } from '@dr-js/core/module/node/system/Run'

import { getGitBranch, getGitCommitHash } from '@dr-js/node/module/module/Software/git'

import { withRunBackground } from '@dr-js/dev/module/node/run'
import { runMain } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const getExampleFileStat = (examplePath) => statSync(fromRoot('example', examplePath))
const renameExampleFile = (examplePath, examplePathRename) => renameSync(fromRoot('example', examplePath), fromRoot('example', examplePathRename))
const verifyExampleFileExist = (title, examplePath) => strictEqual(
  existsSync(fromRoot('example', examplePath)),
  true,
  `[${title}] should file exist: ${examplePath}`
)
const runWithOutputString = async (command) => {
  const { promise, stdoutPromise } = run({ command, option: { cwd: fromRoot(), stdio: [ 'ignore', 'pipe', 'pipe' ], shell: true }, quiet: true })
  await promise
  const outputString = String(await stdoutPromise)
  console.log(indentLine(outputString, '  > '))
  return outputString
}

runMain(async ({ padLog, stepLog }) => {
  padLog('reset example and create auth file')
  await runWithOutputString('npm run example-reset')
  await runWithOutputString('npm run example-auth-gen')

  padLog('start example server')
  await withRunBackground({
    command: 'npm run example-start-server',
    option: { cwd: fromRoot(), stdio: 'ignore', shell: true }
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
      verifyExampleFileExist('upload', 'server-root-gitignore/test-upload/test-file')
    })
    await runTest('file-upload (should rewrite)', async () => {
      const statUpload = getExampleFileStat('server-root-gitignore/test-upload/test-file')
      await runWithOutputString('npm run example-file-upload')
      const statUploadAgain = getExampleFileStat('server-root-gitignore/test-upload/test-file')
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[file-upload] should upload file mtimeMs')
    })
    await runTest('file-download', async () => {
      await runWithOutputString('npm run example-file-download')
      verifyExampleFileExist('download', 'server-root-gitignore/test-download/test-file')
    })
    await runTest('file-download (should rewrite)', async () => {
      const statDownload = getExampleFileStat('server-root-gitignore/test-download/test-file')
      await runWithOutputString('npm run example-file-download')
      const statDownloadAgain = getExampleFileStat('server-root-gitignore/test-download/test-file')
      notStrictEqual(statDownload.mtimeMs, statDownloadAgain.mtimeMs, '[file-download] should update file mtimeMs')
    })

    await runTest('package-download', async () => {
      await runWithOutputString('npm run example-package-download')
      verifyExampleFileExist('package-download', 'sample-package-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      verifyExampleFileExist('package-download', 'sample-package-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')
      verifyExampleFileExist('package-download', 'sample-package-gitignore/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
    })
    await runTest('package-download (should skip)', async () => {
      const statPackageDownloadList = [
        getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
      ]
      await runWithOutputString('npm run example-package-download')
      const statPackageDownloadAgainList = [
        getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz'),
        getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz'),
        getExampleFileStat('sample-package-gitignore/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz')
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
      verifyExampleFileExist('package-download', 'server-root-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      verifyExampleFileExist('package-download', 'server-root-gitignore/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz')
    })
    await runTest('package-upload (should skip)', async () => {
      const statUpload = getExampleFileStat('server-root-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
      await runWithOutputString('npm run example-package-upload')
      const statUploadAgain = getExampleFileStat('server-root-gitignore/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz')
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
      verifyExampleFileExist('upload', `server-root-gitignore/test-upload/${directoryPackFile}`)
    })
    await runTest('directory-upload (should rewrite)', async () => {
      const statUpload = getExampleFileStat(`server-root-gitignore/test-upload/${directoryPackFile}`)
      await runWithOutputString('npm run example-directory-upload')
      const statUploadAgain = getExampleFileStat(`server-root-gitignore/test-upload/${directoryPackFile}`)
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[directory-upload] should upload directory mtimeMs')
    })
    await runTest('directory-download', async () => {
      await runWithOutputString('npm run example-directory-download')
      verifyExampleFileExist('download', 'server-root-gitignore/test-download/test-directory')
    })
    await runTest('directory-download (should merge)', async () => {
      renameExampleFile(
        'server-root-gitignore/test-download/test-directory/PACK_INFO',
        'server-root-gitignore/test-download/test-directory/PACK_INFO-rename'
      )
      await runWithOutputString('npm run example-directory-download')
      verifyExampleFileExist('download-merge', 'server-root-gitignore/test-download/test-directory/PACK_INFO')
      verifyExampleFileExist('download-merge', 'server-root-gitignore/test-download/test-directory/PACK_INFO-rename')
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
      verifyExampleFileExist('upload', `server-root-gitignore/test-upload/${gzDirectoryPackFile}`)
    })
    await runTest('gz-directory-upload (should rewrite)', async () => {
      const statUpload = getExampleFileStat(`server-root-gitignore/test-upload/${gzDirectoryPackFile}`)
      await runWithOutputString('npm run example-gz-directory-upload')
      const statUploadAgain = getExampleFileStat(`server-root-gitignore/test-upload/${gzDirectoryPackFile}`)
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[gz-directory-upload] should upload directory mtimeMs')
    })
    await runTest('gz-directory-download', async () => {
      await runWithOutputString('npm run example-gz-directory-download')
      verifyExampleFileExist('download', 'server-root-gitignore/test-gz-download/test-directory')
      verifyExampleFileExist('download', 'server-root-gitignore/test-gz-download/test-directory/PACK_TRIM_GZ')
      verifyExampleFileExist('download', 'server-root-gitignore/test-gz-download/test-directory/package.json.gz')
    })
    await runTest('gz-directory-download (should merge)', async () => {
      renameExampleFile(
        'server-root-gitignore/test-gz-download/test-directory/PACK_INFO',
        'server-root-gitignore/test-gz-download/test-directory/PACK_INFO-rename'
      )
      await runWithOutputString('npm run example-gz-directory-download')
      verifyExampleFileExist('download-merge', 'server-root-gitignore/test-gz-download/test-directory/PACK_INFO')
      verifyExampleFileExist('download-merge', 'server-root-gitignore/test-gz-download/test-directory/PACK_INFO-rename')
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
      verifyExampleFileExist('upload', `server-root-gitignore/test-upload/${p7zDirectoryPackFile}`)
    })
    await runTest('7z-directory-upload (should rewrite)', async () => {
      const statUpload = getExampleFileStat(`server-root-gitignore/test-upload/${p7zDirectoryPackFile}`)
      await runWithOutputString('npm run example-7z-directory-upload')
      const statUploadAgain = getExampleFileStat(`server-root-gitignore/test-upload/${p7zDirectoryPackFile}`)
      notStrictEqual(statUpload.mtimeMs, statUploadAgain.mtimeMs, '[7z-directory-upload] should upload directory mtimeMs')
    })
    await runTest('7z-directory-download', async () => {
      await runWithOutputString('npm run example-7z-directory-download')
      verifyExampleFileExist('download', 'server-root-gitignore/test-7z-download/test-directory')
    })
    await runTest('7z-directory-download (should merge)', async () => {
      renameExampleFile(
        'server-root-gitignore/test-7z-download/test-directory/PACK_INFO',
        'server-root-gitignore/test-7z-download/test-directory/PACK_INFO-rename'
      )
      await runWithOutputString('npm run example-7z-directory-download')
      verifyExampleFileExist('download-merge', 'server-root-gitignore/test-7z-download/test-directory/PACK_INFO')
      verifyExampleFileExist('download-merge', 'server-root-gitignore/test-7z-download/test-directory/PACK_INFO-rename')
    })

    padLog('stop example server')
  }, 1000) // wait 1sec for server to start up (mostly for GitHub Action win10 + nodejs@14)
  stepLog('stop example server done')
}, 'test-example')
