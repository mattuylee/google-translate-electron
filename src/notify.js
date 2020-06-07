const path = require('path');
const { Notification, dialog } = require('electron');

let current = null;

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
  if (current) {
    current.close();
  }
  current = new Notification({
    title: "Google Translate Desktop",
    body: message,
    subtitle: ops && ops.subtitle,
    icon: path.resolve(__dirname, './assets/icon.ico')
  });
  current.show();
  if (ops && ops.clickCallback) {
    current.on('click', ops.clickCallback);
  }
}

function dismiss() {
  current && current.close();
}

module.exports = {
  show: notify,
  dismiss
};
