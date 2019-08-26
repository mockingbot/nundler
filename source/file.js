import { join } from 'path'

import { binary, padTable } from '@dr-js/core/module/common/format'
import { indentLine } from '@dr-js/core/module/common/string'
import { toPosixPath } from '@dr-js/core/module/node/file/Path'

import { PATH_ACTION_TYPE } from '@dr-js/node/module/module/PathAction'
import { pathAction, fileUpload, fileDownload } from '@dr-js/node/module/server/feature/Explorer/client'

const listFile = async ({
  listKeyPrefix = '',
  urlPathAction,
  timeout,
  authFetch,
  log
}) => {
  const { resultList: [ { key, fileList } ] } = await pathAction({
    actionType: PATH_ACTION_TYPE.DIRECTORY_ALL_FILE_LIST,
    key: listKeyPrefix,
    urlPathAction,
    timeout,
    authFetch
  })
  __DEV__ && console.log(`[listPackage]`, { listKeyPrefix, key, fileList })

  log(`[List] listKeyPrefix: ${listKeyPrefix}\n${indentLine(padTable({
    table: [
      [ 'mTime', 'size', 'key' ],
      ...fileList
        .sort(([ , , mTimeA ], [ , , mTimeB ]) => (mTimeB - mTimeA)) // newer first
        .map(([ name, size, mTimeMs ]) => [ new Date(mTimeMs).toISOString(), `${binary(size)}B`, toPosixPath(join(key, name)) ])
    ],
    padFuncList: [ 'L', 'R', 'L' ]
  }))}`)
}

const uploadFile = fileUpload

const downloadFile = fileDownload

export {
  listFile,
  uploadFile,
  downloadFile
}
