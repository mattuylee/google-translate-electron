const { Menu } = require('electron');

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
        label: "退出",
        role: 'quit'
      }
    ])
  }];
  return Menu.buildFromTemplate(template);
}

module.exports = getMenu;