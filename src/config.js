const fs = require('fs');
const path = require('path');
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

let configPath = path.resolve(path.dirname(process.execPath), 'config.json');
try {
  let userConfig = fs.readFileSync(configPath);
  if (userConfig) {
    Object.assign(config, JSON.parse(userConfig.toString()));
  }
}
catch { }

async function flushConfig() {
  const flush = promisify(fs.writeFile.bind(fs));
  try {
    await flush(configPath, JSON.stringify(config, null, 4));
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
