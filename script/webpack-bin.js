import { resolve } from 'path'

import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack'
import { runMain } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({
    profileOutput: fromRoot('.temp-gitignore/profile-stat-bin.json'),
    logger
  })

  const config = getCommonWebpackConfig({
    isNodeEnv: true, isNodeBin: true,
    output: { path: fromOutput('bin'), filename: '[name].js' },
    entry: { 'index': 'source-bin/index' },
    resolve: { alias: { 'source-bin': fromRoot('source-bin') } },
    externals: { 'source': 'require("../library")' }
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, logger })
}, 'webpack-bin')
