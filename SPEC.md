# Specification

* [Export Path](#export-path)
* [Export Tree](#export-tree)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/file.js](source/file.js)
  - `downloadFile`, `listFile`, `uploadFile`
+ 📄 [source/function.js](source/function.js)
  - `PATH_ACTION_TYPE`, `fileDownload`, `fileUpload`, `getAuthFetch`, `pathAction`
+ 📄 [source/package.js](source/package.js)
  - `downloadPackage`, `listPackage`, `loadPackageList`, `uploadPackage`

#### Export Tree
- `downloadFile`, `listFile`, `uploadFile`, `PATH_ACTION_TYPE`, `fileDownload`, `fileUpload`, `getAuthFetch`, `pathAction`, `downloadPackage`, `listPackage`, `loadPackageList`, `uploadPackage`

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
>   --timeout [OPTIONAL] [ARGUMENT=1]
>   --auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       path to auth file
>   --auth-key [OPTIONAL] [ARGUMENT=1]
>       auth key, of not use default
>   --package-json --P -P [OPTIONAL] [ARGUMENT=1+]
>       enable [PACKAGE] mode, pass the path of "package.json"
>     --package-name-filter --N -N [OPTIONAL-CHECK] [ARGUMENT=0+]
>         pass RegExp or String(startsWith) to filter package in "package.json"
>     --package-path-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>         String will prefix server package key
>   --list --L -L [OPTIONAL] [ARGUMENT=0+]
>       [FILE] list file on server
>       [PACKAGE] list local/server package version, like "npm outdated"
>     --url-path-action [OPTIONAL-CHECK] [ARGUMENT=1]
>     --list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>         only for [FILE] mode
>   --upload --U -U [OPTIONAL] [ARGUMENT=0+]
>       [FILE] upload file to server
>       [PACKAGE] upload package to server, skip server existing, need also set "url-path-action"
>     --url-file-upload [OPTIONAL-CHECK] [ARGUMENT=1]
>     --upload-key [OPTIONAL-CHECK] [ARGUMENT=1]
>         only for [FILE] mode
>       --upload-file [OPTIONAL-CHECK] [ARGUMENT=1]
>   --download --D -D [OPTIONAL] [ARGUMENT=0+]
>       [FILE] download file from server
>       [PACKAGE] download all package found in "package-json", skip local existing, good for npm "preinstall" script
>     --url-file-download [OPTIONAL-CHECK] [ARGUMENT=1]
>     --download-key [OPTIONAL-CHECK] [ARGUMENT=1]
>         only for [FILE] mode
>       --download-file [OPTIONAL-CHECK] [ARGUMENT=1]
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export NUNDLER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_QUIET="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_TIMEOUT="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_AUTH_KEY="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_PACKAGE_JSON="[OPTIONAL] [ARGUMENT=1+]"
>     export NUNDLER_PACKAGE_NAME_FILTER="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export NUNDLER_PACKAGE_PATH_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_LIST="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_PATH_ACTION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_LIST_KEY_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_UPLOAD="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_DOWNLOAD="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "timeout": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "authFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authKey": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "packageJson": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "packageNameFilter": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "packagePathPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "list": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlPathAction": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "listKeyPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "upload": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileUpload": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "download": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileDownload": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "downloadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "downloadFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
