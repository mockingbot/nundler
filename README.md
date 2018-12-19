# nundler

[![i:npm]][l:npm]
[![i:size]][l:size]
[![i:lint]][l:lint]
[![i:npm-dev]][l:npm]

Not bundler

[i:npm]: https://img.shields.io/npm/v/nundler.svg?colorB=blue
[i:npm-dev]: https://img.shields.io/npm/v/nundler/dev.svg
[l:npm]: https://npm.im/nundler
[i:size]: https://packagephobia.now.sh/badge?p=nundler
[l:size]: https://packagephobia.now.sh/result?p=nundler
[i:lint]: https://img.shields.io/badge/code_style-standard_ES6+-yellow.svg
[l:lint]: https://standardjs.com

[//]: # (NON_PACKAGE_CONTENT)

- 📁 [source](source)
  - main source code
- 📁 [source-bin](source-bin)
  - bin source code
- 📁 [example](example)
  - example file for test
- 📄 [SPEC.md](SPEC.md)
  - list of all directly accessible codes, sort of an API lockfile


#### Test setup

build dev with watch:
```bash
npm run script-base
npm run build-library-dev
```

start test server:
```bash
npm run start-example-server
```

clear test: (optional)
```bash
npm run example-reset
```

run each test:
```bash
npm run test-list
npm run test-upload
npm run test-download
npm run test-package-download
```


## Concept

This package should provide 
a somewhat usable **private package setup**

This package can `upload/download` other npm package 
from self-hosted server

This package do not help pack package `.tgz`,
or do the package install

currently the command:
- list: 
  > list file on server
- upload: 
  > upload `.tgz` file to server with `key` (path)
- download:
  > download `.tgz` file from server with `key` (path)
- download + package-json:
  > download `.tgz` file from server,
  > according to dependency in `package.json`
  > select with specified `name-prefix`
  > should combine with `preinstall`

#### Common Setup

in order to install some private package on `npm install`

first add `package.json`
```json5
{
  "devDependencies": {
    // private package with local path
    "@nundler/local-aaa": "./.nundler-gitignore/nundler-local-aaa-0.0.0.tgz",
    "@nundler/local-bbb": "./.nundler-gitignore/nundler-local-bbb-1.1.1.tgz",
    "@nundler/local-ccc": "./.nundler-gitignore/nundler-local-ccc-2.2.2.tgz",

    // maybe have other normal npm public package
    "other-aaa": "^0.0.0",
    "other-bbb": "^1.1.1",
    "other-ccc": "^2.2.2",
  }
}
```

so to correctly install,
local package should exist at `./.nundler-gitignore/`

add to `preinstall`:
```bash
npx nundler\
  --download\
  --package-json ./package.json\
  --package-name-prefix "@nundler/local-"\
  --package-path-prefix "some/server/path/prefix"\
  --url-file-download "https://url/file/download"
  # or put all to --config ./nundler.config.json
```

now upload the required package to server
(assume download from `https://url/file/download`)

since we specified prefix `some/server/path/prefix`,
the file should be accessible with key:
```
some/server/path/prefix/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz
some/server/path/prefix/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz
some/server/path/prefix/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz
```

this setup is under `example/sample-package/`

run the test with:
```
# first
example-reset # reset example file

# then
start-example-server # start file server

# check under `sample-package`

test-package-download 

# check under `sample-package` again, should have `.nundler-gitignore/`
```

or check `npm test` for full test step output

#### Limitation

- require package to have some common `name-prefix`
- require edit `preinstall` script
- require use package `path` instead of `version` in `package.json`
