import { resolve, relative } from 'path'

import { indentLine } from 'dr-js/module/common/string'
import { getRandomId } from 'dr-js/module/common/math/random'

import { readFileAsync, writeFileAsync, visibleAsync, toPosixPath } from 'dr-js/module/node/file/function'
import { createDirectory, deletePath } from 'dr-js/module/node/file/File'
import { getFileList } from 'dr-js/module/node/file/Directory'

import { uploadFile, downloadFile } from './file'
import { tarCompress, tarExtract, p7zCompress, p7zExtract, gzipFile } from './function'

const FILE_PACK_INFO = 'PACK_INFO'
const FILE_PACK_TRIM_GZ = 'PACK_TRIM_GZ'

const dropGz = (fileGz) => fileGz.slice(0, -3) // drop last 3 char (.gz)
const getTempFile = () => resolve(`${getRandomId('temp-')}.pack`) // just create temp file in cwd

const uploadDirectory = async ({
  uploadDirectory,
  infoString,
  isTrimGz,
  isUse7z,
  log,
  ...fileOption
}) => {
  await writeFileAsync(resolve(uploadDirectory, FILE_PACK_INFO), infoString)
  log(`[Upload] directory info:\n${indentLine(infoString)}`)

  if (isTrimGz) { // only pick .gz with original files
    const fileSourceSet = new Set()
    const fileGzSet = new Set()
    for (const file of await getFileList(uploadDirectory)) (file.endsWith('.gz') ? fileGzSet : fileSourceSet).add(file)
    const trimFileGzList = [ ...fileGzSet ].filter((fileGz) => fileSourceSet.has(dropGz(fileGz)))
    if (trimFileGzList.length) {
      for (const fileGz of trimFileGzList) await deletePath(fileGz)
      await writeFileAsync(
        resolve(uploadDirectory, FILE_PACK_TRIM_GZ),
        JSON.stringify(trimFileGzList.map((fileGz) => toPosixPath(relative(uploadDirectory, dropGz(fileGz)))))
      )
      log(`[Upload] trim ".gz" file with source: ${trimFileGzList.length}`)
    } else {
      const isPackTrimGzExist = await visibleAsync(resolve(uploadDirectory, FILE_PACK_TRIM_GZ))
      log(`[Upload] no ".gz" file with source trimmed, ${isPackTrimGzExist ? 're-use' : 'no'} existing ${FILE_PACK_TRIM_GZ}`)
    }
  }

  const tempFile = getTempFile()
  const compress = isUse7z ? p7zCompress : tarCompress
  compress(uploadDirectory, tempFile)
  const fileBuffer = await readFileAsync(tempFile)
  await deletePath(tempFile)
  log(`[Upload] done pack`)

  return uploadFile({ ...fileOption, log, fileBuffer })
}

const downloadDirectory = async ({
  downloadDirectory,
  isTrimGz,
  isUse7z,
  log,
  ...fileOption
}) => {
  const tempFile = getTempFile()
  await downloadFile({ ...fileOption, log, fileOutputPath: tempFile })

  await createDirectory(downloadDirectory)
  const extract = isUse7z ? p7zExtract : tarExtract
  extract(tempFile, downloadDirectory)
  await deletePath(tempFile)
  log(`[Download] done unpack`)

  if (isTrimGz) {
    try {
      const trimFileList = JSON.parse(await readFileAsync(resolve(downloadDirectory, FILE_PACK_TRIM_GZ)))
      for (const file of trimFileList) gzipFile(resolve(downloadDirectory, file))
      log(`[Download] re-generate ".gz" file: ${trimFileList.length}`)
    } catch (error) { console.warn(`[Error][Download] failed to re-generate ".gz" file: ${error}`) }
  }

  const infoString = String(await readFileAsync(resolve(downloadDirectory, FILE_PACK_INFO)))
  log(`[Download] directory info:\n${indentLine(infoString)}`)
}

export {
  uploadDirectory,
  downloadDirectory
}
