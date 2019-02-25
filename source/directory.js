import { resolve } from 'path'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'

import { indentLine } from 'dr-js/module/common/string'
import { getRandomId } from 'dr-js/module/common/math/random'
import { createDirectory } from 'dr-js/module/node/file/File'

import {
  listFile,
  uploadFile,
  downloadFile
} from './file'
import { tarCompress, tarExtract } from './function'

const FILE_PACK_INFO = 'PACK_INFO'

const listDirectory = listFile

const uploadDirectory = async ({
  uploadDirectory,
  infoString,
  log,
  ...fileOption
}) => {
  writeFileSync(resolve(uploadDirectory, FILE_PACK_INFO), infoString)
  log(`[Upload] directory info:\n${indentLine(infoString)}`)

  const tempTgz = resolve(`${getRandomId('temp-')}.tgz`) // just create the temp tgz in cwd
  tarCompress(uploadDirectory, tempTgz)
  const fileBuffer = readFileSync(tempTgz)
  unlinkSync(tempTgz)
  log(`[Upload] done pack`)

  return uploadFile({ fileBuffer, log, ...fileOption })
}

const downloadDirectory = async ({
  downloadDirectory,
  log,
  ...fileOption
}) => {
  const tempTgz = resolve(`${getRandomId('temp-')}.tgz`) // just create the temp tgz in cwd
  await downloadFile({ ...fileOption, fileOutputPath: tempTgz })

  await createDirectory(downloadDirectory)
  tarExtract(tempTgz, downloadDirectory)
  unlinkSync(tempTgz)
  log(`[Download] done unpack`)

  const infoString = String(readFileSync(resolve(downloadDirectory, FILE_PACK_INFO)))
  log(`[Download] directory info:\n${indentLine(infoString)}`)
}

export {
  listDirectory,
  uploadDirectory,
  downloadDirectory
}
