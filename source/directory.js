import { resolve, relative, sep } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { spawnSync } from 'child_process'
import { gzipSync } from 'zlib'

import { indentLine } from '@dr-js/core/module/common/string'
import { getRandomId } from '@dr-js/core/module/common/math/random'

import { readFileAsync, writeFileAsync, visibleAsync } from '@dr-js/core/module/node/file/function'
import { deletePath, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { createDirectory, getFileList } from '@dr-js/core/module/node/file/Directory'

import { uploadFile, downloadFile } from './file'

const FILE_PACK_INFO = 'PACK_INFO'
const FILE_PACK_TRIM_GZ = 'PACK_TRIM_GZ'

const SPAWN_CONFIG = { stdio: 'inherit' }

const tarCompress = (sourcePath, outputFileName) => spawnSync('tar', [
  '-zcf', outputFileName,
  '-C', sourcePath,
  '.'
], SPAWN_CONFIG)
const tarExtract = (sourceFileName, outputPath) => spawnSync('tar', [
  '--strip-components', '1',
  '-xf', sourceFileName, // use '-xf' for both gzip/xz
  '-C', outputPath
], SPAWN_CONFIG)

// require 7z@>=16.00 for `-bs` switch
const p7zCompress = (sourcePath, outputFileName) => spawnSync('7z', [
  'a', outputFileName,
  `${sourcePath}${sep}*`,
  '-bso0', '-bsp0'
], SPAWN_CONFIG)
const p7zExtract = (sourceFileName, outputPath) => spawnSync('7z', [
  'x', sourceFileName,
  `-o${outputPath}`,
  '-y', '-bso0', '-bsp0'
], SPAWN_CONFIG)
const p7zDetect = () => { // test for: `-bs{o|e|p}{0|1|2} : set output stream for output/error/progress line`
  try {
    if (String(spawnSync('7z').stdout).includes(`-bs{o|e|p}{0|1|2}`)) return
  } catch (error) {}
  throw new Error(`[p7zDetect] expect "7z" with "-bs{o|e|p}{0|1|2}" support in PATH`)
}

const gzipFile = (sourceFile) => writeFileSync(`${sourceFile}.gz`, gzipSync(readFileSync(sourceFile)))
const dropGz = (fileGz) => fileGz.slice(0, -3) // drop last 3 char (.gz)
const getTempFile = () => resolve(`${getRandomId('temp-')}.pack`) // just create temp file in cwd

const uploadDirectory = async ({
  directoryInputPath,
  infoString,
  isTrimGz,
  isUse7z,
  log,
  filePackInfo = FILE_PACK_INFO,
  filePackTrimGz = FILE_PACK_TRIM_GZ,
  ...fileOption
}) => {
  isUse7z && p7zDetect()

  await writeFileAsync(resolve(directoryInputPath, filePackInfo), infoString)
  log(`[Upload] directory info:\n${indentLine(infoString)}`)

  if (isTrimGz) { // only pick .gz with original files
    const fileSourceSet = new Set()
    const fileGzSet = new Set()
    for (const file of await getFileList(directoryInputPath)) (file.endsWith('.gz') ? fileGzSet : fileSourceSet).add(file)
    const trimFileGzList = [ ...fileGzSet ].filter((fileGz) => fileSourceSet.has(dropGz(fileGz)))
    if (trimFileGzList.length) {
      for (const fileGz of trimFileGzList) await deletePath(fileGz)
      await writeFileAsync(
        resolve(directoryInputPath, filePackTrimGz),
        JSON.stringify(trimFileGzList.map((fileGz) => toPosixPath(relative(directoryInputPath, dropGz(fileGz)))))
      )
      log(`[Upload] trim ".gz" file with source: ${trimFileGzList.length}`)
    } else {
      const isPackTrimGzExist = await visibleAsync(resolve(directoryInputPath, filePackTrimGz))
      log(`[Upload] no ".gz" file with source trimmed, ${isPackTrimGzExist ? 're-use' : 'no'} existing ${filePackTrimGz}`)
    }
  }

  const tempFile = getTempFile()
  const compress = isUse7z ? p7zCompress : tarCompress
  compress(directoryInputPath, tempFile)
  const fileBuffer = await readFileAsync(tempFile)
  await deletePath(tempFile)
  log(`[Upload] done pack`)

  return uploadFile({ ...fileOption, log, fileBuffer })
}

const downloadDirectory = async ({
  directoryOutputPath,
  isTrimGz,
  isUse7z,
  log,
  filePackInfo = FILE_PACK_INFO,
  filePackTrimGz = FILE_PACK_TRIM_GZ,
  ...fileOption
}) => {
  isUse7z && p7zDetect()

  const tempFile = getTempFile()
  await downloadFile({ ...fileOption, log, fileOutputPath: tempFile })

  await createDirectory(directoryOutputPath)
  const extract = isUse7z ? p7zExtract : tarExtract
  extract(tempFile, directoryOutputPath)
  await deletePath(tempFile)
  log(`[Download] done unpack`)

  if (isTrimGz) {
    try {
      const trimFileList = JSON.parse(await readFileAsync(resolve(directoryOutputPath, filePackTrimGz)))
      for (const file of trimFileList) gzipFile(resolve(directoryOutputPath, file))
      log(`[Download] re-generate ".gz" file: ${trimFileList.length}`)
    } catch (error) { console.warn(`[Error][Download] failed to re-generate ".gz" file: ${error}`) }
  }

  const infoString = String(await readFileAsync(resolve(directoryOutputPath, filePackInfo)))
  log(`[Download] directory info:\n${indentLine(infoString)}`)
}

export {
  uploadDirectory,
  downloadDirectory
}
