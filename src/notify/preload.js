const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  // レンダラプロセス → メインプロセス
  // レンダラプロセス側にwindow.electronAPI.runClickEvent()関数を生やす
  // メインプロセス側ではipcMain.handle("click-event", (event) => {})でイベントを受け取ることができる
  runClickEvent: () => ipcRenderer.invoke("click-event"),
});
