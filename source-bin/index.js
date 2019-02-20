import {
  getAuthFetch,
  listFile, uploadFile, downloadFile,
  loadPackageList, listPackage, uploadPackage, downloadPackage
} from 'source'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, { tryGet, tryGetFirst, get, getFirst }) => {
  const log = tryGet('quiet')
    ? () => {}
    : console.log
  const timeout = tryGetFirst('timeout') || 0
  const authFetch = await getAuthFetch({
    fileAuth: getFirst('auth-file'),
    authKey: tryGetFirst('auth-key')
  })
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
    switch (modeName) {
      case 'list':
        return listFile({
          urlPathAction: getFirst('url-path-action'),
          listKeyPrefix: tryGetFirst('list-key-prefix') || '',
          ...commonOption
        })
      case 'upload':
        return uploadFile({
          urlFileUpload: getFirst('url-file-upload'),
          filePath: getFirst('upload-key'),
          fileInputPath: getFirst('upload-file'),
          ...commonOption
        })
      case 'download':
        return downloadFile({
          urlFileDownload: getFirst('url-file-download'),
          filePath: getFirst('download-key'),
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
