import { list } from './feature/list'
import { upload } from './feature/upload'
import { download, downloadPackageAuto } from './feature/download'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (
  mode,
  { getOptionOptional, getSingleOption, getSingleOptionOptional },
  log = console.log
) => {
  const fileAuth = getSingleOption('file-auth')
  const timeout = getSingleOptionOptional('timeout') || 0

  log(`[${packageName}] mode: ${mode}, timeout: ${timeout}, version: ${packageVersion}`)
  switch (mode) {
    case 'list':
      return list({
        urlPathAction: getSingleOption('url-path-action'),
        listKeyPrefix: getSingleOptionOptional('list-key-prefix') || '',
        fileAuth,
        timeout,
        log
      })
    case 'upload':
      return upload({
        urlFileUpload: getSingleOption('url-file-upload'),
        fileInputPath: getSingleOption('upload-file'),
        filePath: getSingleOption('upload-key'),
        fileAuth,
        timeout,
        log
      })
    case 'download':
      return getOptionOptional('package-json')
        ? downloadPackageAuto({
          urlFileDownload: getSingleOption('url-file-download'),
          pathPackageJSON: getSingleOption('package-json'),
          packageNamePrefix: getSingleOption('package-name-prefix'),
          packagePathPrefix: getSingleOptionOptional('package-path-prefix') || '',
          fileAuth,
          timeout,
          log
        })
        : download({
          urlFileDownload: getSingleOption('url-file-download'),
          fileOutputPath: getSingleOption('download-file'),
          filePath: getSingleOption('download-key'),
          fileAuth,
          timeout,
          log
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
