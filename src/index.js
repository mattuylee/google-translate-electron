const { app, globalShortcut, BrowserWindow } = require('electron');
const { config } = require('./config');
const { createMainWindow } = require('./main');
const { createMiniWindow } = require('./mini');
const getMenu = require('./menu');
const {
  initialSetup,
  notify,
  dismissNotify,
  toggleMiniShortcut,
  toggleTrayIcon,
} = require('./tools');

/** @type BrowserWindow */
let mainWindow;
/** @type BrowserWindow */
let miniWindow;

// 保证单一实例
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.exit();
  return;
}
app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    mainWindow.show();
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
})

app.on('ready', () => {
  mainWindow = createMainWindow();
  miniWindow = createMiniWindow();
  initialSetup(mainWindow, miniWindow);
  mainWindow.on('close', ev => {
    if (config.minimizeToTrayWhenClose) {
      ev.preventDefault();
      mainWindow.hide();
    }
    else {
      app.quit();
    }
  });
  mainWindow.on('closed', () => {
    if (miniWindow) {
      dismissNotify();
      globalShortcut.unregisterAll();
      miniWindow.destroy();
    }
  });
  //主窗口隐藏时设置mini窗口的父窗口为主窗口，防止主窗口意外关闭但mini窗口还保留着导致程序残留在内存中
  mainWindow.on('hide', () => {
    if (miniWindow) {
      miniWindow.setParentWindow(mainWindow);
      miniWindow.setSkipTaskbar(false);
    }
  });
  //主窗口显示时如果mini窗口的父窗口是主窗口，mini窗口获得焦点时父窗口也会弹出来。。emm又没找到其他靠谱的方法
  mainWindow.on('show', () => {
    if (miniWindow) {
      miniWindow.setParentWindow(null);
      miniWindow.setSkipTaskbar(true);
    }
  });
  if (!config.minimizeToTrayWenStart) {
    mainWindow.show();
  }
  else {
    notify("Google Translate Electron已在后台运行。", null, {
      use: 'notification',
      clickCallback: () => mainWindow.show()
    });
  }
  toggleTrayIcon(config.skipTrayIcon);
  registerMiniWindow();
  const mainMenu = getMenu(mainWindow, miniWindow, mainWindow);
  mainWindow.setMenu(mainMenu);
});


function registerMiniWindow() {
  miniWindow.setParentWindow(mainWindow);
  const miniMenu = getMenu(mainWindow, miniWindow, miniWindow);
  miniWindow.setMenu(miniMenu);
  if (config.miniWindowEnabled) {
    toggleMiniShortcut(true);
  }
}

