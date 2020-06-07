const path = require('path');
const { app, globalShortcut, BrowserWindow, Menu, Tray } = require('electron');
const createMiniWindow = require('./mini');
const createMainWindow = require('./main');
const getMenu = require('./menu');
const { config, flushConfig } = require('./config');
const toast = require('./notify');

//将tray保存到全局变量，防止其被自动回收
let tray;

/** @type BrowserWindow */
let mainWindow;
/** @type BrowserWindow */
let miniWindow;

app.on('ready', () => {
  setupTray();
  toggleAutoStart(true);

  mainWindow = createMainWindow();
  mainWindow.on('close', ev => {
    if (config.minimizeToTrayWhenClose) {
      ev.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('closed', () => {
    if (miniWindow) {
      toast.dismiss();
      globalShortcut.unregisterAll();
      miniWindow.destroy();
    }
  });
  //主窗口隐藏时设置mini窗口的父窗口为主窗口，防止主窗口意外关闭但mini窗口还保留着导致程序残留在内存中
  mainWindow.on('hide', () => {
    if (miniWindow) {
      miniWindow.setParentWindow(mainWindow);
    }
  });
  //主窗口显示时如果mini窗口的父窗口是主窗口，mini窗口获得焦点时父窗口也会弹出来。。emm又没找到其他靠谱的方法
  mainWindow.on('show', () => {
    if (miniWindow) {
      miniWindow.setParentWindow(null);
    }
  });
  if (!config.minimizeToTrayWenStart) {
    mainWindow.show();
  }
  else {
    toast.show("Google Translate Desktop已在后台运行。", null, {
      use: 'notification',
      clickCallback: () => mainWindow.show()
    });
  }
  registerMiniWindow();
  const mainMenu = getMenu(mainWindow, miniWindow, mainWindow);
  mainWindow.setMenu(mainMenu);
});

function registerMiniWindow() {
  // if (!config.miniWindowEnabled) {
  //   return;
  // }
  miniWindow = createMiniWindow();  
  miniWindow.setParentWindow(mainWindow);
  const miniMenu = getMenu(mainWindow, miniWindow, miniWindow);
  miniWindow.setMenu(miniMenu);
  if (config.miniWindowEnabled) {
    toggleMiniShortcut(true);
  }
}

function setupTray() {
  tray = new Tray(path.resolve(__dirname, 'assets/icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: "显示主界面", click: () => toggleMainWindowVisibility() },
    { label: "显示Mini窗口", click: () => toggleMiniWindowVisibility() },
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
  tray.setToolTip("Google Translate Desktop");
  tray.on('click', () => toggleMainWindowVisibility());
  tray.setContextMenu(contextMenu);
}

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
    toast.show("已允许Google Translate Desktop在您登录时自动启动。", "提示");
  }
  else {
    toast.show("已禁止Google Translate Desktop在您登录时自动启动。", "提示");
  }
  if (!initial) {
    flushConfig();
  }
  return config.autoStart;
}

//启用/禁用mini窗口快捷键
function toggleMiniShortcut(initial) {
  let enabled = initial ? config.miniWindowEnabled : !config.miniWindowEnabled;
  let success = true;
  if (enabled) {
    if (!globalShortcut.register(config.miniShortcut, () => toggleMiniWindowVisibility())) {
      toast.show("快捷键注册失败，请检查设置的快捷键是否被其他软件占用。", "错误", {
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

function toggleMiniWindowVisibility() {
  if (!miniWindow) { return; }
  if (miniWindow.isVisible()) {
    miniWindow.hide();
  }
  else {
    miniWindow.show();
    miniWindow.focus();
  }
}

function toggleMainWindowVisibility() {
  if (!mainWindow) { return; }
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  }
  else {
    mainWindow.show();
    mainWindow.focus();
  }
}
