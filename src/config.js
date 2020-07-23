const fs = require('fs');
const { promisify } = require('util');
const { debounce } = require('lodash');

const config = {
  mainWindowWidth: 1024,
  mainWindowHeight: 586,
  url: 'https://translate.google.cn/',
  autoStart: false,
  miniWindowEnabled: true,
  miniShortcut: 'CmdOrCtrl+Alt+M',
  extraCssForMain: '',
  extraCssForMini: '',
  minimizeToTrayWhenClose: true,
  minimizeToTrayWenStart: true,
  keepActiveInterval: 60000,
  skipTrayIcon: false
};

try {
  let userConfig = fs.readFileSync('./config.json');
  if (userConfig) {
    Object.assign(config, JSON.parse(userConfig.toString()));
  }
}
catch { }

async function flushConfig() {
  const flush = promisify(fs.writeFile.bind(fs));
  try {
    await flush('./config.json', JSON.stringify(config, null, 4));
  }
  catch {
    const { notify } = require('./tools');
    notify("保存配置失败。", { messageType: 'error' });
  }
}

module.exports = {
  config,
  flushConfig: debounce(flushConfig, 1000, { trailing: true })
};
