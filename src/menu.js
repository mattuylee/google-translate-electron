const { app, Menu } = require('electron');
const { toggleTrayIcon } = require('./tools');

function getMenu(/** @type Electron.BrowserWindow */mainWindow, miniWindow, current) {
  const template = [{
    label: "选项",
    submenu: Menu.buildFromTemplate([
      {
        label: "显示主界面",
        click: () => {
          if (!mainWindow) { return; }
          mainWindow.show();
          mainWindow.focus();
        }
      },
      {
        label: "显示MINI窗口",
        click: () => {
          if (!miniWindow) { return; }
          miniWindow.show();
          miniWindow.focus();
        }
      },
      {
        label: "打开调试控制台",
        click: () => current.webContents.openDevTools()
      },
      {
        label: "显示托盘图标",
        click: () => toggleTrayIcon()
      },
      {
        label: "退出程序",
        click: () => app.exit(0)
      }
    ])
  }];
  return Menu.buildFromTemplate(template);
}

module.exports = getMenu;