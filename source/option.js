import { getOptionalFormatFlag } from 'dr-js/module/common/module/Option/preset'
import { ConfigPresetNode, prepareOption } from 'dr-js/module/node/module/Option'

const { SinglePath, SingleString, AllString, SingleInteger, BooleanFlag, Config } = ConfigPresetNode

const MODE_FORMAT_LIST = [ {
  ...BooleanFlag,
  name: 'list',
  shortName: 'L',
  extendFormatList: [
    { ...SingleString, name: 'url-path-action' },
    { ...SingleString, optional: true, name: 'list-key-prefix' }
  ]
}, {
  ...BooleanFlag,
  name: 'upload',
  shortName: 'U',
  extendFormatList: [
    { ...SingleString, name: 'url-file-upload' },
    { ...SinglePath, name: 'upload-file' },
    { ...SingleString, name: 'upload-key' }
  ]
}, {
  ...BooleanFlag,
  name: 'download',
  shortName: 'D',
  extendFormatList: [
    { ...SingleString, name: 'url-file-download' },
    { ...SinglePath, optional: true, name: 'download-file' },
    { ...SingleString, optional: true, name: 'download-key' },
    {
      ...SinglePath,
      optional: true,
      name: 'package-json',
      shortName: 'P',
      description: 'download package by config in specified "package.json"',
      extendFormatList: [
        { ...AllString, name: 'package-name-prefix', shortName: 'N', description: 'for select package in "package.json"' }, // TODO: support RegExp?
        { ...SingleString, optional: true, name: 'package-path-prefix', description: 'will append to package path' }
      ]
    }
  ]
} ]
const MODE_NAME_LIST = MODE_FORMAT_LIST.map(({ name }) => name)

const OPTION_CONFIG = {
  prefixENV: 'nundler',
  formatList: [
    Config,
    { ...BooleanFlag, name: 'help', shortName: 'h' },
    { ...BooleanFlag, name: 'version', shortName: 'v' },

    { ...SinglePath, optional: getOptionalFormatFlag(...MODE_NAME_LIST), name: 'file-auth' },
    { ...SingleInteger, optional: true, name: 'timeout' },

    ...MODE_FORMAT_LIST
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
