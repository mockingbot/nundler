# Specification

* [Export Path](#export-path)
* [Export Tree](#export-tree)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/directory.js](source/directory.js)
  - `downloadDirectory`, `uploadDirectory`
+ 📄 [source/file.js](source/file.js)
  - `downloadFile`, `listFile`, `uploadFile`
+ 📄 [source/package.js](source/package.js)
  - `downloadPackage`, `listPackage`, `loadPackageList`, `uploadPackage`

#### Export Tree
- `downloadDirectory`, `uploadDirectory`, `downloadFile`, `listFile`, `uploadFile`, `downloadPackage`, `listPackage`, `loadPackageList`, `uploadPackage`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env" to enable, not using be default
>       from JS/JSON file: set to "path/to/file.config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --quiet --q -q [OPTIONAL] [ARGUMENT=0+]
>       less log
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --keep-mark [OPTIONAL] [ARGUMENT=0+]
>       do not replace mark in list/upload/download key name, directory-pack-info & url-*:
>         "{timestamp|time-iso|date-iso|time-b36|time-base36|random|git-branch|git-commit-hash}"
>   --url-host-list --uhl [OPTIONAL] [ARGUMENT=1+]
>       tcp ping test for the fastest host and replace "{url-host}" in url-* option
>   --auth-file [OPTIONAL] [ARGUMENT=1]
>       path to auth file
>   --auth-key [OPTIONAL] [ARGUMENT=1]
>       auth key, of not use default
>   --timeout [OPTIONAL] [ARGUMENT=1]
>       set timeout, default to 0 (no timeout)
>   --package-json --P -P [OPTIONAL] [ARGUMENT=1+]
>       enable [PACKAGE] mode, pass the path of "package.json"
>     --package-name-filter --N -N [ARGUMENT=0+]
>         pass RegExp or String(startsWith) to filter package in "package.json"
>     --package-path-prefix [ARGUMENT=1]
>         String will prefix server package key
>   --directory --DIR [OPTIONAL] [ARGUMENT=0+]
>       enable [DIRECTORY] mode, pack directory as ".tgz/.7z" file in server, require "tar" command
>     --directory-pack-info [ARGUMENT=1+]
>         extra info to add to PACK_INFO for ".tgz/.7z" file, default to "{time-iso}"
>     --trim-gz [ARGUMENT=0+]
>         delete ".gz" file with source on upload, re-generate ".gz" file on download, will generate PACK_TRIM_GZ file
>     --use-7z [ARGUMENT=0+]
>         use ".7z" instead of ".tgz" for better file pack , require "7z@>=16.00" command
>   --list --L -L [OPTIONAL] [ARGUMENT=0+]
>       [FILE] list path on server
>       [PACKAGE] list local/server package version, like "npm outdated"
>       [DIRECTORY] list path on server
>     --url-path-action [ARGUMENT=1]
>     --list-key-prefix [ARGUMENT=1]
>         for [FILE/DIRECTORY] mode
>   --upload --U -U [OPTIONAL] [ARGUMENT=0+]
>       [FILE] upload file to server, overwrite
>       [PACKAGE] upload package to server, skip server existing, need also set "url-path-action"
>       [DIRECTORY] pack & upload directory to server, as ".tgz/.7z" file, overwrite
>     --url-file-upload [ARGUMENT=1]
>     --upload-key [ARGUMENT=1]
>         for [FILE/DIRECTORY] mode, recommend use ".tgz/.7z" for directory pack
>       --upload-file [ARGUMENT=1]
>           for [FILE] mode
>       --upload-directory [ARGUMENT=1]
>           for [DIRECTORY] mode
>   --download --D -D [OPTIONAL] [ARGUMENT=0+]
>       [FILE] download file from server
>       [PACKAGE] download all package found in "package-json", skip local existing, good for npm "preinstall" script
>       [DIRECTORY] download & unpack directory from server
>     --url-file-download [ARGUMENT=1]
>     --download-key [ARGUMENT=1]
>         for [FILE/DIRECTORY] mode, recommend use ".tgz/.7z" for directory pack
>       --download-file [ARGUMENT=1]
>           for [FILE] mode
>       --download-directory [ARGUMENT=1]
>           for [DIRECTORY] mode
>   --ping-host --ph [OPTIONAL] [ARGUMENT=0+]
>       ping "url-host-list", print fastest host and exit
>   --ping-host-stat --phs [OPTIONAL] [ARGUMENT=0+]
>       ping "url-host-list", print stat and exit
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export NUNDLER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_QUIET="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_KEEP_MARK="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_HOST_LIST="[OPTIONAL] [ARGUMENT=1+]"
>     export NUNDLER_AUTH_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_AUTH_KEY="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_TIMEOUT="[OPTIONAL] [ARGUMENT=1]"
>     export NUNDLER_PACKAGE_JSON="[OPTIONAL] [ARGUMENT=1+]"
>     export NUNDLER_PACKAGE_NAME_FILTER="[ARGUMENT=0+]"
>     export NUNDLER_PACKAGE_PATH_PREFIX="[ARGUMENT=1]"
>     export NUNDLER_DIRECTORY="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_DIRECTORY_PACK_INFO="[ARGUMENT=1+]"
>     export NUNDLER_TRIM_GZ="[ARGUMENT=0+]"
>     export NUNDLER_USE_7Z="[ARGUMENT=0+]"
>     export NUNDLER_LIST="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_PATH_ACTION="[ARGUMENT=1]"
>     export NUNDLER_LIST_KEY_PREFIX="[ARGUMENT=1]"
>     export NUNDLER_UPLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_UPLOAD="[ARGUMENT=1]"
>     export NUNDLER_UPLOAD_KEY="[ARGUMENT=1]"
>     export NUNDLER_UPLOAD_FILE="[ARGUMENT=1]"
>     export NUNDLER_UPLOAD_DIRECTORY="[ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_URL_FILE_DOWNLOAD="[ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_KEY="[ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_FILE="[ARGUMENT=1]"
>     export NUNDLER_DOWNLOAD_DIRECTORY="[ARGUMENT=1]"
>     export NUNDLER_PING_HOST="[OPTIONAL] [ARGUMENT=0+]"
>     export NUNDLER_PING_HOST_STAT="[OPTIONAL] [ARGUMENT=0+]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "keepMark": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlHostList": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "authFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "authKey": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "timeout": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "packageJson": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "packageNameFilter": [ "[ARGUMENT=0+]" ],
>     "packagePathPrefix": [ "[ARGUMENT=1]" ],
>     "directory": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "directoryPackInfo": [ "[ARGUMENT=1+]" ],
>     "trimGz": [ "[ARGUMENT=0+]" ],
>     "use7z": [ "[ARGUMENT=0+]" ],
>     "list": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlPathAction": [ "[ARGUMENT=1]" ],
>     "listKeyPrefix": [ "[ARGUMENT=1]" ],
>     "upload": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileUpload": [ "[ARGUMENT=1]" ],
>     "uploadKey": [ "[ARGUMENT=1]" ],
>     "uploadFile": [ "[ARGUMENT=1]" ],
>     "uploadDirectory": [ "[ARGUMENT=1]" ],
>     "download": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "urlFileDownload": [ "[ARGUMENT=1]" ],
>     "downloadKey": [ "[ARGUMENT=1]" ],
>     "downloadFile": [ "[ARGUMENT=1]" ],
>     "downloadDirectory": [ "[ARGUMENT=1]" ],
>     "pingHost": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pingHostStat": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>   }
> ```
