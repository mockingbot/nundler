import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { createDirectory } from 'dr-js/module/node/file/Directory'
import { modifyCopy, modifyDeleteForce } from 'dr-js/module/node/file/Modify'

import { argvFlag, runMain } from 'dr-dev/module/main'

const fromExample = (...args) => resolve(__dirname, ...args)

const SAMPLE_FILE_LIST = [
  [ '@nundler/local-aaa', './.nundler-gitignore/nundler-local-aaa-0.0.2.tgz' ], // extra file for version check
  [ '@nundler/local-aaa', './.nundler-gitignore/nundler-local-aaa-0.0.1.tgz' ], // extra file for version check
  [ '@nundler/local-aaa', './.nundler-gitignore/nundler-local-aaa-0.0.0.tgz' ],
  [ '@nundler/local-bbb', './.nundler-gitignore/nundler-local-bbb-1.1.1.tgz' ],
  [ '@nundler/local-ccc', './.nundler-gitignore/nundler-local-ccc-2.2.2.tgz' ]
]

runMain(async ({ padLog, log }) => {
  if (argvFlag('clear')) {
    padLog('clear example')

    log('clear server-root-gitignore')
    await modifyDeleteForce(fromExample('server-root-gitignore'))

    log('clear sample-package-gitignore')
    await modifyDeleteForce(fromExample('sample-package-gitignore'))

    log('clear sample-directory-gitignore')
    await modifyDeleteForce(fromExample('sample-directory-gitignore'))

    log('clear sample-gz-directory-gitignore')
    await modifyDeleteForce(fromExample('sample-gz-directory-gitignore'))

    log('clear sample-7z-directory-gitignore')
    await modifyDeleteForce(fromExample('sample-7z-directory-gitignore'))
  }

  if (argvFlag('init')) {
    padLog('init example')

    log('init server-root-gitignore')
    await createDirectory(fromExample('server-root-gitignore/.nundler-gitignore'))
    for (const [ packageName, packagePath ] of SAMPLE_FILE_LIST) {
      writeFileSync(
        fromExample('server-root-gitignore', packagePath),
        packageName
      )
    }

    log('init sample-package-gitignore')
    await createDirectory(fromExample('sample-package-gitignore'))
    writeFileSync(
      fromExample('sample-package-gitignore/package.json'),
      JSON.stringify({
        private: true,
        devDependencies: SAMPLE_FILE_LIST.reduce((o, [ packageName, packagePath ]) => {
          o[ packageName ] = packagePath
          return o
        }, {})
      }, null, 2)
    )

    log('init sample-directory-gitignore')
    await modifyCopy(
      fromExample('sample-package-gitignore'),
      fromExample('sample-directory-gitignore')
    )

    log('init sample-gz-directory-gitignore')
    await modifyCopy(
      fromExample('sample-package-gitignore'),
      fromExample('sample-gz-directory-gitignore')
    )
    await modifyCopy(
      fromExample('sample-gz-directory-gitignore/package.json'),
      fromExample('sample-gz-directory-gitignore/package.json.gz') // fake gz file
    )

    log('init sample-7z-directory-gitignore')
    await modifyCopy(
      fromExample('sample-gz-directory-gitignore'),
      fromExample('sample-7z-directory-gitignore')
    )
  }
})
