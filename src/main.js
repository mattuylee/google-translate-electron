const path = require('path');
const { BrowserWindow } = require('electron');
const { config } = require('./config');

function createMainWindow() {   
  const win = new BrowserWindow({
    width: config.mainWindowWidth,
    height: config.mainWindowHeight,
    icon: path.resolve(__dirname, './assets/icon.ico'),
    title: 'Google Translate',
    show: false,
    webPreferences: {
      nodeIntegration: false
    },
    useContentSize: true,
    autoHideMenuBar: true,
  });

  win.loadURL(config.url);
  win.webContents.on('dom-ready', () => {
    win.webContents.insertCSS(`
    /* 隐藏通知 */
    .notification-area {
      display: none !important;
    }
    /* 防止高度较小时出现双滚动条 */
    .frame {
      overflow: visible !important;
    }
    `);
    if (config.extraCssForMain) {
      win.webContents.insertCSS(config.extraCssForMain);
    }
  });
  return win;
}

function toggleMainWindowVisibility(window) {
  if (!window) { return; }
  if (window.isVisible()) {
    window.hide();
  }
  else {
    window.show();
    window.focus();
  }
}


module.exports = {
  createMainWindow,
  toggleMainWindowVisibility
}