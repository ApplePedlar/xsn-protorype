// このファイルはプリロード用サンドボックスで実行されます。
// Electron や Node の組み込みモジュールのサブセット以外のモジュールを読み込むことはできません。
// ウインドウ生成前に実行されるため、ここでDOM操作はできません。
// 主にメインプロセス(setting.js)⇔レンダラプロセス(renderer.js)のプロセス間通信を定義します。

// サンドボックス化されたプリロードスクリプトなのでESMインポートを使用できません。CommonJS方式でインポートします。
const { contextBridge, ipcRenderer } = require("electron/renderer");

// 第一引数によってレンダラプロセス側でwindow.electronAPIが生える
contextBridge.exposeInMainWorld("electronAPI", {
  // メインプロセス → レンダラプロセス
  // メインプロセス側でwin.webContents.send("set-default", value)を実行すると、(winはBrowserWindowのインスタンス)
  // レンダラプロセス側ではwindow.electronAPI.onSetDefault((event, value) => {})で値を受け取ることができる
  onSetDefault: (callback) =>
    ipcRenderer.on("set-default", (event, value) => callback(event, value)),

  // レンダラプロセス → メインプロセス
  // レンダラプロセス側にwindow.electronAPI.saveSetting(slackToken, slackUserID)関数を生やす
  // メインプロセス側ではipcMain.handle("save", (event, slackToken, slackUserID) => {})で値を受け取ることができる
  saveSetting: (setting) => ipcRenderer.invoke("save", setting),
});