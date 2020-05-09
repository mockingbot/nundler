import { Preset, prepareOption } from '@dr-js/core/module/node/module/Option/preset'
import { generateMarkMap } from './function'

const { Config, parseCompactList } = Preset

const FILE_PACK_INFO = 'PACK_INFO'
const FILE_PACK_TRIM_GZ = 'PACK_TRIM_GZ'

const FILE_DIRECTORY_KEY_DESCRIPTION = 'for [FILE/DIRECTORY] mode, recommend use ".tgz/.7z" for directory pack'

const getDescription = (fileDesc, packageDesc, directoryDesc = fileDesc) => `[FILE] ${fileDesc}\n[PACKAGE] ${packageDesc}\n[DIRECTORY] ${directoryDesc}`

const MODE_FORMAT_LIST = parseCompactList(
  [ `list,L/T|${getDescription(
    'list path on server',
    'list local/server package version, like "npm outdated"'
  )}`, parseCompactList(
    'url-path-action/SS',
    'list-key-prefix/SS,O|for [FILE/DIRECTORY] mode'
  ) ],
  [ `upload,U/T|${getDescription(
    'upload file to server, overwrite',
    'upload package to server, skip server existing, need also set "url-path-action"',
    'pack & upload directory to server, as ".tgz/.7z" file, overwrite'
  )}`, parseCompactList(
    'url-file-upload/SS',
    [ `upload-key/SS,O|${FILE_DIRECTORY_KEY_DESCRIPTION}`, parseCompactList(
      'upload-file/SP,O|for [FILE] mode',
      'upload-directory/SP,O|for [DIRECTORY] mode'
    ) ]
  ) ],
  [ `download,D/T|${getDescription(
    'download file from server',
    'download all package found in "package-json", skip local existing, good for npm "preinstall" script',
    'download & unpack directory from server'
  )}`, parseCompactList(
    'url-file-download/SS',
    [ `download-key/SS,O|${FILE_DIRECTORY_KEY_DESCRIPTION}`, parseCompactList(
      'download-file/SP,O|for [FILE] mode',
      'download-directory/SP,O|for [DIRECTORY] mode'
    ) ]
  ) ],
  'package-trim-local,ptl/SP,O|for [PACKAGE] mode, delete unused local ".tgz" under specified path and exit. NOTE: use the most exact path, or more file than expected may lost',
  'ping-host,ph/T|ping "url-host-list", print fastest host and exit',
  'ping-host-stat,phs/T|ping "url-host-list", print stat and exit'
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

      `keep-mark/T,O|do not replace mark in list/upload/download key name, directory-pack-info & url-*:\n  "{${Object.keys(generateMarkMap()).join('|')}}"`,
      'url-host-list,uhl/AS,O|tcp ping test for the fastest host and replace "{url-host}" in url-* option',

      [ 'auth-file/SP,O|path to auth file' ],
      'auth-key/SS,O|auth key, of not use default',
      'timeout/SI,O|set timeout, default to 0 (no timeout)',

      [ 'package-json,P/AP,O|enable [PACKAGE] mode, pass the path of "package.json"', parseCompactList(
        'package-name-filter,N/A|pass RegExp or String(startsWith) to filter package in "package.json"',
        'package-path-prefix/SS,O|String will prefix server package key'
      ) ],

      [ 'directory,DIR/T,O|enable [DIRECTORY] mode, pack directory as ".tgz/.7z" file in server, require "tar" command', parseCompactList(
        `directory-pack-info/AS,O|extra info to add to ${FILE_PACK_INFO} for ".tgz/.7z" file, default to "{time-iso}"`,
        `trim-gz/T,O|delete ".gz" file with source on upload, re-generate ".gz" file on download, will generate ${FILE_PACK_TRIM_GZ} file`,
        'use-7z/T,O|use ".7z" instead of ".tgz" for better file pack , require "7z@>=16.00" command'
      ) ]
    ),
    ...MODE_FORMAT_LIST
  ]
}
const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { FILE_PACK_INFO, FILE_PACK_TRIM_GZ, MODE_NAME_LIST, parseOption, formatUsage }
