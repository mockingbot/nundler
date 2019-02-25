# Specification

* [Export Path](#export-path)
* [Export Tree](#export-tree)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/directory.js](source/directory.js)
  - `downloadDirectory`, `listDirectory`, `uploadDirectory`
+ 📄 [source/file.js](source/file.js)
  - `downloadFile`, `listFile`, `uploadFile`
+ 📄 [source/function.js](source/function.js)
  - `PATH_ACTION_TYPE`, `dispelMagicString`, `fileDownload`, `fileUpload`, `getAuthFetch`, `getGitBranch`, `getGitCommitHash`, `pathAction`, `tarCompress`, `tarExtract`
+ 📄 [source/package.js](source/package.js)
  - `downloadPackage`, `listPackage`, `loadPackageList`, `uploadPackage`

#### Export Tree
- `downloadDirectory`, `listDirectory`, `uploadDirectory`, `downloadFile`, `listFile`, `uploadFile`, `PATH_ACTION_TYPE`, `dispelMagicString`, `fileDownload`, `fileUpload`, `getAuthFetch`, `getGitBranch`, `getGitCommitHash`, `pathAction`, `tarCompress`, `tarExtract`, `downloadPackage`, `listPackage`, `loadPackageList`, `uploadPackage`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env"
>       from JS/JSON file: set to "path/to/config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --quiet --q -q [OPTIONAL] [ARGUMENT=0+]
>       less log
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --magic-key [OPTIONAL] [ARGUMENT=0+]
>       enable replace "{git-branch/git-commit-hash/timestamp/date-iso}" to current value in list/upload/download key name & directory-pack-info
>   --auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       path to auth file
>   --auth-key [OPTIONAL] [ARGUMENT=1]
>       auth key, of not use default
>   --timeout [OPTIONAL] [ARGUMENT=1]
>       set timeout, default to 0 (no timeout)
>   --package-json --P -P [OPTIONAL] [ARGUMENT=1+]
>       enable [PACKAGE] mode, pass the path of "package.json"
>     --package-name-filter --N -N [OPTIONAL-CHECK] [ARGUMENT=0+]
>         pass RegExp or String(startsWith) to filter package in "package.json"
>     --package-path-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>         String will prefix server package key
>   --directory --DIR [OPTIONAL] [ARGUMENT=0+]
>       enable [DIRECTORY] mode, pack directory as .tgz file in server, require "tar" command
>     --directory-pack-info [OPTIONAL-CHECK] [ARGUMENT=1+]
>         extra info to add to PACK_INFO for .tgz file, default to "{date-iso}"
>   --list --L -L [OPTIONAL] [ARGUMENT=0+]
>       [FILE] list path on server
>       [PACKAGE] list local/server package version, like "npm outdated"
>       [DIRECTORY] list path on server
>     --url-path-action [OPTIONAL-CHECK] [ARGUMENT=1]
>     --list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>         for [FILE/DIRECTORY] mode
>   --upload --U -U [OPTIONAL] [ARGUMENT=0+]
>       [FILE] upload file to server, overwrite
>       [PACKAGE] upload package to server, skip server existing, need also set "url-path-action"
>       [DIRECTORY] pack & upload directory to server, as .tgz file, overwrite
>     --url-file-upload [OPTIONAL-CHECK] [ARGUMENT=1]
>     --upload-key [OPTIONAL-CHECK] [ARGUMENT=1]
>         for [FILE/DIRECTORY] mode, recommend use .tgz for directory pack
>       --upload-file [OPTIONAL-CHECK] [ARGUMENT=1]
>           for [FILE] mode
>       --upload-directory [OPTIONAL-CHECK] [ARGUMENT=1]
>           for [DIRECTORY] mode
>   --download --D -D [OPTIONAL] [ARGUMENT=0+]
>       [FILE] download file from server
>       [PACKAGE] download all package found in "package-json", skip local existing, good for npm "preinstall" script
>       [DIRECTORY] download & unpack directory from server
>     --url-file-download [OPTIONAL-CHECK] [ARGUMENT=1]
>     --download-key [OPTIONAL-CHECK] [ARGUMENT=1]
>         for [FILE/DIRECTORY] mode, recommend use .tgz for directory pack
>       --download-file [OPTIONAL-CHECK] [ARGUMENT=1]
>           for [FILE] mode
>       --download-directory [OPTIONAL-CHECK] [ARGUMENT=1]
>           for [DIRECTORY] mode
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export NUNDLER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_QUIET="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_MAGIC_KEY="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_AUTH_KEY="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_TIMEOUT="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_PACKAGE_JSON="[OPTIONAL] [ARGUMENT=1+]"
>     export NUNDLER_PACKAGE_NAME_FILTER="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export NUNDLER_PACKAGE_PATH_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DIRECTORY="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_DIRECTORY_PACK_INFO="[OPTIONAL-CHECK] [ARGUMENT=1+]"
>     export NUNDLER_LIST="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_PATH_ACTION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_LIST_KEY_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_UPLOAD="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD_DIRECTORY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_DOWNLOAD="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_DIRECTORY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "magicKey": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "authFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authKey": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "timeout": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "packageJson": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "packageNameFilter": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "packagePathPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "directory": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "directoryPackInfo": [ "[OPTIONAL-CHECK] [ARGUMENT=1+]" ],
>     "list": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlPathAction": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "listKeyPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "upload": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileUpload": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadDirectory": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "download": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileDownload": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "downloadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "downloadFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "downloadDirectory": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
