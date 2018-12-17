import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { stringIndentLine } from 'dr-js/module/common/format'

import { runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'
import { collectSourceRouteMap } from 'dr-dev/module/ExportIndex/parseExport'
import { generateExportInfo } from 'dr-dev/module/ExportIndex/generateInfo'
import { autoAppendMarkdownHeaderLink, renderMarkdownFileLink, renderMarkdownExportPath } from 'dr-dev/module/ExportIndex/renderMarkdown'

import { formatUsage } from 'source/option'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownBinOptionFormat = () => [
  renderMarkdownFileLink('source/option.js'),
  '> ```',
  stringIndentLine(formatUsage(), '> '),
  '> ```'
]

runMain(async (logger) => {
  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ pathRootList: [ fromRoot('source') ], logger })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...autoAppendMarkdownHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      '',
      '#### Bin Option Format',
      ...renderMarkdownBinOptionFormat()
    ),
    ''
  ].join('\n'))
}, getLogger('generate-export'))
