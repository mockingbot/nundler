import { Preset, getOptionalFormatFlag, prepareOption } from 'dr-js/module/node/module/Option/preset'

const { Config, parseCompactList } = Preset

// TODO: split to `source-bin` and support script API call?

const MODE_FORMAT_LIST = parseCompactList(
  [ 'list,L/T|[FILE] list file on server\n[PACKAGE] list local/server package version, like "npm outdated"', parseCompactList(
    'url-path-action/SS',
    'list-key-prefix/SS,O|only for [FILE] mode'
  ) ],
  [ 'upload,U/T|[FILE] upload file to server\n[PACKAGE] upload package to server, skip server existing, need also set "url-path-action"', parseCompactList(
    'url-file-upload/SS',
    [ 'upload-key/SS,O|only for [FILE] mode', parseCompactList(
      'upload-file/SP'
    ) ]
  ) ],
  [ 'download,D/T|[FILE] download file from server\n[PACKAGE] download all package found in "package-json", skip local existing, good for npm "preinstall" script', parseCompactList(
    'url-file-download/SS',
    [ 'download-key/SS,O|only for [FILE] mode', parseCompactList(
      'download-file/SP'
    ) ]
  ) ]
)
const MODE_NAME_LIST = MODE_FORMAT_LIST.map(({ name }) => name)

const OPTION_CONFIG = {
  prefixENV: 'nundler',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'quiet,q/T|less log',
      'version,v/T|show version',
      'timeout/SI,O',

      [ 'auth-file/SP|path to auth file', { optional: getOptionalFormatFlag(...MODE_NAME_LIST) } ],
      'auth-key/SS,O|auth key, of not use default',

      [ 'package-json,P/SP,O|enable [PACKAGE] mode, pass the path of "package.json"', parseCompactList(
        'package-name-filter,N/A|pass RegExp or String(startsWith) to filter package in "package.json"',
        'package-path-prefix/SS,O|String will prefix server package key',
        'package-file/SP,O|package path for upload'
      ) ]
    ),
    ...MODE_FORMAT_LIST
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
