const path = require('path');
const { BrowserWindow } = require('electron');
const { config } = require('./config');

function createMiniWindow () {
  let miniWindow = new BrowserWindow({
    width: 500,
    height: 315,
    minWidth: 500,
    minHeight: 315,
    maxWidth: 500,
    maxHeight: 315,
    icon: path.resolve(__dirname, './assets/icon.png'),
    webPreferences: {
      preload: path.resolve(__dirname, 'mini-preload.js'),
      nodeIntegration: false
    },
    title: "Google Translate Mini",
    autoHideMenuBar: true,
    show: false,
    minimizable: false,
    maximizable: true,
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: false,
  });
  miniWindow.on('focus', () => {
    miniWindow.setOpacity(1);
  });
  miniWindow.on('blur', () => {
    miniWindow.setOpacity(0.618);
  });
  miniWindow.on('close', ev => {
    ev.preventDefault();
    toggleMiniWindowVisibility(miniWindow);
  });

  miniWindow.loadURL(config.url);
  miniWindow.webContents.on('dom-ready', () => {
    miniWindow.webContents.insertCSS(`
    /* 隐藏通知，文本/文件切换栏 */
    .container .input-button-container,
    .notification-area {
      display: none !important;
    }
    /* mini窗口隐藏header和历史记录按钮和拼音 */
    header,
    body > c-wiz:first-of-type > div:first-of-type > div:first-of-type,
    .gp-footer,
    .tlid-source-transliteration-container.source-transliteration-container {
      display: none !important;
    }
    /* 防止高度较小时出现双滚动条 */
    .frame {
      overflow: visible !important;
    }
    /* 去除语言选择栏顶部边框 */
    .tlid-language-bar.ls-wrap {
      border-top: none;
    }
    /* 减小输入内容高度 */
    .tlid-copy-target {
      margin-bottom: 0;
    }
    /* 减小结果内容高度 */
    .result.tlid-copy-target {
      height: 72px;
      min-height: 72px;
    }
    /* 缩小语言选择栏高度 */
    a.ls-select.new-ls-select {
      line-height: 32px;
    }
    .tlid-language-bar.ls-wrap {
      height: 40px;
      overflow: hidden;
    }
    .swap-wrap {
      transform: translateY(-8px);
    }
    /* 取消结果栏聚焦时的外边框（一般来说不应该这样做） */
    .result-shield-container.tlid-copy-target {
      outline: none;
    }
    `);
    if (config.extraCssForMini) {
      miniWindow.insertCSS(config.extraCssForMini);
    }
  });
  let interval = config.keepActiveInterval | 0;
  if (miniWindow && interval !== 0) {
    interval = Math.max(1000, interval);
    setInterval(() => {
      if (!miniWindow.isVisible()) {
        miniWindow.webContents.send('random-input');
      }
    }, interval);
  }
  return miniWindow;
}

function toggleMiniWindowVisibility(miniWindow, mainWindow) {
  if (!miniWindow) { return; }
  if (miniWindow.isVisible()) {
    miniWindow.hide();
    clearInput(miniWindow);
  }
  else {
    miniWindow.show();
    clearInput(miniWindow);
    focusInput(miniWindow);
    miniWindow.focus();
  }
}

function clearInput(window) {
  window.webContents.send('clear-input');
}
function focusInput (window) {
  window.webContents.send('focus-input');
}

module.exports = {
  createMiniWindow,
  toggleMiniWindowVisibility
}
