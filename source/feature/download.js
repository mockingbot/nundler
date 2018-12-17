import { join, resolve, normalize, dirname } from 'path'
import { readFileAsync, visibleAsync, toPosixPath } from 'dr-js/module/node/file/function'
import { modify } from 'dr-js/module/node/file/Modify'
import { fileDownload } from 'dr-server/module/featureNode/explorer'

const download = fileDownload

const downloadPackageAuto = async ({
  urlFileDownload,
  pathPackageJSON,
  packageNamePrefixList,
  packagePathPrefix = '',
  fileAuth,
  timeout,
  log
}) => {
  const {
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies
  } = JSON.parse(await readFileAsync(pathPackageJSON))

  const packageList = Object.entries({
    ...dependencies,
    ...devDependencies,
    ...peerDependencies,
    ...optionalDependencies
  }).filter(([ packageName ]) => packageNamePrefixList.find((packageNamePrefix) => packageName.startsWith(packageNamePrefix)))
  __DEV__ && console.log('[downloadPackageAuto]', { packageList })

  const indexMax = packageList.length
  log(`[downloadPackageAuto] found package: ${indexMax}`)
  for (let index = 0; index < indexMax; index++) {
    const [ packageName, packagePath ] = packageList[ index ]
    const processTag = `[downloadPackageAuto|${index}/${indexMax}]`

    __DEV__ && console.log('[downloadPackageAuto]', { packageName, packagePath })
    if (!packagePath.startsWith('./')) throw new Error(`[downloadPackageAuto] invalid package path: ${packagePath} (${packageName})`)

    const fileOutputPath = resolve(dirname(pathPackageJSON), packagePath)

    if (await visibleAsync(fileOutputPath)) log(`${processTag} skip exist ${packageName}: ${packagePath}`)
    else {
      const fileTempPath = `${fileOutputPath}_temp_${Date.now().toString(36)}`
      const fileKey = toPosixPath(normalize(join(packagePathPrefix, packagePath)))
      __DEV__ && console.log('[downloadPackageAuto]', { fileTempPath, fileKey })

      await fileDownload({ urlFileDownload, fileOutputPath: fileTempPath, filePath: fileKey, fileAuth, timeout, log })
      await modify.move(fileTempPath, fileOutputPath)
      log(`${processTag} get ${packageName}: ${packagePath}`)
    }
  }
}

export { download, downloadPackageAuto }
