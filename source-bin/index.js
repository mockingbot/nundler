import { time } from '@dr-js/core/module/common/format'
import { clock } from '@dr-js/core/module/common/time'

import {
  listFile, uploadFile, downloadFile,
  uploadDirectory, downloadDirectory,
  loadPackageList, listPackage, uploadPackage, downloadPackage
} from 'source'

import { createMarkReplacer, generateMarkMap, configureAuthFile, pingRaceUrlList, pingStatUrlList } from './function'
import { FILE_PACK_INFO, FILE_PACK_TRIM_GZ, MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, { tryGet, tryGetFirst, get, getFirst }) => {
  if (tryGet('ping-host')) return console.log(await pingRaceUrlList(tryGet('url-host-list')))
  if (tryGet('ping-host-stat')) return console.log(JSON.stringify(await pingStatUrlList(tryGet('url-host-list')), null, 2))

  const timeStart = clock()
  const log = tryGet('quiet')
    ? () => {}
    : (...args) => console.log(...args, `(${time(clock() - timeStart)})`)

  const isPackageMode = tryGet('package-json')
  const isDirectoryMode = tryGet('directory')
  const timeout = tryGetFirst('timeout') || 0
  const { authFetch } = await configureAuthFile({
    authFile: getFirst('auth-file'),
    authKey: tryGetFirst('auth-key')
  })
  let urlHost
  let markReplacer = (string) => string
  if (!tryGet('keep-mark')) {
    const urlHostList = tryGet('url-host-list')
    if (urlHostList) urlHost = await pingRaceUrlList(urlHostList)
    markReplacer = createMarkReplacer(generateMarkMap({ 'url-host': urlHost }))
  }
  const commonOption = { timeout, authFetch, log, filePackInfo: FILE_PACK_INFO, filePackTrimGz: FILE_PACK_TRIM_GZ }

  log(`[${packageName}@${packageVersion}]`, [
    `mode: ${modeName}`,
    `timeout: ${timeout}`,
    urlHost && `url-host: ${urlHost}`
  ].filter(Boolean).join(', '))

  if (isPackageMode) {
    const pathPackageJSONList = get('package-json')
    const packageNameFilterList = get('package-name-filter')
    const packagePathPrefix = tryGetFirst('package-path-prefix') || ''
    const packageListList = pathPackageJSONList.map((pathPackageJSON) => loadPackageList({ pathPackageJSON, packageNameFilterList, packagePathPrefix, log }))
    for (const packageList of packageListList) {
      switch (modeName) {
        case 'list':
          await listPackage({
            urlPathAction: markReplacer(getFirst('url-path-action')),
            packageList,
            ...commonOption
          })
          break
        case 'upload':
          await uploadPackage({
            urlFileUpload: markReplacer(getFirst('url-file-upload')),
            urlPathAction: markReplacer(getFirst('url-path-action')),
            packageList,
            ...commonOption
          })
          break
        case 'download':
          await downloadPackage({
            urlFileDownload: markReplacer(getFirst('url-file-download')),
            packageList,
            ...commonOption
          })
          break
      }
    }
    return
  }

  if (isDirectoryMode) {
    commonOption.isTrimGz = tryGet('trim-gz')
    commonOption.isUse7z = tryGet('use-7z')
  }

  switch (modeName) {
    case 'list':
      return listFile({
        urlPathAction: markReplacer(getFirst('url-path-action')),
        listKeyPrefix: markReplacer(tryGetFirst('list-key-prefix') || ''),
        ...commonOption
      })
    case 'upload': {
      commonOption.urlFileUpload = markReplacer(getFirst('url-file-upload'))
      commonOption.key = markReplacer(getFirst('upload-key'))
      return isDirectoryMode
        ? uploadDirectory({
          directoryInputPath: getFirst('upload-directory'),
          infoString: markReplacer((tryGet('directory-pack-info') || [ '{time-iso}' ]).join('\n')),
          ...commonOption
        })
        : uploadFile({
          fileInputPath: getFirst('upload-file'),
          ...commonOption
        })
    }
    case 'download': {
      commonOption.urlFileDownload = markReplacer(getFirst('url-file-download'))
      commonOption.key = markReplacer(getFirst('download-key'))
      return isDirectoryMode
        ? downloadDirectory({
          directoryOutputPath: getFirst('download-directory'),
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
  if (optionData.tryGet('version')) return console.log(JSON.stringify({ packageName, packageVersion }, null, 2))
  if (optionData.tryGet('help')) return console.log(formatUsage())
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))
  if (!modeName) throw new Error('no mode specified')
  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
