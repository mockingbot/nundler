import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { createDirectory } from 'dr-js/module/node/file/File'
import { modify } from 'dr-js/module/node/file/Modify'
import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'

const fromExample = (...args) => resolve(__dirname, ...args)

const SAMPLE_FILE_LIST = [
  [ '@nundler/local-aaa', './.nundler-gitignore/nundler-local-aaa-0.0.0.tgz' ],
  [ '@nundler/local-bbb', './.nundler-gitignore/nundler-local-bbb-1.1.1.tgz' ],
  [ '@nundler/local-ccc', './.nundler-gitignore/nundler-local-ccc-2.2.2.tgz' ]
]

runMain(async ({ padLog, log }) => {
  if (argvFlag('clear')) {
    padLog('clear example')

    log('clear server-root')
    await modify.delete(fromExample('server-root')).catch(() => {})

    log('clear sample-package')
    await modify.delete(fromExample('sample-package')).catch(() => {})
  }

  if (argvFlag('init')) {
    padLog('init example')

    log('init server-root')
    await createDirectory(fromExample('server-root/.nundler-gitignore'))
    for (const [ packageName, packagePath ] of SAMPLE_FILE_LIST) {
      writeFileSync(
        fromExample('server-root', packagePath),
        packageName
      )
    }

    log('init sample-package')
    await createDirectory(fromExample('sample-package'))
    writeFileSync(
      fromExample('sample-package/package.json'),
      JSON.stringify({
        private: true,
        devDependencies: SAMPLE_FILE_LIST.reduce((o, [ packageName, packagePath ]) => {
          o[ packageName ] = packagePath
          return o
        }, {})
      }, null, 2)
    )
  }
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
