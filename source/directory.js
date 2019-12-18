import { resolve, relative } from 'path'

import { indentLine } from '@dr-js/core/module/common/string'
import { getRandomId } from '@dr-js/core/module/common/math/random'

import { readFileAsync, writeFileAsync, visibleAsync } from '@dr-js/core/module/node/file/function'
import { deletePath, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { createDirectory, getFileList } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import { detect as detect7z, compressConfig as compressConfig7z, extractConfig as extractConfig7z } from '@dr-js/node/module/module/Software/7z'
import { detect as detectTar, compressConfig as compressConfigTar, extractConfig as extractConfigTar } from '@dr-js/node/module/module/Software/tar'
import { compressFile } from '@dr-js/node/module/module/Compress'

import { uploadFile, downloadFile } from './file'

const FILE_PACK_INFO = 'PACK_INFO'
const FILE_PACK_TRIM_GZ = 'PACK_TRIM_GZ'

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
  isUse7z ? detect7z() : detectTar()

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
  await run((isUse7z ? compressConfig7z : compressConfigTar)(directoryInputPath, tempFile)).promise
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
  isUse7z ? detect7z() : detectTar()

  const tempFile = getTempFile()
  await downloadFile({ ...fileOption, log, fileOutputPath: tempFile })

  await createDirectory(directoryOutputPath)
  await run((isUse7z ? extractConfig7z : extractConfigTar)(tempFile, directoryOutputPath)).promise
  await deletePath(tempFile)
  log(`[Download] done unpack`)

  if (isTrimGz) {
    try {
      const trimFileList = JSON.parse(String(await readFileAsync(resolve(directoryOutputPath, filePackTrimGz))))
      for (const file of trimFileList) {
        const inputFile = resolve(directoryOutputPath, file)
        await compressFile(inputFile, `${inputFile}.gz`)
      }
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
