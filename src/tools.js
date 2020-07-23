const { app, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { Menu, Tray, Notification, dialog } = require('electron');
const { config, flushConfig } = require('./config');
const { toggleMainWindowVisibility } = require('./main');
const { toggleMiniWindowVisibility } = require('./mini');


let mainWindow, miniWindow, tray, currentNotification;

function initialSetup(_mainWindow, _miniWindow) {
  mainWindow = _mainWindow;
  miniWindow = _miniWindow;
}
//启用/禁用mini窗口快捷键
function toggleMiniShortcut(initial) {
  let enabled = initial ? config.miniWindowEnabled : !config.miniWindowEnabled;
  let success = true;
  if (enabled) {
    if (!globalShortcut.register(config.miniShortcut, () => toggleMiniWindowVisibility(miniWindow, mainWindow))) {
      notify("快捷键注册失败，请检查设置的快捷键是否被其他软件占用。", "错误", {
        type: 'error'
      });
      success = false;
    }
  }
  else {
    globalShortcut.unregister(config.miniShortcut);
  }
  if (success) {
    config.miniWindowEnabled = enabled;
    if (!initial) {
      flushConfig();
    }
  }
  return enabled;
}

//切换是否自动启动
function toggleAutoStart(initial) {
  if (!initial) {
    config.autoStart = !config.autoStart;
  }
  app.setLoginItemSettings({
    openAtLogin: config.autoStart,
    path: process.execPath,
    openAsHidden: false,
    args: [
      '--autoStart'
    ]
  });
  if (config.autoStart) {
    notify("已允许Google Translate Electron在您登录时自动启动。", "提示");
  }
  else {
    notify("已禁止Google Translate Electron在您登录时自动启动。", "提示");
  }
  if (!initial) {
    flushConfig();
  }
  return config.autoStart;
}

function notify(message, title, ops) {
  const use = ops ? ops.use : 'auto';
  if (use === 'dialog' || (!Notification.isSupported() && use !== 'notification')) {
    let options = { message, title: title || "信息" };
    if (ops && ops.messageType) {
      options.type = ops.messageType;
    }
    dialog.showMessageBox(null, options);
    return;
  }
  if (currentNotification) {
    currentNotification.close();
  }
  let extName = process.platform === 'win32' ? 'ico' : 'png';
  currentNotification = new Notification({
    title: "Google Translate Electron",
    body: message,
    subtitle: ops && ops.subtitle,
    icon: path.resolve(__dirname, './assets/icon.' + extName)
  });
  currentNotification.show();
  if (ops && ops.clickCallback) {
    currentNotification.on('click', ops.clickCallback);
  }
}

function dismissNotify() {
  currentNotification && currentNotification.close();
}

function setupTrayIcon() {
  if (tray) { return; }
  let extName = process.platform === 'win32' ? 'ico' : 'png';
  tray = new Tray(path.resolve(__dirname, 'assets/icon.' + extName));
  const contextMenu = Menu.buildFromTemplate([
    { label: "显示主界面", click: () => toggleMainWindowVisibility(mainWindow) },
    { label: "显示Mini窗口", click: () => toggleMiniWindowVisibility(miniWindow, mainWindow) },
    {
      type: 'checkbox',
      label: "开机启动",
      checked: config.autoStart,
      click: menu => menu.checked = toggleAutoStart()
    },
    {
      type: 'checkbox',
      label: "启用MINI窗口快捷键",
      checked: config.miniWindowEnabled,
      click: menu => menu.checked = toggleMiniShortcut()
    },
    { label: "退出", click: () => app.exit() }
  ]);
  
  tray.setTitle("Google Translate Electron");
  tray.setToolTip("Google Translate Electron");
  tray.on('click', () => toggleMainWindowVisibility(mainWindow));
  tray.setContextMenu(contextMenu);
}
function destroyTrayIcon() {
  if (tray) {
    tray.destroy();
  }
  tray = null;
}
function toggleTrayIcon(show) {
  if (typeof show === 'boolean') {
    config.skipTrayIcon = show;
  }
  else {
    config.skipTrayIcon = !config.skipTrayIcon;
  }
  if (config.skipTrayIcon) {
    destroyTrayIcon();
  }
  else {
    setupTrayIcon();
  }
  flushConfig();
}


module.exports = {
  initialSetup,
  notify,
  dismissNotify,
  toggleTrayIcon,
  toggleAutoStart,
  toggleMiniShortcut,
}