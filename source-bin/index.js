import { resolve } from 'path'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'

import { time } from 'dr-js/module/common/format'
import { indentLine } from 'dr-js/module/common/string'
import { clock, getTimestamp } from 'dr-js/module/common/time'
import { getRandomId } from 'dr-js/module/common/math/random'
import { createDirectory } from 'dr-js/module/node/file/File'

import {
  getAuthFetch,
  getGitBranch, getGitCommitHash,
  tarCompress, tarExtract,
  listFile, uploadFile, downloadFile,
  loadPackageList, listPackage, uploadPackage, downloadPackage
} from 'source'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const FILE_PACK_INFO = 'PACK_INFO'

const cacheValue = (func) => {
  let value
  return () => {
    if (value === undefined) value = func()
    return value
  }
}
const getGitBranchCached = cacheValue(() => getGitBranch() || 'unknown-branch')
const getGitCommitHashCached = cacheValue(() => getGitCommitHash() || 'unknown-commit-hash')

const dispelMagic = (key = '') => key
  .replace(/{git-branch}/g, getGitBranchCached)
  .replace(/{git-commit-hash}/g, getGitCommitHashCached)
  .replace(/{timestamp}/g, cacheValue(getTimestamp))
  .replace(/{date-iso}/g, cacheValue(() => new Date().toISOString()))

const runMode = async (modeName, { tryGet, tryGetFirst, get, getFirst }) => {
  const timeout = tryGetFirst('timeout') || 0
  const authFetch = await getAuthFetch({
    fileAuth: getFirst('auth-file'),
    authKey: tryGetFirst('auth-key')
  })
  const timeStart = clock()
  const log = tryGet('quiet')
    ? () => {}
    : (...args) => console.log(...args, `(${time(clock() - timeStart)})`)

  log(`[${packageName}@${packageVersion}] mode: ${modeName}, timeout: ${timeout}`)

  const commonOption = { timeout, authFetch, log }
  if (tryGet('package-json')) {
    const pathPackageJSONList = get('package-json')
    const packageNameFilterList = get('package-name-filter')
    const packagePathPrefix = tryGetFirst('package-path-prefix') || ''
    const packageListList = pathPackageJSONList.map((pathPackageJSON) => loadPackageList({ pathPackageJSON, packageNameFilterList, packagePathPrefix, log }))
    for (const packageList of packageListList) {
      switch (modeName) {
        case 'list':
          await listPackage({
            packageList,
            urlPathAction: getFirst('url-path-action'),
            ...commonOption
          })
          break
        case 'upload':
          await uploadPackage({
            packageList,
            urlFileUpload: getFirst('url-file-upload'),
            urlPathAction: getFirst('url-path-action'),
            ...commonOption
          })
          break
        case 'download':
          await downloadPackage({
            packageList,
            urlFileDownload: getFirst('url-file-download'),
            ...commonOption
          })
          break
      }
    }
  } else {
    const isDirectoryMode = tryGet('directory')
    switch (modeName) {
      case 'list':
        return listFile({
          urlPathAction: getFirst('url-path-action'),
          listKeyPrefix: dispelMagic(tryGetFirst('list-key-prefix') || ''),
          ...commonOption
        })
      case 'upload': {
        let fileBuffer
        if (isDirectoryMode) {
          const uploadDirectory = getFirst('upload-directory')
          const infoString = dispelMagic((tryGet('directory-pack-info') || [ '{date-iso}' ]).join('\n'))
          writeFileSync(resolve(uploadDirectory, FILE_PACK_INFO), infoString)
          log(`[Upload] directory info:\n${indentLine(infoString)}`)

          const tempTgz = resolve(`${getRandomId('temp-')}.tgz`) // just create the temp tgz in cwd
          tarCompress(uploadDirectory, tempTgz)
          fileBuffer = readFileSync(tempTgz)
          unlinkSync(tempTgz)
          log(`[Upload] done pack`)
        } else fileBuffer = readFileSync(getFirst('upload-file'))

        await uploadFile({
          urlFileUpload: getFirst('url-file-upload'),
          filePath: dispelMagic(getFirst('upload-key')),
          fileBuffer,
          ...commonOption
        })
        break
      }
      case 'download': {
        const fileOutputPath = isDirectoryMode
          ? resolve(`${getRandomId('temp-')}.tgz`) // just create the temp tgz in cwd
          : getFirst('download-file')

        await downloadFile({
          urlFileDownload: getFirst('url-file-download'),
          filePath: dispelMagic(getFirst('download-key')),
          fileOutputPath,
          ...commonOption
        })

        if (isDirectoryMode) {
          const downloadDirectory = getFirst('download-directory')
          await createDirectory(downloadDirectory)
          const tempTgz = fileOutputPath
          tarExtract(tempTgz, downloadDirectory)
          unlinkSync(tempTgz)
          log(`[Download] done unpack`)

          const infoString = String(readFileSync(resolve(downloadDirectory, FILE_PACK_INFO)))
          log(`[Download] directory info:\n${indentLine(infoString)}`)
        }
        break
      }
    }
  }
}

const main = async () => {
  const optionData = await parseOption()
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))

  if (!modeName) {
    return optionData.tryGet('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.tryGet('help') ? null : 'simple'))
  }

  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
