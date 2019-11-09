# nundler

[![i:npm]][l:npm]
[![i:ci]][l:ci]
[![i:size]][l:size]
[![i:npm-dev]][l:npm]

Not bundler

[i:npm]: https://img.shields.io/npm/v/nundler?colorB=blue
[i:npm-dev]: https://img.shields.io/npm/v/nundler/dev
[l:npm]: https://npm.im/nundler
[i:ci]: https://img.shields.io/github/workflow/status/mockingbot/nundler/ci-test
[l:ci]: https://github.com/mockingbot/nundler/actions?query=workflow:ci-test
[i:size]: https://packagephobia.now.sh/badge?p=nundler
[l:size]: https://packagephobia.now.sh/result?p=nundler

[//]: # (NON_PACKAGE_CONTENT)

- 📁 [source/](source/)
  - main source code
- 📁 [source-bin/](source-bin/)
  - bin source code
- 📁 [example/](example/)
  - example file for test
- 📄 [SPEC.md](SPEC.md)
  - list of all directly accessible codes, sort of an API lockfile


#### Test example setup

build dev with watch:
```shell script
npm run script-pack
npm run build-library-dev
npm run build-bin-dev
```

start example server:
```shell script
npm run example-start-server
```

clear up example file: (optional)
```shell script
npm run example-reset
```

run each example:
```shell script
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

This package should provide a somewhat usable **private package setup**

This package can `list/upload/download` other npm package 
from self-hosted server with home-made auth check

This package do not help pack package `.tgz`,
or run the actual package install


#### Common Setup

For this **private package setup** to work with `npm install`,
some change & config is required.

First edit `package.json`:
```json5
{
  "devDependencies": {
    // New private package, with a local path
    "@nundler/local-aaa": "./.nundler-gitignore/nundler-local-aaa-0.0.0.tgz",
    "@nundler/local-bbb": "./.nundler-gitignore/nundler-local-bbb-1.1.1.tgz",
    "@nundler/local-ccc": "./.nundler-gitignore/nundler-local-ccc-2.2.2.tgz",

    // Other normal npm public package
    "other-aaa": "^0.0.0",
    "other-bbb": "^1.1.1",
    "other-ccc": "^2.2.2",
  }
}
```

Then, for this to correctly install,
those private package should exist under local path: `./.nundler-gitignore/`

To pull those packages before the install start,
add `nundler` to `preinstall`:
```shell script
npx nundler\
  --download\
  --package-json ./package.json\
  --package-name-filter "@nundler/local-"\
  --package-path-prefix "some/server/path/prefix"\
  --url-file-download "https://url/file/download"\
  --auth-file "./path/to/auth/file"
  # or put all to `--config ./nundler.config.json` for a cleaner script
```

Now upload the required package to server, if it's not done already
(assume download from `https://url/file/download`)

With the specified prefix `some/server/path/prefix`,
the file should be accessible from the server with options like:
```
https://url/file/download?file=some/server/path/prefix/.nundler-gitignore/nundler-local-aaa-0.0.0.tgz
https://url/file/download?file=some/server/path/prefix/.nundler-gitignore/nundler-local-bbb-1.1.1.tgz
https://url/file/download?file=some/server/path/prefix/.nundler-gitignore/nundler-local-ccc-2.2.2.tgz
```

Similar example setup can be found in `example/sample-package/`

Test with:
```shell script
npm run example-reset # reset example file
npm run example-start-server # start file server

# check under `example/sample-package-gitignore/` first,
# should only have single file: `package.json`

npm run example-package-download # pull private packages from server

# now should have `.tgz` file for private packages,
# in `example/sample-package-gitignore/.nundler-gitignore/`
```


#### Limitation

- require edit `preinstall` script
- require use `path` instead of `version` to specify package in `package.json`


#### 7zip install

should be able to run `7z@>=16.00`

- Windows: [download](https://www.7-zip.org/), install & add to PATH
- Ubuntu/Debian: `sudo apt install p7zip-full` or dpkg + deb: [p7zip-full](https://packages.debian.org/sid/p7zip-full) [p7zip](https://packages.debian.org/sid/p7zip)
- Fedora: `sudo yum install p7zip p7zip-plugins`
- OSX: `HOMEBREW_NO_AUTO_UPDATE=1 brew install p7zip`
