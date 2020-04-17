import { join, resolve, normalize, dirname, basename } from 'path'
import { readFileSync } from 'fs'

import { padTable } from '@dr-js/core/module/common/format'
import { indentLine } from '@dr-js/core/module/common/string'
import { compareSemVer } from '@dr-js/core/module/common/module/SemVer'

import { STAT_ERROR, getPathLstat, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { modifyRename } from '@dr-js/core/module/node/file/Modify'

import { PATH_ACTION_TYPE } from '@dr-js/node/module/module/PathAction/base'
import { pathAction, fileUpload, fileDownload } from '@dr-js/node/module/server/feature/Explorer/client'

const loadPackageList = ({
  pathPackageJSON,
  packageNameFilterList = [], // array of RegExp or String(startsWith)
  packagePathPrefix = '',
  log
}) => {
  __DEV__ && console.log({ packageNameFilterList })

  const filterList = packageNameFilterList.map( // normalize to `filter.test(string)`
    (packageNameFilter) => (packageNameFilter instanceof RegExp)
      ? packageNameFilter
      : { test: (string) => string.startsWith(packageNameFilter) }
  )

  const {
    dependencies,
    devDependencies,
    // peerDependencies, // NOTE: ignore peerDependencies, since this is not intended to be installed
    optionalDependencies // TODO: support allow failed install pass?
  } = JSON.parse(String(readFileSync(pathPackageJSON)))

  __DEV__ && console.log({
    dependencies,
    devDependencies,
    // peerDependencies,
    optionalDependencies
  })

  const packageList = Object
    .entries({
      ...dependencies,
      ...devDependencies,
      // ...peerDependencies,
      ...optionalDependencies
    })
    .filter(([ packageName ]) => filterList.find((filter) => filter.test(packageName)))
    .map(([ packageName, packagePath ]) => {
      if (!packagePath.startsWith('./')) throw new Error(`[loadPackageList] invalid packagePath: ${packagePath} (${packageName})`)
      const serverPath = toPosixPath(normalize(join(packagePathPrefix, packagePath)))
      const localPath = resolve(dirname(pathPackageJSON), packagePath)
      return { packageName, packagePath, serverPath, localPath }
    })

  __DEV__ && console.log('[loadPackageList] get filtered packageList:', packageList)

  log(`found ${packageList.length} package in ${pathPackageJSON}`)

  return packageList
}

const REGEXP_PACKAGE_VERSION = /-(\d+\.\d+\.\d+.*)\.tgz$/ // pick semver version from: `some/path/<name>-<version>.tgz`
const unique = (array) => [ ...new Set(array) ]

const listPackage = async ({
  packageList,
  urlPathAction,
  timeout,
  authFetch,
  log
}) => {
  // first get server file
  const serverPathList = packageList.map(({ serverPath }) => toPosixPath(dirname(serverPath)))

  __DEV__ && console.log({ serverPathList, nameList: unique(serverPathList) })

  const { resultList: contentList } = await pathAction({
    actionType: PATH_ACTION_TYPE.DIRECTORY_CONTENT,
    key: '',
    nameList: unique(serverPathList),
    urlPathAction,
    timeout,
    authFetch
  })

  __DEV__ && console.log({ contentList })
  __DEV__ && console.log(JSON.stringify(contentList, null, 2))

  const serverPackageList = unique(contentList.reduce((o, { key, fileList }) => {
    fileList.forEach(([ name ]) => {
      const result = REGEXP_PACKAGE_VERSION.exec(name) || []
      const packageVersion = result[ 1 ]
      const packageFileName = name.slice(0, result.index)
      const serverPath = toPosixPath(join(key, name))
      o.push({ packageVersion, packageFileName, serverPath })
    })
    return o
  }, []))

  __DEV__ && console.log({ serverPackageList })

  const statusList = []
  for (let index = 0, indexMax = packageList.length; index < indexMax; index++) {
    const { packageName, packagePath } = packageList[ index ]
    const [ , packageVersion = '0.0.0' ] = REGEXP_PACKAGE_VERSION.exec(packagePath) || []
    const packageFileName = basename(packagePath)
    const relatedServerPackageList = serverPackageList
      .filter((serverPackage) => packageFileName.startsWith(serverPackage.packageFileName))
      .sort((a, b) => compareSemVer(b.packageVersion, a.packageVersion)) // big version first
    const serverPackageVersion = (relatedServerPackageList[ 0 ] || {}).packageVersion
    statusList.push([
      packageName,
      packageVersion,
      serverPackageVersion,
      relatedServerPackageList.length,
      packageVersion === serverPackageVersion
    ])
  }

  log(`[PackageList]\n${indentLine(padTable({
    table: [ [ 'name', 'local', 'server', '#', 'match' ], ...statusList ],
    padFuncList: [ 'L', 'R', 'L', 'R', 'R' ]
  }))}`)
}

const uploadPackage = async ({
  packageList,
  urlFileUpload,
  urlPathAction, // TODO: strange url dependency
  timeout,
  authFetch,
  log
}) => {
  // first check if server file exist
  const { resultList: visibleList } = await pathAction({
    actionType: PATH_ACTION_TYPE.PATH_VISIBLE,
    key: '',
    nameList: packageList.map(({ serverPath }) => serverPath),
    urlPathAction,
    timeout,
    authFetch
  })

  for (let index = 0, indexMax = packageList.length; index < indexMax; index++) {
    const tag = `[PackageUpload|${index + 1}/${indexMax}]`
    const { packageName, packagePath, serverPath, localPath } = packageList[ index ]
    const { isVisible } = visibleList[ index ]

    if (isVisible) log(tag, `exist: ${packagePath}`)
    else {
      await fileUpload({ fileInputPath: localPath, key: serverPath, urlFileUpload, timeout, authFetch, log })
      log(tag, `done ${packageName}: ${packagePath}`)
    }
  }
}

const downloadPackage = async ({
  packageList,
  urlFileDownload,
  timeout,
  authFetch,
  log
}) => {
  for (let index = 0, indexMax = packageList.length; index < indexMax; index++) {
    const tag = `[PackageDownload|${index + 1}/${indexMax}]`
    const { packageName, packagePath, serverPath, localPath } = packageList[ index ]

    if (STAT_ERROR !== await getPathLstat(localPath)) log(tag, `exist: ${packagePath}`)
    else {
      const fileTempPath = `${localPath}_temp_${Date.now().toString(36)}`
      await fileDownload({ fileOutputPath: fileTempPath, key: serverPath, urlFileDownload, timeout, authFetch, log })
      await modifyRename(fileTempPath, localPath)
      log(tag, `done ${packageName}: ${packagePath}`)
    }
  }
}

export {
  loadPackageList,
  listPackage,
  uploadPackage,
  downloadPackage
}
