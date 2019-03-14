import { time } from 'dr-js/module/common/format'
import { clock } from 'dr-js/module/common/time'

import {
  getAuthFetch, dispelMagicString,
  listFile, uploadFile, downloadFile,
  uploadDirectory, downloadDirectory,
  loadPackageList, listPackage, uploadPackage, downloadPackage
} from 'source'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

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

  const isPackageMode = tryGet('package-json')
  const isDirectoryMode = tryGet('directory')

  if (isPackageMode) {
    const pathPackageJSONList = get('package-json')
    const packageNameFilterList = get('package-name-filter')
    const packagePathPrefix = tryGetFirst('package-path-prefix') || ''
    const packageListList = pathPackageJSONList.map((pathPackageJSON) => loadPackageList({ pathPackageJSON, packageNameFilterList, packagePathPrefix, log }))
    for (const packageList of packageListList) {
      switch (modeName) {
        case 'list':
          await listPackage({
            urlPathAction: getFirst('url-path-action'),
            packageList,
            ...commonOption
          })
          break
        case 'upload':
          await uploadPackage({
            urlFileUpload: getFirst('url-file-upload'),
            urlPathAction: getFirst('url-path-action'),
            packageList,
            ...commonOption
          })
          break
        case 'download':
          await downloadPackage({
            urlFileDownload: getFirst('url-file-download'),
            packageList,
            ...commonOption
          })
          break
      }
    }
    return
  }

  if (isDirectoryMode) commonOption.isTrimGz = tryGet('trim-gz')
  switch (modeName) {
    case 'list':
      return listFile({
        urlPathAction: getFirst('url-path-action'),
        listKeyPrefix: dispelMagicString(tryGetFirst('list-key-prefix') || ''),
        ...commonOption
      })
    case 'upload': {
      commonOption.urlFileUpload = getFirst('url-file-upload')
      commonOption.filePath = dispelMagicString(getFirst('upload-key'))
      return isDirectoryMode
        ? uploadDirectory({
          uploadDirectory: getFirst('upload-directory'),
          infoString: dispelMagicString((tryGet('directory-pack-info') || [ '{date-iso}' ]).join('\n')),
          ...commonOption
        })
        : uploadFile({
          fileInputPath: getFirst('upload-file'),
          ...commonOption
        })
    }
    case 'download': {
      commonOption.urlFileDownload = getFirst('url-file-download')
      commonOption.filePath = dispelMagicString(getFirst('download-key'))
      return isDirectoryMode
        ? downloadDirectory({
          downloadDirectory: getFirst('download-directory'),
          ...commonOption
        })
        : downloadFile({
          fileOutputPath: getFirst('download-file'),
          ...commonOption
        })
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
