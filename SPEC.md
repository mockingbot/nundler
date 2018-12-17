# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/option.js](source/option.js)
  - `MODE_NAME_LIST`, `formatUsage`, `parseOption`
+ 📄 [source/feature/download.js](source/feature/download.js)
  - `download`, `downloadPackageAuto`
+ 📄 [source/feature/list.js](source/feature/list.js)
  - `list`
+ 📄 [source/feature/upload.js](source/feature/upload.js)
  - `upload`

#### Bin Option Format
📄 [source/option.js](source/option.js)
> ```
> CLI Usage:
>   --config -c [OPTIONAL] [ARGUMENT=1]
>       # from JSON: set to 'path/to/config.json'
>       # from ENV: set to 'env'
>   --help -h [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --version -v [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --file-auth [OPTIONAL-CHECK] [ARGUMENT=1]
>   --timeout [OPTIONAL] [ARGUMENT=1]
>   --list -L [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --url-path-action [OPTIONAL-CHECK] [ARGUMENT=1]
>     --list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>   --upload -U [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --url-file-upload [OPTIONAL-CHECK] [ARGUMENT=1]
>     --upload-file [OPTIONAL-CHECK] [ARGUMENT=1]
>     --upload-key [OPTIONAL-CHECK] [ARGUMENT=1]
>   --download -D [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --url-file-download [OPTIONAL-CHECK] [ARGUMENT=1]
>     --download-file [OPTIONAL-CHECK] [ARGUMENT=1]
>     --download-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --package-json -P [OPTIONAL-CHECK] [ARGUMENT=1]
>         download package by config in specified "package.json"
>       --package-name-prefix -N [OPTIONAL-CHECK] [ARGUMENT=1+]
>           for select package in "package.json"
>       --package-path-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>           will append to package path
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export NUNDLER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_FILE_AUTH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_TIMEOUT="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_LIST="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_PATH_ACTION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_LIST_KEY_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_UPLOAD="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_UPLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_DOWNLOAD="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_PACKAGE_JSON="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export NUNDLER_PACKAGE_NAME_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1+]"
>     export NUNDLER_PACKAGE_PATH_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> JSON Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "fileAuth": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "timeout": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "list": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlPathAction": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "listKeyPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "upload": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileUpload": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "download": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileDownload": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "downloadFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "downloadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "packageJson": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "packageNamePrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1+]" ],
>     "packagePathPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
