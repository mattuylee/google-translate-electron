const { ipcRenderer } = require("electron");

ipcRenderer.on("focus-input", () => {
  var source = document.querySelector("textarea");
  if (source) {
    source.focus();
  }
});
ipcRenderer.on("clear-input", () => {
  var button = document.querySelector(
    "body>c-wiz>div>div>c-wiz>div:nth-of-type(2)>c-wiz>div>div:nth-of-type(2)>div:nth-of-type(2)>c-wiz>div:nth-of-type(2) div button"
  );
  if (button) {
    button.click();
  }
});
ipcRenderer.on("random-input", () => {
  var source = document.querySelector("textarea");
  if (source) {
    source.value = source.value ? "" : Math.random();
  }
});
