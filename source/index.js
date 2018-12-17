import { list } from './feature/list'
import { upload } from './feature/upload'
import { download, downloadPackageAuto } from './feature/download'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (
  mode,
  { getOption, getOptionOptional, getSingleOption, getSingleOptionOptional },
  log = console.log
) => {
  const commonOption = {
    fileAuth: getSingleOption('file-auth'),
    timeout: getSingleOptionOptional('timeout') || 0,
    log
  }
  log(`[${packageName}] mode: ${mode}, timeout: ${commonOption.timeout}, version: ${packageVersion}`)

  switch (mode) {
    case 'list':
      return list({
        urlPathAction: getSingleOption('url-path-action'),
        listKeyPrefix: getSingleOptionOptional('list-key-prefix') || '',
        ...commonOption
      })
    case 'upload':
      return upload({
        urlFileUpload: getSingleOption('url-file-upload'),
        fileInputPath: getSingleOption('upload-file'),
        filePath: getSingleOption('upload-key'),
        ...commonOption
      })
    case 'download':
      return getOptionOptional('package-json')
        ? downloadPackageAuto({
          urlFileDownload: getSingleOption('url-file-download'),
          pathPackageJSON: getSingleOption('package-json'),
          packageNamePrefixList: getOption('package-name-prefix'),
          packagePathPrefix: getSingleOptionOptional('package-path-prefix') || '',
          ...commonOption
        })
        : download({
          urlFileDownload: getSingleOption('url-file-download'),
          fileOutputPath: getSingleOption('download-file'),
          filePath: getSingleOption('download-key'),
          ...commonOption
        })
  }
}

const main = async () => {
  const optionData = await parseOption()
  const mode = MODE_NAME_LIST.find((name) => optionData.getOptionOptional(name))

  if (!mode) {
    return optionData.getOptionOptional('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.getOptionOptional('help') ? null : 'simple'))
  }

  await runMode(mode, optionData).catch((error) => {
    console.warn(`[Error] mode:`, mode, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
