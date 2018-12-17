import { join, resolve, normalize, dirname } from 'path'
import { readFileAsync, visibleAsync, toPosixPath } from 'dr-js/module/node/file/function'
import { modify } from 'dr-js/module/node/file/Modify'
import { fileDownload } from 'dr-server/module/featureNode/explorer'

const download = fileDownload

const downloadPackageAuto = async ({
  urlFileDownload,
  pathPackageJSON,
  packageNamePrefix,
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
  }).filter(([ packageName ]) => packageName.startsWith(packageNamePrefix))

  __DEV__ && console.log('[downloadPackageAuto]', { packageList })

  for (const [ packageName, packagePath ] of packageList) {
    if (!packagePath.startsWith('./')) throw new Error(`[downloadPackageAuto] invalid package path: ${packagePath} (${packageName})`)

    const fileOutputPath = resolve(dirname(pathPackageJSON), packagePath)

    if (await visibleAsync(fileOutputPath)) log(`[downloadPackageAuto] skip exist ${packageName}: ${packagePath}`)
    else {
      const tempFile = `${fileOutputPath}_TEMP`

      __DEV__ && console.log('[downloadPackageAuto]', { packageName, packagePath, tempFile, filePath: toPosixPath(normalize(packagePath)) })

      await fileDownload({
        urlFileDownload,
        fileOutputPath: tempFile,
        filePath: toPosixPath(normalize(join(packagePathPrefix, packagePath))),
        fileAuth,
        timeout,
        log
      })
      await modify.move(tempFile, fileOutputPath)
    }
  }
}

export { download, downloadPackageAuto }
