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


#### Test example setup

build dev with watch:
```bash
npm run script-base
npm run build-library-dev
npm run build-bin-dev
```

start example server:
```bash
npm run example-start-server
```

clear up example file: (optional)
```bash
npm run example-reset
```

run each example:
```bash
npm run example-file-list
npm run example-file-upload
npm run example-file-download
npm run example-package-list
npm run example-package-upload
npm run example-package-download
npm run example-directory-list
npm run example-directory-upload
npm run example-directory-download
```

or run `npm test` for full build & test

## Concept

This package should provide 
a somewhat usable **private package setup**

This package can `list/upload/download` other npm package 
from self-hosted server
with home-made auth check

This package do not help pack package `.tgz`,
or run the actual package install

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
  --package-name-filter "@nundler/local-"\
  --package-path-prefix "some/server/path/prefix"\
  --url-file-download "https://url/file/download"\
  --auth-file "./path/to/auth/file"
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

similar example setup is under `example/sample-package/`

test with:
```
# first
npm run example-reset # reset example file

# then
npm run example-start-server # start file server

# check under `example/sample-package` first, should only have `package.json`

npm run example-package-download 

# now should have `.tgz` file in `example/sample-package/.nundler-gitignore/`
```

#### Limitation

- require edit `preinstall` script
- require use package `path` instead of `version` in `package.json`
