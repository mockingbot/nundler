import { join } from 'path'
import { binary, stringIndentLine, padTable } from 'dr-js/module/common/format'
import { toPosixPath } from 'dr-js/module/node/file/function'
import { pathAction } from 'dr-server/module/featureNode/explorer'

const list = async ({
  listKeyPrefix = '',
  urlPathAction,
  fileAuth,
  timeout,
  log
}) => {
  const { resultList: [ { relativeFrom, fileList } ] } = await pathAction({
    actionType: 'list-file-recursive',
    key: listKeyPrefix,
    urlPathAction,
    fileAuth,
    timeout
  })
  __DEV__ && console.log(`[listPackage]`, { listKeyPrefix, relativeFrom, fileList })

  log(`[List] listKeyPrefix '${listKeyPrefix}'\n${stringIndentLine(padTable({
    table: [
      [ 'mTime', 'size', 'key' ],
      ...fileList
        .sort(([ , , mTimeA ], [ , , mTimeB ]) => (mTimeB - mTimeA)) // bigger time first
        .map(([ name, size, mTimeMs ]) => [ new Date(mTimeMs).toISOString(), `${binary(size)}B`, toPosixPath(join(relativeFrom, name)) ])
    ],
    padFuncList: [ 'L', 'R', 'L' ]
  }), '  ')}\n`)
}

export { list }
