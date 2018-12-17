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
